import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

export const MobileRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  // Mobile redirect removed - all pages are now mobile-friendly
  useEffect(() => {
    // No redirects - allow access to all pages on mobile
  }, [isMobile, location.pathname, navigate]);

  return null;
};
