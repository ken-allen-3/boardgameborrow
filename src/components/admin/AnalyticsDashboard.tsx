import React, { useEffect, useState } from 'react';
import { fetchAnalyticsData, formatDuration } from '../../services/analyticsDataService';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface AnalyticsMetrics {
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

const AnalyticsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
    dailyActiveUsers: 0,
    monthlyActiveUsers: 0,
    totalPageViews: 0,
    averageSessionDuration: 0,
    topFeatures: [],
    popularGames: [],
    userRetentionRate: 0,
    conversionRate: 0,
    userActivity: {
      labels: [],
      data: []
    }
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        const data = await fetchAnalyticsData();
        setMetrics(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
        setLoading(false);
      }
    };

    loadAnalyticsData();
  }, []);

  const userActivityData = {
    labels: metrics.userActivity?.labels || [],
    datasets: [
      {
        label: 'Daily Active Users',
        data: metrics.userActivity?.data || [],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p className="font-bold">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Analytics Overview</h2>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Daily Active Users</h3>
          <p className="text-2xl font-bold">{metrics.dailyActiveUsers}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Monthly Active Users</h3>
          <p className="text-2xl font-bold">{metrics.monthlyActiveUsers}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">User Retention Rate</h3>
          <p className="text-2xl font-bold">{metrics.userRetentionRate}%</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Conversion Rate</h3>
          <p className="text-2xl font-bold">{metrics.conversionRate}%</p>
        </div>
      </div>

      {/* User Activity Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">User Activity Trend</h3>
        <div className="h-64">
          <Line data={userActivityData} options={{ maintainAspectRatio: false }} />
        </div>
      </div>

      {/* Feature Usage and Popular Games */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Top Features</h3>
          <div className="space-y-4">
            {metrics.topFeatures.map((feature, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-gray-600">{feature.name}</span>
                <span className="font-semibold">{feature.usage} uses</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Popular Games</h3>
          <div className="space-y-4">
            {metrics.popularGames.map((game, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-gray-600">{game.name}</span>
                <span className="font-semibold">{game.views} views</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Session Information */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Session Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-gray-500 text-sm font-medium">Average Session Duration</h4>
            <p className="text-2xl font-bold">
              {formatDuration(metrics.averageSessionDuration)}
            </p>
          </div>
          <div>
            <h4 className="text-gray-500 text-sm font-medium">Total Page Views</h4>
            <p className="text-2xl font-bold">{metrics.totalPageViews}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
