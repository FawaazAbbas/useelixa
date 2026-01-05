-- Add SEO fields to blog_posts table
ALTER TABLE public.blog_posts 
ADD COLUMN seo_title TEXT,
ADD COLUMN seo_description TEXT;