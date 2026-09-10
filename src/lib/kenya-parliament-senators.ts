// Parliament-Sourced Senator Data — verified from parliament.go.ke
import type { CoalitionType } from './kenya-data';
export interface ParliamentSenator { id: string; fullName: string; officialTitle: string; party: string; coalition: CoalitionType; jurisdiction: string; countyName: string; countyCode: number; status: 'Elected' | 'Nominated'; profileUrl: string; rawName: string; source: 'Parliament of Kenya (parliament.go.ke)'; }

export const MOMBASA_SENATORS: ParliamentSenator[] = [
  { id: 'sen-parliament-mombasa', fullName: 'Sen. Faki Mohamed Mwinyihaji', officialTitle: 'Senator, Mombasa', party: 'ODM', coalition: 'Azimio', jurisdiction: 'Mombasa', countyName: 'Mombasa', countyCode: 1, status: 'Elected', profileUrl: 'https://www.parliament.go.ke/the-senate/sen-faki-mohamed-mwinyihaji', rawName: 'Sen. Faki Mohamed Mwinyihaji', source: 'Parliament of Kenya (parliament.go.ke)' },
];
export const KWALE_SENATORS: ParliamentSenator[] = [
  { id: 'sen-parliament-kwale', fullName: 'Sen. Boy Issa Juma', officialTitle: 'Senator, Kwale', party: 'ODM', coalition: 'Azimio', jurisdiction: 'Kwale', countyName: 'Kwale', countyCode: 2, status: 'Elected', profileUrl: 'https://www.parliament.go.ke/the-senate/sen-boy-issa-juma-cbs', rawName: 'Sen. Boy Issa Juma, CBS', source: 'Parliament of Kenya (parliament.go.ke)' },
];
export const KILIFI_SENATORS: ParliamentSenator[] = [
  { id: 'sen-parliament-kilifi', fullName: 'Sen. (Rtd.) Justice Stewart Madzayo', officialTitle: 'Senator, Kilifi', party: 'ODM', coalition: 'Azimio', jurisdiction: 'Kilifi', countyName: 'Kilifi', countyCode: 3, status: 'Elected', profileUrl: 'https://www.parliament.go.ke/the-senate/sen-rtd-justice-stewart-madzayo-cbs-mp', rawName: 'Sen. (Rtd) Justice Stewart Madzayo, CBS, MP', source: 'Parliament of Kenya (parliament.go.ke)' },
];
export const TANA_RIVER_SENATORS: ParliamentSenator[] = [
  { id: 'sen-parliament-tana-river', fullName: 'Sen. Mungatana Danson Buya', officialTitle: 'Senator, Tana River', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Tana River', countyName: 'Tana River', countyCode: 4, status: 'Elected', profileUrl: 'https://www.parliament.go.ke/the-senate/sen-mungatana-danson-buya', rawName: 'Sen. Mungatana Danson Buya', source: 'Parliament of Kenya (parliament.go.ke)' },
];
export const LAMU_SENATORS: ParliamentSenator[] = [
  { id: 'sen-parliament-lamu', fullName: 'Sen. Kamau Joseph Githuku', officialTitle: 'Senator, Lamu', party: 'JP', coalition: 'Kenya Kwanza', jurisdiction: 'Lamu', countyName: 'Lamu', countyCode: 5, status: 'Elected', profileUrl: 'https://www.parliament.go.ke/the-senate/sen-kamau-joseph-githuku', rawName: 'Sen. Kamau Joseph Githuku', source: 'Parliament of Kenya (parliament.go.ke)' },
];
export const TAITA_TAVETA_SENATORS: ParliamentSenator[] = [
  { id: 'sen-parliament-taita-taveta', fullName: 'Sen. Mwaruma Johnes M', officialTitle: 'Senator, Taita Taveta', party: 'ODM', coalition: 'Azimio', jurisdiction: 'Taita Taveta', countyName: 'Taita Taveta', countyCode: 6, status: 'Elected', profileUrl: 'https://www.parliament.go.ke/the-senate/sen-mwaruma-johnes-m-cbs', rawName: 'Sen. Mwaruma Johnes M, CBS', source: 'Parliament of Kenya (parliament.go.ke)' },
];
export const GARISSA_SENATORS: ParliamentSenator[] = [
  { id: 'sen-parliament-garissa', fullName: 'Sen. Haji Abdul Mohammed', officialTitle: 'Senator, Garissa', party: 'JP', coalition: 'Kenya Kwanza', jurisdiction: 'Garissa', countyName: 'Garissa', countyCode: 7, status: 'Elected', profileUrl: 'https://www.parliament.go.ke/the-senate/sen-haji-abdul-mohammed', rawName: 'Sen. Haji Abdul Mohammed', source: 'Parliament of Kenya (parliament.go.ke)' },
];
export const WAJIR_SENATORS: ParliamentSenator[] = [
  { id: 'sen-parliament-wajir', fullName: 'Sen. Mohamed Abass Sheikh', officialTitle: 'Senator, Wajir', party: 'UDM', coalition: 'Kenya Kwanza', jurisdiction: 'Wajir', countyName: 'Wajir', countyCode: 8, status: 'Elected', profileUrl: 'https://www.parliament.go.ke/the-senate/sen-mohamed-abass-sheikh', rawName: 'Sen. Mohamed Abass Sheikh', source: 'Parliament of Kenya (parliament.go.ke)' },
];
export const MANDERA_SENATORS: ParliamentSenator[] = [
  { id: 'sen-parliament-mandera', fullName: 'Sen. Roba Ali Ibrahim', officialTitle: 'Senator, Mandera', party: 'UDM', coalition: 'Kenya Kwanza', jurisdiction: 'Mandera', countyName: 'Mandera', countyCode: 9, status: 'Elected', profileUrl: 'https://www.parliament.go.ke/the-senate/sen-roba-ali-ibrahim', rawName: 'Sen. Roba Ali Ibrahim', source: 'Parliament of Kenya (parliament.go.ke)' },
];
export const MARSABIT_SENATORS: ParliamentSenator[] = [
  { id: 'sen-parliament-marsabit', fullName: 'Sen. Chute Mohamed Said', officialTitle: 'Senator, Marsabit', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Marsabit', countyName: 'Marsabit', countyCode: 10, status: 'Elected', profileUrl: 'https://www.parliament.go.ke/the-senate/sen-chute-mohamed-said-cbs', rawName: 'Sen. Chute Mohamed Said, CBS', source: 'Parliament of Kenya (parliament.go.ke)' },
];
export const ISIOLO_SENATORS: ParliamentSenator[] = [
  { id: 'sen-parliament-isiolo', fullName: 'Sen. Dullo Fatuma Adan', officialTitle: 'Senator, Isiolo', party: 'JP', coalition: 'Kenya Kwanza', jurisdiction: 'Isiolo', countyName: 'Isiolo', countyCode: 11, status: 'Elected', profileUrl: 'https://www.parliament.go.ke/the-senate/sen-dullo-fatuma-adan', rawName: 'Sen. Dullo Fatuma Adan', source: 'Parliament of Kenya (parliament.go.ke)' },
];
export const MERU_SENATORS: ParliamentSenator[] = [
  { id: 'sen-parliament-meru', fullName: 'Sen. Murungi Kathuri', officialTitle: 'Senator, Meru', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Meru', countyName: 'Meru', countyCode: 12, status: 'Elected', profileUrl: 'https://www.parliament.go.ke/the-senate/sen-murungi-kathuri', rawName: 'Sen. Murungi Kathuri', source: 'Parliament of Kenya (parliament.go.ke)' },
];
export const THARAKA_NITHI_SENATORS: ParliamentSenator[] = [
  { id: 'sen-parliament-tharaka-nithi', fullName: 'Sen. Mwenda Gataya Mo Fire', officialTitle: 'Senator, Tharaka Nithi', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Tharaka Nithi', countyName: 'Tharaka Nithi', countyCode: 13, status: 'Elected', profileUrl: 'https://www.parliament.go.ke/the-senate/sen-mwenda-gataya-mo-fire', rawName: 'Sen. Mwenda Gataya Mo Fire', source: 'Parliament of Kenya (parliament.go.ke)' },
];
export const EMBU_SENATORS: ParliamentSenator[] = [
  { id: 'sen-parliament-embu', fullName: 'Sen. Munyi Alexander Mundigi', officialTitle: 'Senator, Embu', party: 'DP', coalition: 'Other', jurisdiction: 'Embu', countyName: 'Embu', countyCode: 14, status: 'Elected', profileUrl: 'https://www.parliament.go.ke/the-senate/sen-munyi-alexander-mundigi', rawName: 'Sen. Munyi Alexander Mundigi', source: 'Parliament of Kenya (parliament.go.ke)' },
];
export const KITUI_SENATORS: ParliamentSenator[] = [
  { id: 'sen-parliament-kitui', fullName: 'Sen. Wambua Enoch Kiio', officialTitle: 'Senator, Kitui', party: 'WDM', coalition: 'Kenya Kwanza', jurisdiction: 'Kitui', countyName: 'Kitui', countyCode: 15, status: 'Elected', profileUrl: 'https://www.parliament.go.ke/the-senate/sen-wambua-enoch-kiio-0', rawName: 'Sen. Wambua Enoch Kiio', source: 'Parliament of Kenya (parliament.go.ke)' },
];
export const MACHAKOS_SENATORS: ParliamentSenator[] = [
  { id: 'sen-parliament-machakos', fullName: 'Sen. Muthama Agnes Kavindu Mbuku', officialTitle: 'Senator, Machakos', party: 'WDM', coalition: 'Kenya Kwanza', jurisdiction: 'Machakos', countyName: 'Machakos', countyCode: 16, status: 'Elected', profileUrl: 'https://www.parliament.go.ke/the-senate/sen-muthama-agnes-kavindu-mbuku', rawName: 'Sen. Muthama Agnes Kavindu Mbuku', source: 'Parliament of Kenya (parliament.go.ke)' },
];
export const MAKUENI_SENATORS: ParliamentSenator[] = [
  { id: 'sen-parliament-makueni', fullName: 'Sen. Maanzo Daniel Kitonga', officialTitle: 'Senator, Makueni', party: 'WDM', coalition: 'Kenya Kwanza', jurisdiction: 'Makueni', countyName: 'Makueni', countyCode: 17, status: 'Elected', profileUrl: 'https://www.parliament.go.ke/the-senate/sen-maanzo-daniel-kitonga', rawName: 'Sen. Maanzo Daniel Kitonga', source: 'Parliament of Kenya (parliament.go.ke)' },
];
export const NYANDARUA_SENATORS: ParliamentSenator[] = [
  { id: 'sen-parliament-nyandarua', fullName: 'Sen. Methu John Muhia', officialTitle: 'Senator, Nyandarua', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Nyandarua', countyName: 'Nyandarua', countyCode: 18, status: 'Elected', profileUrl: 'https://www.parliament.go.ke/the-senate/sen-methu-john-muhia', rawName: 'Sen. Methu John Muhia', source: 'Parliament of Kenya (parliament.go.ke)' },
];
export const NYERI_SENATORS: ParliamentSenator[] = [
  { id: 'sen-parliament-nyeri', fullName: 'Sen. Wamatinga Wahome', officialTitle: 'Senator, Nyeri', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Nyeri', countyName: 'Nyeri', countyCode: 19, status: 'Elected', profileUrl: 'https://www.parliament.go.ke/the-senate/sen-wamatinga-wahome-cbs', rawName: 'Sen. Wamatinga Wahome, CBS', source: 'Parliament of Kenya (parliament.go.ke)' },
];
export const KIRINYAGA_SENATORS: ParliamentSenator[] = [
  { id: 'sen-parliament-kirinyaga', fullName: 'Sen. Murango James Kamau', officialTitle: 'Senator, Kirinyaga', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Kirinyaga', countyName: 'Kirinyaga', countyCode: 20, status: 'Elected', profileUrl: 'https://www.parliament.go.ke/the-senate/sen-murango-james-kamau', rawName: 'Sen. Murango James Kamau', source: 'Parliament of Kenya (parliament.go.ke)' },
];
export const MURANGA_SENATORS: ParliamentSenator[] = [
  { id: 'sen-parliament-murang-a', fullName: 'Sen. Joe Nyutu', officialTitle: 'Senator, Murang\'a', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Murang\'a', countyName: 'Murang\'a', countyCode: 21, status: 'Elected', profileUrl: 'https://www.parliament.go.ke/the-senate/sen-joe-nyutu', rawName: 'Sen. Joe Nyutu', source: 'Parliament of Kenya (parliament.go.ke)' },
];
export const KIAMBU_SENATORS: ParliamentSenator[] = [
  { id: 'sen-parliament-kiambu', fullName: 'Sen. Karungo Paul Thangwa', officialTitle: 'Senator, Kiambu', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Kiambu', countyName: 'Kiambu', countyCode: 22, status: 'Elected', profileUrl: 'https://www.parliament.go.ke/the-senate/sen-karungo-paul-thangwa', rawName: 'Sen. Karungo Paul Thangwa', source: 'Parliament of Kenya (parliament.go.ke)' },
];
export const TURKANA_SENATORS: ParliamentSenator[] = [
  { id: 'sen-parliament-turkana', fullName: 'Sen. Ekomwa James Lomenen', officialTitle: 'Senator, Turkana', party: 'JP', coalition: 'Kenya Kwanza', jurisdiction: 'Turkana', countyName: 'Turkana', countyCode: 23, status: 'Elected', profileUrl: 'https://www.parliament.go.ke/the-senate/sen-ekomwa-james-lomenen', rawName: 'Sen. Ekomwa James Lomenen', source: 'Parliament of Kenya (parliament.go.ke)' },
];
export const WEST_POKOT_SENATORS: ParliamentSenator[] = [
  { id: 'sen-parliament-west-pokot', fullName: 'Sen. Recha Julius Murgor', officialTitle: 'Senator, West Pokot', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'West Pokot', countyName: 'West Pokot', countyCode: 24, status: 'Elected', profileUrl: 'https://www.parliament.go.ke/the-senate/sen-recha-julius-murgor', rawName: 'Sen. Recha Julius Murgor', source: 'Parliament of Kenya (parliament.go.ke)' },
];
export const SAMBURU_SENATORS: ParliamentSenator[] = [
  { id: 'sen-parliament-samburu', fullName: 'Sen. Lelegwe Steve Ltumbesi', officialTitle: 'Senator, Samburu', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Samburu', countyName: 'Samburu', countyCode: 25, status: 'Elected', profileUrl: 'https://www.parliament.go.ke/the-senate/sen-lelegwe-steve-ltumbesi', rawName: 'Sen. Lelegwe Steve Ltumbesi', source: 'Parliament of Kenya (parliament.go.ke)' },
];
export const TRANS_NZOIA_SENATORS: ParliamentSenator[] = [
  { id: 'sen-parliament-trans-nzoia', fullName: 'Sen. Chesang Allan Kiprotich', officialTitle: 'Senator, Trans-Nzoia', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Trans-Nzoia', countyName: 'Trans-Nzoia', countyCode: 26, status: 'Elected', profileUrl: 'https://www.parliament.go.ke/the-senate/sen-chesang-allan-kiprotich-cbs', rawName: 'Sen. Chesang Allan Kiprotich, CBS', source: 'Parliament of Kenya (parliament.go.ke)' },
];
export const UASIN_GISHU_SENATORS: ParliamentSenator[] = [
  { id: 'sen-parliament-uasin-gishu', fullName: 'Sen. Kiplagat Jackson Mandago', officialTitle: 'Senator, Uasin Gishu', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Uasin Gishu', countyName: 'Uasin Gishu', countyCode: 27, status: 'Elected', profileUrl: 'https://www.parliament.go.ke/the-senate/sen-kiplagat-jackson-mandago', rawName: 'Sen. Kiplagat Jackson Mandago', source: 'Parliament of Kenya (parliament.go.ke)' },
];
export const ELGEYO_MARAKWET_SENATORS: ParliamentSenator[] = [
  { id: 'sen-parliament-elgeyo-marakwet', fullName: 'Sen. Kisang William Kipkemoi', officialTitle: 'Senator, Elgeyo-Marakwet', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Elgeyo-Marakwet', countyName: 'Elgeyo-Marakwet', countyCode: 28, status: 'Elected', profileUrl: 'https://www.parliament.go.ke/the-senate/sen-kisang-william-kipkemoi-cbs', rawName: 'Sen. Kisang William Kipkemoi, CBS', source: 'Parliament of Kenya (parliament.go.ke)' },
];
export const NANDI_SENATORS: ParliamentSenator[] = [
  { id: 'sen-parliament-nandi', fullName: 'Sen. Cherarkey Samson K', officialTitle: 'Senator, Nandi', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Nandi', countyName: 'Nandi', countyCode: 29, status: 'Elected', profileUrl: 'https://www.parliament.go.ke/the-senate/sen-cherarkey-samson-k', rawName: 'Sen. Cherarkey Samson K', source: 'Parliament of Kenya (parliament.go.ke)' },
];
export const BARINGO_SENATORS: ParliamentSenator[] = [
  { id: 'sen-parliament-baringo', fullName: 'Sen. Cheburet Kiprono Chemitei V.', officialTitle: 'Senator, Baringo', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Baringo', countyName: 'Baringo', countyCode: 30, status: 'Elected', profileUrl: 'https://www.parliament.go.ke/the-senate/sen-cheburet-kiprono-chemitei-v', rawName: 'Sen. Cheburet Kiprono Chemitei V.', source: 'Parliament of Kenya (parliament.go.ke)' },
];
export const LAIKIPIA_SENATORS: ParliamentSenator[] = [
  { id: 'sen-parliament-laikipia', fullName: 'Sen. Nderitu John Kinyua', officialTitle: 'Senator, Laikipia', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Laikipia', countyName: 'Laikipia', countyCode: 31, status: 'Elected', profileUrl: 'https://www.parliament.go.ke/the-senate/sen-nderitu-john-kinyua', rawName: 'Sen. Nderitu John Kinyua', source: 'Parliament of Kenya (parliament.go.ke)' },
];
export const NAKURU_SENATORS: ParliamentSenator[] = [
  { id: 'sen-parliament-nakuru', fullName: 'Sen. Keroche Tabitha Karanja', officialTitle: 'Senator, Nakuru', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Nakuru', countyName: 'Nakuru', countyCode: 32, status: 'Elected', profileUrl: 'https://www.parliament.go.ke/the-senate/sen-keroche-tabitha-karanja', rawName: 'Sen. Keroche Tabitha Karanja', source: 'Parliament of Kenya (parliament.go.ke)' },
];
export const NAROK_SENATORS: ParliamentSenator[] = [
  { id: 'sen-parliament-narok', fullName: 'Sen. Olekina Ledama', officialTitle: 'Senator, Narok', party: 'ODM', coalition: 'Azimio', jurisdiction: 'Narok', countyName: 'Narok', countyCode: 33, status: 'Elected', profileUrl: 'https://www.parliament.go.ke/the-senate/sen-olekina-ledama-0', rawName: 'Sen. Olekina Ledama', source: 'Parliament of Kenya (parliament.go.ke)' },
];
export const KAJIADO_SENATORS: ParliamentSenator[] = [
  { id: 'sen-parliament-kajiado', fullName: 'Sen. Seki Lenku Ole Kanar', officialTitle: 'Senator, Kajiado', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Kajiado', countyName: 'Kajiado', countyCode: 34, status: 'Elected', profileUrl: 'https://www.parliament.go.ke/the-senate/sen-seki-lenku-ole-kanar', rawName: 'Sen. Seki Lenku Ole Kanar', source: 'Parliament of Kenya (parliament.go.ke)' },
];
export const KERICHO_SENATORS: ParliamentSenator[] = [
  { id: 'sen-parliament-kericho', fullName: 'Sen. Cheruiyot Aaron Kipkirui', officialTitle: 'Senator, Kericho', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Kericho', countyName: 'Kericho', countyCode: 35, status: 'Elected', profileUrl: 'https://www.parliament.go.ke/the-senate/sen-cheruiyot-aaron-kipkirui-0', rawName: 'Sen. Cheruiyot Aaron Kipkirui', source: 'Parliament of Kenya (parliament.go.ke)' },
];
export const BOMET_SENATORS: ParliamentSenator[] = [
  { id: 'sen-parliament-bomet', fullName: 'Sen. Wakili Hillary Kiprotich Sigei', officialTitle: 'Senator, Bomet', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Bomet', countyName: 'Bomet', countyCode: 36, status: 'Elected', profileUrl: 'https://www.parliament.go.ke/the-senate/sen-wakili-hillary-kiprotich-sigei-cbs-mp', rawName: 'Sen. Wakili Hillary Kiprotich Sigei', source: 'Parliament of Kenya (parliament.go.ke)' },
];
export const KAKAMEGA_SENATORS: ParliamentSenator[] = [
  { id: 'sen-parliament-kakamega', fullName: 'Sen. (Dr.) Khalwale Boni', officialTitle: 'Senator, Kakamega', party: 'UDA', coalition: 'Kenya Kwanza', jurisdiction: 'Kakamega', countyName: 'Kakamega', countyCode: 37, status: 'Elected', profileUrl: 'https://www.parliament.go.ke/the-senate/sen-dr-khalwale-boni', rawName: 'Sen. (Dr.) Khalwale Boni', source: 'Parliament of Kenya (parliament.go.ke)' },
];
export const VIHIGA_SENATORS: ParliamentSenator[] = [
  { id: 'sen-parliament-vihiga', fullName: 'Sen. Osotsi Godfrey Atieno', officialTitle: 'Senator, Vihiga', party: 'ODM', coalition: 'Azimio', jurisdiction: 'Vihiga', countyName: 'Vihiga', countyCode: 38, status: 'Elected', profileUrl: 'https://www.parliament.go.ke/the-senate/sen-osotsi-godfrey-atieno', rawName: 'Sen. Osotsi Godfrey Atieno', source: 'Parliament of Kenya (parliament.go.ke)' },
];
export const BUNGOMA_SENATORS: ParliamentSenator[] = [
];
export const BUSIA_SENATORS: ParliamentSenator[] = [
  { id: 'sen-parliament-busia', fullName: 'Sen. Okoiti Andrew Omtatah', officialTitle: 'Senator, Busia', party: 'NRA', coalition: 'Other', jurisdiction: 'Busia', countyName: 'Busia', countyCode: 40, status: 'Elected', profileUrl: 'https://www.parliament.go.ke/the-senate/sen-okoiti-andrew-omtatah', rawName: 'Sen. Okoiti Andrew Omtatah', source: 'Parliament of Kenya (parliament.go.ke)' },
];
export const SIAYA_SENATORS: ParliamentSenator[] = [
  { id: 'sen-parliament-siaya', fullName: 'Sen. Oginga Oburu', officialTitle: 'Senator, Siaya', party: 'ODM', coalition: 'Azimio', jurisdiction: 'Siaya', countyName: 'Siaya', countyCode: 41, status: 'Elected', profileUrl: 'https://www.parliament.go.ke/the-senate/sen-oginga-oburu', rawName: 'Sen. Oginga Oburu', source: 'Parliament of Kenya (parliament.go.ke)' },
];
export const KISUMU_SENATORS: ParliamentSenator[] = [
  { id: 'sen-parliament-kisumu', fullName: 'Sen. Prof. Tom Odhiambo Ojienda', officialTitle: 'Senator, Kisumu', party: 'ODM', coalition: 'Azimio', jurisdiction: 'Kisumu', countyName: 'Kisumu', countyCode: 42, status: 'Elected', profileUrl: 'https://www.parliament.go.ke/the-senate/sen-prof-tom-odhiambo-ojienda-sc-mp', rawName: 'Sen. Prof. Tom Odhiambo Ojienda, SC, MP', source: 'Parliament of Kenya (parliament.go.ke)' },
];
export const HOMA_BAY_SENATORS: ParliamentSenator[] = [
  { id: 'sen-parliament-homa-bay', fullName: 'Sen. Kajwang\' Moses Otieno', officialTitle: 'Senator, Homa Bay', party: 'ODM', coalition: 'Azimio', jurisdiction: 'Homa Bay', countyName: 'Homa Bay', countyCode: 43, status: 'Elected', profileUrl: 'https://www.parliament.go.ke/the-senate/sen-kajwang-moses-otieno-0', rawName: 'Sen. Kajwang\' Moses Otieno', source: 'Parliament of Kenya (parliament.go.ke)' },
];
export const MIGORI_SENATORS: ParliamentSenator[] = [
  { id: 'sen-parliament-migori', fullName: 'Sen. Oketch Eddy Gicheru', officialTitle: 'Senator, Migori', party: 'ODM', coalition: 'Azimio', jurisdiction: 'Migori', countyName: 'Migori', countyCode: 44, status: 'Elected', profileUrl: 'https://www.parliament.go.ke/the-senate/sen-oketch-eddy-gicheru', rawName: 'Sen. Oketch Eddy Gicheru', source: 'Parliament of Kenya (parliament.go.ke)' },
];
export const KISII_SENATORS: ParliamentSenator[] = [
  { id: 'sen-parliament-kisii', fullName: 'Sen. Onyonka Richard Momoima', officialTitle: 'Senator, Kisii', party: 'ODM', coalition: 'Azimio', jurisdiction: 'Kisii', countyName: 'Kisii', countyCode: 45, status: 'Elected', profileUrl: 'https://www.parliament.go.ke/the-senate/sen-onyonka-richard-momoima', rawName: 'Sen. Onyonka Richard Momoima', source: 'Parliament of Kenya (parliament.go.ke)' },
];
export const NYAMIRA_SENATORS: ParliamentSenator[] = [
  { id: 'sen-parliament-nyamira', fullName: 'Sen. Mogeni Erick Okongo', officialTitle: 'Senator, Nyamira', party: 'ODM', coalition: 'Azimio', jurisdiction: 'Nyamira', countyName: 'Nyamira', countyCode: 46, status: 'Elected', profileUrl: 'https://www.parliament.go.ke/the-senate/sen-mogeni-erick-okongo', rawName: 'Sen. Mogeni Erick Okongo', source: 'Parliament of Kenya (parliament.go.ke)' },
];
export const NAIROBI_CITY_SENATORS: ParliamentSenator[] = [
  { id: 'sen-parliament-nairobi-city', fullName: 'Sen. Sifuna Edwin Watenya', officialTitle: 'Senator, Nairobi City', party: 'ODM', coalition: 'Azimio', jurisdiction: 'Nairobi City', countyName: 'Nairobi City', countyCode: 47, status: 'Elected', profileUrl: 'https://www.parliament.go.ke/the-senate/sen-sifuna-edwin-watenya', rawName: 'Sen. Sifuna Edwin Watenya', source: 'Parliament of Kenya (parliament.go.ke)' },
];
export const NOMINATED_SENATORS: ParliamentSenator[] = [
  { id: 'sen-parliament-nominated-abdalla-shakilla-mohamed', fullName: 'Sen. Abdalla Shakilla Mohamed', officialTitle: 'Nominated Senator', party: 'WDM', coalition: 'Kenya Kwanza', jurisdiction: 'Nominated (Special Interest)', countyName: 'Nominated', countyCode: 0, status: 'Nominated', profileUrl: 'https://www.parliament.go.ke/the-senate/sen-abdalla-shakila-mohamed', rawName: 'Sen. Abdalla Shakilla Mohamed', source: 'Parliament of Kenya (parliament.go.ke)' },
];

export function getParliamentSenatorForCounty(countyName: string): ParliamentSenator | null {
  switch (countyName) {
    case "Mombasa": return MOMBASA_SENATORS.find(s => s.status === "Elected") ?? null;
    case "Kwale": return KWALE_SENATORS.find(s => s.status === "Elected") ?? null;
    case "Kilifi": return KILIFI_SENATORS.find(s => s.status === "Elected") ?? null;
    case "Tana River": return TANA_RIVER_SENATORS.find(s => s.status === "Elected") ?? null;
    case "Lamu": return LAMU_SENATORS.find(s => s.status === "Elected") ?? null;
    case "Taita Taveta": return TAITA_TAVETA_SENATORS.find(s => s.status === "Elected") ?? null;
    case "Garissa": return GARISSA_SENATORS.find(s => s.status === "Elected") ?? null;
    case "Wajir": return WAJIR_SENATORS.find(s => s.status === "Elected") ?? null;
    case "Mandera": return MANDERA_SENATORS.find(s => s.status === "Elected") ?? null;
    case "Marsabit": return MARSABIT_SENATORS.find(s => s.status === "Elected") ?? null;
    case "Isiolo": return ISIOLO_SENATORS.find(s => s.status === "Elected") ?? null;
    case "Meru": return MERU_SENATORS.find(s => s.status === "Elected") ?? null;
    case "Tharaka Nithi": return THARAKA_NITHI_SENATORS.find(s => s.status === "Elected") ?? null;
    case "Embu": return EMBU_SENATORS.find(s => s.status === "Elected") ?? null;
    case "Kitui": return KITUI_SENATORS.find(s => s.status === "Elected") ?? null;
    case "Machakos": return MACHAKOS_SENATORS.find(s => s.status === "Elected") ?? null;
    case "Makueni": return MAKUENI_SENATORS.find(s => s.status === "Elected") ?? null;
    case "Nyandarua": return NYANDARUA_SENATORS.find(s => s.status === "Elected") ?? null;
    case "Nyeri": return NYERI_SENATORS.find(s => s.status === "Elected") ?? null;
    case "Kirinyaga": return KIRINYAGA_SENATORS.find(s => s.status === "Elected") ?? null;
    case "Murang'a": return MURANGA_SENATORS.find(s => s.status === "Elected") ?? null;
    case "Kiambu": return KIAMBU_SENATORS.find(s => s.status === "Elected") ?? null;
    case "Turkana": return TURKANA_SENATORS.find(s => s.status === "Elected") ?? null;
    case "West Pokot": return WEST_POKOT_SENATORS.find(s => s.status === "Elected") ?? null;
    case "Samburu": return SAMBURU_SENATORS.find(s => s.status === "Elected") ?? null;
    case "Trans-Nzoia": return TRANS_NZOIA_SENATORS.find(s => s.status === "Elected") ?? null;
    case "Uasin Gishu": return UASIN_GISHU_SENATORS.find(s => s.status === "Elected") ?? null;
    case "Elgeyo-Marakwet": return ELGEYO_MARAKWET_SENATORS.find(s => s.status === "Elected") ?? null;
    case "Nandi": return NANDI_SENATORS.find(s => s.status === "Elected") ?? null;
    case "Baringo": return BARINGO_SENATORS.find(s => s.status === "Elected") ?? null;
    case "Laikipia": return LAIKIPIA_SENATORS.find(s => s.status === "Elected") ?? null;
    case "Nakuru": return NAKURU_SENATORS.find(s => s.status === "Elected") ?? null;
    case "Narok": return NAROK_SENATORS.find(s => s.status === "Elected") ?? null;
    case "Kajiado": return KAJIADO_SENATORS.find(s => s.status === "Elected") ?? null;
    case "Kericho": return KERICHO_SENATORS.find(s => s.status === "Elected") ?? null;
    case "Bomet": return BOMET_SENATORS.find(s => s.status === "Elected") ?? null;
    case "Kakamega": return KAKAMEGA_SENATORS.find(s => s.status === "Elected") ?? null;
    case "Vihiga": return VIHIGA_SENATORS.find(s => s.status === "Elected") ?? null;
    case "Bungoma": return BUNGOMA_SENATORS.find(s => s.status === "Elected") ?? null;
    case "Busia": return BUSIA_SENATORS.find(s => s.status === "Elected") ?? null;
    case "Siaya": return SIAYA_SENATORS.find(s => s.status === "Elected") ?? null;
    case "Kisumu": return KISUMU_SENATORS.find(s => s.status === "Elected") ?? null;
    case "Homa Bay": return HOMA_BAY_SENATORS.find(s => s.status === "Elected") ?? null;
    case "Migori": return MIGORI_SENATORS.find(s => s.status === "Elected") ?? null;
    case "Kisii": return KISII_SENATORS.find(s => s.status === "Elected") ?? null;
    case "Nyamira": return NYAMIRA_SENATORS.find(s => s.status === "Elected") ?? null;
    case "Nairobi City": return NAIROBI_CITY_SENATORS.find(s => s.status === "Elected") ?? null;
    default: return null;
  }
}
export function getNominatedSenators(): ParliamentSenator[] { return NOMINATED_SENATORS; }
export const PARLIAMENT_SENATORS_TOTAL = 47;