import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Calendar, ArrowLeft, User, Clock, Share2, BookOpen, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { TalentPoolNavbar } from "@/components/TalentPoolNavbar";
import { TalentPoolFooter } from "@/components/TalentPoolFooter";

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
  // Removed waitlist state - table dropped

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

  // Waitlist functionality removed

  // Calculate reading time from plain text
  const getPlainText = (html: string) => html.replace(/<[^>]*>/g, '');
  const readingTime = post ? Math.ceil(getPlainText(post.content).split(/\s+/).length / 200) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <TalentPoolNavbar showSearch={false} />
        <div className="pt-24 max-w-4xl mx-auto px-4">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-6 w-64 mb-8" />
          <Skeleton className="h-[400px] w-full rounded-2xl mb-8" />
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
      <div className="min-h-screen bg-background">
        <TalentPoolNavbar showSearch={false} />
        <div className="pt-32 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Article not found</h1>
            <Link to="/blog">
              <Button className="bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90">
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
        <TalentPoolFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TalentPoolNavbar showSearch={false} />
      
      {/* Hero Section with Cover */}
      <section className="relative pt-20 sm:pt-24 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-violet-500/5 to-background" />
        <div className="absolute top-20 right-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-primary/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-[200px] sm:w-[350px] h-[200px] sm:h-[350px] bg-violet-500/15 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        <article className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {/* Back button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link 
              to="/blog" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
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
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 flex-wrap">
              {post.category && (
                <Badge variant="secondary" className="rounded-lg text-xs sm:text-sm">{post.category}</Badge>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-muted-foreground">
              <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-card/80 backdrop-blur-sm border border-border">
                <User className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                <span className="text-xs sm:text-sm">{post.author_name}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-card/80 backdrop-blur-sm border border-border">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                <span className="text-xs sm:text-sm">
                  {post.published_at 
                    ? format(new Date(post.published_at), "MMM d, yyyy")
                    : format(new Date(post.created_at), "MMM d, yyyy")
                  }
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-card/80 backdrop-blur-sm border border-border">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                <span className="text-xs sm:text-sm">{readingTime} min read</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleShare} 
                className="ml-auto rounded-lg hover:bg-primary/10 hover:border-primary/50 text-xs sm:text-sm h-7 sm:h-9 px-2 sm:px-3"
              >
                <Share2 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">Share</span>
              </Button>
            </div>
          </motion.header>

          {/* Cover Image */}
          {post.cover_image_url && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-6 sm:mb-10"
            >
              <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl shadow-primary/10">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-violet-500/30 to-fuchsia-500/30 rounded-xl sm:rounded-2xl blur-xl opacity-50" />
                <img
                  src={post.cover_image_url}
                  alt={post.title}
                  className="relative w-full h-auto max-h-[300px] sm:max-h-[500px] object-cover rounded-xl sm:rounded-2xl"
                />
              </div>
            </motion.div>
          )}

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="prose prose-sm sm:prose-lg max-w-none bg-card/60 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-border [&>p]:mb-6 [&>p]:sm:mb-8"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-6 sm:mt-8 p-4 sm:p-6 bg-card/60 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-border"
            >
              <h4 className="text-xs sm:text-sm font-semibold mb-3 sm:mb-4 text-muted-foreground">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs sm:text-sm rounded-lg hover:bg-primary/10 transition-colors">
                    {tag}
                  </Badge>
                ))}
              </div>
            </motion.div>
          )}

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 sm:mt-12 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-xl sm:rounded-2xl blur-xl opacity-60" />
            <div className="relative bg-card/90 backdrop-blur-xl rounded-xl sm:rounded-2xl p-5 sm:p-8 border border-primary/20 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              
              <div className="relative text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                  <span className="text-[10px] sm:text-xs font-medium text-primary uppercase tracking-wider">Get Started</span>
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3">
                  <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    Try Elixa Today
                  </span>
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-5 sm:mb-6 max-w-md mx-auto">
                  Connect your tools and start automating workflows with MCP.
                </p>
                <Link to="/auth">
                  <Button className="h-11 sm:h-12 px-8 rounded-xl shadow-lg shadow-primary/25 transition-all text-sm sm:text-base">
                    Get Started <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Back to blog */}
          <motion.div 
            className="text-center mt-8 sm:mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Link to="/blog">
              <Button 
                variant="outline" 
                size="lg"
                className="rounded-xl hover:bg-primary/10 hover:border-primary/50 transition-all text-sm sm:text-base h-10 sm:h-12"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to all articles
              </Button>
            </Link>
          </motion.div>
        </article>
      </section>

      <TalentPoolFooter hideTopSpacing />
    </div>
  );
};

export default BlogPostPage;
