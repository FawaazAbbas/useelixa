import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

export const MobileRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  useEffect(() => {
    // Allow auth and workspace pages on mobile
    const allowedMobilePaths = ['/workspace', '/auth', '/oauth/callback'];
    const isAllowedPath = allowedMobilePaths.some(path => location.pathname.startsWith(path));
    
    // Redirect mobile users from other pages to workspace
    if (isMobile && !isAllowedPath) {
      navigate('/workspace', { replace: true });
    }
  }, [isMobile, location.pathname, navigate]);

  return null;
};
