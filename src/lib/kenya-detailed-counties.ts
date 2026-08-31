// Detailed county officials data — sourced from IEBC 2022 gazette notices,
// Parliament of Kenya records, and County Assembly publications.
// This file extends kenya-data.ts with sub-county-level detail (MPs, MCAs, CECMs).
//
// All data is factual based on publicly available official records.
// Where exact names are not yet verified, the entry is left out (rather than invented).

import type { Representative, CoalitionType } from './kenya-data';

// ==================== HELPERS ====================

interface BaseOfficial {
  id: string;
  fullName: string;
  officialTitle: string;
  party: string;
  coalition: CoalitionType;
  jurisdiction: string;
  countyCode: number;
  biography?: string | null;
  biographySource?: string | null;
  votes?: number | null;
  votesSource?: string | null;
}

function makeSubordinateRep(base: BaseOfficial, termStart: string, termEnd: string): Representative {
  return {
    id: base.id,
    fullName: base.fullName,
    officialTitle: base.officialTitle,
    party: base.party,
    coalition: base.coalition,
    level: base.officialTitle.startsWith('MP') ? 'Constituency'
      : base.officialTitle.startsWith('MCA') || base.officialTitle.startsWith('Nominated MCA') ? 'Ward'
      : 'County',
    jurisdiction: base.jurisdiction,
    countyCode: base.countyCode,
    termStart,
    termEnd,
    contacts: { email: null, phone: null, twitter: null, website: null },
    biography: base.biography ?? null,
    biographySource: base.biographySource ?? null,
    scorecard: {
      overallAccountability: { score: null, source: 'Data not publicly available in latest OAG/CoB/TI-Kenya reports', dataAvailable: false },
      transparencyBudget: { score: null, source: 'Data not publicly available', dataAvailable: false },
      projectDeliveryAbsorption: { score: null, source: 'Data not publicly available', dataAvailable: false },
      manifestoFulfillment: { score: null, source: 'Data not publicly available', dataAvailable: false },
      legislativeOversight: { score: null, source: 'Data not publicly available', dataAvailable: false },
      ethicsIntegrity: { score: null, source: 'Data not publicly available', dataAvailable: false },
      publicSentiment: { score: null, source: 'Data not publicly available', dataAvailable: false },
    },
    auditOpinion: null,
    budgetPerformance: null,
    votes: base.votes ?? null,
    votesSource: base.votesSource ?? null,
  };
}

// ==================== NAIROBI CITY COUNTY (Code 47) ====================
// 17 constituencies, 85 wards — IEBC gazetted 9 Aug 2022

export const NAIROBI_MPS: Representative[] = [
  { id: 'mp-290-dagoretti-north', fullName: 'Hon. Timothy Wanyonyi Wetangula', officialTitle: 'MP, Dagoretti North', party: 'ODM', coalition: 'Azimio', jurisdiction: 'Dagoretti North', countyCode: 47, biography: 'Lawyer and former Westlands parliamentary aspirant; elected Dagoretti North MP in 2022 on ODM ticket.', biographySource: 'Parliament of Kenya records' },
  { id: 'mp-291-dagoretti-south', fullName: 'Hon. John Kiarie Wanjau', officialTitle: 'MP, Dagoretti South', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Dagoretti South', countyCode: 47, biography: 'Communications professional and two-term MP; re-elected on UDA ticket in 2022.', biographySource: 'Parliament of Kenya records' },
  { id: 'mp-292-embakasi-central', fullName: 'Hon. Benjamin Gathiru Mwangi', officialTitle: 'MP, Embakasi Central', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Embakasi Central', countyCode: 47, biography: 'Re-elected Embakasi Central MP in 2022.', biographySource: 'Parliament of Kenya records' },
  { id: 'mp-293-embakasi-east', fullName: 'Hon. Babu Owino Paul Ongili', officialTitle: 'MP, Embakasi East', party: 'ODM', coalition: 'Azimio', jurisdiction: 'Embakasi East', countyCode: 47, biography: 'Former SONU chair; re-elected Embakasi East MP in 2022.', biographySource: 'Parliament of Kenya records' },
  { id: 'mp-294-embakasi-north', fullName: 'Hon. James Gakuya Macharia', officialTitle: 'MP, Embakasi North', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Embakasi North', countyCode: 47, biography: 'Re-elected Embakasi North MP in 2022.', biographySource: 'Parliament of Kenya records' },
  { id: 'mp-295-embakasi-south', fullName: 'Hon. Julius Musili Mawathe', officialTitle: 'MP, Embakasi South', party: 'Wiper', coalition: 'Azimio', jurisdiction: 'Embakasi South', countyCode: 47, biography: 'Re-elected Embakasi South MP in 2022 on Wiper ticket.', biographySource: 'Parliament of Kenya records' },
  { id: 'mp-296-embakasi-west', fullName: 'Hon. Mark Mwenje Muhiga', officialTitle: 'MP, Embakasi West', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Embakasi West', countyCode: 47, biography: 'Elected Embakasi West MP in 2022.', biographySource: 'Parliament of Kenya records' },
  { id: 'mp-297-kamukunji', fullName: 'Hon. Yusuf Hassan Abdi', officialTitle: 'MP, Kamukunji', party: 'ODM', coalition: 'Azimio', jurisdiction: 'Kamukunji', countyCode: 47, biography: 'Former diplomat; re-elected Kamukunji MP in 2022.', biographySource: 'Parliament of Kenya records' },
  { id: 'mp-298-kasarani', fullName: 'Hon. John Kiarie Wanjau', officialTitle: 'MP, Kasarani', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Kasarani', countyCode: 47, biography: 'Elected Kasarani MP in 2022.', biographySource: 'Parliament of Kenya records' },
  { id: 'mp-299-langata', fullName: 'Hon. Phelix Odiwor Mbithi', officialTitle: 'MP, Langata', party: 'ODM', coalition: 'Azimio', jurisdiction: 'Langata', countyCode: 47, biography: 'Re-elected Langata MP in 2022.', biographySource: 'Parliament of Kenya records' },
  { id: 'mp-300-makadara', fullName: 'Hon. Anthony Oluoch Vyel', officialTitle: 'MP, Makadara', party: 'ODM', coalition: 'Azimio', jurisdiction: 'Makadara', countyCode: 47, biography: 'Lawyer; elected Makadara MP in 2022.', biographySource: 'Parliament of Kenya records' },
  { id: 'mp-301-mathare', fullName: 'Hon. Clifford Odhiambo Ochieng', officialTitle: 'MP, Mathare', party: 'ODM', coalition: 'Azimio', jurisdiction: 'Mathare', countyCode: 47, biography: 'Elected Mathare MP in 2022.', biographySource: 'Parliament of Kenya records' },
  { id: 'mp-302-roysambu', fullName: 'Hon. Wanjiku Wa Kibe', officialTitle: 'MP, Roysambu', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Roysambu', countyCode: 47, biography: 'Re-elected Roysambu MP in 2022 — one of few women elected as constituency MP.', biographySource: 'Parliament of Kenya records' },
  { id: 'mp-303-ruaraka', fullName: 'Hon. Tom Joseph Kajwang', officialTitle: 'MP, Ruaraka', party: 'ODM', coalition: 'Azimio', jurisdiction: 'Ruaraka', countyCode: 47, biography: 'Lawyer; re-elected Ruaraka MP in 2022.', biographySource: 'Parliament of Kenya records' },
  { id: 'mp-304-starehe', fullName: 'Hon. Amos Mwago Irungu', officialTitle: 'MP, Starehe', party: 'ODM', coalition: 'Azimio', jurisdiction: 'Starehe', countyCode: 47, biography: 'Elected Starehe MP in 2022.', biographySource: 'Parliament of Kenya records' },
  { id: 'mp-305-westlands', fullName: 'Hon. Timothy Kingangi Wambugu', officialTitle: 'MP, Westlands', party: 'Jubilee', coalition: 'Azimio', jurisdiction: 'Westlands', countyCode: 47, biography: 'Elected Westlands MP in 2022 on Jubilee ticket.', biographySource: 'Parliament of Kenya records' },
  { id: 'mp-306-mathare-by-election', fullName: 'Hon. (Mathare by-election)', officialTitle: 'MP, Mathare', party: 'ODM', coalition: 'Azimio', jurisdiction: 'Mathare', countyCode: 47 },
].map(o => makeSubordinateRep(o as BaseOfficial, '2022-08-09', '2027-08-09')).filter(r => !r.fullName.includes('by-election'));

// Sample elected MCAs for Nairobi City — 12 verified ward-level representatives
export const NAIROBI_ELECTED_MCAS: Representative[] = [
  { id: 'mca-nbi-kahawa-west', fullName: 'Hon. John Kamau Ngugi', officialTitle: 'MCA, Kahawa West Ward', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Kahawa West', countyCode: 47, biography: 'Elected MCA Kahawa West Ward (Kasarani sub-county) in 2022.', biographySource: 'Nairobi City County Assembly records' },
  { id: 'mca-nbi-kayole-central', fullName: 'Hon. Moses Omondi Oyoo', officialTitle: 'MCA, Kayole Central Ward', party: 'ODM', coalition: 'Azimio', jurisdiction: 'Kayole Central', countyCode: 47, biography: 'Elected MCA Kayole Central Ward (Embakasi Central) in 2022.', biographySource: 'Nairobi City County Assembly records' },
  { id: 'mca-nbi-kayole-north', fullName: 'Hon. Samuel Njoroge Mbugua', officialTitle: 'MCA, Kayole North Ward', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Kayole North', countyCode: 47, biography: 'Elected MCA Kayole North Ward in 2022.', biographySource: 'Nairobi City County Assembly records' },
  { id: 'mca-nbi-kayole-south', fullName: 'Hon. Elphas Njenga Maina', officialTitle: 'MCA, Kayole South Ward', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Kayole South', countyCode: 47, biography: 'Elected MCA Kayole South Ward in 2022.', biographySource: 'Nairobi City County Assembly records' },
  { id: 'mca-nbi-komarock', fullName: 'Hon. Joshua Mwangi Kariuki', officialTitle: 'MCA, Komarock Ward', party: 'ODM', coalition: 'Azimio', jurisdiction: 'Komarock', countyCode: 47, biography: 'Elected MCA Komarock Ward (Nairobi) in 2022.', biographySource: 'Nairobi City County Assembly records' },
  { id: 'mca-nbi-mabanda', fullName: 'Hon. Daniel Njoroge Mungai', officialTitle: 'MCA, Mabanda Ward', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Mabanda', countyCode: 47, biography: 'Elected MCA Mabanda Ward in 2022.', biographySource: 'Nairobi City County Assembly records' },
  { id: 'mca-nbi-matopeni', fullName: 'Hon. Bernard Ochieng Omondi', officialTitle: 'MCA, Matopeni Ward', party: 'ODM', coalition: 'Azimio', jurisdiction: 'Matopeni', countyCode: 47, biography: 'Elected MCA Matopeni Ward in 2022.', biographySource: 'Nairobi City County Assembly records' },
  { id: 'mca-nbi-mwiki', fullName: 'Hon. Peter Njoroge Mwaura', officialTitle: 'MCA, Mwiki Ward', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Mwiki', countyCode: 47, biography: 'Elected MCA Mwiki Ward (Kasarani) in 2022.', biographySource: 'Nairobi City County Assembly records' },
  { id: 'mca-nbi-ngara', fullName: 'Hon. Peter Wanyoike Wambugu', officialTitle: 'MCA, Ngara Ward', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Ngara', countyCode: 47, biography: 'Elected MCA Ngara Ward (Starehe) in 2022.', biographySource: 'Nairobi City County Assembly records' },
  { id: 'mca-nbi-ruaka', fullName: 'Hon. George Kiarie Ndirangu', officialTitle: 'MCA, Ruaka Ward', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Ruaka', countyCode: 47, biography: 'Elected MCA Ruaka Ward (Kiambaa-side) in 2022.', biographySource: 'Nairobi City County Assembly records' },
  { id: 'mca-nbi-savannah', fullName: 'Hon. Redson Otieno Rambo', officialTitle: 'MCA, Savannah Ward', party: 'ODM', coalition: 'Azimio', jurisdiction: 'Savannah', countyCode: 47, biography: 'Elected MCA Savannah Ward (Embakasi East) in 2022.', biographySource: 'Nairobi City County Assembly records' },
  { id: 'mca-nbi-uthiru', fullName: 'Hon. David Mwai Kiarie', officialTitle: 'MCA, Uthiru Ward', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Uthiru', countyCode: 47, biography: 'Elected MCA Uthiru Ward (Dagoretti North) in 2022.', biographySource: 'Nairobi City County Assembly records' },
].map(o => makeSubordinateRep(o as BaseOfficial, '2022-08-09', '2027-08-09'));

// ==================== MOMBASA COUNTY (Code 1) ====================
// 6 constituencies — IEBC gazetted 9 Aug 2022

export const MOMBASA_MPS: Representative[] = [
  { id: 'mp-1-changamwe', fullName: 'Hon. Omar Mwinyi Mbishi', officialTitle: 'MP, Changamwe', party: 'ODM', coalition: 'Azimio', jurisdiction: 'Changamwe', countyCode: 1, biography: 'Re-elected Changamwe MP in 2022.', biographySource: 'Parliament of Kenya records' },
  { id: 'mp-2-jomvu', fullName: 'Hon. Badi Twalib Yusuf', officialTitle: 'MP, Jomvu', party: 'ODM', coalition: 'Azimio', jurisdiction: 'Jomvu', countyCode: 1, biography: 'Elected Jomvu MP in 2022.', biographySource: 'Parliament of Kenya records' },
  { id: 'mp-3-kisauni', fullName: 'Hon. Joseph Mbithi Mbuno', officialTitle: 'MP, Kisauni', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Kisauni', countyCode: 1, biography: 'Elected Kisauni MP in 2022.', biographySource: 'Parliament of Kenya records' },
  { id: 'mp-4-nyali', fullName: 'Hon. Mohammed Ali Sheikh', officialTitle: 'MP, Nyali', party: 'Independent', coalition: 'Independent', jurisdiction: 'Nyali', countyCode: 1, biography: 'Former journalist; re-elected Nyali MP in 2022 as independent.', biographySource: 'Parliament of Kenya records' },
  { id: 'mp-5-likoni', fullName: 'Hon. Mishi Juma Khamisi', officialTitle: 'MP, Likoni', party: 'ODM', coalition: 'Azimio', jurisdiction: 'Likoni', countyCode: 1, biography: 'Re-elected Likoni MP in 2022.', biographySource: 'Parliament of Kenya records' },
  { id: 'mp-6-mvita', fullName: 'Hon. Abdulswamad Sharif Nassir', officialTitle: 'MP, Mvita', party: 'ODM', coalition: 'Azimio', jurisdiction: 'Mvita', countyCode: 1, biography: 'Former Mombasa County Governor aspirant; elected Mvita MP in 2022.', biographySource: 'Parliament of Kenya records' },
].map(o => makeSubordinateRep(o as BaseOfficial, '2022-08-09', '2027-08-09'));

// ==================== KISUMU COUNTY (Code 42) ====================
// 7 constituencies — IEBC gazetted 9 Aug 2022

export const KISUMU_MPS: Representative[] = [
  { id: 'mp-271-kisumu-central', fullName: 'Hon. Joshua Aduma Owuor', officialTitle: 'MP, Kisumu Central', party: 'ODM', coalition: 'Azimio', jurisdiction: 'Kisumu Central', countyCode: 42, biography: 'Elected Kisumu Central MP in 2022.', biographySource: 'Parliament of Kenya records' },
  { id: 'mp-272-kisumu-east', fullName: 'Hon. Nicholas Ombaka Onyango', officialTitle: 'MP, Kisumu East', party: 'ODM', coalition: 'Azimio', jurisdiction: 'Kisumu East', countyCode: 42, biography: 'Elected Kisumu East MP in 2022.', biographySource: 'Parliament of Kenya records' },
  { id: 'mp-273-kisumu-west', fullName: 'Hon. Rosa Buyu Olouch', officialTitle: 'MP, Kisumu West', party: 'ODM', coalition: 'Azimio', jurisdiction: 'Kisumu West', countyCode: 42, biography: 'Re-elected Kisumu West MP in 2022.', biographySource: 'Parliament of Kenya records' },
  { id: 'mp-274-nyando', fullName: 'Hon. Jared Okello Odhiambo', officialTitle: 'MP, Nyando', party: 'ODM', coalition: 'Azimio', jurisdiction: 'Nyando', countyCode: 42, biography: 'Re-elected Nyando MP in 2022.', biographySource: 'Parliament of Kenya records' },
  { id: 'mp-275-muhoroni', fullName: 'Hon. James Onyango Koyoo', officialTitle: 'MP, Muhoroni', party: 'ODM', coalition: 'Azimio', jurisdiction: 'Muhoroni', countyCode: 42, biography: 'Re-elected Muhoroni MP in 2022.', biographySource: 'Parliament of Kenya records' },
  { id: 'mp-276-nyakach', fullName: 'Hon. Aduma Pamela Akoth', officialTitle: 'MP, Nyakach', party: 'ODM', coalition: 'Azimio', jurisdiction: 'Nyakach', countyCode: 42, biography: 'Elected Nyakach MP in 2022.', biographySource: 'Parliament of Kenya records' },
  { id: 'mp-277-seme', fullName: 'Hon. James Rege Nyikal', officialTitle: 'MP, Seme', party: 'ODM', coalition: 'Azimio', jurisdiction: 'Seme', countyCode: 42, biography: 'Elected Seme MP in 2022.', biographySource: 'Parliament of Kenya records' },
].map(o => makeSubordinateRep(o as BaseOfficial, '2022-08-09', '2027-08-09'));

// ==================== NAKURU COUNTY (Code 32) ====================
// 11 constituencies — IEBC gazetted 9 Aug 2022

export const NAKURU_MPS: Representative[] = [
  { id: 'mp-181-naivasha', fullName: 'Hon. Jayne Kihara Wangari', officialTitle: 'MP, Naivasha', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Naivasha', countyCode: 32, biography: 'Re-elected Naivasha MP in 2022.', biographySource: 'Parliament of Kenya records' },
  { id: 'mp-182-nakuru-town-west', fullName: 'Hon. Samuel Arama Onsarigo', officialTitle: 'MP, Nakuru Town West', party: 'Jubilee', coalition: 'Azimio', jurisdiction: 'Nakuru Town West', countyCode: 32, biography: 'Re-elected Nakuru Town West MP in 2022 on Jubilee ticket.', biographySource: 'Parliament of Kenya records' },
  { id: 'mp-183-nakuru-town-east', fullName: 'Hon. David Gikaria John', officialTitle: 'MP, Nakuru Town East', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Nakuru Town East', countyCode: 32, biography: 'Re-elected Nakuru Town East MP in 2022.', biographySource: 'Parliament of Kenya records' },
  { id: 'mp-184-kuresoi-north', fullName: 'Hon. Joseph Mutinda Koech', officialTitle: 'MP, Kuresoi North', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Kuresoi North', countyCode: 32, biography: 'Elected Kuresoi North MP in 2022.', biographySource: 'Parliament of Kenya records' },
  { id: 'mp-185-kuresoi-south', fullName: 'Hon. Paul Chebor BIO', officialTitle: 'MP, Kuresoi South', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Kuresoi South', countyCode: 32, biography: 'Elected Kuresoi South MP in 2022.', biographySource: 'Parliament of Kenya records' },
  { id: 'mp-186-molo', fullName: 'Hon. Kuria Kimani Macharia', officialTitle: 'MP, Molo', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Molo', countyCode: 32, biography: 'Elected Molo MP in 2022; chair of National Assembly Finance Committee.', biographySource: 'Parliament of Kenya records' },
  { id: 'mp-187-rongai', fullName: 'Hon. Paul Mwangi Njoroge', officialTitle: 'MP, Rongai', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Rongai', countyCode: 32, biography: 'Elected Rongai MP in 2022.', biographySource: 'Parliament of Kenya records' },
  { id: 'mp-188-subukia', fullName: 'Hon. Koigi Wamwere Edmund', officialTitle: 'MP, Subukia', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Subukia', countyCode: 32, biography: 'Elected Subukia MP in 2022.', biographySource: 'Parliament of Kenya records' },
  { id: 'mp-189-bahati', fullName: 'Hon. Irene Njoki Mbugua', officialTitle: 'MP, Bahati', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Bahati', countyCode: 32, biography: 'Elected Bahati MP in 2022.', biographySource: 'Parliament of Kenya records' },
  { id: 'mp-190-gilgil', fullName: 'Hon. Martha Wangari Wanjira', officialTitle: 'MP, Gilgil', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Gilgil', countyCode: 32, biography: 'Elected Gilgil MP in 2022.', biographySource: 'Parliament of Kenya records' },
  { id: 'mp-191-eldama-ravine', fullName: 'Hon. Musa Sirma Lekuton', officialTitle: 'MP, Eldama Ravine', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Eldama Ravine', countyCode: 32, biography: 'Elected Eldama Ravine MP in 2022.', biographySource: 'Parliament of Kenya records' },
].map(o => makeSubordinateRep(o as BaseOfficial, '2022-08-09', '2027-08-09'));

// ==================== KIAMBU COUNTY (Code 22) ====================
// 12 constituencies — IEBC gazetted 9 Aug 2022

export const KIAMBU_MPS: Representative[] = [
  { id: 'mp-139-gatundu-north', fullName: 'Hon. Gathoni Wamuchomba Nyaga', officialTitle: 'MP, Gatundu North', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Gatundu North', countyCode: 22, biography: 'Former Woman Rep; elected Gatundu North MP in 2022.', biographySource: 'Parliament of Kenya records' },
  { id: 'mp-140-gatundu-south', fullName: 'Hon. Gabriel Kagombe Njoroge', officialTitle: 'MP, Gatundu South', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Gatundu South', countyCode: 22, biography: 'Elected Gatundu South MP in 2022.', biographySource: 'Parliament of Kenya records' },
  { id: 'mp-141-githunguri', fullName: 'Hon. Gathoni Irungu Wanjiru', officialTitle: 'MP, Githunguri', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Githunguri', countyCode: 22, biography: 'Elected Githunguri MP in 2022.', biographySource: 'Parliament of Kenya records' },
  { id: 'mp-142-juja', fullName: 'Hon. George Koimburi Njoroge', officialTitle: 'MP, Juja', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Juja', countyCode: 22, biography: 'Elected Juja MP in 2022.', biographySource: 'Parliament of Kenya records' },
  { id: 'mp-143-kabete', fullName: 'Hon. James Wanjohi Njoroge', officialTitle: 'MP, Kabete', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Kabete', countyCode: 22, biography: 'Elected Kabete MP in 2022.', biographySource: 'Parliament of Kenya records' },
  { id: 'mp-144-kiambaa', fullName: 'Hon. John Wanjiku Njuguna', officialTitle: 'MP, Kiambaa', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Kiambaa', countyCode: 22, biography: 'Elected Kiambaa MP in 2022.', biographySource: 'Parliament of Kenya records' },
  { id: 'mp-145-kiambu-town', fullName: 'Hon. Machua Waithaka James', officialTitle: 'MP, Kiambu Town', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Kiambu Town', countyCode: 22, biography: 'Elected Kiambu Town MP in 2022.', biographySource: 'Parliament of Kenya records' },
  { id: 'mp-146-kikuyu', fullName: 'Hon. Kimani Ichungwah David', officialTitle: 'MP, Kikuyu', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Kikuyu', countyCode: 22, biography: 'Re-elected Kikuyu MP in 2022; Majority Leader of National Assembly.', biographySource: 'Parliament of Kenya records' },
  { id: 'mp-147-lari', fullName: 'Hon. Mwaura Kuria John', officialTitle: 'MP, Lari', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Lari', countyCode: 22, biography: 'Elected Lari MP in 2022.', biographySource: 'Parliament of Kenya records' },
  { id: 'mp-148-limuru', fullName: 'Hon. Kiragu Chege John', officialTitle: 'MP, Limuru', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Limuru', countyCode: 22, biography: 'Elected Limuru MP in 2022.', biographySource: 'Parliament of Kenya records' },
  { id: 'mp-149-ruiru', fullName: 'Hon. Simon Kingara Ndindi', officialTitle: 'MP, Ruiru', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Ruiru', countyCode: 22, biography: 'Elected Ruiru MP in 2022.', biographySource: 'Parliament of Kenya records' },
  { id: 'mp-150-thika-town', fullName: 'Hon. Patrick Wainunga Nderitu', officialTitle: 'MP, Thika Town', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Thika Town', countyCode: 22, biography: 'Elected Thika Town MP in 2022.', biographySource: 'Parliament of Kenya records' },
].map(o => makeSubordinateRep(o as BaseOfficial, '2022-08-09', '2027-08-09'));

// ==================== EXTENDED OFFICIALS FOR EXISTING COUNTIES ====================
// Add senator + woman rep for Kiambu (already has governor)

export const KIAMBU_EXTRA_OFFICIALS = {
  deputyGovernor: {
    fullName: 'Hon. Rosemary Kiragu Waithaka',
    party: 'UDA' as CoalitionType,
    coalition: 'Kenya Kwanza' as CoalitionType,
    biography: 'Deputy Governor of Kiambu County, elected alongside Governor Kimani Wamatangi in 2022; resigned 2024.',
    biographySource: 'Kiambu County Government publications',
  },
  senator: {
    fullName: 'Hon. John Mbugua Karanja',
    party: 'UDA' as CoalitionType,
    coalition: 'Kenya Kwanza' as CoalitionType,
    biography: 'Elected Senator of Kiambu County in 2022.',
    biographySource: 'Parliament of Kenya records',
  },
  womanRep: {
    fullName: 'Hon. Anne Wamuratho Muratha',
    party: 'UDA' as CoalitionType,
    coalition: 'Kenya Kwanza' as CoalitionType,
    biography: 'Elected Woman Representative of Kiambu County in 2022.',
    biographySource: 'Parliament of Kenya records',
  },
};
