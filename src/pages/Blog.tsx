import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Search, Calendar, ArrowRight, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { TalentPoolNavbar } from "@/components/TalentPoolNavbar";
import { TalentPoolFooter } from "@/components/TalentPoolFooter";

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
    <div className="min-h-screen bg-background">
      <TalentPoolNavbar showSearch={false} />
      
      {/* Hero Section */}
      <section className="relative pt-20 sm:pt-24 pb-12 overflow-hidden">
        {/* Background effects - matching site style */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-violet-500/5 to-background" />
        <div className="absolute top-20 right-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-primary/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-[200px] sm:w-[350px] h-[200px] sm:h-[350px] bg-violet-500/15 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div 
            className="text-center mb-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              <span className="bg-gradient-to-r from-primary via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
                Insights & Updates
              </span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
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
            <div className="relative flex-1 max-w-xl mx-auto md:mx-0">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-violet-500/20 to-fuchsia-500/20 rounded-xl blur-xl opacity-50" />
              <div className="relative flex items-center bg-card/90 backdrop-blur-xl border border-border hover:border-primary/30 rounded-xl shadow-lg shadow-primary/5 transition-all focus-within:border-primary/50 focus-within:shadow-primary/10">
                <Search className="ml-4 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search articles..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-12 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="mr-4 p-1 rounded-md hover:bg-muted transition-colors"
                  >
                    <span className="sr-only">Clear</span>
                    <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            <div className="flex gap-2 flex-wrap justify-center md:justify-start">
              <Badge
                variant={selectedCategory === null ? "default" : "outline"}
                className="cursor-pointer px-4 py-2.5 text-sm hover:bg-primary/10 transition-all hover:scale-105 rounded-xl"
                onClick={() => setSelectedCategory(null)}
              >
                All
              </Badge>
              {categories.map(cat => (
                <Badge
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  className="cursor-pointer px-4 py-2.5 text-sm hover:bg-primary/10 transition-all hover:scale-105 rounded-xl"
                  onClick={() => setSelectedCategory(cat as string)}
                >
                  {cat}
                </Badge>
              ))}
            </div>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden bg-card/80 backdrop-blur-sm border-border">
                  <Skeleton className="h-40 sm:h-48 w-full" />
                  <CardContent className="p-4 sm:p-6 space-y-3">
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
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <p className="text-muted-foreground text-lg">No articles found</p>
              <p className="text-muted-foreground text-sm mt-2">Try adjusting your search or filters</p>
            </motion.div>
          )}

          {/* Featured Post */}
          {!loading && featuredPost && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-6 sm:mb-10"
            >
              <Link to={`/blog/${featuredPost.slug}`}>
                <Card className="group overflow-hidden bg-card/80 backdrop-blur-xl border-border hover:border-primary/50 transition-all duration-300 shadow-xl shadow-primary/5">
                  <div className="flex flex-col md:flex-row">
                    {featuredPost.cover_image_url && (
                      <div className="md:w-1/2 h-48 sm:h-64 md:h-auto overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/50 z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <img
                          src={featuredPost.cover_image_url}
                          alt={featuredPost.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <CardContent className={`p-5 sm:p-8 flex flex-col justify-center ${featuredPost.cover_image_url ? 'md:w-1/2' : 'w-full'}`}>
                      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 flex-wrap">
                        {featuredPost.category && (
                          <Badge variant="secondary" className="rounded-lg text-xs sm:text-sm">{featuredPost.category}</Badge>
                        )}
                        <Badge className="bg-gradient-to-r from-primary to-violet-600 text-white rounded-lg text-xs sm:text-sm">Featured</Badge>
                      </div>
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {featuredPost.title}
                      </h2>
                      {featuredPost.excerpt && (
                        <p className="text-muted-foreground mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3 text-sm sm:text-base">
                          {featuredPost.excerpt}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                          {featuredPost.published_at && format(new Date(featuredPost.published_at), "MMM d, yyyy")}
                        </div>
                        <span className="flex items-center gap-1 text-primary font-medium group-hover:gap-2 transition-all text-sm">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {remainingPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * Math.min(index + 1, 6) }}
                >
                  <Link to={`/blog/${post.slug}`}>
                    <Card className="group h-full overflow-hidden bg-card/80 backdrop-blur-sm border-border hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                      {post.cover_image_url && (
                        <div className="h-40 sm:h-48 overflow-hidden relative">
                          <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <img
                            src={post.cover_image_url}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <CardContent className="p-4 sm:p-6">
                        {post.category && (
                          <Badge variant="secondary" className="mb-2 sm:mb-3 rounded-lg text-xs">{post.category}</Badge>
                        )}
                        <h3 className="text-base sm:text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                            {post.excerpt}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {post.published_at && format(new Date(post.published_at), "MMM d, yyyy")}
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <TalentPoolFooter hideTopSpacing />
    </div>
  );
};

export default Blog;
