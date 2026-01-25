import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { ElixaMascot } from "@/components/ElixaMascot";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <ElixaMascot pose="search" size="2xl" animation="float" />
        </div>
        <h1 className="mb-2 text-6xl font-bold text-primary">404</h1>
        <p className="mb-6 text-xl text-muted-foreground">
          Oops! Elixa couldn't find that page
        </p>
        <Button asChild size="lg">
          <Link to="/">
            <Home className="mr-2 h-4 w-4" />
            Return to Home
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
