'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Scale, BookOpen, Shield, Users, Landmark, FileText,
  Gavel, ScrollText, ChevronRight, Vote, DollarSign,
  Briefcase, Heart, TreePine, Building2, Award,
} from 'lucide-react';

interface Article { number: string; title: string; summary: string; }
interface Chapter {
  number: number; title: string; icon: React.ReactNode;
  color: string; description: string; articles: Article[];
}

const ALL_CHAPTERS: Chapter[] = [
  { number: 1, title: 'Sovereignty of the People and Supremacy of the Constitution', icon: <Gavel className="h-5 w-5 text-blue-600" />, color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800', description: 'All sovereign power belongs to the people of Kenya and shall be exercised only in accordance with this Constitution.', articles: [
    { number: '1', title: 'Supremacy of the Constitution', summary: 'This Constitution is the supreme law and binds all persons and State organs. Any law inconsistent with it is void.' },
    { number: '2', title: 'Sovereignty of the People', summary: 'The people exercise sovereign power either directly or through their democratically elected representatives.' },
    { number: '3', title: 'Defence of the Constitution', summary: 'Every person has a duty to respect and uphold the Constitution.' },
  ]},
  { number: 2, title: 'The Republic', icon: <Landmark className="h-5 w-5 text-emerald-600" />, color: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800', description: 'Kenya is a sovereign Republic with a multi-party democratic system of government.', articles: [
    { number: '4', title: 'Territory of Kenya', summary: 'Kenya consists of the territory recognized under Article 5, including territorial waters.' },
    { number: '5', title: 'Territorial Divisions', summary: 'Kenya is divided into 47 counties as set out in the First Schedule.' },
    { number: '6', title: 'Devolution of State Organs', summary: 'The territory of Kenya is divided into counties for purposes of devolved government.' },
  ]},
  { number: 3, title: 'Values and Principles of Governance', icon: <Award className="h-5 w-5 text-amber-600" />, color: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800', description: 'The national values and principles of governance bind all State organs and public officers.', articles: [
    { number: '10', title: 'National Values', summary: 'Include patriotism, national unity, sharing and devolution of power, the rule of law, democracy, human dignity, equity, social justice, inclusiveness, equality, human rights, integrity, transparency, and accountability.' },
    { number: '11', title: 'Culture as Foundation of Nation', summary: 'Recognises culture as the foundation of the nation and cumulative civilization of the Kenyan people and nation.' },
    { number: '12', title: 'Principles of Public Finance', summary: 'Openness, accountability, public participation, equity in sharing the burden of taxation, and prudence in financial management.' },
  ]},
  { number: 4, title: 'The Bill of Rights', icon: <Heart className="h-5 w-5 text-red-600" />, color: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800', description: 'Every person has inherent dignity and the right to have that dignity respected and protected.', articles: [
    { number: '19', title: 'Rights and Fundamental Freedoms', summary: 'The Bill of Rights is an integral part of Kenya\'s democratic State and is the framework for social, economic, and cultural policies.' },
    { number: '26', title: 'Right to Life', summary: 'Every person has the right to life. No person shall be deprived of life intentionally.' },
    { number: '27', title: 'Equality and Freedom from Discrimination', summary: 'Every person is equal before the law and has the right to equal protection of the law.' },
    { number: '28', title: 'Human Dignity', summary: 'Every person has inherent dignity and the right to have that dignity respected and protected.' },
    { number: '33', title: 'Freedom of Expression', summary: 'Includes freedom to seek, receive, or impart information. Does not extend to propaganda for war, incitement to violence, or hate speech.' },
    { number: '35', title: 'Access to Information', summary: 'Every citizen has the right to information held by the State and information held by another person required for exercise/protection of rights.' },
    { number: '37', title: 'Assembly, Demonstration, Picketing', summary: 'Every person has the right to peacefully assemble, demonstrate, picket, and present petitions to public authorities.' },
    { number: '38', title: 'Political Rights', summary: 'Every citizen is free to make political choices, including the right to form or participate in a political party.' },
    { number: '43', title: 'Economic and Social Rights', summary: 'Every person has the right to: highest attainable standard of health; accessible and adequate housing; freedom from hunger; clean and safe water; social security; education.' },
  ]},
  { number: 5, title: 'Land and Environment', icon: <TreePine className="h-5 w-5 text-green-600" />, color: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800', description: 'Land is held, used, and managed in a manner that is equitable, efficient, productive, and sustainable.', articles: [
    { number: '60', title: 'Principles of Land', summary: 'Equity, efficiency, productivity, sustainability, transparency, and conservation of ecologically sensitive areas.' },
    { number: '61', title: 'Classification of Land', summary: 'All land in Kenya is classified as public, community, or private land.' },
    { number: '69', title: 'Obligations in Respect of Environment', summary: 'The State shall ensure sustainable exploitation of natural resources and work to achieve tree cover of at least 10% of land area.' },
  ]},
  { number: 6, title: 'Leadership and Integrity', icon: <Shield className="h-5 w-5 text-indigo-600" />, color: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800', description: 'Authority assigned to a State officer is a public trust to be exercised in a manner that demonstrates respect for the people.', articles: [
    { number: '73', title: 'Responsibilities of Leadership', summary: 'Authority is a public trust. State officers must: bring honour to the nation, promote public confidence, not abuse office, and serve the people selflessly.' },
    { number: '75', title: 'Restrictions on Activities', summary: 'State officers cannot maintain foreign bank accounts, hold dual citizenship, or engage in gainful employment. Annual financial declarations required.' },
    { number: '76', title: 'Financial Probity', summary: 'Gifts on official occasions belong to the Republic. No State officer shall accept gifts that influence conduct.' },
    { number: '80', title: 'Legislation on Leadership', summary: 'Parliament shall enact legislation establishing the framework for leadership and integrity, including codes of conduct.' },
  ]},
  { number: 7, title: 'Representation of the People', icon: <Vote className="h-5 w-5 text-purple-600" />, color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800', description: 'The electoral system shall comply with principles of: freedom of citizens to exercise political choices; universal suffrage; free and fair elections; secret ballot.', articles: [
    { number: '81', title: 'General Principles of Electoral System', summary: 'Compliance with principles including: not more than two-thirds of members of elective bodies shall be of the same gender; fair representation of persons with disabilities; fair representation of minorities.' },
    { number: '83', title: 'Right to Vote', summary: 'Every adult citizen has the right to vote without unreasonable restrictions, in secret ballot in an election.' },
    { number: '86', title: 'Public Access to Political Parties', summary: 'Parliament shall enact legislation providing for the registration and regulation of political parties.' },
  ]},
  { number: 8, title: 'The Legislature', icon: <Building2 className="h-5 w-5 text-teal-600" />, color: 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800', description: 'Parliament consists of the National Assembly and the Senate.', articles: [
    { number: '93', title: 'Parliament of Kenya', summary: 'Parliament consists of the National Assembly and the Senate. Both participate in the legislative process.' },
    { number: '95', title: 'Role of National Assembly', summary: 'Represents the people, enacts legislation, appropriates money for national government, and oversees national revenue allocation.' },
    { number: '96', title: 'Role of Senate', summary: 'Represents the counties, protects county interests, considers and determines resolutions on allocation of national revenue among counties.' },
    { number: '97', title: 'Membership of National Assembly', summary: '290 members elected from constituencies, 47 women representatives, 12 nominated members, and the Speaker.' },
    { number: '98', title: 'Membership of Senate', summary: '47 senators (one per county), 16 nominated women, 2 youth, 2 persons with disabilities, and the Speaker.' },
  ]},
  { number: 9, title: 'The Executive', icon: <Briefcase className="h-5 w-5 text-orange-600" />, color: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800', description: 'Executive authority is vested in the President, who is the Head of State and Government and Commander-in-Chief of the Defence Forces.', articles: [
    { number: '129', title: 'Executive Authority', summary: 'Executive authority derives from the people and shall be exercised in a manner compatible with the principles of democracy.' },
    { number: '131', title: 'Authority of the President', summary: 'The President is Head of State and Government, exercises executive authority with the Deputy President, and is Commander-in-Chief.' },
    { number: '132', title: 'Functions of the President', summary: 'Assents to Bills, addresses the nation, chairs Cabinet meetings, declares states of emergency, and receives foreign envoys.' },
    { number: '138', title: 'Election of the President', summary: 'The President is elected by registered voters. A candidate needs more than half of votes and at least 25% in more than half of counties.' },
  ]},
  { number: 10, title: 'The Judiciary', icon: <Scale className="h-5 w-5 text-slate-600" />, color: 'bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800', description: 'Judicial authority is derived from the people and is vested in the courts and tribunals.', articles: [
    { number: '159', title: 'Principles of Judicial Authority', summary: 'Justice shall be done to all irrespective of status; justice shall not be delayed; alternative dispute resolution shall be promoted.' },
    { number: '161', title: 'Supreme Court', summary: 'The Supreme Court consists of the Chief Justice, Deputy Chief Justice, and five other judges. It has exclusive original jurisdiction over presidential elections.' },
    { number: '163', title: 'Supreme Court Jurisdiction', summary: 'Highest court. Hears appeals from the Court of Appeal. Its decisions are binding on all other courts.' },
  ]},
  { number: 11, title: 'Devolved Government', icon: <Landmark className="h-5 w-5 text-emerald-600" />, color: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800', description: 'The objects of devolution are to promote democratic and accountable exercise of power, foster national unity, and recognise the right of communities to manage their own affairs.', articles: [
    { number: '174', title: 'Objects of Devolution', summary: 'Promote democratic accountability; foster national unity; recognise community self-governance; protect marginalised groups; promote social/economic development; ensure equitable sharing; facilitate decentralisation; enhance checks and balances.' },
    { number: '175', title: 'Principles of Devolved Government', summary: 'Democratic principles; separation of powers; reliable revenue; gender equality (not more than two-thirds of one gender).' },
    { number: '176', title: 'County Government', summary: 'Each county has a county government consisting of a county assembly and a county executive. The Governor is directly elected.' },
    { number: '177', title: 'Membership of County Assembly', summary: 'Elected ward representatives (MCAs), nominated members for special seats, and nominated members to ensure gender balance.' },
    { number: '179', title: 'County Executive Committee', summary: 'Consists of the Governor, Deputy Governor, and not more than ten CECMs nominated by the Governor and approved by the County Assembly.' },
    { number: '180', title: 'Election of Governor', summary: 'The Governor is elected by registered voters in the county, by direct vote. Each candidate names a running mate as Deputy Governor.' },
    { number: '196', title: 'Public Participation', summary: 'Every county government shall facilitate public participation in the budget process, planning, and policy-making.' },
  ]},
  { number: 12, title: 'Public Finance', icon: <DollarSign className="h-5 w-5 text-amber-600" />, color: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800', description: 'Public finance shall promote an equitable society, with expenditure directed toward public benefit and fiscal reporting that is clear.', articles: [
    { number: '201', title: 'Principles of Public Finance', summary: 'Openness, accountability, public participation, equity in taxation, prudence, and fiscal reporting that is clear.' },
    { number: '203', title: 'Consolidated Fund', summary: 'All money raised or received by or on behalf of the national government is paid into the Consolidated Fund.' },
    { number: '215', title: 'Commission on Revenue Allocation', summary: 'The CRA determines the basis for equitable sharing of revenue between national and county governments. Counties receive at least 15% of national revenue.' },
    { number: '216', title: 'Equitable Share', summary: 'The equitable share of revenue allocated to counties shall not be less than fifteen percent of all revenue collected by the national government.' },
    { number: '227', title: 'Procurement of Public Goods and Services', summary: 'Public procurement shall be transparent, competitive, and cost-effective. It shall protect and promote local industry.' },
    { number: '228', title: 'Controller of Budget', summary: 'The Controller of Budget monitors and evaluates budget implementation. No money shall be withdrawn from any public fund without their approval.' },
    { number: '229', title: 'Office of the Auditor General', summary: 'The Auditor General audits all accounts of entities funded from public funds within six months after the end of each financial year.' },
  ]},
  { number: 13, title: 'The Public Service', icon: <Users className="h-5 w-5 text-cyan-600" />, color: 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800', description: 'The Public Service shall be maintained in all spheres of government to provide efficient, effective, and economical service.', articles: [
    { number: '232', title: 'Values and Principles of Public Service', summary: 'High standards of performance; accountability; transparency; competition and merit in appointments; gender equality; representation of marginalised groups.' },
    { number: '234', title: 'Public Service Commission', summary: 'The PSC is responsible for human resource management in the public service including appointments, promotions, and discipline.' },
    { number: '235', title: 'County Public Service', summary: 'Each county has a County Public Service Board responsible for human resource management within the county.' },
  ]},
  { number: 14, title: 'National Security', icon: <Shield className="h-5 w-5 text-slate-700" />, color: 'bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800', description: 'National security is the protection of the territorial integrity and sovereignty of Kenya, its people, rights, and interests.', articles: [
    { number: '238', title: 'National Security Organs', summary: 'The national security organs are: the Kenya Defence Forces, the National Police Service, and the National Intelligence Service.' },
    { number: '239', title: 'National Security Council', summary: 'Consists of the President, Deputy President, Cabinet Secretaries for Interior, Defence, Foreign Affairs, and the Attorney General.' },
    { number: '241', title: 'Defence Forces', summary: 'The Kenya Defence Forces comprise the Kenya Army, Kenya Navy, and Kenya Air Force, under the command of the President.' },
  ]},
  { number: 15, title: 'Commissions and Independent Offices', icon: <Award className="h-5 w-5 text-violet-600" />, color: 'bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800', description: 'Commissions and independent offices are established to protect the sovereignty of the people, secure the observance of democratic values, and promote constitutionalism.', articles: [
    { number: '248', title: 'Application of Chapter', summary: 'Commissions and holders of independent offices are subject to the Constitution and shall not be subject to direction by any person or authority.' },
    { number: '249', title: 'Functions of Commissions', summary: 'Protect sovereignty of the people; secure observance of democratic values; promote constitutionalism; protect rights and freedoms.' },
    { number: '252', title: 'Independence of Commissions', summary: 'Each commission shall be independent and shall not be subject to direction or control by any person or authority.' },
  ]},
  { number: 16, title: 'Amendment of the Constitution', icon: <ScrollText className="h-5 w-5 text-gray-600" />, color: 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800', description: 'A Bill to amend the Constitution may be introduced in either House of Parliament.', articles: [
    { number: '255', title: 'Amendment by Parliamentary Initiative', summary: 'Requires two-thirds majority of both Houses. If it amends Chapter 1-10 or certain protected articles, it must go to a referendum.' },
    { number: '256', title: 'Amendment by Popular Initiative', summary: 'Can be initiated by a petition signed by at least one million registered voters and supported by at least 25% of county assemblies.' },
    { number: '257', title: 'Referendum', summary: 'A referendum on a constitutional amendment is passed if at least 20% of registered voters in at least half of the counties vote in favour.' },
  ]},
  { number: 17, title: 'General Provisions', icon: <FileText className="h-5 w-5 text-neutral-600" />, color: 'bg-neutral-50 dark:bg-neutral-900/20 border-neutral-200 dark:border-neutral-800', description: 'General provisions governing interpretation, implementation, and transitional matters.', articles: [
    { number: '259', title: 'Construing the Constitution', summary: 'This Constitution shall be interpreted in a manner that promotes its purposes, values, and principles, and contributes to good governance.' },
    { number: '260', title: 'Interpretation', summary: 'Defines key terms used throughout the Constitution including "county," "public officer," "State organ," and other critical terms.' },
  ]},
  { number: 18, title: 'Transitional and Consequential Provisions', icon: <Gavel className="h-5 w-5 text-blue-700" />, color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800', description: 'Transitional provisions for the implementation of the Constitution.', articles: [
    { number: '261', title: 'Implementation of Constitution', summary: 'Parliament shall enact legislation required by the Constitution within specified timeframes, generally within five years.' },
    { number: '262', title: 'Consequential Legislation', summary: 'All existing laws shall be construed with alterations and adaptations necessary to bring them into conformity with this Constitution.' },
  ]},
];

export function KenyaConstitutionFull() {
  const [expandedChapter, setExpandedChapter] = useState<number | null>(6);

  return (
    <div className="space-y-4 p-4">
      <Card className="border-2 border-primary/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            Constitution of Kenya 2010 — Full Text
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            All 18 chapters with key articles. Promulgated on 27 August 2010, replacing the 1963 independence constitution.
          </p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-[10px]">Promulgated: 27 Aug 2010</Badge>
            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 text-[10px]">47 Counties</Badge>
            <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 text-[10px]">18 Chapters</Badge>
          </div>
        </CardHeader>
      </Card>

      {ALL_CHAPTERS.map((chapter) => (
        <Card key={chapter.number} className={`border-2 ${chapter.color} ${expandedChapter === chapter.number ? 'shadow-md' : ''}`}>
          <button className="w-full text-left" onClick={() => setExpandedChapter(expandedChapter === chapter.number ? null : chapter.number)}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  {chapter.icon} Chapter {chapter.number}: {chapter.title}
                </CardTitle>
                <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${expandedChapter === chapter.number ? 'rotate-90' : ''}`} />
              </div>
              {!expandedChapter && <p className="text-xs text-muted-foreground mt-1">{chapter.description}</p>}
            </CardHeader>
          </button>
          {expandedChapter === chapter.number && (
            <CardContent className="space-y-2 pt-0">
              <p className="text-xs text-muted-foreground italic mb-2">{chapter.description}</p>
              {chapter.articles.map((article) => (
                <div key={article.number} className="p-3 rounded-md bg-card border border-border hover:border-primary/30 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-sm font-medium flex items-center gap-1.5">
                      <ScrollText className="h-3.5 w-3.5 text-muted-foreground" />
                      Article {article.number}: {article.title}
                    </h4>
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 shrink-0">Ch. {chapter.number}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{article.summary}</p>
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      ))}

      <Card className="border-dashed">
        <CardContent className="pt-3">
          <div className="flex items-start gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              The Constitution of Kenya 2010 was promulgated on 27 August 2010 after being approved by 67% of voters in a referendum on 4 August 2010. It replaced the 1963 independence constitution and established: 47 county governments, a bicameral parliament (National Assembly + Senate), an independent Judiciary, the Supreme Court, and independent commissions including the Controller of Budget, Auditor General, and the Ethics and Anti-Corruption Commission (EACC).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
