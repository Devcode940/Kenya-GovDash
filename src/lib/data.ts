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
