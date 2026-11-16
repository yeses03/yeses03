// Writes assets/moon.svg - "tonight's moon", drawn from the real lunar phase.
// Run nightly by .github/workflows/moon.yml (or locally: node scripts/moon.mjs).
import { writeFileSync, mkdirSync } from "node:fs";

const SYNODIC = 29.530588853;
const REF_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14); // a known new moon

function phase(now) {
  const f = ((((now - REF_NEW_MOON) / 86_400_000 / SYNODIC) % 1) + 1) % 1;
  const names = ["New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous", "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"];
  return { f, lit: Math.round(((1 - Math.cos(2 * Math.PI * f)) / 2) * 100), name: names[Math.round(f * 8) % 8], waxing: f < 0.5 };
}

const now = Date.now();
const p = phase(now);
const ist = new Date(now + 5.5 * 3600e3);
const label = ist.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });

const R = 44, cx = 90, cy = 90;
const c = Math.cos(2 * Math.PI * p.f);
const rx = Math.round(Math.abs(c) * R * 100) / 100;
const sweep = c > 0 ? 0 : 1;
const lit = `M ${cx} ${cy - R} A ${R} ${R} 0 0 1 ${cx} ${cy + R} A ${rx} ${R} 0 0 ${sweep} ${cx} ${cy - R} Z`;
const flip = p.waxing ? "" : ` transform="translate(${cx * 2} 0) scale(-1 1)"`;

const stars = [[240,22,1.2],[300,48,0.8],[360,18,1],[420,60,0.9],[470,28,1.1],[520,70,0.7],[270,100,0.8],[340,120,1],[400,110,0.7],[460,125,0.9],[30,20,0.9],[150,18,0.8],[20,150,1],[190,150,0.8]]
  .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#c9d1e6" opacity="0.6"/>`).join("");

writeFileSync("assets/moon.svg", `<svg xmlns="http://www.w3.org/2000/svg" width="560" height="180" viewBox="0 0 560 180" role="img" aria-label="Tonight's moon: ${p.name}, ${p.lit}% lit">
  <rect width="560" height="180" rx="14" fill="#080f1c" stroke="#202d43"/>
  ${stars}
  <circle cx="${cx}" cy="${cy}" r="${R}" fill="#141f33" stroke="#2a3a57"/>
  <g${flip}><path d="${lit}" fill="#e3e7f1"/></g>
  <circle cx="${cx - 12}" cy="${cy - 10}" r="4" fill="#000" opacity="0.07"/>
  <circle cx="${cx + 14}" cy="${cy + 14}" r="5.5" fill="#000" opacity="0.06"/>
  <text x="170" y="62" fill="#68758f" font-family="Georgia, serif" font-size="13" letter-spacing="2">TONIGHT'S MOON</text>
  <text x="170" y="98" fill="#e7eaf4" font-family="Georgia, serif" font-size="30" font-weight="bold">${p.name}</text>
  <text x="170" y="126" fill="#929db5" font-family="Verdana, sans-serif" font-size="14">${p.lit}% illuminated  ·  ${label}</text>
</svg>
`);
console.log(`moon.svg: ${p.name}, ${p.lit}%`);
