import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Calendar, ArrowLeft, User, Clock, Share2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  author_name: string;
  category: string | null;
  tags: string[];
  published_at: string | null;
  created_at: string;
  seo_title: string | null;
  seo_description: string | null;
}

// Helper to update meta tags
const updateMetaTags = (post: BlogPost) => {
  const baseUrl = window.location.origin;
  const postUrl = `${baseUrl}/blog/${post.slug}`;
  
  // Use SEO fields if available, otherwise fall back to defaults
  const seoTitle = post.seo_title || post.title;
  const seoDescription = post.seo_description || post.excerpt || post.content.replace(/<[^>]*>/g, '').substring(0, 160);
  
  // Update title
  document.title = `${seoTitle} | Elixa Blog`;
  
  // Helper to set or create meta tag
  const setMetaTag = (property: string, content: string, isName = false) => {
    const selector = isName ? `meta[name="${property}"]` : `meta[property="${property}"]`;
    let meta = document.querySelector(selector) as HTMLMetaElement;
    if (!meta) {
      meta = document.createElement('meta');
      if (isName) {
        meta.name = property;
      } else {
        meta.setAttribute('property', property);
      }
      document.head.appendChild(meta);
    }
    meta.content = content;
  };
  
  // Description
  setMetaTag('description', seoDescription, true);
  
  // Open Graph tags
  setMetaTag('og:title', seoTitle);
  setMetaTag('og:description', seoDescription);
  setMetaTag('og:url', postUrl);
  setMetaTag('og:type', 'article');
  if (post.cover_image_url) {
    setMetaTag('og:image', post.cover_image_url);
  }
  
  // Twitter Card tags
  setMetaTag('twitter:card', 'summary_large_image', true);
  setMetaTag('twitter:title', seoTitle, true);
  setMetaTag('twitter:description', seoDescription, true);
  if (post.cover_image_url) {
    setMetaTag('twitter:image', post.cover_image_url, true);
  }
  
  // Article specific tags
  setMetaTag('article:author', post.author_name);
  if (post.published_at) {
    setMetaTag('article:published_time', post.published_at);
  }
  if (post.tags?.length) {
    post.tags.forEach((tag, i) => {
      setMetaTag(`article:tag:${i}`, tag);
    });
  }
};

// Reset meta tags on unmount
const resetMetaTags = () => {
  document.title = 'Elixa - AI Agents Marketplace';
  const metaProperties = [
    'og:title', 'og:description', 'og:url', 'og:type', 'og:image',
    'article:author', 'article:published_time'
  ];
  metaProperties.forEach(prop => {
    const meta = document.querySelector(`meta[property="${prop}"]`);
    if (meta) meta.remove();
  });
  const metaNames = ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image'];
  metaNames.forEach(name => {
    const meta = document.querySelector(`meta[name="${name}"]`);
    if (meta) meta.remove();
  });
};

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
    
    return () => {
      resetMetaTags();
    };
  }, [slug]);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          navigate("/blog");
        }
        throw error;
      }
      setPost(data);
      updateMetaTags(data);
    } catch (error) {
      console.error("Error fetching post:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          url,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  // Calculate reading time from plain text
  const getPlainText = (html: string) => html.replace(/<[^>]*>/g, '');
  const readingTime = post ? Math.ceil(getPlainText(post.content).split(/\s+/).length / 200) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-6 w-64 mb-8" />
          <Skeleton className="h-[400px] w-full rounded-xl mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Article not found</h1>
          <Link to="/blog">
            <Button>Back to Blog</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated gradient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[100px]"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <article className="relative z-10 max-w-4xl mx-auto px-4 py-12 md:py-20">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link 
            to="/blog" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </motion.div>

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            {post.category && (
              <Badge variant="secondary">{post.category}</Badge>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{post.author_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                {post.published_at 
                  ? format(new Date(post.published_at), "MMMM d, yyyy")
                  : format(new Date(post.created_at), "MMMM d, yyyy")
                }
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{readingTime} min read</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleShare} className="ml-auto">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </motion.header>

        {/* Cover Image */}
        {post.cover_image_url && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-10"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-violet-500/30 to-fuchsia-500/30 rounded-2xl blur-xl opacity-50" />
              <img
                src={post.cover_image_url}
                alt={post.title}
                className="relative w-full h-auto max-h-[500px] object-cover rounded-2xl"
              />
            </div>
          </motion.div>
        )}

        {/* Content - Rendered as HTML */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 pt-8 border-t"
          >
            <h4 className="text-sm font-semibold mb-4 text-muted-foreground">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-sm">
                  {tag}
                </Badge>
              ))}
            </div>
          </motion.div>
        )}

        {/* Back to blog */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Link to="/blog">
            <Button variant="outline" size="lg">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to all articles
            </Button>
          </Link>
        </motion.div>
      </article>
    </div>
  );
};

export default BlogPostPage;