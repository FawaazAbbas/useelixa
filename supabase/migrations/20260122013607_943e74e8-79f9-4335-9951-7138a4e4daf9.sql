-- Insert Google services into integrations table with correct auth_type value
INSERT INTO public.integrations (name, slug, description, category, logo_url, company_name, status, auth_type, credential_type, display_order, is_google_bundle, bundle_type)
VALUES 
  ('Gmail', 'gmail', 'Send, read, and manage emails from your Gmail account', 'Communication', 'https://okkybxipbxpoyzqmtosz.supabase.co/storage/v1/object/public/logos/GmailLogo.webp', 'Google', 'live', 'oauth', 'googleOAuth2Api', 5, true, 'email_workspace'),
  ('Google Calendar', 'google-calendar', 'View and manage your calendar events and scheduling', 'Productivity', 'https://okkybxipbxpoyzqmtosz.supabase.co/storage/v1/object/public/logos/GoogleCalendarLogo.png', 'Google', 'live', 'oauth', 'googleOAuth2Api', 6, true, 'email_workspace'),
  ('Google Sheets', 'google-sheets', 'Read and write data in your spreadsheets', 'Productivity', 'https://okkybxipbxpoyzqmtosz.supabase.co/storage/v1/object/public/logos/GoogleSheetsLogo.png', 'Google', 'live', 'oauth', 'googleOAuth2Api', 7, true, 'email_workspace'),
  ('Google Ads', 'google-ads', 'View campaigns, performance metrics, and ad spend', 'Marketing', 'https://okkybxipbxpoyzqmtosz.supabase.co/storage/v1/object/public/logos/GoogleAdsLogo.svg', 'Google', 'live', 'oauth', 'googleOAuth2Api', 8, true, 'ads_marketing'),
  ('Google Analytics', 'google-analytics', 'Access website traffic, user behavior, and conversion data', 'Analytics', 'https://okkybxipbxpoyzqmtosz.supabase.co/storage/v1/object/public/logos/GoogleAnalyticsLogo.png', 'Google', 'live', 'oauth', 'googleOAuth2Api', 9, true, 'analytics_reporting')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  logo_url = EXCLUDED.logo_url,
  company_name = EXCLUDED.company_name,
  status = EXCLUDED.status,
  auth_type = EXCLUDED.auth_type,
  credential_type = EXCLUDED.credential_type,
  is_google_bundle = EXCLUDED.is_google_bundle,
  bundle_type = EXCLUDED.bundle_type;