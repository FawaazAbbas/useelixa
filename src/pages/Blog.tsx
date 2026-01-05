import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Search, Calendar, ArrowRight, Sparkles } from "lucide-react";
import { format } from "date-fns";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  author_name: string;
  category: string | null;
  tags: string[];
  published_at: string | null;
}

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, cover_image_url, author_name, category, tags, published_at")
        .eq("published", true)
        .order("published_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [...new Set(posts.map(p => p.category).filter(Boolean))];

  const filteredPosts = posts.filter(post => {
    const matchesSearch = !search || 
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPost = filteredPosts[0];
  const remainingPosts = filteredPosts.slice(1);

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

      {/* Grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link to="/" className="inline-block mb-8">
            <img 
              src="/elixa-logo.png" 
              alt="Elixa" 
              className="h-10 mx-auto hover:scale-105 transition-transform duration-300"
            />
          </Link>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary uppercase tracking-wider">Blog</span>
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text">
            Insights & Updates
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover the latest news, tutorials, and insights about AI agents and automation
          </p>
        </motion.div>

        {/* Search & Filters */}
        <motion.div 
          className="flex flex-col md:flex-row gap-4 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-12 bg-card/50 backdrop-blur-sm border-border/50"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge
              variant={selectedCategory === null ? "default" : "outline"}
              className="cursor-pointer px-4 py-2 text-sm hover:bg-primary/10 transition-colors"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Badge>
            {categories.map(cat => (
              <Badge
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                className="cursor-pointer px-4 py-2 text-sm hover:bg-primary/10 transition-colors"
                onClick={() => setSelectedCategory(cat as string)}
              >
                {cat}
              </Badge>
            ))}
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-6 space-y-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredPosts.length === 0 && (
          <motion.div 
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-muted-foreground text-lg">No articles found</p>
          </motion.div>
        )}

        {/* Featured Post */}
        {!loading && featuredPost && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-10"
          >
            <Link to={`/blog/${featuredPost.slug}`}>
              <Card className="group overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300">
                <div className="md:flex">
                  {featuredPost.cover_image_url && (
                    <div className="md:w-1/2 h-64 md:h-auto overflow-hidden">
                      <img
                        src={featuredPost.cover_image_url}
                        alt={featuredPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <CardContent className={`p-8 flex flex-col justify-center ${featuredPost.cover_image_url ? 'md:w-1/2' : 'w-full'}`}>
                    <div className="flex items-center gap-3 mb-4">
                      {featuredPost.category && (
                        <Badge variant="secondary">{featuredPost.category}</Badge>
                      )}
                      <Badge className="bg-gradient-to-r from-primary to-violet-600 text-white">Featured</Badge>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-3 group-hover:text-primary transition-colors">
                      {featuredPost.title}
                    </h2>
                    {featuredPost.excerpt && (
                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {featuredPost.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {featuredPost.published_at && format(new Date(featuredPost.published_at), "MMM d, yyyy")}
                      </div>
                      <span className="flex items-center gap-1 text-primary font-medium group-hover:gap-2 transition-all">
                        Read more <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </Link>
          </motion.div>
        )}

        {/* Posts Grid */}
        {!loading && remainingPosts.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {remainingPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * (index + 1) }}
              >
                <Link to={`/blog/${post.slug}`}>
                  <Card className="group h-full overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                    {post.cover_image_url && (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={post.cover_image_url}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <CardContent className="p-6">
                      {post.category && (
                        <Badge variant="secondary" className="mb-3">{post.category}</Badge>
                      )}
                      <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {post.published_at && format(new Date(post.published_at), "MMM d, yyyy")}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Back to home */}
        <motion.p 
          className="text-center text-sm text-muted-foreground mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Link to="/" className="hover:text-primary transition-colors duration-300 flex items-center justify-center gap-2">
            <span>←</span>
            <span>Back to Elixa</span>
          </Link>
        </motion.p>
      </div>
    </div>
  );
};

export default Blog;