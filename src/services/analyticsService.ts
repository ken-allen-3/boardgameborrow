import mixpanel from 'mixpanel-browser';
import hotjar from '@hotjar/browser';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Initialize analytics services
export const initializeAnalytics = () => {
  // Initialize Google Analytics
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=G-XZW0HFPH6Y`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', 'G-XZW0HFPH6Y');

  // Initialize Hotjar
  hotjar.init(5291614, 6);

  // Initialize Mixpanel
  mixpanel.init('94929140035bcef57e59bba96de747fe', {
    debug: process.env.NODE_ENV !== 'production'
  });
};

// Track page views
export const trackPageView = (pageName: string) => {
  window.gtag('event', 'page_view', {
    page_title: pageName,
    page_location: window.location.href,
    page_path: window.location.pathname
  });
  mixpanel.track('Page View', { page: pageName });
};

// Track user events
export const trackEvent = (eventName: string, properties: Record<string, any> = {}) => {
  window.gtag('event', eventName, properties);
  mixpanel.track(eventName, properties);
};

// Identify user
export const identifyUser = (userId: string, userProperties: Record<string, any> = {}) => {
  window.gtag('set', 'user_id', userId);
  mixpanel.identify(userId);
  mixpanel.people.set(userProperties);
};

// Track errors
export const trackError = (error: Error, context: Record<string, any> = {}) => {
  trackEvent('Error', {
    error_message: error.message,
    error_stack: error.stack,
    ...context
  });
};

// Track feature usage
export const trackFeatureUsage = (featureName: string, properties: Record<string, any> = {}) => {
  trackEvent('Feature Usage', {
    feature: featureName,
    ...properties
  });
};

// Track game actions
export const trackGameAction = (action: string, gameId: string, properties: Record<string, any> = {}) => {
  trackEvent(`Game ${action}`, {
    game_id: gameId,
    ...properties
  });
};

// Track social interactions
export const trackSocialInteraction = (action: string, properties: Record<string, any> = {}) => {
  trackEvent('Social Interaction', {
    action,
    ...properties
  });
};
