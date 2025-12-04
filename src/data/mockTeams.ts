export interface TeamMember {
  id: string;
  name: string;
  role: string;
  isManager: boolean;
  status: "online" | "busy" | "offline";
  specialty?: string;
}

export interface Team {
  id: string;
  name: string;
  icon: string;
  color: string;
  gradient: string;
  manager: TeamMember;
  members: TeamMember[];
  description: string;
}

export const mockTeams: Team[] = [
  {
    id: "team-marketing",
    name: "Marketing Team",
    icon: "Megaphone",
    color: "rose",
    gradient: "from-rose-500 to-orange-500",
    description: "Drives brand awareness, customer acquisition, and revenue growth",
    manager: {
      id: "marketing-director",
      name: "Marketing Director",
      role: "Department Head",
      isManager: true,
      status: "online",
      specialty: "Strategy & Growth",
    },
    members: [
      {
        id: "ppc-specialist",
        name: "PPC Specialist",
        role: "Paid Search",
        isManager: false,
        status: "online",
        specialty: "Google Ads, Bing Ads",
      },
      {
        id: "social-media-manager",
        name: "Social Media Manager",
        role: "Organic Social",
        isManager: false,
        status: "online",
        specialty: "Community, Content Calendar",
      },
      {
        id: "content-writer",
        name: "Content Writer",
        role: "Copywriting",
        isManager: false,
        status: "online",
        specialty: "Blog, Landing Pages",
      },
      {
        id: "email-marketing-specialist",
        name: "Email Marketing Specialist",
        role: "Email & CRM",
        isManager: false,
        status: "online",
        specialty: "Klaviyo, Flows, Campaigns",
      },
      {
        id: "seo-specialist",
        name: "SEO Specialist",
        role: "Organic Search",
        isManager: false,
        status: "busy",
        specialty: "Technical SEO, Content SEO",
      },
    ],
  },
  {
    id: "team-product",
    name: "Product & Merchandising",
    icon: "Package",
    color: "purple",
    gradient: "from-purple-500 to-pink-500",
    description: "Manages product catalog, pricing strategy, and inventory optimization",
    manager: {
      id: "product-director",
      name: "Product Director",
      role: "Department Head",
      isManager: true,
      status: "online",
      specialty: "Product Strategy",
    },
    members: [
      {
        id: "listing-merchandising-specialist",
        name: "Listing & Merchandising Specialist",
        role: "Visual Merchandising",
        isManager: false,
        status: "busy",
        specialty: "Collections, Bundles, Upsells",
      },
      {
        id: "competitive-pricing-analyst",
        name: "Competitive Pricing Analyst",
        role: "Pricing Strategy",
        isManager: false,
        status: "online",
        specialty: "Price Monitoring, Dynamic Pricing",
      },
    ],
  },
  {
    id: "team-customer-service",
    name: "Customer Service",
    icon: "Headphones",
    color: "green",
    gradient: "from-green-500 to-teal-500",
    description: "Delivers exceptional customer experiences and support",
    manager: {
      id: "customer-service-director",
      name: "Human - Customer Service Director",
      role: "Department Head",
      isManager: true,
      status: "online",
      specialty: "CX Strategy",
    },
    members: [
      {
        id: "customer-support-rep",
        name: "Customer Support Rep",
        role: "Frontline Support",
        isManager: false,
        status: "online",
        specialty: "Tickets, Live Chat, Phone",
      },
      {
        id: "refunds-warranty-specialist",
        name: "Refunds & Warranty Specialist",
        role: "Returns & Claims",
        isManager: false,
        status: "busy",
        specialty: "Refunds, Exchanges, Warranties",
      },
      {
        id: "qa-specialist",
        name: "QA Specialist",
        role: "Human - Quality Assurance",
        isManager: false,
        status: "online",
        specialty: "CSAT, NPS, Quality Reviews",
      },
    ],
  },
  {
    id: "team-finance",
    name: "Finance Team",
    icon: "DollarSign",
    color: "emerald",
    gradient: "from-emerald-500 to-green-500",
    description: "Manages financial planning, analysis, and revenue operations",
    manager: {
      id: "finance-director",
      name: "Human - Finance Director",
      role: "Department Head",
      isManager: true,
      status: "online",
      specialty: "Financial Strategy",
    },
    members: [
      {
        id: "fpna-analyst",
        name: "FP&A Analyst",
        role: "Financial Planning",
        isManager: false,
        status: "online",
        specialty: "Budgeting, Forecasting, P&L",
      },
      {
        id: "revenue-ops-analyst",
        name: "Revenue Ops Analyst",
        role: "Revenue Operations",
        isManager: false,
        status: "busy",
        specialty: "Revenue Tracking, Reporting",
      },
    ],
  },
  {
    id: "team-development",
    name: "Development Team",
    icon: "Code",
    color: "blue",
    gradient: "from-blue-500 to-indigo-500",
    description: "Builds and maintains digital infrastructure and experiences",
    manager: {
      id: "tech-lead",
      name: "Tech Lead",
      role: "Department Head",
      isManager: true,
      status: "online",
      specialty: "Technical Architecture",
    },
    members: [
      {
        id: "shopify-developer",
        name: "Shopify Developer",
        role: "Platform Development",
        isManager: false,
        status: "online",
        specialty: "Liquid, Theme Development",
      },
      {
        id: "ux-ui-designer",
        name: "UX/UI Designer",
        role: "Design",
        isManager: false,
        status: "online",
        specialty: "User Experience, Figma",
      },
    ],
  },
  {
    id: "team-creative",
    name: "Creative Team",
    icon: "Palette",
    color: "pink",
    gradient: "from-pink-500 to-rose-500",
    description: "Creates visual content and brand storytelling",
    manager: {
      id: "creative-director",
      name: "Creative Director",
      role: "Department Head",
      isManager: true,
      status: "online",
      specialty: "Creative Vision",
    },
    members: [
      {
        id: "graphic-designer",
        name: "Graphic Designer",
        role: "Visual Design",
        isManager: false,
        status: "online",
        specialty: "Branding, Print, Digital",
      },
      {
        id: "video-producer",
        name: "Video Producer",
        role: "Video Production",
        isManager: false,
        status: "busy",
        specialty: "Video Editing, Production",
      },
    ],
  },
  {
    id: "team-legal",
    name: "Legal & Risk",
    icon: "Shield",
    color: "slate",
    gradient: "from-slate-500 to-gray-500",
    description: "Ensures compliance, manages risk, and protects the business",
    manager: {
      id: "legal-director",
      name: "Legal Director",
      role: "Department Head",
      isManager: true,
      status: "online",
      specialty: "Legal Strategy",
    },
    members: [
      {
        id: "compliance-officer",
        name: "Compliance Officer",
        role: "Compliance",
        isManager: false,
        status: "online",
        specialty: "GDPR, Policies, Audits",
      },
      {
        id: "legal-assistant",
        name: "Legal Assistant",
        role: "Legal Support",
        isManager: false,
        status: "busy",
        specialty: "Contracts, Documentation",
      },
    ],
  },
];

// Helper to get all team members across all teams
export const getAllTeamMembers = (): TeamMember[] => {
  return mockTeams.flatMap((team) => [team.manager, ...team.members]);
};

// Helper to get a team member by ID
export const getTeamMemberById = (id: string): { member: TeamMember; team: Team } | null => {
  for (const team of mockTeams) {
    if (team.manager.id === id) {
      return { member: team.manager, team };
    }
    const member = team.members.find((m) => m.id === id);
    if (member) {
      return { member, team };
    }
  }
  return null;
};

// Helper to get online count for a team
export const getTeamOnlineCount = (team: Team): number => {
  const managerOnline = team.manager.status === "online" ? 1 : 0;
  const membersOnline = team.members.filter((m) => m.status === "online").length;
  return managerOnline + membersOnline;
};
