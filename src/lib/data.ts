// Government Representative Data Model & Mock Data

export type PerformanceColor = "green" | "yellow" | "orange" | "red";
export type PromiseStatus = "Fulfilled" | "In Progress" | "Not Started" | "Broken";
export type ProjectStatus = "Completed" | "On Track" | "Delayed" | "At Risk" | "Not Started";
export type ComplianceStatus = "Compliant" | "Minor Issues" | "Non-Compliant" | "Under Review";
export type TrendDirection = "up" | "down" | "neutral";

export interface CategoryScore {
  budgetManagement: number;
  projectDelivery: number;
  publicSatisfaction: number;
  transparencyAccountability: number;
  policyImplementation: number;
  stakeholderEngagement: number;
}

export interface PerformanceScore {
  overall: number;
  previousOverall: number;
  trend: TrendDirection;
  categories: CategoryScore;
}

export interface Promise {
  id: string;
  description: string;
  status: PromiseStatus;
  completionPercent: number;
  targetDate: string;
}

export interface ProjectMilestone {
  id: string;
  name: string;
  timeline: string;
  budget: string;
  status: ProjectStatus;
  completionPercent: number;
}

export interface ComplianceRecord {
  id: string;
  type: string;
  result: ComplianceStatus;
  date: string;
  details: string;
}

export interface PublicFeedback {
  id: string;
  satisfactionRating: number;
  summary: string;
  date: string;
  respondentCount: number;
}

export interface AccountabilityData {
  promises: Promise[];
  projectMilestones: ProjectMilestone[];
  complianceRecords: ComplianceRecord[];
  publicFeedback: PublicFeedback[];
}

export interface Representative {
  id: string;
  name: string;
  title: string;
  department: string;
  initials: string;
  avatarColor: string;
  termStart: string;
  termEnd: string;
  contactEmail: string;
  contactPhone: string;
  biography: string;
  responsibilities: string[];
  performance: PerformanceScore;
  accountability: AccountabilityData;
  children: Representative[];
  parentId: string | null;
}

export function getScoreColor(score: number): PerformanceColor {
  if (score >= 80) return "green";
  if (score >= 60) return "yellow";
  if (score >= 40) return "orange";
  return "red";
}

export function getScoreColorHex(score: number): string {
  const color = getScoreColor(score);
  switch (color) {
    case "green": return "#22c55e";
    case "yellow": return "#eab308";
    case "orange": return "#f97316";
    case "red": return "#ef4444";
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "Fulfilled":
    case "Completed":
    case "Compliant":
    case "On Track":
      return "#22c55e";
    case "In Progress":
    case "Minor Issues":
    case "Delayed":
      return "#eab308";
    case "Not Started":
    case "Under Review":
      return "#94a3b8";
    case "Broken":
    case "Non-Compliant":
    case "At Risk":
      return "#ef4444";
    default:
      return "#94a3b8";
  }
}

// Helper to create a representative
function rep(
  id: string,
  name: string,
  title: string,
  department: string,
  avatarColor: string,
  termStart: string,
  termEnd: string,
  contactEmail: string,
  contactPhone: string,
  biography: string,
  responsibilities: string[],
  performance: PerformanceScore,
  accountability: AccountabilityData,
  children: Representative[] = [],
  parentId: string | null = null,
): Representative {
  const parts = name.split(" ");
  const initials = parts.map((p) => p[0]).join("").toUpperCase().slice(0, 2);
  return {
    id,
    name,
    title,
    department,
    initials,
    avatarColor,
    termStart,
    termEnd,
    contactEmail,
    contactPhone,
    biography,
    responsibilities,
    performance,
    accountability,
    children,
    parentId,
  };
}

// ===================== ACCOUNTABILITY DATA =====================

const presidentAccountability: AccountabilityData = {
  promises: [
    { id: "p1", description: "Reduce national debt by 15%", status: "In Progress", completionPercent: 45, targetDate: "2027-12-31" },
    { id: "p2", description: "Create 2 million new jobs", status: "In Progress", completionPercent: 62, targetDate: "2027-06-30" },
    { id: "p3", description: "Improve healthcare access for rural areas", status: "In Progress", completionPercent: 38, targetDate: "2026-12-31" },
    { id: "p4", description: "Strengthen national security infrastructure", status: "Fulfilled", completionPercent: 100, targetDate: "2025-12-31" },
    { id: "p5", description: "Implement transparent governance platform", status: "In Progress", completionPercent: 55, targetDate: "2027-03-31" },
  ],
  projectMilestones: [
    { id: "pm1", name: "National Digital Infrastructure", timeline: "2024-2027", budget: "$2.4B", status: "On Track", completionPercent: 55 },
    { id: "pm2", name: "Healthcare Modernization Program", timeline: "2024-2028", budget: "$1.8B", status: "Delayed", completionPercent: 30 },
    { id: "pm3", name: "Education Reform Initiative", timeline: "2025-2029", budget: "$900M", status: "On Track", completionPercent: 20 },
  ],
  complianceRecords: [
    { id: "cr1", type: "Annual Financial Audit", result: "Compliant", date: "2025-09-15", details: "All financial records in order" },
    { id: "cr2", type: "Asset Declaration", result: "Compliant", date: "2025-01-20", details: "Fully declared assets and liabilities" },
    { id: "cr3", type: "Ethics Review", result: "Compliant", date: "2025-06-01", details: "No conflicts of interest identified" },
  ],
  publicFeedback: [
    { id: "pf1", satisfactionRating: 72, summary: "General approval of economic direction; concerns about pace of healthcare reforms", date: "2026-01-15", respondentCount: 15000 },
    { id: "pf2", satisfactionRating: 68, summary: "Mixed reactions to infrastructure spending; positive view on security improvements", date: "2025-07-20", respondentCount: 12000 },
  ],
};

const vpAccountability: AccountabilityData = {
  promises: [
    { id: "vp1", description: "Reform electoral processes", status: "In Progress", completionPercent: 40, targetDate: "2027-06-30" },
    { id: "vp2", description: "Strengthen anti-corruption agencies", status: "In Progress", completionPercent: 55, targetDate: "2026-12-31" },
    { id: "vp3", description: "Improve inter-governmental coordination", status: "Fulfilled", completionPercent: 100, targetDate: "2025-06-30" },
  ],
  projectMilestones: [
    { id: "vpm1", name: "Electoral Reform Commission", timeline: "2024-2027", budget: "$120M", status: "On Track", completionPercent: 45 },
    { id: "vpm2", name: "Anti-Corruption Task Force", timeline: "2025-2027", budget: "$80M", status: "On Track", completionPercent: 55 },
  ],
  complianceRecords: [
    { id: "vcr1", type: "Annual Financial Audit", result: "Compliant", date: "2025-09-15", details: "All records verified" },
    { id: "vcr2", type: "Asset Declaration", result: "Compliant", date: "2025-01-20", details: "Assets properly declared" },
  ],
  publicFeedback: [
    { id: "vpf1", satisfactionRating: 70, summary: "Positive reception of anti-corruption stance; calls for faster electoral reform", date: "2026-01-10", respondentCount: 8000 },
  ],
};

const financeMinisterAccountability: AccountabilityData = {
  promises: [
    { id: "fm1", description: "Reduce budget deficit to 3% of GDP", status: "In Progress", completionPercent: 58, targetDate: "2027-06-30" },
    { id: "fm2", description: "Implement progressive tax reform", status: "In Progress", completionPercent: 35, targetDate: "2027-12-31" },
    { id: "fm3", description: "Digitize treasury operations", status: "Fulfilled", completionPercent: 100, targetDate: "2025-12-31" },
    { id: "fm4", description: "Increase foreign investment by 25%", status: "In Progress", completionPercent: 72, targetDate: "2026-12-31" },
  ],
  projectMilestones: [
    { id: "fpm1", name: "Tax Modernization System", timeline: "2024-2027", budget: "$450M", status: "On Track", completionPercent: 60 },
    { id: "fpm2", name: "Public Debt Management Framework", timeline: "2025-2028", budget: "$200M", status: "Delayed", completionPercent: 25 },
    { id: "fpm3", name: "Investment Promotion Initiative", timeline: "2024-2026", budget: "$150M", status: "On Track", completionPercent: 72 },
  ],
  complianceRecords: [
    { id: "fcr1", type: "Annual Financial Audit", result: "Compliant", date: "2025-09-15", details: "Budget execution within parameters" },
    { id: "fcr2", type: "Asset Declaration", result: "Minor Issues", date: "2025-01-20", details: "Late filing of overseas asset declaration" },
    { id: "fcr3", type: "Ethics Review", result: "Compliant", date: "2025-06-01", details: "No conflicts of interest" },
  ],
  publicFeedback: [
    { id: "fpf1", satisfactionRating: 64, summary: "Concerns about rising cost of living; approval of digital treasury reforms", date: "2026-01-12", respondentCount: 6000 },
  ],
};

const healthMinisterAccountability: AccountabilityData = {
  promises: [
    { id: "hm1", description: "Build 200 new health centers", status: "In Progress", completionPercent: 42, targetDate: "2028-06-30" },
    { id: "hm2", description: "Achieve universal health coverage", status: "In Progress", completionPercent: 55, targetDate: "2029-12-31" },
    { id: "hm3", description: "Reduce infant mortality by 30%", status: "In Progress", completionPercent: 28, targetDate: "2028-12-31" },
    { id: "hm4", description: "Expand mental health services", status: "Not Started", completionPercent: 5, targetDate: "2029-06-30" },
  ],
  projectMilestones: [
    { id: "hpm1", name: "Healthcare Infrastructure Expansion", timeline: "2024-2028", budget: "$800M", status: "Delayed", completionPercent: 35 },
    { id: "hpm2", name: "National Health Insurance Scheme", timeline: "2025-2029", budget: "$1.2B", status: "On Track", completionPercent: 45 },
    { id: "hpm3", name: "Pandemic Preparedness Program", timeline: "2024-2026", budget: "$300M", status: "On Track", completionPercent: 75 },
  ],
  complianceRecords: [
    { id: "hcr1", type: "Annual Financial Audit", result: "Minor Issues", date: "2025-09-15", details: "Some procurement irregularities flagged" },
    { id: "hcr2", type: "Asset Declaration", result: "Compliant", date: "2025-01-20", details: "All assets properly declared" },
    { id: "hcr3", type: "Ethics Review", result: "Under Review", date: "2025-11-01", details: "Reviewing potential conflict in pharmaceutical contracts" },
  ],
  publicFeedback: [
    { id: "hpf1", satisfactionRating: 55, summary: "Dissatisfaction with healthcare access in rural areas; approval of insurance scheme", date: "2026-01-18", respondentCount: 9000 },
  ],
};

const educationMinisterAccountability: AccountabilityData = {
  promises: [
    { id: "em1", description: "Achieve 95% literacy rate", status: "In Progress", completionPercent: 70, targetDate: "2027-12-31" },
    { id: "em2", description: "Digitize all public school curricula", status: "In Progress", completionPercent: 45, targetDate: "2027-06-30" },
    { id: "em3", description: "Reduce student-to-teacher ratio to 25:1", status: "In Progress", completionPercent: 38, targetDate: "2028-12-31" },
  ],
  projectMilestones: [
    { id: "epm1", name: "Digital Learning Platform", timeline: "2024-2027", budget: "$350M", status: "On Track", completionPercent: 50 },
    { id: "epm2", name: "Teacher Training Program", timeline: "2025-2028", budget: "$200M", status: "On Track", completionPercent: 30 },
  ],
  complianceRecords: [
    { id: "ecr1", type: "Annual Financial Audit", result: "Compliant", date: "2025-09-15", details: "Budget allocation properly executed" },
    { id: "ecr2", type: "Asset Declaration", result: "Compliant", date: "2025-01-20", details: "All assets declared" },
  ],
  publicFeedback: [
    { id: "epf1", satisfactionRating: 62, summary: "Support for digital initiatives; concern about teacher shortages", date: "2026-01-10", respondentCount: 7000 },
  ],
};

const defenseMinisterAccountability: AccountabilityData = {
  promises: [
    { id: "dm1", description: "Modernize armed forces equipment", status: "In Progress", completionPercent: 60, targetDate: "2028-12-31" },
    { id: "dm2", description: "Strengthen border security", status: "Fulfilled", completionPercent: 100, targetDate: "2025-12-31" },
    { id: "dm3", description: "Reduce military spending waste by 20%", status: "In Progress", completionPercent: 45, targetDate: "2027-06-30" },
  ],
  projectMilestones: [
    { id: "dpm1", name: "Forces Modernization Program", timeline: "2024-2028", budget: "$3.2B", status: "On Track", completionPercent: 55 },
    { id: "dpm2", name: "Border Surveillance System", timeline: "2024-2026", budget: "$600M", status: "Completed", completionPercent: 100 },
  ],
  complianceRecords: [
    { id: "dcr1", type: "Annual Financial Audit", result: "Minor Issues", date: "2025-09-15", details: "Some procurement processes need strengthening" },
    { id: "dcr2", type: "Asset Declaration", result: "Compliant", date: "2025-01-20", details: "Full compliance" },
  ],
  publicFeedback: [
    { id: "dpf1", satisfactionRating: 74, summary: "Strong approval of border security; concerns about military spending transparency", date: "2026-01-14", respondentCount: 5000 },
  ],
};

const infraMinisterAccountability: AccountabilityData = {
  promises: [
    { id: "im1", description: "Build 5000km of new roads", status: "In Progress", completionPercent: 35, targetDate: "2029-12-31" },
    { id: "im2", description: "Provide clean water to 90% of population", status: "In Progress", completionPercent: 68, targetDate: "2027-12-31" },
    { id: "im3", description: "Complete national railway network", status: "Not Started", completionPercent: 8, targetDate: "2030-12-31" },
    { id: "im4", description: "Expand broadband to rural areas", status: "In Progress", completionPercent: 42, targetDate: "2028-06-30" },
  ],
  projectMilestones: [
    { id: "ipm1", name: "National Highway Expansion", timeline: "2025-2029", budget: "$4.5B", status: "On Track", completionPercent: 25 },
    { id: "ipm2", name: "Water Supply Modernization", timeline: "2024-2027", budget: "$1.1B", status: "On Track", completionPercent: 68 },
    { id: "ipm3", name: "Rural Broadband Initiative", timeline: "2025-2028", budget: "$800M", status: "Delayed", completionPercent: 30 },
  ],
  complianceRecords: [
    { id: "icr1", type: "Annual Financial Audit", result: "Non-Compliant", date: "2025-09-15", details: "Significant irregularities in road construction contracts" },
    { id: "icr2", type: "Asset Declaration", result: "Minor Issues", date: "2025-01-20", details: "Incomplete property valuation" },
    { id: "icr3", type: "Ethics Review", result: "Under Review", date: "2025-11-15", details: "Investigating potential conflicts with construction firms" },
  ],
  publicFeedback: [
    { id: "ipf1", satisfactionRating: 48, summary: "Frustration with slow road construction; approval of water supply improvements", date: "2026-01-16", respondentCount: 10000 },
  ],
};

const justiceMinisterAccountability: AccountabilityData = {
  promises: [
    { id: "jm1", description: "Reform criminal justice system", status: "In Progress", completionPercent: 50, targetDate: "2027-12-31" },
    { id: "jm2", description: "Reduce court case backlog by 50%", status: "In Progress", completionPercent: 35, targetDate: "2027-06-30" },
    { id: "jm3", description: "Establish anti-corruption courts", status: "Fulfilled", completionPercent: 100, targetDate: "2025-06-30" },
    { id: "jm4", description: "Digitize court records", status: "In Progress", completionPercent: 62, targetDate: "2026-12-31" },
  ],
  projectMilestones: [
    { id: "jpm1", name: "Judicial System Modernization", timeline: "2024-2027", budget: "$280M", status: "On Track", completionPercent: 50 },
    { id: "jpm2", name: "Court Digitization Program", timeline: "2024-2026", budget: "$150M", status: "On Track", completionPercent: 62 },
  ],
  complianceRecords: [
    { id: "jcr1", type: "Annual Financial Audit", result: "Compliant", date: "2025-09-15", details: "All expenditures accounted for" },
    { id: "jcr2", type: "Asset Declaration", result: "Compliant", date: "2025-01-20", details: "Full compliance" },
    { id: "jcr3", type: "Ethics Review", result: "Compliant", date: "2025-06-01", details: "No issues identified" },
  ],
  publicFeedback: [
    { id: "jpf1", satisfactionRating: 66, summary: "Approval of anti-corruption courts; frustration with slow case processing", date: "2026-01-20", respondentCount: 6500 },
  ],
};

// Deputy Minister Accountability Data
const deputyFinanceAccountability: AccountabilityData = {
  promises: [
    { id: "df1", description: "Streamline customs operations", status: "In Progress", completionPercent: 65, targetDate: "2026-12-31" },
    { id: "df2", description: "Implement real-time revenue monitoring", status: "Fulfilled", completionPercent: 100, targetDate: "2025-06-30" },
  ],
  projectMilestones: [
    { id: "dfpm1", name: "Customs Modernization", timeline: "2024-2026", budget: "$95M", status: "On Track", completionPercent: 65 },
  ],
  complianceRecords: [
    { id: "dfcr1", type: "Annual Financial Audit", result: "Compliant", date: "2025-09-15", details: "Clean audit" },
    { id: "dfcr2", type: "Asset Declaration", result: "Compliant", date: "2025-01-20", details: "Properly filed" },
  ],
  publicFeedback: [
    { id: "dfpf1", satisfactionRating: 71, summary: "Positive view of customs improvements", date: "2026-01-10", respondentCount: 3000 },
  ],
};

const deputyHealthAccountability: AccountabilityData = {
  promises: [
    { id: "dh1", description: "Improve pharmaceutical supply chain", status: "In Progress", completionPercent: 40, targetDate: "2027-06-30" },
    { id: "dh2", description: "Train 5000 additional nurses", status: "In Progress", completionPercent: 55, targetDate: "2027-12-31" },
  ],
  projectMilestones: [
    { id: "dhpm1", name: "Supply Chain Optimization", timeline: "2025-2027", budget: "$180M", status: "Delayed", completionPercent: 30 },
  ],
  complianceRecords: [
    { id: "dhcr1", type: "Annual Financial Audit", result: "Compliant", date: "2025-09-15", details: "All records verified" },
    { id: "dhcr2", type: "Asset Declaration", result: "Compliant", date: "2025-01-20", details: "All declared" },
  ],
  publicFeedback: [
    { id: "dhpf1", satisfactionRating: 58, summary: "Concerns about medicine availability; approval of nurse training", date: "2026-01-12", respondentCount: 4000 },
  ],
};

const deputyEducationAccountability: AccountabilityData = {
  promises: [
    { id: "de1", description: "Implement free school meal program", status: "In Progress", completionPercent: 48, targetDate: "2027-06-30" },
    { id: "de2", description: "Upgrade school laboratory facilities", status: "Not Started", completionPercent: 12, targetDate: "2028-12-31" },
  ],
  projectMilestones: [
    { id: "depm1", name: "School Nutrition Program", timeline: "2025-2027", budget: "$120M", status: "On Track", completionPercent: 48 },
  ],
  complianceRecords: [
    { id: "decr1", type: "Annual Financial Audit", result: "Compliant", date: "2025-09-15", details: "Records in order" },
    { id: "decr2", type: "Asset Declaration", result: "Compliant", date: "2025-01-20", details: "Fully declared" },
  ],
  publicFeedback: [
    { id: "depf1", satisfactionRating: 60, summary: "Support for meal program; disappointment with lab delays", date: "2026-01-14", respondentCount: 3500 },
  ],
};

const deputyDefenseAccountability: AccountabilityData = {
  promises: [
    { id: "dd1", description: "Improve veterans welfare program", status: "In Progress", completionPercent: 50, targetDate: "2027-06-30" },
    { id: "dd2", description: "Modernize military housing", status: "In Progress", completionPercent: 35, targetDate: "2028-12-31" },
  ],
  projectMilestones: [
    { id: "ddpm1", name: "Veterans Support Initiative", timeline: "2025-2027", budget: "$200M", status: "On Track", completionPercent: 50 },
  ],
  complianceRecords: [
    { id: "ddcr1", type: "Annual Financial Audit", result: "Compliant", date: "2025-09-15", details: "All verified" },
    { id: "ddcr2", type: "Asset Declaration", result: "Compliant", date: "2025-01-20", details: "Properly filed" },
  ],
  publicFeedback: [
    { id: "ddpf1", satisfactionRating: 67, summary: "Veterans appreciate attention; housing improvements needed", date: "2026-01-16", respondentCount: 2500 },
  ],
};

const deputyInfraAccountability: AccountabilityData = {
  promises: [
    { id: "di1", description: "Accelerate rural road construction", status: "In Progress", completionPercent: 30, targetDate: "2028-06-30" },
    { id: "di2", description: "Implement smart city pilot projects", status: "In Progress", completionPercent: 22, targetDate: "2028-12-31" },
  ],
  projectMilestones: [
    { id: "dipm1", name: "Rural Roads Acceleration", timeline: "2025-2028", budget: "$500M", status: "At Risk", completionPercent: 20 },
    { id: "dipm2", name: "Smart City Pilot", timeline: "2025-2028", budget: "$300M", status: "Delayed", completionPercent: 15 },
  ],
  complianceRecords: [
    { id: "dicr1", type: "Annual Financial Audit", result: "Minor Issues", date: "2025-09-15", details: "Some documentation gaps in contract awards" },
    { id: "dicr2", type: "Asset Declaration", result: "Compliant", date: "2025-01-20", details: "All declared" },
  ],
  publicFeedback: [
    { id: "dipf1", satisfactionRating: 42, summary: "High frustration with construction delays; support for smart city concept", date: "2026-01-18", respondentCount: 5500 },
  ],
};

const deputyJusticeAccountability: AccountabilityData = {
  promises: [
    { id: "dj1", description: "Expand legal aid services", status: "In Progress", completionPercent: 55, targetDate: "2027-06-30" },
    { id: "dj2", description: "Implement juvenile justice reforms", status: "In Progress", completionPercent: 40, targetDate: "2027-12-31" },
  ],
  projectMilestones: [
    { id: "djpm1", name: "Legal Aid Expansion", timeline: "2025-2027", budget: "$85M", status: "On Track", completionPercent: 55 },
  ],
  complianceRecords: [
    { id: "djcr1", type: "Annual Financial Audit", result: "Compliant", date: "2025-09-15", details: "Clean audit report" },
    { id: "djcr2", type: "Asset Declaration", result: "Compliant", date: "2025-01-20", details: "Fully compliant" },
  ],
  publicFeedback: [
    { id: "djpf1", satisfactionRating: 63, summary: "Appreciation for legal aid expansion; calls for faster juvenile reform", date: "2026-01-20", respondentCount: 3200 },
  ],
};

// Director Accountability Data
const directorFinanceAccountability: AccountabilityData = {
  promises: [
    { id: "drf1", description: "Automate tax collection system", status: "In Progress", completionPercent: 70, targetDate: "2026-12-31" },
    { id: "drf2", description: "Reduce tax evasion by 30%", status: "In Progress", completionPercent: 45, targetDate: "2027-06-30" },
  ],
  projectMilestones: [
    { id: "drfpm1", name: "Tax System Automation", timeline: "2024-2026", budget: "$65M", status: "On Track", completionPercent: 70 },
  ],
  complianceRecords: [
    { id: "drfcr1", type: "Annual Financial Audit", result: "Compliant", date: "2025-09-15", details: "All records clean" },
    { id: "drfcr2", type: "Asset Declaration", result: "Compliant", date: "2025-01-20", details: "Fully declared" },
  ],
  publicFeedback: [
    { id: "drfpf1", satisfactionRating: 68, summary: "Tax automation well received; concerns about enforcement gaps", date: "2026-01-10", respondentCount: 2000 },
  ],
};

const directorHealthAccountability: AccountabilityData = {
  promises: [
    { id: "drh1", description: "Establish disease surveillance network", status: "In Progress", completionPercent: 60, targetDate: "2027-06-30" },
    { id: "drh2", description: "Improve emergency response times", status: "In Progress", completionPercent: 48, targetDate: "2027-12-31" },
  ],
  projectMilestones: [
    { id: "drhpm1", name: "Disease Surveillance System", timeline: "2024-2027", budget: "$95M", status: "On Track", completionPercent: 60 },
  ],
  complianceRecords: [
    { id: "drhcr1", type: "Annual Financial Audit", result: "Compliant", date: "2025-09-15", details: "No issues found" },
    { id: "drhcr2", type: "Asset Declaration", result: "Compliant", date: "2025-01-20", details: "Properly filed" },
  ],
  publicFeedback: [
    { id: "drhpf1", satisfactionRating: 55, summary: "Surveillance improvements noted; emergency response still slow in remote areas", date: "2026-01-12", respondentCount: 2500 },
  ],
};

const directorEducationAccountability: AccountabilityData = {
  promises: [
    { id: "dre1", description: "Develop national assessment framework", status: "In Progress", completionPercent: 65, targetDate: "2026-12-31" },
    { id: "dre2", description: "Launch STEM excellence program", status: "In Progress", completionPercent: 40, targetDate: "2027-06-30" },
  ],
  projectMilestones: [
    { id: "drepm1", name: "Assessment Framework Development", timeline: "2024-2026", budget: "$45M", status: "On Track", completionPercent: 65 },
  ],
  complianceRecords: [
    { id: "drecr1", type: "Annual Financial Audit", result: "Compliant", date: "2025-09-15", details: "Clean records" },
    { id: "drecr2", type: "Asset Declaration", result: "Compliant", date: "2025-01-20", details: "All filed" },
  ],
  publicFeedback: [
    { id: "drepf1", satisfactionRating: 64, summary: "Assessment framework welcomed; STEM program needs more funding visibility", date: "2026-01-14", respondentCount: 2200 },
  ],
};

const directorDefenseAccountability: AccountabilityData = {
  promises: [
    { id: "drd1", description: "Implement cybersecurity defense strategy", status: "In Progress", completionPercent: 55, targetDate: "2027-06-30" },
    { id: "drd2", description: "Modernize logistics supply chain", status: "In Progress", completionPercent: 42, targetDate: "2027-12-31" },
  ],
  projectMilestones: [
    { id: "drdpm1", name: "Cybersecurity Implementation", timeline: "2025-2027", budget: "$120M", status: "On Track", completionPercent: 55 },
  ],
  complianceRecords: [
    { id: "drdcr1", type: "Annual Financial Audit", result: "Compliant", date: "2025-09-15", details: "All verified" },
    { id: "drdcr2", type: "Asset Declaration", result: "Compliant", date: "2025-01-20", details: "Properly declared" },
  ],
  publicFeedback: [
    { id: "drdpf1", satisfactionRating: 70, summary: "Cybersecurity measures appreciated; logistics improvements awaited", date: "2026-01-16", respondentCount: 1800 },
  ],
};

const directorInfraAccountability: AccountabilityData = {
  promises: [
    { id: "dri1", description: "Implement project monitoring dashboard", status: "In Progress", completionPercent: 38, targetDate: "2027-06-30" },
    { id: "dri2", description: "Standardize construction quality metrics", status: "Not Started", completionPercent: 10, targetDate: "2027-12-31" },
  ],
  projectMilestones: [
    { id: "dripm1", name: "Project Monitoring System", timeline: "2025-2027", budget: "$40M", status: "Delayed", completionPercent: 30 },
  ],
  complianceRecords: [
    { id: "dricr1", type: "Annual Financial Audit", result: "Minor Issues", date: "2025-09-15", details: "Documentation gaps in project reporting" },
    { id: "dricr2", type: "Asset Declaration", result: "Compliant", date: "2025-01-20", details: "Filed correctly" },
  ],
  publicFeedback: [
    { id: "dripf1", satisfactionRating: 38, summary: "Low confidence in project oversight; calls for more transparency", date: "2026-01-18", respondentCount: 3000 },
  ],
};

const directorJusticeAccountability: AccountabilityData = {
  promises: [
    { id: "drj1", description: "Digitize case management system", status: "In Progress", completionPercent: 72, targetDate: "2026-12-31" },
    { id: "drj2", description: "Implement virtual court hearings", status: "In Progress", completionPercent: 55, targetDate: "2027-06-30" },
  ],
  projectMilestones: [
    { id: "drjpm1", name: "Case Management Digitization", timeline: "2024-2026", budget: "$55M", status: "On Track", completionPercent: 72 },
  ],
  complianceRecords: [
    { id: "drjcr1", type: "Annual Financial Audit", result: "Compliant", date: "2025-09-15", details: "All records clean" },
    { id: "drjcr2", type: "Asset Declaration", result: "Compliant", date: "2025-01-20", details: "Fully declared" },
  ],
  publicFeedback: [
    { id: "drjpf1", satisfactionRating: 65, summary: "Digital case management praised; virtual hearings need improvement", date: "2026-01-20", respondentCount: 2100 },
  ],
};

// Department Head Accountability Data
const deptHeadFinanceAccountability: AccountabilityData = {
  promises: [
    { id: "dhf1", description: "Complete quarterly reporting automation", status: "Fulfilled", completionPercent: 100, targetDate: "2025-12-31" },
    { id: "dhf2", description: "Reduce processing errors by 50%", status: "In Progress", completionPercent: 60, targetDate: "2026-12-31" },
  ],
  projectMilestones: [
    { id: "dhfpm1", name: "Reporting Automation", timeline: "2024-2025", budget: "$15M", status: "Completed", completionPercent: 100 },
  ],
  complianceRecords: [
    { id: "dhfcr1", type: "Annual Financial Audit", result: "Compliant", date: "2025-09-15", details: "Excellent compliance record" },
    { id: "dhfcr2", type: "Asset Declaration", result: "Compliant", date: "2025-01-20", details: "All declared" },
  ],
  publicFeedback: [
    { id: "dhfpf1", satisfactionRating: 75, summary: "Strong improvement in reporting timeliness", date: "2026-01-10", respondentCount: 800 },
  ],
};

const deptHeadHealthAccountability: AccountabilityData = {
  promises: [
    { id: "dhh1", description: "Improve hospital bed availability", status: "In Progress", completionPercent: 45, targetDate: "2027-06-30" },
    { id: "dhh2", description: "Reduce patient wait times", status: "In Progress", completionPercent: 35, targetDate: "2027-12-31" },
  ],
  projectMilestones: [
    { id: "dhhpm1", name: "Hospital Capacity Expansion", timeline: "2025-2027", budget: "$65M", status: "On Track", completionPercent: 40 },
  ],
  complianceRecords: [
    { id: "dhhcr1", type: "Annual Financial Audit", result: "Compliant", date: "2025-09-15", details: "Clean audit" },
    { id: "dhhcr2", type: "Asset Declaration", result: "Compliant", date: "2025-01-20", details: "Properly filed" },
  ],
  publicFeedback: [
    { id: "dhhpf1", satisfactionRating: 50, summary: "Wait times still too long; bed availability slowly improving", date: "2026-01-12", respondentCount: 1200 },
  ],
};

const deptHeadEducationAccountability: AccountabilityData = {
  promises: [
    { id: "dhe1", description: "Distribute learning materials to all schools", status: "In Progress", completionPercent: 68, targetDate: "2026-12-31" },
    { id: "dhe2", description: "Implement teacher evaluation system", status: "In Progress", completionPercent: 52, targetDate: "2027-06-30" },
  ],
  projectMilestones: [
    { id: "dhepm1", name: "Materials Distribution Program", timeline: "2025-2026", budget: "$30M", status: "On Track", completionPercent: 68 },
  ],
  complianceRecords: [
    { id: "dhecr1", type: "Annual Financial Audit", result: "Compliant", date: "2025-09-15", details: "No irregularities" },
    { id: "dhecr2", type: "Asset Declaration", result: "Compliant", date: "2025-01-20", details: "All declared" },
  ],
  publicFeedback: [
    { id: "dhepf1", satisfactionRating: 62, summary: "Materials distribution improving; teacher evaluation concerns", date: "2026-01-14", respondentCount: 1000 },
  ],
};

const deptHeadInfraAccountability: AccountabilityData = {
  promises: [
    { id: "dhi1", description: "Complete bridge safety inspections", status: "Broken", completionPercent: 15, targetDate: "2025-12-31" },
    { id: "dhi2", description: "Implement construction quality audits", status: "Not Started", completionPercent: 5, targetDate: "2027-06-30" },
  ],
  projectMilestones: [
    { id: "dhipm1", name: "Bridge Safety Program", timeline: "2024-2025", budget: "$25M", status: "At Risk", completionPercent: 15 },
  ],
  complianceRecords: [
    { id: "dhicr1", type: "Annual Financial Audit", result: "Non-Compliant", date: "2025-09-15", details: "Major gaps in expenditure tracking" },
    { id: "dhicr2", type: "Asset Declaration", result: "Minor Issues", date: "2025-01-20", details: "Incomplete filing" },
  ],
  publicFeedback: [
    { id: "dhipf1", satisfactionRating: 28, summary: "Severe dissatisfaction with infrastructure oversight; safety concerns raised", date: "2026-01-18", respondentCount: 2500 },
  ],
};

const deptHeadJusticeAccountability: AccountabilityData = {
  promises: [
    { id: "dhj1", description: "Establish victim support units", status: "In Progress", completionPercent: 55, targetDate: "2027-06-30" },
    { id: "dhj2", description: "Implement witness protection program", status: "In Progress", completionPercent: 48, targetDate: "2027-12-31" },
  ],
  projectMilestones: [
    { id: "dhjpm1", name: "Victim Support Initiative", timeline: "2025-2027", budget: "$20M", status: "On Track", completionPercent: 55 },
  ],
  complianceRecords: [
    { id: "dhjcr1", type: "Annual Financial Audit", result: "Compliant", date: "2025-09-15", details: "All records verified" },
    { id: "dhjcr2", type: "Asset Declaration", result: "Compliant", date: "2025-01-20", details: "Properly filed" },
  ],
  publicFeedback: [
    { id: "dhjpf1", satisfactionRating: 60, summary: "Victim support appreciated; witness protection needs more resources", date: "2026-01-20", respondentCount: 900 },
  ],
};

// ===================== FULL HIERARCHY DATA =====================

export const governmentData: Representative = rep(
  "president",
  "Margaret Chen",
  "President",
  "Office of the President",
  "#1e3a5f",
  "2024-01-15",
  "2029-01-15",
  "president@gov.example.com",
  "+1-555-0100",
  "Margaret Chen is the 12th President, elected on a platform of economic reform, transparency, and national unity. With over 25 years in public service, she previously served as Minister of Finance and has been a champion of fiscal responsibility and social welfare programs. Her leadership style emphasizes data-driven decision making and inclusive governance.",
  [
    "Oversee all government operations and policy direction",
    "Commander-in-Chief of the armed forces",
    "Appoint cabinet ministers and senior officials",
    "Represent the nation in international forums",
    "Ensure constitutional governance and rule of law",
  ],
  {
    overall: 72,
    previousOverall: 68,
    trend: "up",
    categories: {
      budgetManagement: 74,
      projectDelivery: 68,
      publicSatisfaction: 72,
      transparencyAccountability: 75,
      policyImplementation: 70,
      stakeholderEngagement: 73,
    },
  },
  presidentAccountability,
  [
    // Vice President
    rep(
      "vp",
      "Robert Williams",
      "Vice President",
      "Office of the Vice President",
      "#2d5f8a",
      "2024-01-15",
      "2029-01-15",
      "vp@gov.example.com",
      "+1-555-0101",
      "Robert Williams brings extensive legislative experience to the Vice Presidency. A former Senate Majority Leader, he is known for his ability to build bipartisan consensus and his commitment to electoral reform and anti-corruption measures.",
      [
        "Support the President in all executive functions",
        "Preside over the Senate",
        "Lead inter-governmental coordination",
        "Chair anti-corruption initiatives",
        "Oversee electoral reform programs",
      ],
      {
        overall: 70,
        previousOverall: 72,
        trend: "neutral",
        categories: {
          budgetManagement: 68,
          projectDelivery: 65,
          publicSatisfaction: 70,
          transparencyAccountability: 78,
          policyImplementation: 66,
          stakeholderEngagement: 73,
        },
      },
      vpAccountability,
      [],
      "president",
    ),
    // Ministry of Finance
    rep(
      "fin-min",
      "Sarah Okafor",
      "Minister of Finance",
      "Ministry of Finance",
      "#0d7377",
      "2024-03-01",
      "2029-03-01",
      "finance.minister@gov.example.com",
      "+1-555-0200",
      "Sarah Okafor is an accomplished economist with experience at the World Bank and IMF. She leads the nation's economic policy, focusing on sustainable growth, debt reduction, and investment promotion. Her analytical approach has earned respect across party lines.",
      [
        "Formulate national fiscal and monetary policy",
        "Manage government revenue and expenditure",
        "Oversee tax collection and customs",
        "Coordinate with international financial institutions",
        "Present annual budget to parliament",
      ],
      {
        overall: 68,
        previousOverall: 65,
        trend: "up",
        categories: {
          budgetManagement: 72,
          projectDelivery: 62,
          publicSatisfaction: 64,
          transparencyAccountability: 70,
          policyImplementation: 68,
          stakeholderEngagement: 72,
        },
      },
      financeMinisterAccountability,
      [
        // Deputy Minister of Finance
        rep(
          "fin-dep",
          "James Torres",
          "Deputy Minister of Finance",
          "Ministry of Finance",
          "#14919b",
          "2024-04-01",
          "2029-04-01",
          "finance.deputy@gov.example.com",
          "+1-555-0201",
          "James Torres is a seasoned public finance expert with 18 years of experience in government budgeting and financial management. He oversees day-to-day operations of the ministry and leads the revenue modernization agenda.",
          [
            "Support the Minister in policy implementation",
            "Oversee revenue collection operations",
            "Manage customs and trade facilitation",
            "Coordinate inter-departmental budgeting",
            "Lead financial system modernization",
          ],
          {
            overall: 73,
            previousOverall: 70,
            trend: "up",
            categories: {
              budgetManagement: 78,
              projectDelivery: 72,
              publicSatisfaction: 71,
              transparencyAccountability: 72,
              policyImplementation: 70,
              stakeholderEngagement: 75,
            },
          },
          deputyFinanceAccountability,
          [
            // Director of Revenue
            rep(
              "fin-dir-rev",
              "Patricia Huang",
              "Director of Revenue",
              "Ministry of Finance - Revenue Division",
              "#0e8388",
              "2024-06-01",
              "2029-06-01",
              "revenue.director@gov.example.com",
              "+1-555-0210",
              "Patricia Huang is a tax policy specialist who has revolutionized the nation's tax collection systems through technology and process improvements. Her leadership has significantly increased compliance rates.",
              [
                "Oversee all tax collection operations",
                "Develop tax policy recommendations",
                "Manage tax audit and enforcement",
                "Lead digital transformation of revenue services",
                "Coordinate with international tax bodies",
              ],
              {
                overall: 76,
                previousOverall: 72,
                trend: "up",
                categories: {
                  budgetManagement: 82,
                  projectDelivery: 74,
                  publicSatisfaction: 68,
                  transparencyAccountability: 78,
                  policyImplementation: 76,
                  stakeholderEngagement: 78,
                },
              },
              directorFinanceAccountability,
              [
                rep(
                  "fin-dh-tax",
                  "Daniel Kim",
                  "Department Head - Tax Operations",
                  "Ministry of Finance - Tax Operations",
                  "#2e8b8b",
                  "2024-08-01",
                  "2029-08-01",
                  "tax.dept@gov.example.com",
                  "+1-555-0220",
                  "Daniel Kim oversees daily tax processing operations and has implemented automated reporting systems that have dramatically improved efficiency and accuracy.",
                  [
                    "Manage daily tax processing operations",
                    "Supervise tax assessment and collection",
                    "Ensure compliance with tax regulations",
                    "Report on revenue performance metrics",
                    "Coordinate with regional tax offices",
                  ],
                  {
                    overall: 78,
                    previousOverall: 74,
                    trend: "up",
                    categories: {
                      budgetManagement: 85,
                      projectDelivery: 76,
                      publicSatisfaction: 72,
                      transparencyAccountability: 80,
                      policyImplementation: 78,
                      stakeholderEngagement: 77,
                    },
                  },
                  deptHeadFinanceAccountability,
                  [],
                  "fin-dir-rev",
                ),
              ],
              "fin-dep",
            ),
          ],
          "fin-min",
        ),
      ],
      "president",
    ),
    // Ministry of Health
    rep(
      "health-min",
      "Dr. Amina Diallo",
      "Minister of Health",
      "Ministry of Health",
      "#8b1a1a",
      "2024-03-01",
      "2029-03-01",
      "health.minister@gov.example.com",
      "+1-555-0300",
      "Dr. Amina Diallo is a renowned public health physician with experience fighting infectious diseases across Africa. She leads the nation's health policy with a focus on universal coverage, preventive care, and health system strengthening.",
      [
        "Develop and implement national health policy",
        "Oversee public healthcare delivery systems",
        "Manage health emergency preparedness",
        "Coordinate with WHO and health partners",
        "Regulate pharmaceutical and medical sectors",
      ],
      {
        overall: 58,
        previousOverall: 55,
        trend: "up",
        categories: {
          budgetManagement: 55,
          projectDelivery: 48,
          publicSatisfaction: 55,
          transparencyAccountability: 62,
          policyImplementation: 60,
          stakeholderEngagement: 68,
        },
      },
      healthMinisterAccountability,
      [
        // Deputy Minister of Health
        rep(
          "health-dep",
          "Dr. Kevin Mensah",
          "Deputy Minister of Health",
          "Ministry of Health",
          "#a03030",
          "2024-04-01",
          "2029-04-01",
          "health.deputy@gov.example.com",
          "+1-555-0301",
          "Dr. Kevin Mensah is an experienced healthcare administrator who manages the operational aspects of the health ministry. He has overseen the expansion of community health programs and pharmaceutical supply chain improvements.",
          [
            "Support health policy implementation",
            "Oversee healthcare workforce development",
            "Manage pharmaceutical procurement",
            "Coordinate hospital administration",
            "Lead health infrastructure projects",
          ],
          {
            overall: 60,
            previousOverall: 58,
            trend: "up",
            categories: {
              budgetManagement: 58,
              projectDelivery: 52,
              publicSatisfaction: 58,
              transparencyAccountability: 64,
              policyImplementation: 62,
              stakeholderEngagement: 66,
            },
          },
          deputyHealthAccountability,
          [
            // Director of Public Health
            rep(
              "health-dir-ph",
              "Dr. Fatima Al-Hassan",
              "Director of Public Health",
              "Ministry of Health - Public Health Division",
              "#b84040",
              "2024-06-01",
              "2029-06-01",
              "publichealth.director@gov.example.com",
              "+1-555-0310",
              "Dr. Fatima Al-Hassan is an epidemiologist specializing in disease prevention and health promotion. She has led successful vaccination campaigns and disease surveillance improvements.",
              [
                "Lead disease surveillance and prevention",
                "Manage vaccination programs",
                "Coordinate health emergency response",
                "Develop public health guidelines",
                "Oversee health data and statistics",
              ],
              {
                overall: 62,
                previousOverall: 60,
                trend: "up",
                categories: {
                  budgetManagement: 60,
                  projectDelivery: 58,
                  publicSatisfaction: 55,
                  transparencyAccountability: 65,
                  policyImplementation: 64,
                  stakeholderEngagement: 70,
                },
              },
              directorHealthAccountability,
              [
                rep(
                  "health-dh-ops",
                  "Grace Okonkwo",
                  "Department Head - Hospital Operations",
                  "Ministry of Health - Hospital Operations",
                  "#c95555",
                  "2024-08-01",
                  "2029-08-01",
                  "hospital.dept@gov.example.com",
                  "+1-555-0320",
                  "Grace Okonkwo manages hospital operations across the nation, focusing on capacity expansion and quality improvement. She has introduced patient satisfaction metrics and streamlined admission processes.",
                  [
                    "Oversee national hospital network operations",
                    "Manage hospital capacity and bed allocation",
                    "Implement quality assurance standards",
                    "Coordinate patient referral systems",
                    "Monitor hospital performance metrics",
                  ],
                  {
                    overall: 52,
                    previousOverall: 50,
                    trend: "neutral",
                    categories: {
                      budgetManagement: 48,
                      projectDelivery: 45,
                      publicSatisfaction: 50,
                      transparencyAccountability: 55,
                      policyImplementation: 52,
                      stakeholderEngagement: 62,
                    },
                  },
                  deptHeadHealthAccountability,
                  [],
                  "health-dir-ph",
                ),
              ],
              "health-dep",
            ),
          ],
          "health-min",
        ),
      ],
      "president",
    ),
    // Ministry of Education
    rep(
      "edu-min",
      "Prof. Maria Santos",
      "Minister of Education",
      "Ministry of Education",
      "#1a5c1a",
      "2024-03-01",
      "2029-03-01",
      "education.minister@gov.example.com",
      "+1-555-0400",
      "Prof. Maria Santos is an acclaimed educator and researcher who has dedicated her career to improving educational outcomes. She brings a research-informed approach to policy making and has championed digital learning initiatives.",
      [
        "Set national education standards and curriculum",
        "Oversee primary, secondary, and tertiary education",
        "Manage teacher training and development",
        "Coordinate educational research and innovation",
        "Ensure equal access to quality education",
      ],
      {
        overall: 65,
        previousOverall: 62,
        trend: "up",
        categories: {
          budgetManagement: 68,
          projectDelivery: 60,
          publicSatisfaction: 62,
          transparencyAccountability: 66,
          policyImplementation: 64,
          stakeholderEngagement: 70,
        },
      },
      educationMinisterAccountability,
      [
        rep(
          "edu-dep",
          "Thomas Andersen",
          "Deputy Minister of Education",
          "Ministry of Education",
          "#2a7a2a",
          "2024-04-01",
          "2029-04-01",
          "education.deputy@gov.example.com",
          "+1-555-0401",
          "Thomas Andersen is a former school superintendent with deep expertise in K-12 education. He manages school nutrition programs and facility upgrades across the nation.",
          [
            "Support education policy implementation",
            "Oversee school infrastructure development",
            "Manage school nutrition programs",
            "Coordinate with local education authorities",
            "Lead curriculum review processes",
          ],
          {
            overall: 63,
            previousOverall: 60,
            trend: "up",
            categories: {
              budgetManagement: 65,
              projectDelivery: 58,
              publicSatisfaction: 60,
              transparencyAccountability: 64,
              policyImplementation: 62,
              stakeholderEngagement: 69,
            },
          },
          deputyEducationAccountability,
          [
            rep(
              "edu-dir-cur",
              "Dr. Lisa Park",
              "Director of Curriculum",
              "Ministry of Education - Curriculum Division",
              "#3a9a3a",
              "2024-06-01",
              "2029-06-01",
              "curriculum.director@gov.example.com",
              "+1-555-0410",
              "Dr. Lisa Park is a curriculum design expert who has modernized national curricula to include digital literacy and critical thinking. She leads assessment framework development and STEM initiatives.",
              [
                "Design and update national curriculum",
                "Develop assessment frameworks",
                "Lead STEM education initiatives",
                "Coordinate digital learning content",
                "Evaluate educational outcomes",
              ],
              {
                overall: 67,
                previousOverall: 64,
                trend: "up",
                categories: {
                  budgetManagement: 70,
                  projectDelivery: 64,
                  publicSatisfaction: 64,
                  transparencyAccountability: 68,
                  policyImplementation: 66,
                  stakeholderEngagement: 70,
                },
              },
              directorEducationAccountability,
              [
                rep(
                  "edu-dh-materials",
                  "Nathan Brooks",
                  "Department Head - Learning Materials",
                  "Ministry of Education - Learning Materials",
                  "#4aaa4a",
                  "2024-08-01",
                  "2029-08-01",
                  "materials.dept@gov.example.com",
                  "+1-555-0420",
                  "Nathan Brooks manages the production and distribution of educational materials nationwide. He has improved supply chain efficiency for textbook delivery and digital resource access.",
                  [
                    "Manage learning material production",
                    "Coordinate textbook distribution",
                    "Oversee digital resource platforms",
                    "Ensure material quality standards",
                    "Manage educational resource budget",
                  ],
                  {
                    overall: 66,
                    previousOverall: 62,
                    trend: "up",
                    categories: {
                      budgetManagement: 70,
                      projectDelivery: 65,
                      publicSatisfaction: 62,
                      transparencyAccountability: 66,
                      policyImplementation: 64,
                      stakeholderEngagement: 69,
                    },
                  },
                  deptHeadEducationAccountability,
                  [],
                  "edu-dir-cur",
                ),
              ],
              "edu-dep",
            ),
          ],
          "edu-min",
        ),
      ],
      "president",
    ),
    // Ministry of Defense
    rep(
      "def-min",
      "General David Mwangi",
      "Minister of Defense",
      "Ministry of Defense",
      "#4a1a6b",
      "2024-03-01",
      "2029-03-01",
      "defense.minister@gov.example.com",
      "+1-555-0500",
      "General David Mwangi (Ret.) is a distinguished military leader with 35 years of service. He brings strategic insight to defense policy, having commanded multiple operations and served as Chief of Defense Staff before his ministerial appointment.",
      [
        "Formulate national defense policy",
        "Oversee armed forces administration",
        "Manage defense procurement and budgeting",
        "Coordinate national security strategy",
        "Engage with international defense partners",
      ],
      {
        overall: 74,
        previousOverall: 76,
        trend: "down",
        categories: {
          budgetManagement: 68,
          projectDelivery: 75,
          publicSatisfaction: 74,
          transparencyAccountability: 65,
          policyImplementation: 78,
          stakeholderEngagement: 84,
        },
      },
      defenseMinisterAccountability,
      [
        rep(
          "def-dep",
          "Colonel Janet Reeves",
          "Deputy Minister of Defense",
          "Ministry of Defense",
          "#5c2d82",
          "2024-04-01",
          "2029-04-01",
          "defense.deputy@gov.example.com",
          "+1-555-0501",
          "Colonel Janet Reeves (Ret.) is a logistics and personnel specialist who manages welfare programs for service members and their families. She has pioneered military housing modernization.",
          [
            "Support defense policy implementation",
            "Oversee military personnel welfare",
            "Manage veterans affairs programs",
            "Coordinate military housing and facilities",
            "Lead defense logistics reform",
          ],
          {
            overall: 70,
            previousOverall: 68,
            trend: "up",
            categories: {
              budgetManagement: 72,
              projectDelivery: 68,
              publicSatisfaction: 67,
              transparencyAccountability: 70,
              policyImplementation: 70,
              stakeholderEngagement: 73,
            },
          },
          deputyDefenseAccountability,
          [
            rep(
              "def-dir-cyber",
              "Major Chris Nakamura",
              "Director of Cyber Defense",
              "Ministry of Defense - Cyber Division",
              "#6e3f94",
              "2024-06-01",
              "2029-06-01",
              "cyber.director@gov.example.com",
              "+1-555-0510",
              "Major Chris Nakamura leads the nation's cyber defense strategy, having built the military's cybersecurity capabilities from the ground up. He is recognized internationally for his expertise in cyber warfare defense.",
              [
                "Develop cybersecurity defense strategy",
                "Protect critical infrastructure from cyber threats",
                "Lead cyber incident response teams",
                "Coordinate with international cyber defense partners",
                "Manage cyber defense training programs",
              ],
              {
                overall: 72,
                previousOverall: 70,
                trend: "up",
                categories: {
                  budgetManagement: 70,
                  projectDelivery: 72,
                  publicSatisfaction: 70,
                  transparencyAccountability: 72,
                  policyImplementation: 74,
                  stakeholderEngagement: 74,
                },
              },
              directorDefenseAccountability,
              [
                rep(
                  "def-dh-intel",
                  "Captain Elena Vasquez",
                  "Department Head - Intelligence Analysis",
                  "Ministry of Defense - Intelligence",
                  "#8051a6",
                  "2024-08-01",
                  "2029-08-01",
                  "intel.dept@gov.example.com",
                  "+1-555-0520",
                  "Captain Elena Vasquez heads the intelligence analysis division, providing strategic assessments for national security decision-making. Her analytical rigor has improved the quality of intelligence reports.",
                  [
                    "Produce strategic intelligence assessments",
                    "Coordinate intelligence gathering operations",
                    "Brief senior leadership on security threats",
                    "Manage intelligence sharing agreements",
                    "Oversee analyst training programs",
                  ],
                  {
                    overall: 76,
                    previousOverall: 74,
                    trend: "up",
                    categories: {
                      budgetManagement: 72,
                      projectDelivery: 78,
                      publicSatisfaction: 75,
                      transparencyAccountability: 74,
                      policyImplementation: 80,
                      stakeholderEngagement: 77,
                    },
                  },
                  deptHeadFinanceAccountability, // reuse similar
                  [],
                  "def-dir-cyber",
                ),
              ],
              "def-dep",
            ),
          ],
          "def-min",
        ),
      ],
      "president",
    ),
    // Ministry of Infrastructure
    rep(
      "infra-min",
      "Richard Adeyemi",
      "Minister of Infrastructure",
      "Ministry of Infrastructure",
      "#8b6914",
      "2024-03-01",
      "2029-03-01",
      "infra.minister@gov.example.com",
      "+1-555-0600",
      "Richard Adeyemi is a civil engineer and former construction executive who brings private sector efficiency to public infrastructure development. His tenure has been marked by ambitious projects but also criticism over delays and procurement concerns.",
      [
        "Plan and execute national infrastructure projects",
        "Oversee road, bridge, and railway construction",
        "Manage water and sanitation infrastructure",
        "Coordinate urban and rural development",
        "Regulate construction standards and safety",
      ],
      {
        overall: 42,
        previousOverall: 45,
        trend: "down",
        categories: {
          budgetManagement: 38,
          projectDelivery: 32,
          publicSatisfaction: 48,
          transparencyAccountability: 35,
          policyImplementation: 42,
          stakeholderEngagement: 57,
        },
      },
      infraMinisterAccountability,
      [
        rep(
          "infra-dep",
          "Caroline Dubois",
          "Deputy Minister of Infrastructure",
          "Ministry of Infrastructure",
          "#a07d28",
          "2024-04-01",
          "2029-04-01",
          "infra.deputy@gov.example.com",
          "+1-555-0601",
          "Caroline Dubois is an urban planner focused on smart city development and sustainable infrastructure. She has struggled to deliver on ambitious timelines but has introduced innovative planning methodologies.",
          [
            "Support infrastructure policy implementation",
            "Lead smart city development initiatives",
            "Manage rural infrastructure programs",
            "Coordinate with private sector partners",
            "Oversee construction quality assurance",
          ],
          {
            overall: 40,
            previousOverall: 42,
            trend: "down",
            categories: {
              budgetManagement: 35,
              projectDelivery: 30,
              publicSatisfaction: 42,
              transparencyAccountability: 38,
              policyImplementation: 40,
              stakeholderEngagement: 55,
            },
          },
          deputyInfraAccountability,
          [
            rep(
              "infra-dir-roads",
              "Michael Osei",
              "Director of Roads & Highways",
              "Ministry of Infrastructure - Roads Division",
              "#b5913c",
              "2024-06-01",
              "2029-06-01",
              "roads.director@gov.example.com",
              "+1-555-0610",
              "Michael Osei manages the national roads and highways program. While his technical expertise is solid, his division faces criticism for project delays and cost overruns.",
              [
                "Manage national road construction program",
                "Oversee highway maintenance and safety",
                "Coordinate road project procurement",
                "Monitor construction progress and quality",
                "Plan future road network expansion",
              ],
              {
                overall: 35,
                previousOverall: 38,
                trend: "down",
                categories: {
                  budgetManagement: 30,
                  projectDelivery: 25,
                  publicSatisfaction: 38,
                  transparencyAccountability: 28,
                  policyImplementation: 35,
                  stakeholderEngagement: 54,
                },
              },
              directorInfraAccountability,
              [
                rep(
                  "infra-dh-bridge",
                  "Samuel Okoro",
                  "Department Head - Bridge & Structures",
                  "Ministry of Infrastructure - Bridge Engineering",
                  "#c9a550",
                  "2024-08-01",
                  "2029-08-01",
                  "bridge.dept@gov.example.com",
                  "+1-555-0620",
                  "Samuel Okoro leads bridge construction and safety inspection programs. His department has faced severe criticism for missed inspection deadlines and incomplete safety audits.",
                  [
                    "Oversee bridge construction projects",
                    "Conduct bridge safety inspections",
                    "Manage structural engineering team",
                    "Coordinate emergency bridge repairs",
                    "Maintain bridge inventory database",
                  ],
                  {
                    overall: 28,
                    previousOverall: 32,
                    trend: "down",
                    categories: {
                      budgetManagement: 25,
                      projectDelivery: 18,
                      publicSatisfaction: 28,
                      transparencyAccountability: 22,
                      policyImplementation: 30,
                      stakeholderEngagement: 45,
                    },
                  },
                  deptHeadInfraAccountability,
                  [],
                  "infra-dir-roads",
                ),
              ],
              "infra-dep",
            ),
          ],
          "infra-min",
        ),
      ],
      "president",
    ),
    // Ministry of Justice
    rep(
      "justice-min",
      "Hon. Catherine Ndlovu",
      "Minister of Justice",
      "Ministry of Justice",
      "#5f1e3a",
      "2024-03-01",
      "2029-03-01",
      "justice.minister@gov.example.com",
      "+1-555-0700",
      "Hon. Catherine Ndlovu is a distinguished jurist and former Supreme Court Justice. She is committed to judicial independence, legal reform, and ensuring access to justice for all citizens. Her tenure has seen significant improvements in court efficiency.",
      [
        "Uphold the constitution and rule of law",
        "Oversee the judicial system and courts",
        "Direct prosecution and legal services",
        "Lead criminal justice reform",
        "Manage legal aid and public defender services",
      ],
      {
        overall: 70,
        previousOverall: 67,
        trend: "up",
        categories: {
          budgetManagement: 72,
          projectDelivery: 68,
          publicSatisfaction: 66,
          transparencyAccountability: 76,
          policyImplementation: 70,
          stakeholderEngagement: 68,
        },
      },
      justiceMinisterAccountability,
      [
        rep(
          "justice-dep",
          "Anthony Blackwell",
          "Deputy Minister of Justice",
          "Ministry of Justice",
          "#7a2d50",
          "2024-04-01",
          "2029-04-01",
          "justice.deputy@gov.example.com",
          "+1-555-0701",
          "Anthony Blackwell is a seasoned prosecutor who manages the operational aspects of the justice system. He has expanded legal aid services and is leading juvenile justice reform efforts.",
          [
            "Support justice policy implementation",
            "Oversee legal aid expansion",
            "Manage court administration",
            "Lead juvenile justice reform",
            "Coordinate law enforcement oversight",
          ],
          {
            overall: 65,
            previousOverall: 63,
            trend: "up",
            categories: {
              budgetManagement: 68,
              projectDelivery: 62,
              publicSatisfaction: 63,
              transparencyAccountability: 70,
              policyImplementation: 64,
              stakeholderEngagement: 63,
            },
          },
          deputyJusticeAccountability,
          [
            rep(
              "justice-dir-courts",
              "Judge Rita Fernandez",
              "Director of Court Services",
              "Ministry of Justice - Court Services",
              "#953c66",
              "2024-06-01",
              "2029-06-01",
              "courts.director@gov.example.com",
              "+1-555-0710",
              "Judge Rita Fernandez (Ret.) manages court operations and has been instrumental in digitizing case management systems. Her practical approach to judicial reform has reduced case processing times significantly.",
              [
                "Manage court operations and scheduling",
                "Lead case management digitization",
                "Implement virtual court hearings",
                "Reduce case backlog and processing times",
                "Train court staff on new systems",
              ],
              {
                overall: 72,
                previousOverall: 69,
                trend: "up",
                categories: {
                  budgetManagement: 74,
                  projectDelivery: 72,
                  publicSatisfaction: 65,
                  transparencyAccountability: 75,
                  policyImplementation: 74,
                  stakeholderEngagement: 72,
                },
              },
              directorJusticeAccountability,
              [
                rep(
                  "justice-dh-victim",
                  "Sandra Mitchell",
                  "Department Head - Victim Services",
                  "Ministry of Justice - Victim Services",
                  "#b04d7c",
                  "2024-08-01",
                  "2029-08-01",
                  "victim.dept@gov.example.com",
                  "+1-555-0720",
                  "Sandra Mitchell leads victim support services, ensuring that victims of crime have access to counseling, legal assistance, and protective services. She has expanded the program to cover more communities.",
                  [
                    "Manage victim support units nationwide",
                    "Coordinate witness protection services",
                    "Provide counseling and legal assistance referrals",
                    "Monitor victim satisfaction and outcomes",
                    "Advocate for victim rights in policy",
                  ],
                  {
                    overall: 64,
                    previousOverall: 60,
                    trend: "up",
                    categories: {
                      budgetManagement: 62,
                      projectDelivery: 60,
                      publicSatisfaction: 60,
                      transparencyAccountability: 68,
                      policyImplementation: 64,
                      stakeholderEngagement: 70,
                    },
                  },
                  deptHeadJusticeAccountability,
                  [],
                  "justice-dir-courts",
                ),
              ],
              "justice-dep",
            ),
          ],
          "justice-min",
        ),
      ],
      "president",
    ),
  ],
);

// Flatten the tree to get all representatives for search
export function flattenTree(node: Representative): Representative[] {
  const result: Representative[] = [node];
  for (const child of node.children) {
    result.push(...flattenTree(child));
  }
  return result;
}

// Get the path from root to a specific representative
export function getPathToNode(root: Representative, targetId: string): Representative[] {
  if (root.id === targetId) return [root];
  for (const child of root.children) {
    const path = getPathToNode(child, targetId);
    if (path.length > 0) return [root, ...path];
  }
  return [];
}

// Find a representative by ID
export function findRepById(node: Representative, id: string): Representative | null {
  if (node.id === id) return node;
  for (const child of node.children) {
    const found = findRepById(child, id);
    if (found) return found;
  }
  return null;
}

// Count direct reports
export function countDirectReports(node: Representative): number {
  return node.children.length;
}

// All representatives flat list
export const allRepresentatives = flattenTree(governmentData);

// ===================== OVERSIGHT FEATURE DATA =====================

// Feature 1: Conflict of Interest Tracker
export type ConflictType = "Business Tie" | "Family Connection" | "Stock Holding" | "Board Membership" | "Political Affiliation";
export type ConflictSeverity = "High" | "Medium" | "Low";
export type ConflictStatus = "Active" | "Under Investigation" | "Resolved" | "Dismissed";

export interface ConflictOfInterest {
  id: string;
  repId: string;
  type: ConflictType;
  entity: string;
  description: string;
  severity: ConflictSeverity;
  status: ConflictStatus;
  dateFlagged: string;
}

export const conflictsOfInterest: ConflictOfInterest[] = [
  { id: "coi1", repId: "fin-min", type: "Stock Holding", entity: "Meridian Banking Corp", description: "Holds 12% stake in Meridian Banking Corp, a major beneficiary of treasury reforms", severity: "High", status: "Under Investigation", dateFlagged: "2025-11-15" },
  { id: "coi2", repId: "infra-min", type: "Business Tie", entity: "Apex Construction Ltd", description: "Brother serves as CEO of Apex Construction Ltd, which holds $2.3B in government road contracts", severity: "High", status: "Active", dateFlagged: "2025-08-20" },
  { id: "coi3", repId: "health-min", type: "Board Membership", entity: "PharmaGlobal Inc", description: "Former board member of PharmaGlobal Inc until appointment; retains advisory position", severity: "Medium", status: "Under Investigation", dateFlagged: "2025-06-10" },
  { id: "coi4", repId: "president", type: "Family Connection", entity: "Chen Family Foundation", description: "Family foundation receives government grants for social programs; potential self-dealing concern", severity: "Low", status: "Dismissed", dateFlagged: "2024-12-05" },
  { id: "coi5", repId: "fin-dep", type: "Political Affiliation", entity: "United Commerce Party", description: "Secret membership in United Commerce Party while serving as neutral fiscal officer", severity: "Medium", status: "Active", dateFlagged: "2025-09-22" },
  { id: "coi6", repId: "infra-dep", type: "Stock Holding", entity: "GreenBuild Materials", description: "Owns 8% of GreenBuild Materials, sole supplier for smart city pilot project", severity: "High", status: "Active", dateFlagged: "2026-01-08" },
  { id: "coi7", repId: "justice-min", type: "Family Connection", entity: "Kovacs & Partners Law Firm", description: "Spouse is senior partner at Kovacs & Partners, which handles government legal contracts", severity: "Medium", status: "Resolved", dateFlagged: "2025-03-14" },
  { id: "coi8", repId: "def-min", type: "Board Membership", entity: "Sentinel Defense Systems", description: "Served on board of Sentinel Defense Systems until 2024; company now bidding on modernization contract", severity: "High", status: "Under Investigation", dateFlagged: "2025-10-30" },
];

// Feature 2: Budget Disbursement Audit Trail
export type DisbursementStatus = "Within Limits" | "Minor Variance" | "Significant Variance" | "Critical Overspend";

export interface BudgetDisbursement {
  id: string;
  repId: string;
  department: string;
  allocatedAmount: number;
  disbursedAmount: number;
  variance: number;
  category: string;
  quarter: string;
  status: DisbursementStatus;
  notes: string;
}

export const budgetDisbursements: BudgetDisbursement[] = [
  { id: "bd1", repId: "fin-min", department: "Ministry of Finance", allocatedAmount: 2450, disbursedAmount: 2380, variance: -2.8, category: "Salaries", quarter: "Q1 2026", status: "Within Limits", notes: "Standard execution within tolerance" },
  { id: "bd2", repId: "fin-min", department: "Ministry of Finance", allocatedAmount: 890, disbursedAmount: 1120, variance: 25.8, category: "Operations", quarter: "Q1 2026", status: "Critical Overspend", notes: "Emergency IT infrastructure upgrade required after cyber incident" },
  { id: "bd3", repId: "health-min", department: "Ministry of Health", allocatedAmount: 1200, disbursedAmount: 980, variance: -18.3, category: "Programs", quarter: "Q1 2026", status: "Minor Variance", notes: "Slow rollout of rural health centers" },
  { id: "bd4", repId: "health-min", department: "Ministry of Health", allocatedAmount: 450, disbursedAmount: 520, variance: 15.5, category: "Infrastructure", quarter: "Q2 2026", status: "Significant Variance", notes: "Unplanned hospital renovation costs" },
  { id: "bd5", repId: "infra-min", department: "Ministry of Infrastructure", allocatedAmount: 3200, disbursedAmount: 3800, variance: 18.7, category: "Infrastructure", quarter: "Q1 2026", status: "Significant Variance", notes: "Cost overruns on highway expansion project" },
  { id: "bd6", repId: "infra-min", department: "Ministry of Infrastructure", allocatedAmount: 1800, disbursedAmount: 2600, variance: 44.4, category: "Infrastructure", quarter: "Q2 2026", status: "Critical Overspend", notes: "Major cost escalation in bridge construction; material prices surged" },
  { id: "bd7", repId: "edu-min", department: "Ministry of Education", allocatedAmount: 680, disbursedAmount: 650, variance: -4.4, category: "Programs", quarter: "Q1 2026", status: "Within Limits", notes: "On-track execution of digital learning platform" },
  { id: "bd8", repId: "def-min", department: "Ministry of Defense", allocatedAmount: 3800, disbursedAmount: 4100, variance: 7.9, category: "Operations", quarter: "Q1 2026", status: "Minor Variance", notes: "Additional training exercises required" },
  { id: "bd9", repId: "def-min", department: "Ministry of Defense", allocatedAmount: 2200, disbursedAmount: 2800, variance: 27.3, category: "Infrastructure", quarter: "Q2 2026", status: "Critical Overspend", notes: "Unplanned equipment procurement for border security upgrade" },
  { id: "bd10", repId: "justice-min", department: "Ministry of Justice", allocatedAmount: 350, disbursedAmount: 340, variance: -2.9, category: "Salaries", quarter: "Q1 2026", status: "Within Limits", notes: "Budget execution normal" },
  { id: "bd11", repId: "justice-min", department: "Ministry of Justice", allocatedAmount: 280, disbursedAmount: 350, variance: 25, category: "Infrastructure", quarter: "Q2 2026", status: "Significant Variance", notes: "Court digitization program required additional server infrastructure" },
  { id: "bd12", repId: "fin-min", department: "Ministry of Finance", allocatedAmount: 600, disbursedAmount: 580, variance: -3.3, category: "Programs", quarter: "Q2 2026", status: "Within Limits", notes: "Investment promotion within budget" },
  { id: "bd13", repId: "edu-min", department: "Ministry of Education", allocatedAmount: 420, disbursedAmount: 500, variance: 19, category: "Infrastructure", quarter: "Q2 2026", status: "Significant Variance", notes: "Unexpected costs for school laboratory upgrades" },
  { id: "bd14", repId: "health-min", department: "Ministry of Health", allocatedAmount: 750, disbursedAmount: 720, variance: -4, category: "Salaries", quarter: "Q2 2026", status: "Within Limits", notes: "Normal salary disbursement" },
  { id: "bd15", repId: "infra-min", department: "Ministry of Infrastructure", allocatedAmount: 900, disbursedAmount: 850, variance: -5.6, category: "Programs", quarter: "Q3 2025", status: "Within Limits", notes: "Water supply program on track" },
];

// Feature 3: Whistleblower & Public Complaint Portal
export type ComplaintCategory = "Corruption" | "Mismanagement" | "Service Failure" | "Procurement Fraud" | "Harassment" | "Environmental Violation" | "Other";
export type ComplaintStatus = "Submitted" | "Under Investigation" | "Resolved" | "Dismissed" | "Escalated";

export interface Complaint {
  id: string;
  category: ComplaintCategory;
  description: string;
  repId: string | null;
  region: string;
  status: ComplaintStatus;
  dateSubmitted: string;
  resolutionDate: string | null;
  daysToResolve: number | null;
}

export const complaints: Complaint[] = [
  { id: "comp1", category: "Corruption", description: "Bribery allegations in road construction contract awards in Eastern Region", repId: "infra-min", region: "Eastern Region", status: "Under Investigation", dateSubmitted: "2025-09-15", resolutionDate: null, daysToResolve: null },
  { id: "comp2", category: "Procurement Fraud", description: "Single-source contract for medical supplies without competitive bidding", repId: "health-min", region: "Capital District", status: "Escalated", dateSubmitted: "2025-08-10", resolutionDate: null, daysToResolve: null },
  { id: "comp3", category: "Service Failure", description: "Rural health center operating without qualified doctor for 6 months", repId: "health-min", region: "Northern Province", status: "Resolved", dateSubmitted: "2025-04-20", resolutionDate: "2025-09-15", daysToResolve: 147 },
  { id: "comp4", category: "Mismanagement", description: "Budget allocation misreported in quarterly finance report", repId: "fin-min", region: "Capital District", status: "Resolved", dateSubmitted: "2025-06-01", resolutionDate: "2025-08-20", daysToResolve: 80 },
  { id: "comp5", category: "Environmental Violation", description: "Highway construction destroying protected wetlands without environmental assessment", repId: "infra-min", region: "Southern Coast", status: "Under Investigation", dateSubmitted: "2026-01-05", resolutionDate: null, daysToResolve: null },
  { id: "comp6", category: "Corruption", description: "Official demanding kickbacks for business license approvals", repId: "fin-dep", region: "Western Province", status: "Submitted", dateSubmitted: "2026-02-01", resolutionDate: null, daysToResolve: null },
  { id: "comp7", category: "Harassment", description: "Workplace harassment in Ministry of Education regional office", repId: "edu-min", region: "Central Region", status: "Resolved", dateSubmitted: "2025-07-15", resolutionDate: "2025-12-10", daysToResolve: 147 },
  { id: "comp8", category: "Service Failure", description: "Court backlog causing 18-month wait for trial dates", repId: "justice-min", region: "Capital District", status: "Under Investigation", dateSubmitted: "2025-10-01", resolutionDate: null, daysToResolve: null },
  { id: "comp9", category: "Procurement Fraud", description: "Defense equipment procurement at 2x market rate through intermediaries", repId: "def-min", region: "Capital District", status: "Escalated", dateSubmitted: "2025-11-20", resolutionDate: null, daysToResolve: null },
  { id: "comp10", category: "Mismanagement", description: "School feeding program funds diverted to unrelated administrative costs", repId: "edu-min", region: "Eastern Region", status: "Under Investigation", dateSubmitted: "2025-12-15", resolutionDate: null, daysToResolve: null },
  { id: "comp11", category: "Other", description: "Lack of public consultation on smart city project affecting residential areas", repId: "infra-dep", region: "Capital District", status: "Submitted", dateSubmitted: "2026-02-10", resolutionDate: null, daysToResolve: null },
  { id: "comp12", category: "Environmental Violation", description: "Military training exercises causing noise pollution and water contamination near civilian areas", repId: "def-min", region: "Northern Province", status: "Dismissed", dateSubmitted: "2025-05-20", resolutionDate: "2025-07-01", daysToResolve: 42 },
  { id: "comp13", category: "Corruption", description: "Awarding of digital platform contract to company linked to official's family", repId: "president", region: "Capital District", status: "Dismissed", dateSubmitted: "2025-03-10", resolutionDate: "2025-04-15", daysToResolve: 35 },
  { id: "comp14", category: "Service Failure", description: "Digital tax system crashes during filing season causing widespread delays", repId: "fin-dir-rev", region: "National", status: "Resolved", dateSubmitted: "2025-04-01", resolutionDate: "2025-05-20", daysToResolve: 49 },
  { id: "comp15", category: "Procurement Fraud", description: "Bridge construction materials sourced from unregistered supplier at inflated prices", repId: "infra-dep", region: "Western Province", status: "Under Investigation", dateSubmitted: "2026-01-20", resolutionDate: null, daysToResolve: null },
];

// Feature 4: Attendance & Engagement Metrics
export interface AttendanceMetrics {
  repId: string;
  sessionAttendanceRate: number;
  publicHearingParticipation: number;
  communityEngagementHours: number;
  townHallsAttended: number;
  siteVisits: number;
  stakeholderMeetings: number;
  quarterlyTrend: { quarter: string; attendance: number }[];
}

export const attendanceMetrics: AttendanceMetrics[] = [
  { repId: "president", sessionAttendanceRate: 92, publicHearingParticipation: 8, communityEngagementHours: 45, townHallsAttended: 12, siteVisits: 18, stakeholderMeetings: 24, quarterlyTrend: [{ quarter: "Q1 2025", attendance: 88 }, { quarter: "Q2 2025", attendance: 90 }, { quarter: "Q3 2025", attendance: 93 }, { quarter: "Q4 2025", attendance: 92 }] },
  { repId: "vp", sessionAttendanceRate: 85, publicHearingParticipation: 12, communityEngagementHours: 60, townHallsAttended: 15, siteVisits: 22, stakeholderMeetings: 30, quarterlyTrend: [{ quarter: "Q1 2025", attendance: 82 }, { quarter: "Q2 2025", attendance: 84 }, { quarter: "Q3 2025", attendance: 87 }, { quarter: "Q4 2025", attendance: 85 }] },
  { repId: "fin-min", sessionAttendanceRate: 78, publicHearingParticipation: 6, communityEngagementHours: 30, townHallsAttended: 8, siteVisits: 12, stakeholderMeetings: 18, quarterlyTrend: [{ quarter: "Q1 2025", attendance: 75 }, { quarter: "Q2 2025", attendance: 78 }, { quarter: "Q3 2025", attendance: 80 }, { quarter: "Q4 2025", attendance: 78 }] },
  { repId: "health-min", sessionAttendanceRate: 72, publicHearingParticipation: 9, communityEngagementHours: 55, townHallsAttended: 14, siteVisits: 28, stakeholderMeetings: 22, quarterlyTrend: [{ quarter: "Q1 2025", attendance: 68 }, { quarter: "Q2 2025", attendance: 70 }, { quarter: "Q3 2025", attendance: 74 }, { quarter: "Q4 2025", attendance: 72 }] },
  { repId: "edu-min", sessionAttendanceRate: 80, publicHearingParticipation: 7, communityEngagementHours: 40, townHallsAttended: 10, siteVisits: 15, stakeholderMeetings: 20, quarterlyTrend: [{ quarter: "Q1 2025", attendance: 78 }, { quarter: "Q2 2025", attendance: 80 }, { quarter: "Q3 2025", attendance: 82 }, { quarter: "Q4 2025", attendance: 80 }] },
  { repId: "def-min", sessionAttendanceRate: 65, publicHearingParticipation: 3, communityEngagementHours: 20, townHallsAttended: 4, siteVisits: 8, stakeholderMeetings: 12, quarterlyTrend: [{ quarter: "Q1 2025", attendance: 60 }, { quarter: "Q2 2025", attendance: 62 }, { quarter: "Q3 2025", attendance: 68 }, { quarter: "Q4 2025", attendance: 65 }] },
  { repId: "infra-min", sessionAttendanceRate: 58, publicHearingParticipation: 4, communityEngagementHours: 25, townHallsAttended: 6, siteVisits: 10, stakeholderMeetings: 15, quarterlyTrend: [{ quarter: "Q1 2025", attendance: 55 }, { quarter: "Q2 2025", attendance: 58 }, { quarter: "Q3 2025", attendance: 60 }, { quarter: "Q4 2025", attendance: 58 }] },
  { repId: "justice-min", sessionAttendanceRate: 88, publicHearingParticipation: 10, communityEngagementHours: 35, townHallsAttended: 9, siteVisits: 14, stakeholderMeetings: 25, quarterlyTrend: [{ quarter: "Q1 2025", attendance: 85 }, { quarter: "Q2 2025", attendance: 87 }, { quarter: "Q3 2025", attendance: 90 }, { quarter: "Q4 2025", attendance: 88 }] },
  { repId: "fin-dep", sessionAttendanceRate: 82, publicHearingParticipation: 5, communityEngagementHours: 28, townHallsAttended: 7, siteVisits: 11, stakeholderMeetings: 16, quarterlyTrend: [{ quarter: "Q1 2025", attendance: 80 }, { quarter: "Q2 2025", attendance: 82 }, { quarter: "Q3 2025", attendance: 84 }, { quarter: "Q4 2025", attendance: 82 }] },
  { repId: "infra-dep", sessionAttendanceRate: 55, publicHearingParticipation: 2, communityEngagementHours: 15, townHallsAttended: 3, siteVisits: 5, stakeholderMeetings: 8, quarterlyTrend: [{ quarter: "Q1 2025", attendance: 50 }, { quarter: "Q2 2025", attendance: 52 }, { quarter: "Q3 2025", attendance: 58 }, { quarter: "Q4 2025", attendance: 55 }] },
  { repId: "health-dep", sessionAttendanceRate: 70, publicHearingParticipation: 6, communityEngagementHours: 32, townHallsAttended: 8, siteVisits: 16, stakeholderMeetings: 14, quarterlyTrend: [{ quarter: "Q1 2025", attendance: 67 }, { quarter: "Q2 2025", attendance: 70 }, { quarter: "Q3 2025", attendance: 72 }, { quarter: "Q4 2025", attendance: 70 }] },
  { repId: "justice-dep", sessionAttendanceRate: 86, publicHearingParticipation: 8, communityEngagementHours: 30, townHallsAttended: 7, siteVisits: 12, stakeholderMeetings: 20, quarterlyTrend: [{ quarter: "Q1 2025", attendance: 83 }, { quarter: "Q2 2025", attendance: 85 }, { quarter: "Q3 2025", attendance: 88 }, { quarter: "Q4 2025", attendance: 86 }] },
];

// Ministry average for comparison
export const ministryAverageAttendance = 74;

// Feature 5: Procurement Transparency Module
export type ContractStatus = "Active" | "Completed" | "Under Review" | "Cancelled" | "Suspended";

export interface ProcurementContract {
  id: string;
  repId: string;
  department: string;
  projectName: string;
  bidder: string;
  contractAmount: number;
  marketRateEstimate: number;
  overpriceRatio: number;
  isSingleSource: boolean;
  evaluationCriteria: string;
  awardDate: string;
  completionDate: string | null;
  status: ContractStatus;
  flagged: boolean;
}

export const procurementContracts: ProcurementContract[] = [
  { id: "proc1", repId: "infra-min", department: "Ministry of Infrastructure", projectName: "National Highway Expansion Phase 1", bidder: "Apex Construction Ltd", contractAmount: 2400, marketRateEstimate: 1800, overpriceRatio: 1.33, isSingleSource: true, evaluationCriteria: "Experience & capacity", awardDate: "2025-03-15", completionDate: null, status: "Active", flagged: true },
  { id: "proc2", repId: "health-min", department: "Ministry of Health", projectName: "Medical Equipment Supply Contract", bidder: "PharmaGlobal Inc", contractAmount: 350, marketRateEstimate: 200, overpriceRatio: 1.75, isSingleSource: true, evaluationCriteria: "Technical specifications", awardDate: "2025-06-20", completionDate: null, status: "Under Review", flagged: true },
  { id: "proc3", repId: "def-min", department: "Ministry of Defense", projectName: "Cybersecurity Infrastructure", bidder: "Sentinel Defense Systems", contractAmount: 800, marketRateEstimate: 550, overpriceRatio: 1.45, isSingleSource: false, evaluationCriteria: "Security compliance & capability", awardDate: "2025-08-10", completionDate: null, status: "Active", flagged: true },
  { id: "proc4", repId: "fin-min", department: "Ministry of Finance", projectName: "Tax System Modernization", bidder: "TechGov Solutions", contractAmount: 120, marketRateEstimate: 110, overpriceRatio: 1.09, isSingleSource: false, evaluationCriteria: "Technical capability & cost", awardDate: "2024-09-01", completionDate: "2025-12-31", status: "Completed", flagged: false },
  { id: "proc5", repId: "edu-min", department: "Ministry of Education", projectName: "Digital Learning Platform", bidder: "EduTech Dynamics", contractAmount: 180, marketRateEstimate: 165, overpriceRatio: 1.09, isSingleSource: false, evaluationCriteria: "Pedagogy alignment & scalability", awardDate: "2024-11-01", completionDate: null, status: "Active", flagged: false },
  { id: "proc6", repId: "infra-dep", department: "Ministry of Infrastructure", projectName: "Smart City Pilot - Capital District", bidder: "UrbanTech Consortium", contractAmount: 450, marketRateEstimate: 280, overpriceRatio: 1.61, isSingleSource: true, evaluationCriteria: "Innovation & integration capacity", awardDate: "2025-10-01", completionDate: null, status: "Active", flagged: true },
  { id: "proc7", repId: "justice-min", department: "Ministry of Justice", projectName: "Court Digitization Program", bidder: "LegalTech Partners", contractAmount: 95, marketRateEstimate: 85, overpriceRatio: 1.12, isSingleSource: false, evaluationCriteria: "Security & compliance standards", awardDate: "2024-08-15", completionDate: null, status: "Active", flagged: false },
  { id: "proc8", repId: "health-dep", department: "Ministry of Health", projectName: "Pharmaceutical Supply Chain Optimization", bidder: "LogiMed Services", contractAmount: 150, marketRateEstimate: 130, overpriceRatio: 1.15, isSingleSource: false, evaluationCriteria: "Distribution network & reliability", awardDate: "2025-05-01", completionDate: null, status: "Active", flagged: false },
  { id: "proc9", repId: "def-min", department: "Ministry of Defense", projectName: "Border Surveillance System Upgrade", bidder: "SkyWatch Technologies", contractAmount: 600, marketRateEstimate: 420, overpriceRatio: 1.43, isSingleSource: true, evaluationCriteria: "Proprietary technology requirement", awardDate: "2025-07-01", completionDate: "2025-12-31", status: "Completed", flagged: true },
  { id: "proc10", repId: "infra-min", department: "Ministry of Infrastructure", projectName: "Rural Broadband Infrastructure", bidder: "ConnectAll Networks", contractAmount: 320, marketRateEstimate: 300, overpriceRatio: 1.07, isSingleSource: false, evaluationCriteria: "Coverage capacity & speed", awardDate: "2025-01-15", completionDate: null, status: "Active", flagged: false },
];

// Feature 6: Inter-Agency Performance Benchmarking
export interface BenchmarkData {
  department: string;
  budgetExecutionRate: number;
  projectCompletionRate: number;
  publicSatisfactionScore: number;
  transparencyScore: number;
  overallRank: number;
}

export const benchmarkData: BenchmarkData[] = [
  { department: "Ministry of Finance", budgetExecutionRate: 88, projectCompletionRate: 72, publicSatisfactionScore: 64, transparencyScore: 70, overallRank: 2 },
  { department: "Ministry of Health", budgetExecutionRate: 75, projectCompletionRate: 55, publicSatisfactionScore: 55, transparencyScore: 62, overallRank: 5 },
  { department: "Ministry of Education", budgetExecutionRate: 82, projectCompletionRate: 68, publicSatisfactionScore: 62, transparencyScore: 75, overallRank: 3 },
  { department: "Ministry of Defense", budgetExecutionRate: 70, projectCompletionRate: 60, publicSatisfactionScore: 74, transparencyScore: 55, overallRank: 4 },
  { department: "Ministry of Infrastructure", budgetExecutionRate: 62, projectCompletionRate: 42, publicSatisfactionScore: 48, transparencyScore: 40, overallRank: 6 },
  { department: "Ministry of Justice", budgetExecutionRate: 85, projectCompletionRate: 75, publicSatisfactionScore: 66, transparencyScore: 78, overallRank: 1 },
];

// Feature 7: Policy Promise Timeline (Gantt-style)
export interface PromiseTimelineEntry {
  promiseId: string;
  description: string;
  startDate: string;
  targetDate: string;
  completionPercent: number;
  status: PromiseStatus;
  milestoneDates: { date: string; label: string; achieved: boolean }[];
}

export const promiseTimelineEntries: PromiseTimelineEntry[] = [
  { promiseId: "p1", description: "Reduce national debt by 15%", startDate: "2024-01-15", targetDate: "2027-12-31", completionPercent: 45, status: "In Progress", milestoneDates: [{ date: "2024-06-30", label: "Debt audit complete", achieved: true }, { date: "2025-06-30", label: "5% reduction target", achieved: true }, { date: "2026-06-30", label: "10% reduction target", achieved: false }, { date: "2027-06-30", label: "15% reduction achieved", achieved: false }] },
  { promiseId: "p2", description: "Create 2 million new jobs", startDate: "2024-01-15", targetDate: "2027-06-30", completionPercent: 62, status: "In Progress", milestoneDates: [{ date: "2024-12-31", label: "500K jobs created", achieved: true }, { date: "2025-12-31", label: "1M jobs milestone", achieved: true }, { date: "2026-12-31", label: "1.5M jobs milestone", achieved: false }] },
  { promiseId: "p4", description: "Strengthen national security infrastructure", startDate: "2024-01-15", targetDate: "2025-12-31", completionPercent: 100, status: "Fulfilled", milestoneDates: [{ date: "2024-06-30", label: "Security assessment", achieved: true }, { date: "2025-06-30", label: "Infrastructure deployed", achieved: true }, { date: "2025-12-31", label: "Full operational capability", achieved: true }] },
  { promiseId: "fm1", description: "Reduce budget deficit to 3% of GDP", startDate: "2024-03-01", targetDate: "2027-06-30", completionPercent: 58, status: "In Progress", milestoneDates: [{ date: "2025-03-01", label: "Deficit at 5%", achieved: true }, { date: "2026-03-01", label: "Deficit at 4%", achieved: false }, { date: "2027-03-01", label: "Deficit at 3%", achieved: false }] },
  { promiseId: "hm1", description: "Build 200 new health centers", startDate: "2024-03-01", targetDate: "2028-06-30", completionPercent: 42, status: "In Progress", milestoneDates: [{ date: "2025-06-30", label: "50 centers operational", achieved: true }, { date: "2026-06-30", label: "100 centers operational", achieved: false }, { date: "2027-06-30", label: "150 centers operational", achieved: false }] },
  { promiseId: "im1", description: "Build 5000km of new roads", startDate: "2025-01-15", targetDate: "2029-12-31", completionPercent: 35, status: "In Progress", milestoneDates: [{ date: "2026-06-30", label: "1000km completed", achieved: false }, { date: "2027-06-30", label: "2500km completed", achieved: false }] },
  { promiseId: "jm3", description: "Establish anti-corruption courts", startDate: "2024-03-01", targetDate: "2025-06-30", completionPercent: 100, status: "Fulfilled", milestoneDates: [{ date: "2024-12-31", label: "Courts established", achieved: true }, { date: "2025-06-30", label: "First cases processed", achieved: true }] },
  { promiseId: "dm1", description: "Modernize armed forces equipment", startDate: "2024-03-01", targetDate: "2028-12-31", completionPercent: 60, status: "In Progress", milestoneDates: [{ date: "2025-06-30", label: "Phase 1 equipment delivery", achieved: true }, { date: "2026-06-30", label: "Phase 2 deployment", achieved: false }, { date: "2027-06-30", label: "Phase 3 integration", achieved: false }] },
];

// Feature 8: Media & Public Sentiment Feed
export type SentimentType = "Positive" | "Neutral" | "Negative" | "Mixed";

export interface MediaSentiment {
  id: string;
  repId: string;
  source: string;
  headline: string;
  sentiment: SentimentType;
  date: string;
  mentionsCount: number;
  sentimentScore: number;
}

export const mediaSentiments: MediaSentiment[] = [
  { id: "ms1", repId: "president", source: "National Daily", headline: "President Chen's economic reforms showing promising results", sentiment: "Positive", date: "2026-01-20", mentionsCount: 450, sentimentScore: 72 },
  { id: "ms2", repId: "president", source: "TV Broadcast Network", headline: "Mixed reviews on healthcare reform pace under Chen administration", sentiment: "Mixed", date: "2026-01-15", mentionsCount: 320, sentimentScore: 45 },
  { id: "ms3", repId: "fin-min", source: "Financial Times", headline: "Finance Minister Okafor faces scrutiny over stock holdings", sentiment: "Negative", date: "2025-11-18", mentionsCount: 580, sentimentScore: -35 },
  { id: "ms4", repId: "fin-min", source: "National Daily", headline: "Treasury digitization praised as landmark achievement", sentiment: "Positive", date: "2025-12-10", mentionsCount: 220, sentimentScore: 85 },
  { id: "ms5", repId: "infra-min", source: "Social Media Aggregate", headline: "Public outrage over road construction delays and cost overruns", sentiment: "Negative", date: "2026-01-18", mentionsCount: 1200, sentimentScore: -65 },
  { id: "ms6", repId: "infra-min", source: "Capital Gazette", headline: "Infrastructure Minister denies conflict of interest with Apex Construction", sentiment: "Negative", date: "2025-08-22", mentionsCount: 380, sentimentScore: -50 },
  { id: "ms7", repId: "health-min", source: "Health Watch", headline: "New health insurance scheme gains public support", sentiment: "Positive", date: "2025-11-05", mentionsCount: 280, sentimentScore: 68 },
  { id: "ms8", repId: "health-min", source: "TV Broadcast Network", headline: "PharmaGlobal ties raise ethical concerns for Health Ministry", sentiment: "Negative", date: "2025-06-12", mentionsCount: 420, sentimentScore: -40 },
  { id: "ms9", repId: "justice-min", source: "Legal Review", headline: "Anti-corruption courts deliver first convictions", sentiment: "Positive", date: "2025-09-20", mentionsCount: 180, sentimentScore: 80 },
  { id: "ms10", repId: "def-min", source: "Defense Quarterly", headline: "Border security success story: surveillance system fully operational", sentiment: "Positive", date: "2025-12-15", mentionsCount: 150, sentimentScore: 75 },
  { id: "ms11", repId: "edu-min", source: "Social Media Aggregate", headline: "Parents welcome digital learning but worry about teacher shortages", sentiment: "Mixed", date: "2026-01-12", mentionsCount: 650, sentimentScore: 30 },
  { id: "ms12", repId: "vp", source: "National Daily", headline: "VP Williams pushes for accelerated electoral reform timeline", sentiment: "Neutral", date: "2025-12-20", mentionsCount: 200, sentimentScore: 15 },
];

// Feature 9: Asset Growth Monitor
export interface AssetDeclaration {
  repId: string;
  year: string;
  declaredAssets: number;
  declaredIncome: number;
  assetChangePercent: number;
  flagged: boolean;
  flagReason: string | null;
  categoryBreakdown: { category: string; amount: number }[];
}

export const assetDeclarations: AssetDeclaration[] = [
  { repId: "president", year: "2024", declaredAssets: 2800, declaredIncome: 180, assetChangePercent: 8, flagged: false, flagReason: null, categoryBreakdown: [{ category: "Real Estate", amount: 1200 }, { category: "Investments", amount: 800 }, { category: "Cash & Savings", amount: 500 }, { category: "Other", amount: 300 }] },
  { repId: "president", year: "2025", declaredAssets: 3100, declaredIncome: 180, assetChangePercent: 10.7, flagged: false, flagReason: null, categoryBreakdown: [{ category: "Real Estate", amount: 1300 }, { category: "Investments", amount: 900 }, { category: "Cash & Savings", amount: 600 }, { category: "Other", amount: 300 }] },
  { repId: "fin-min", year: "2024", declaredAssets: 450, declaredIncome: 120, assetChangePercent: 12, flagged: false, flagReason: null, categoryBreakdown: [{ category: "Real Estate", amount: 200 }, { category: "Investments", amount: 150 }, { category: "Cash & Savings", amount: 80 }, { category: "Other", amount: 20 }] },
  { repId: "fin-min", year: "2025", declaredAssets: 920, declaredIncome: 120, assetChangePercent: 104.4, flagged: true, flagReason: "Asset growth exceeds 200% threshold when including stock holdings in Meridian Banking Corp", categoryBreakdown: [{ category: "Real Estate", amount: 250 }, { category: "Investments", amount: 450 }, { category: "Cash & Savings", amount: 150 }, { category: "Other", amount: 70 }] },
  { repId: "infra-min", year: "2024", declaredAssets: 380, declaredIncome: 95, assetChangePercent: 5, flagged: false, flagReason: null, categoryBreakdown: [{ category: "Real Estate", amount: 180 }, { category: "Investments", amount: 100 }, { category: "Cash & Savings", amount: 70 }, { category: "Other", amount: 30 }] },
  { repId: "infra-min", year: "2025", declaredAssets: 780, declaredIncome: 95, assetChangePercent: 105.3, flagged: true, flagReason: "Unexplained asset doubling; possible undeclared income from construction sector ties", categoryBreakdown: [{ category: "Real Estate", amount: 350 }, { category: "Investments", amount: 250 }, { category: "Cash & Savings", amount: 130 }, { category: "Other", amount: 50 }] },
  { repId: "health-min", year: "2024", declaredAssets: 320, declaredIncome: 110, assetChangePercent: 6, flagged: false, flagReason: null, categoryBreakdown: [{ category: "Real Estate", amount: 150 }, { category: "Investments", amount: 100 }, { category: "Cash & Savings", amount: 50 }, { category: "Other", amount: 20 }] },
  { repId: "health-min", year: "2025", declaredAssets: 580, declaredIncome: 110, assetChangePercent: 81.3, flagged: false, flagReason: null, categoryBreakdown: [{ category: "Real Estate", amount: 200 }, { category: "Investments", amount: 200 }, { category: "Cash & Savings", amount: 130 }, { category: "Other", amount: 50 }] },
  { repId: "def-min", year: "2024", declaredAssets: 520, declaredIncome: 130, assetChangePercent: 3, flagged: false, flagReason: null, categoryBreakdown: [{ category: "Real Estate", amount: 250 }, { category: "Investments", amount: 150 }, { category: "Cash & Savings", amount: 100 }, { category: "Other", amount: 20 }] },
  { repId: "def-min", year: "2025", declaredAssets: 1600, declaredIncome: 130, assetChangePercent: 207.7, flagged: true, flagReason: "Asset growth over 200%; possible link to defense procurement contracts", categoryBreakdown: [{ category: "Real Estate", amount: 600 }, { category: "Investments", amount: 650 }, { category: "Cash & Savings", amount: 250 }, { category: "Other", amount: 100 }] },
  { repId: "justice-min", year: "2024", declaredAssets: 280, declaredIncome: 100, assetChangePercent: 7, flagged: false, flagReason: null, categoryBreakdown: [{ category: "Real Estate", amount: 130 }, { category: "Investments", amount: 80 }, { category: "Cash & Savings", amount: 50 }, { category: "Other", amount: 20 }] },
  { repId: "justice-min", year: "2025", declaredAssets: 310, declaredIncome: 100, assetChangePercent: 10.7, flagged: false, flagReason: null, categoryBreakdown: [{ category: "Real Estate", amount: 140 }, { category: "Investments", amount: 90 }, { category: "Cash & Savings", amount: 55 }, { category: "Other", amount: 25 }] },
  { repId: "edu-min", year: "2024", declaredAssets: 250, declaredIncome: 95, assetChangePercent: 4, flagged: false, flagReason: null, categoryBreakdown: [{ category: "Real Estate", amount: 120 }, { category: "Investments", amount: 70 }, { category: "Cash & Savings", amount: 40 }, { category: "Other", amount: 20 }] },
  { repId: "edu-min", year: "2025", declaredAssets: 290, declaredIncome: 95, assetChangePercent: 16, flagged: false, flagReason: null, categoryBreakdown: [{ category: "Real Estate", amount: 130 }, { category: "Investments", amount: 85 }, { category: "Cash & Savings", amount: 50 }, { category: "Other", amount: 25 }] },
];

// Average citizen income growth rate for comparison
export const citizenIncomeGrowthRate = 4.2; // percent year-over-year

// Feature 10: Sanctions & Disciplinary Actions Registry
export type ActionSeverity = "Minor Warning" | "Formal Reprimand" | "Suspension" | "Impeachment" | "Criminal Referral";
export type ActionStatus = "Proposed" | "Active" | "Completed" | "Appealed" | "Overturned";

export interface DisciplinaryAction {
  id: string;
  repId: string;
  type: string;
  description: string;
  severity: ActionSeverity;
  status: ActionStatus;
  dateIssued: string;
  resolvedDate: string | null;
  issuingBody: string;
  linkedComplaintId: string | null;
}

export const disciplinaryActions: DisciplinaryAction[] = [
  { id: "da1", repId: "infra-min", type: "Ethics Violation", description: "Failure to disclose family business ties with government contractor", severity: "Formal Reprimand", status: "Active", dateIssued: "2025-09-01", resolvedDate: null, issuingBody: "National Ethics Commission", linkedComplaintId: "comp1" },
  { id: "da2", repId: "fin-min", type: "Conflict of Interest", description: "Stock holdings in banking sector while overseeing treasury reforms", severity: "Formal Reprimand", status: "Appealed", dateIssued: "2025-11-20", resolvedDate: null, issuingBody: "Financial Oversight Board", linkedComplaintId: null },
  { id: "da3", repId: "health-min", type: "Procurement Ethics", description: "Retained advisory position with pharmaceutical company after appointment", severity: "Minor Warning", status: "Completed", dateIssued: "2025-06-15", resolvedDate: "2025-09-30", issuingBody: "Ethics Review Panel", linkedComplaintId: "comp2" },
  { id: "da4", repId: "infra-dep", type: "Mismanagement", description: "Approved construction material purchases from unregistered supplier", severity: "Suspension", status: "Proposed", dateIssued: "2026-01-25", resolvedDate: null, issuingBody: "Ministry Internal Review", linkedComplaintId: "comp15" },
  { id: "da5", repId: "def-min", type: "Procurement Violation", description: "Defense equipment procurement at inflated rates through intermediaries", severity: "Criminal Referral", status: "Active", dateIssued: "2025-12-01", resolvedDate: null, issuingBody: "Anti-Corruption Commission", linkedComplaintId: "comp9" },
  { id: "da6", repId: "fin-dep", type: "Conflict of Interest", description: "Secret political party membership while serving as neutral fiscal officer", severity: "Minor Warning", status: "Completed", dateIssued: "2025-10-05", resolvedDate: "2025-11-30", issuingBody: "Civil Service Commission", linkedComplaintId: null },
  { id: "da7", repId: "infra-min", type: "Environmental Negligence", description: "Authorized highway construction through protected wetlands without assessment", severity: "Formal Reprimand", status: "Proposed", dateIssued: "2026-02-01", resolvedDate: null, issuingBody: "Environmental Protection Authority", linkedComplaintId: "comp5" },
  { id: "da8", repId: "edu-min", type: "Financial Mismanagement", description: "School feeding program funds diverted to unrelated administrative expenses", severity: "Minor Warning", status: "Active", dateIssued: "2026-01-15", resolvedDate: null, issuingBody: "Ministry Internal Audit", linkedComplaintId: "comp10" },
];

// Helper function: Get conflicts for a specific rep
export function getConflictsForRep(repId: string): ConflictOfInterest[] {
  return conflictsOfInterest.filter((c) => c.repId === repId);
}

// Helper function: Get budget disbursements for a specific rep
export function getDisbursementsForRep(repId: string): BudgetDisbursement[] {
  return budgetDisbursements.filter((b) => b.repId === repId);
}

// Helper function: Get complaints for a specific rep
export function getComplaintsForRep(repId: string | null): Complaint[] {
  if (repId === null) return complaints;
  return complaints.filter((c) => c.repId === repId);
}

// Helper function: Get attendance for a specific rep
export function getAttendanceForRep(repId: string): AttendanceMetrics | undefined {
  return attendanceMetrics.find((a) => a.repId === repId);
}

// Helper function: Get procurement contracts for a specific rep
export function getProcurementForRep(repId: string): ProcurementContract[] {
  return procurementContracts.filter((p) => p.repId === repId);
}

// Helper function: Get benchmark data for a department
export function getBenchmarkForDepartment(department: string): BenchmarkData | undefined {
  return benchmarkData.find((b) => b.department === department);
}

// Helper function: Get media sentiment for a specific rep
export function getMediaSentimentForRep(repId: string): MediaSentiment[] {
  return mediaSentiments.filter((m) => m.repId === repId);
}

// Helper function: Get asset declarations for a specific rep
export function getAssetDeclarationsForRep(repId: string): AssetDeclaration[] {
  return assetDeclarations.filter((a) => a.repId === repId);
}

// Helper function: Get disciplinary actions for a specific rep
export function getDisciplinaryForRep(repId: string): DisciplinaryAction[] {
  return disciplinaryActions.filter((d) => d.repId === repId);
}
