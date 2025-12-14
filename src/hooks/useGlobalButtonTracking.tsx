import { useEffect } from 'react';
import { trackButtonClick } from '@/utils/analytics';

export const useGlobalButtonTracking = () => {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Find the closest button or clickable element
      const button = target.closest('button, [role="button"], a');
      
      if (button) {
        // Get button text
        let buttonText = button.textContent?.trim() || '';
        
        // If button has an aria-label, prefer that
        const ariaLabel = button.getAttribute('aria-label');
        if (ariaLabel) {
          buttonText = ariaLabel;
        }
        
        // Truncate long text
        if (buttonText.length > 50) {
          buttonText = buttonText.substring(0, 50) + '...';
        }
        
        // Get location context
        const location = window.location.pathname;
        
        // Track the click
        if (buttonText) {
          trackButtonClick(buttonText, location);
        }
      }
    };

    document.addEventListener('click', handleClick, true);
    
    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, []);
};
