export interface MockReview {
  id: string;
  agentId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  helpful: number;
  verified: boolean;
}

export const mockReviews: MockReview[] = [
  // Customer Support Pro Reviews
  {
    id: "rev-1",
    agentId: "mock-1",
    userId: "user-1",
    userName: "Sarah Johnson",
    userAvatar: "SJ",
    rating: 5,
    title: "Game changer for our support team",
    content: "This agent has completely transformed how we handle customer inquiries. The sentiment analysis is incredibly accurate and the multi-language support is seamless. Our response times have improved by 60%!",
    date: "2024-01-15",
    helpful: 34,
    verified: true
  },
  {
    id: "rev-2",
    agentId: "mock-1",
    userId: "user-2",
    userName: "Michael Chen",
    userAvatar: "MC",
    rating: 5,
    title: "Excellent AI capabilities",
    content: "The 24/7 support is truly automated and handles most common queries without any human intervention. Setup was easy and the ticket routing is smart.",
    date: "2024-01-10",
    helpful: 28,
    verified: true
  },
  {
    id: "rev-3",
    agentId: "mock-1",
    userId: "user-3",
    userName: "Emily Rodriguez",
    userAvatar: "ER",
    rating: 4,
    title: "Great but needs more customization",
    content: "Works well for standard support cases. Would love to see more customization options for specific industries. Overall very satisfied with the performance.",
    date: "2024-01-05",
    helpful: 15,
    verified: true
  },

  // Content Creator AI Reviews
  {
    id: "rev-4",
    agentId: "mock-2",
    userId: "user-4",
    userName: "David Kim",
    userAvatar: "DK",
    rating: 5,
    title: "Best content creation tool I've used",
    content: "The quality of content this agent produces is outstanding. It understands brand voice and creates engaging posts consistently. SEO optimization is top-notch!",
    date: "2024-01-18",
    helpful: 42,
    verified: true
  },
  {
    id: "rev-5",
    agentId: "mock-2",
    userId: "user-5",
    userName: "Jessica Martinez",
    userAvatar: "JM",
    rating: 5,
    title: "Saves hours of work every week",
    content: "I can now create a week's worth of social media content in under an hour. The AI understands context and creates relevant, engaging posts every time.",
    date: "2024-01-12",
    helpful: 31,
    verified: true
  },
  {
    id: "rev-6",
    agentId: "mock-2",
    userId: "user-6",
    userName: "Robert Taylor",
    userAvatar: "RT",
    rating: 4,
    title: "Solid content generation",
    content: "Really good for blog posts and social media. Sometimes needs a bit of editing but it's a huge time saver overall.",
    date: "2024-01-08",
    helpful: 19,
    verified: true
  },

  // Data Analyst Pro Reviews
  {
    id: "rev-7",
    agentId: "mock-3",
    userId: "user-7",
    userName: "Amanda White",
    userAvatar: "AW",
    rating: 5,
    title: "Incredible insights and forecasting",
    content: "The predictive analytics are incredibly accurate. We've been able to make better business decisions based on the forecasts this agent provides. The visualizations are beautiful too!",
    date: "2024-01-20",
    helpful: 38,
    verified: true
  },
  {
    id: "rev-8",
    agentId: "mock-3",
    userId: "user-8",
    userName: "James Anderson",
    userAvatar: "JA",
    rating: 5,
    title: "Professional-grade analytics",
    content: "Finally an AI agent that can handle complex data analysis. The reports are comprehensive and easy to understand. Highly recommend!",
    date: "2024-01-14",
    helpful: 26,
    verified: true
  },

  // Sales Assistant Reviews
  {
    id: "rev-9",
    agentId: "mock-4",
    userId: "user-9",
    userName: "Lisa Brown",
    userAvatar: "LB",
    rating: 5,
    title: "Boosted our sales pipeline",
    content: "Lead scoring is incredibly accurate. We're spending time on qualified leads and our conversion rate has increased by 40%. The CRM integration works flawlessly.",
    date: "2024-01-22",
    helpful: 45,
    verified: true
  },
  {
    id: "rev-10",
    agentId: "mock-4",
    userId: "user-10",
    userName: "Chris Wilson",
    userAvatar: "CW",
    rating: 4,
    title: "Great automation for sales",
    content: "Email outreach is well-automated and personalized. Pipeline management could use a few more features but it's a solid tool overall.",
    date: "2024-01-16",
    helpful: 22,
    verified: true
  },

  // Social Media Manager Reviews
  {
    id: "rev-11",
    agentId: "mock-5",
    userId: "user-11",
    userName: "Rachel Green",
    userAvatar: "RG",
    rating: 5,
    title: "Perfect for managing multiple accounts",
    content: "Managing 5 social media accounts has never been easier. The scheduling is smart and the analytics help us understand what content works best.",
    date: "2024-01-19",
    helpful: 33,
    verified: true
  },
  {
    id: "rev-12",
    agentId: "mock-5",
    userId: "user-12",
    userName: "Kevin Lee",
    userAvatar: "KL",
    rating: 4,
    title: "Solid social media tool",
    content: "Good for scheduling and analytics. Hashtag research is helpful. Would like to see more advanced features for stories and reels.",
    date: "2024-01-13",
    helpful: 18,
    verified: true
  },

  // Email Marketing Bot Reviews
  {
    id: "rev-13",
    agentId: "mock-6",
    userId: "user-13",
    userName: "Nicole Adams",
    userAvatar: "NA",
    rating: 5,
    title: "Best email marketing automation",
    content: "The A/B testing features are excellent and the personalization is on point. Our email open rates have doubled since we started using this agent!",
    date: "2024-01-21",
    helpful: 40,
    verified: true
  },
  {
    id: "rev-14",
    agentId: "mock-6",
    userId: "user-14",
    userName: "Tom Harris",
    userAvatar: "TH",
    rating: 5,
    title: "Incredible campaign builder",
    content: "Creating campaigns is intuitive and the analytics are detailed. The AI-driven personalization really works - we're seeing much better engagement.",
    date: "2024-01-17",
    helpful: 29,
    verified: true
  },

  // HR Recruiter AI Reviews
  {
    id: "rev-15",
    agentId: "mock-7",
    userId: "user-15",
    userName: "Maria Garcia",
    userAvatar: "MG",
    rating: 5,
    title: "Streamlined our hiring process",
    content: "Resume screening saves us hours every week. Interview scheduling is automated and candidates love the smooth experience. Can't imagine going back to manual processes!",
    date: "2024-01-23",
    helpful: 36,
    verified: true
  },

  // Finance Manager Reviews
  {
    id: "rev-16",
    agentId: "mock-8",
    userId: "user-16",
    userName: "Daniel Scott",
    userAvatar: "DS",
    rating: 5,
    title: "Perfect for financial management",
    content: "Expense tracking is automatic and the reports are detailed and accurate. Invoice management has saved us so much time. Highly recommend for any business!",
    date: "2024-01-24",
    helpful: 41,
    verified: true
  },

  // Project Manager Pro Reviews
  {
    id: "rev-17",
    agentId: "mock-9",
    userId: "user-17",
    userName: "Sophie Turner",
    userAvatar: "ST",
    rating: 5,
    title: "Amazing project coordination",
    content: "Task management is intuitive and team coordination has never been better. Timeline tracking helps us stay on schedule consistently.",
    date: "2024-01-25",
    helpful: 35,
    verified: true
  },

  // Legal Assistant Reviews
  {
    id: "rev-18",
    agentId: "mock-10",
    userId: "user-18",
    userName: "Benjamin Clark",
    userAvatar: "BC",
    rating: 5,
    title: "Excellent for legal work",
    content: "Contract drafting is accurate and compliance checking is thorough. Document review is fast and catches issues we might have missed. Essential tool for our legal team.",
    date: "2024-01-26",
    helpful: 30,
    verified: true
  },

  // Research Assistant Reviews
  {
    id: "rev-19",
    agentId: "mock-11",
    userId: "user-19",
    userName: "Olivia Martin",
    userAvatar: "OM",
    rating: 5,
    title: "Comprehensive research capabilities",
    content: "Market research is thorough and competitive analysis is insightful. The trend reports help us stay ahead of the competition. Great tool!",
    date: "2024-01-27",
    helpful: 32,
    verified: true
  },

  // DevOps Helper Reviews
  {
    id: "rev-20",
    agentId: "mock-12",
    userId: "user-20",
    userName: "Alex Thompson",
    userAvatar: "AT",
    rating: 5,
    title: "DevOps automation done right",
    content: "CI/CD automation is seamless and infrastructure monitoring is comprehensive. Log analysis helps us catch issues before they become problems. Must-have for any dev team!",
    date: "2024-01-28",
    helpful: 37,
    verified: true
  }
];

export const getReviewsByAgent = (agentId: string) => 
  mockReviews.filter(review => review.agentId === agentId);

export const getAverageRating = (agentId: string) => {
  const agentReviews = getReviewsByAgent(agentId);
  if (agentReviews.length === 0) return 0;
  return agentReviews.reduce((sum, review) => sum + review.rating, 0) / agentReviews.length;
};

export const getRatingDistribution = (agentId: string) => {
  const agentReviews = getReviewsByAgent(agentId);
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  
  agentReviews.forEach(review => {
    distribution[review.rating as keyof typeof distribution]++;
  });
  
  return distribution;
};
