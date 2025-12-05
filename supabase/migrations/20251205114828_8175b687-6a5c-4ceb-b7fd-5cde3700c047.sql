-- First, insert all required agent categories
INSERT INTO agent_categories (name, description, icon) VALUES
  ('Marketing & Growth', 'Agents focused on paid ads, SEO, content, social media, and growth strategies', 'TrendingUp'),
  ('Customer Support', 'Agents for customer service, tickets, refunds, and support operations', 'Headphones'),
  ('Sales', 'Agents for lead generation, pipeline management, and sales operations', 'Target'),
  ('Finance', 'Agents for accounting, FP&A, revenue analysis, and financial planning', 'DollarSign'),
  ('Operations', 'Agents for inventory, logistics, procurement, and warehouse management', 'Package'),
  ('HR & People', 'Agents for recruiting, onboarding, training, and people operations', 'Users'),
  ('Development', 'Agents for building and maintaining ecommerce platforms and integrations', 'Code'),
  ('Design & Creative', 'Agents for UX/UI design, graphics, video, and creative production', 'Palette'),
  ('Analytics & Data', 'Agents for dashboards, attribution, data quality, and business intelligence', 'BarChart3'),
  ('Legal & Compliance', 'Agents for contracts, compliance, risk management, and legal operations', 'Shield'),
  ('Product', 'Agents for product management, CRO, and product-led growth', 'Box'),
  ('Project Management', 'Agents for project coordination, resource planning, and team management', 'ClipboardList'),
  ('Ecommerce', 'Agents specialized in ecommerce platform management and optimization', 'ShoppingCart')
ON CONFLICT DO NOTHING;