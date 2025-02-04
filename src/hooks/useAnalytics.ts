import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../services/analyticsService';

export const useAnalytics = () => {
  const location = useLocation();
  const prevPathRef = useRef<string>('');

  useEffect(() => {
    const currentPath = location.pathname;
    if (currentPath !== prevPathRef.current) {
      // Get page name from path
      const pageName = currentPath === '/' ? 'Home' : 
        currentPath.charAt(1).toUpperCase() + 
        currentPath.slice(2).replace(/-/g, ' ');

      trackPageView(pageName);
      prevPathRef.current = currentPath;
    }
  }, [location]);
};
