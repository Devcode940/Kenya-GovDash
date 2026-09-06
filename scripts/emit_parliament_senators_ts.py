#!/usr/bin/env python3
"""Emit kenya-parliament-senators.ts from cached JSON."""
import json, re, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from emit_parliament_mps_ts import OFFICIAL_COUNTY_NAMES, COUNTY_CODES, COUNTY_NORMALIZATION, normalize_county, normalize_party, title_case_name

INPUT = Path("/home/z/my-project/upload/mps/senators_parliament_ke.json")
OUTPUT = Path("/home/z/my-project/src/lib/kenya-parliament-senators.ts")
COUNTY_NORMALIZATION["NOMINATED"] = "Nominated"
with open(INPUT) as f:
    data = json.load(f)
senators = data["senators"]

by_county = {}
for sen in senators:
    raw_county = sen.get("county", "")
    county = normalize_county(raw_county) if raw_county else "Nominated"
    if county is None: continue
    name = title_case_name(sen["name"])
    if not name: continue
    party, coalition = normalize_party(sen["party"])
    status = "Nominated" if county == "Nominated" else (sen["status"].title() if sen["status"] else "Elected")
    if county == "Nominated":
        slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
        sen_id = f"sen-parliament-nominated-{slug}"
    else:
        sen_id = f"sen-parliament-{re.sub(r'[^a-z0-9]+', '-', county.lower()).strip('-')}"
    if county not in by_county:
        by_county[county] = {"id":sen_id,"name":name,"party":party,"coalition":coalition,
            "county":county,"code":COUNTY_CODES.get(county,0),"status":status,
            "profile_url":sen.get("profile_url",""),"raw_name":sen.get("raw_name",name)}

lines = ["// Parliament-Sourced Senator Data — verified from parliament.go.ke",
    "import type { CoalitionType } from './kenya-data';",
    "export interface ParliamentSenator { id: string; fullName: string; officialTitle: string; party: string; coalition: CoalitionType; jurisdiction: string; countyName: string; countyCode: number; status: 'Elected' | 'Nominated'; profileUrl: string; rawName: string; source: 'Parliament of Kenya (parliament.go.ke)'; }",
    ""]
all_counties = OFFICIAL_COUNTY_NAMES + ["Nominated"]
for county in all_counties:
    sen = by_county.get(county)
    var_name = county.upper().replace("'","").replace(" ","_").replace("-","_") + "_SENATORS"
    code = COUNTY_CODES.get(county, 0)
    lines.append(f"export const {var_name}: ParliamentSenator[] = [")
    if sen:
        def ts(s): return "'" + s.replace("\\","\\\\").replace("'","\\'") + "'" if s else "''"
        full_name = "Sen. " + sen['name']
        title = f"Senator, {county}" if county != "Nominated" else "Nominated Senator"
        jur = county if county != "Nominated" else "Nominated (Special Interest)"
        lines.append(f"  {{ id: {ts(sen['id'])}, fullName: {ts(full_name)}, officialTitle: {ts(title)}, party: {ts(sen['party'])}, coalition: {ts(sen['coalition'])}, jurisdiction: {ts(jur)}, countyName: {ts(county)}, countyCode: {code}, status: {ts(sen['status'])}, profileUrl: {ts(sen['profile_url'])}, rawName: {ts(sen['raw_name'])}, source: 'Parliament of Kenya (parliament.go.ke)' }},")
    lines.append("];")
lines.append("")
lines.append("export function getParliamentSenatorForCounty(countyName: string): ParliamentSenator | null {")
lines.append("  switch (countyName) {")
for county in OFFICIAL_COUNTY_NAMES:
    var_name = county.upper().replace("'","").replace(" ","_").replace("-","_") + "_SENATORS"
    lines.append(f'    case "{county}": return {var_name}.find(s => s.status === "Elected") ?? null;')
lines.append('    default: return null;')
lines.append("  }")
lines.append("}")
lines.append("export function getNominatedSenators(): ParliamentSenator[] { return NOMINATED_SENATORS; }")
lines.append(f"export const PARLIAMENT_SENATORS_TOTAL = {len(by_county)};")
OUTPUT.write_text("\n".join(lines))
print(f"✓ Wrote {OUTPUT} — {len(by_county)} senators")
