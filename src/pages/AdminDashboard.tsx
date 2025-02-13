import React, { useEffect, useState } from 'react';
import { getAllUsers, getAllGames, getActiveBorrows, getUpcomingGameNights } from '../services/adminService';
import { getCacheMetrics, initializeCache } from '../services/cacheMetricsService';
import { getFirebaseStatus } from '../config/firebase';
import { UserProfile } from '../types/user';
import { CacheMetrics } from '../types/cache';
import UserManagement from '../components/admin/UserManagement';
import AnalyticsDashboard from '../components/admin/AnalyticsDashboard';
import { seedDataService } from '../services/seedDataService';

interface DashboardMetrics {
  totalUsers: number;
  totalGames: number;
  activeBorrows: number;
  upcomingGameNights: number;
  cacheMetrics: CacheMetrics;
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    joinDate: string;
  }>;
}

const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalUsers: 0,
    totalGames: 0,
    activeBorrows: 0,
    upcomingGameNights: 0,
    cacheMetrics: {
      totalCachedGames: 0,
      cacheHitRate: 0,
      memoryUsage: 0,
      lastRefreshDate: ''
    },
    recentUsers: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setError(null);
        const { isInitialized, error: initError } = getFirebaseStatus();
        if (!isInitialized) {
          throw new Error(`Firebase not initialized: ${initError?.message || 'Unknown error'}`);
        }

        const [users, games, borrows, gameNights, cacheMetrics] = await Promise.all([
          getAllUsers(),
          getAllGames(),
          getActiveBorrows(),
          getUpcomingGameNights(),
          getCacheMetrics()
        ]);

        const recentUsers = users
          .filter((user: UserProfile) => user.id !== undefined)
          .sort((a: UserProfile, b: UserProfile) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 5)
          .map((user: UserProfile) => ({
            id: user.id as string,
            name: `${user.firstName} ${user.lastName}`.trim(),
            email: user.email,
            joinDate: user.createdAt
          }));

        setMetrics({
          totalUsers: users.length,
          totalGames: games.length,
          activeBorrows: borrows.length,
          upcomingGameNights: gameNights.length,
          cacheMetrics,
          recentUsers
        });
      } catch (error) {
        console.error('Error fetching dashboard metrics:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch dashboard metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-lg">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      {/* Overview Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
          <p className="text-3xl font-bold">{metrics.totalUsers}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Total Games</h3>
          <p className="text-3xl font-bold">{metrics.totalGames}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Active Borrows</h3>
          <p className="text-3xl font-bold">{metrics.activeBorrows}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Upcoming Game Nights</h3>
          <p className="text-3xl font-bold">{metrics.upcomingGameNights}</p>
        </div>
      </div>

      {/* Cache Overview Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Cache Overview</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={async () => {
                try {
                  setLoading(true);
                  setError(null);

                  const { isInitialized, error: initError } = getFirebaseStatus();
                  if (!isInitialized) {
                    throw new Error(`Firebase not initialized: ${initError?.message || 'Unknown error'}`);
                  }

                  console.log('Starting cache initialization...');
                  const result = await initializeCache();
                  
                  if (result.success) {
                    console.log('Cache initialized, fetching new metrics...');
                    const newMetrics = await getCacheMetrics();
                    console.log('New metrics fetched:', newMetrics);
                    setMetrics(prev => ({ ...prev, cacheMetrics: newMetrics }));
                  } else {
                    throw new Error(result.message);
                  }
                } catch (error) {
                  console.error('Cache initialization error:', error);
                  setError(error instanceof Error ? error.message : 'Failed to initialize cache');
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className={`px-4 py-2 rounded font-medium ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Initializing...
                </span>
              ) : (
                'Initialize Cache'
              )}
            </button>
          </div>
          <div className="cache-error-container mt-2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <h3 className="text-gray-500 text-sm font-medium">Cached Games</h3>
            <p className="text-3xl font-bold">{metrics.cacheMetrics.totalCachedGames}</p>
          </div>
          
          <div>
            <h3 className="text-gray-500 text-sm font-medium">Cache Hit Rate</h3>
            <p className="text-3xl font-bold">{metrics.cacheMetrics.cacheHitRate.toFixed(1)}%</p>
          </div>
          
          <div>
            <h3 className="text-gray-500 text-sm font-medium">Memory Usage</h3>
            <p className="text-3xl font-bold">{metrics.cacheMetrics.memoryUsage} KB</p>
          </div>
          
          <div>
            <h3 className="text-gray-500 text-sm font-medium">Last Refresh</h3>
            <p className="text-3xl font-bold">{metrics.cacheMetrics.lastRefreshDate}</p>
          </div>
        </div>
      </div>

      {/* Recent Users Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Recent Users</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Name</th>
                <th className="text-left py-2">Email</th>
                <th className="text-left py-2">Join Date</th>
              </tr>
            </thead>
            <tbody>
              {metrics.recentUsers.map(user => (
                <tr key={user.id} className="border-b">
                  <td className="py-2">{user.name || 'No name'}</td>
                  <td className="py-2">{user.email}</td>
                  <td className="py-2">{new Date(user.joinDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Demo Content Management */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Demo Content Settings</h2>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Sample Games Visibility</h3>
            <p className="text-sm text-gray-500">Toggle visibility of sample games across the platform</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={seedDataService.isEnabled()}
              onChange={(e) => seedDataService.setEnabled(e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <div className="mt-8">
        <AnalyticsDashboard />
      </div>

      {/* User Management Section */}
      <div className="mt-8">
        <UserManagement />
      </div>
    </div>
  );
};

export default AdminDashboard;
