export interface MockCategory {
  name: string;
  icon: string;
  color: string;
  count: number;
}

export const mockCategories: MockCategory[] = [
  { name: "Customer Service", icon: "🎧", color: "from-blue-500 to-cyan-500", count: 23 },
  { name: "Marketing", icon: "📢", color: "from-purple-500 to-pink-500", count: 45 },
  { name: "Sales", icon: "📈", color: "from-green-500 to-emerald-500", count: 18 },
  { name: "Analytics", icon: "📊", color: "from-teal-500 to-cyan-500", count: 12 },
  { name: "HR", icon: "👥", color: "from-indigo-500 to-blue-500", count: 15 },
  { name: "Finance", icon: "💰", color: "from-emerald-500 to-green-500", count: 9 },
  { name: "Productivity", icon: "⚡", color: "from-violet-500 to-purple-500", count: 27 },
  { name: "Legal", icon: "⚖️", color: "from-slate-500 to-gray-500", count: 6 },
  { name: "Research", icon: "🔬", color: "from-sky-500 to-blue-500", count: 14 },
  { name: "Development", icon: "💻", color: "from-orange-500 to-red-500", count: 21 }
];
