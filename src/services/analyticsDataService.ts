interface AnalyticsData {
  dailyActiveUsers: number;
  monthlyActiveUsers: number;
  totalPageViews: number;
  averageSessionDuration: number;
  topFeatures: Array<{name: string, usage: number}>;
  popularGames: Array<{name: string, views: number}>;
  userRetentionRate: number;
  conversionRate: number;
  userActivity: {
    labels: string[];
    data: number[];
  };
}

export const fetchAnalyticsData = async (): Promise<AnalyticsData> => {
  // In a real implementation, this would make API calls to Google Analytics, Hotjar, and Mixpanel
  // For now, we'll return mock data
  return {
    dailyActiveUsers: await fetchGoogleAnalyticsDailyUsers(),
    monthlyActiveUsers: await fetchGoogleAnalyticsMonthlyUsers(),
    totalPageViews: await fetchGoogleAnalyticsPageViews(),
    averageSessionDuration: await fetchGoogleAnalyticsSessionDuration(),
    topFeatures: await fetchMixpanelTopFeatures(),
    popularGames: await fetchMixpanelPopularGames(),
    userRetentionRate: await fetchMixpanelRetentionRate(),
    conversionRate: await fetchMixpanelConversionRate(),
    userActivity: await fetchUserActivityData()
  };
};

// Mock implementations of analytics API calls
const fetchGoogleAnalyticsDailyUsers = async (): Promise<number> => {
  return 150;
};

const fetchGoogleAnalyticsMonthlyUsers = async (): Promise<number> => {
  return 2500;
};

const fetchGoogleAnalyticsPageViews = async (): Promise<number> => {
  return 7500;
};

const fetchGoogleAnalyticsSessionDuration = async (): Promise<number> => {
  return 420; // in seconds
};

const fetchMixpanelTopFeatures = async (): Promise<Array<{name: string, usage: number}>> => {
  return [
    { name: 'Game Search', usage: 450 },
    { name: 'Borrow Request', usage: 320 },
    { name: 'Game Night Creation', usage: 280 }
  ];
};

const fetchMixpanelPopularGames = async (): Promise<Array<{name: string, views: number}>> => {
  return [
    { name: 'Catan', views: 250 },
    { name: 'Ticket to Ride', views: 200 },
    { name: 'Pandemic', views: 180 }
  ];
};

const fetchMixpanelRetentionRate = async (): Promise<number> => {
  return 65; // percentage
};

const fetchMixpanelConversionRate = async (): Promise<number> => {
  return 12; // percentage
};

const fetchUserActivityData = async (): Promise<{labels: string[], data: number[]}> => {
  return {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    data: [120, 150, 180, 140, 160, 190, 150]
  };
};

// Helper function to format duration
export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};
