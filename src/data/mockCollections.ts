export interface Collection {
  id: string;
  name: string;
  description: string;
  agentIds: string[];
  icon: string;
  gradient: string;
}

export const mockCollections: Collection[] = [
  {
    id: "col-1",
    name: "Marketing Starter Pack",
    description: "Everything you need to launch your marketing campaigns",
    agentIds: ["mock-2", "mock-5", "mock-6"],
    icon: "📢",
    gradient: "from-purple-500 to-pink-600"
  },
  {
    id: "col-2",
    name: "Customer Service Essentials",
    description: "Build world-class customer support operations",
    agentIds: ["mock-1"],
    icon: "💬",
    gradient: "from-blue-500 to-cyan-600"
  },
  {
    id: "col-3",
    name: "Data-Driven Business",
    description: "Analytics and insights for informed decision making",
    agentIds: ["mock-3", "mock-11"],
    icon: "📊",
    gradient: "from-green-500 to-emerald-600"
  },
  {
    id: "col-4",
    name: "Sales Acceleration",
    description: "Close more deals with AI-powered sales tools",
    agentIds: ["mock-4"],
    icon: "💰",
    gradient: "from-orange-500 to-red-600"
  }
];
