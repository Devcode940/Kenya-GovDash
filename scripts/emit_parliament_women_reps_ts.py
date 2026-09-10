#!/usr/bin/env python3
"""Emit kenya-parliament-women-reps.ts from cached MP JSON."""
import json, re, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from emit_parliament_mps_ts import OFFICIAL_COUNTY_NAMES, COUNTY_CODES, COUNTY_NORMALIZATION, normalize_county, normalize_party, title_case_name

INPUT = Path("/home/z/my-project/upload/mps/mps_parliament_ke_clean.json")
OUTPUT = Path("/home/z/my-project/src/lib/kenya-parliament-women-reps.ts")

with open(INPUT) as f:
    data = json.load(f)
mps = data["mps"]

women_reps = {}
for mp in mps:
    county_raw = mp.get("county", "").upper().strip()
    const_raw = mp.get("constituency", "").upper().strip()
    if not county_raw or not const_raw or county_raw != const_raw: continue
    if county_raw == "NOMINATED": continue
    county = normalize_county(county_raw)
    if county is None or county == "Nominated": continue
    if county in women_reps: continue
    name = title_case_name(mp["name"])
    if not name: continue
    party, coalition = normalize_party(mp["party"])
    women_reps[county] = {"name":name,"party":party,"coalition":coalition,
        "profile_url":mp.get("profile_url",""),"raw_name":mp.get("raw_name",name)}

lines = ["// Parliament-Sourced Woman Representatives Data",
    "import type { CoalitionType } from './kenya-data';",
    "export interface ParliamentWomanRep { id: string; fullName: string; officialTitle: string; party: string; coalition: CoalitionType; jurisdiction: string; countyName: string; countyCode: number; status: 'Elected'; profileUrl: string; rawName: string; source: 'Parliament of Kenya (parliament.go.ke)'; }",
    "",
    "export function getParliamentWomanRepForCounty(countyName: string): ParliamentWomanRep | null {",
    "  switch (countyName) {"]
for county in OFFICIAL_COUNTY_NAMES:
    wr = women_reps.get(county)
    if wr:
        def ts(s): return "'" + s.replace("\\","\\\\").replace("'","\\'") + "'" if s else "''"
        slug = re.sub(r'[^a-z0-9]+', '-', county.lower()).strip('-')
        lines.append(f'    case "{county}": return {{ id: "wrep-parliament-{slug}", fullName: {ts(wr["name"])}, officialTitle: "Woman Rep, {county} County", party: {ts(wr["party"])}, coalition: {ts(wr["coalition"])}, jurisdiction: "{county} County", countyName: "{county}", countyCode: {COUNTY_CODES[county]}, status: "Elected", profileUrl: {ts(wr["profile_url"])}, rawName: {ts(wr["raw_name"])}, source: "Parliament of Kenya (parliament.go.ke)" }};')
lines.append('    default: return null;')
lines.append("  }")
lines.append("}")
lines.append(f"export const PARLIAMENT_WOMEN_REPS_TOTAL = {len(women_reps)};")
OUTPUT.write_text("\n".join(lines))
print(f"✓ Wrote {OUTPUT} — {len(women_reps)} Woman Reps")
