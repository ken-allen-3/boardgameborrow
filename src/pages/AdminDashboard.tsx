import React, { useEffect, useState } from 'react';
import { getAllUsers, getAllGames, getActiveBorrows, getUpcomingGameNights } from '../services/adminService';
import { UserProfile } from '../types/user';
import UserManagement from '../components/admin/UserManagement';
import { seedDataService } from '../services/seedDataService';

interface DashboardMetrics {
  totalUsers: number;
  totalGames: number;
  activeBorrows: number;
  upcomingGameNights: number;
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
    recentUsers: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const [users, games, borrows, gameNights] = await Promise.all([
          getAllUsers(),
          getAllGames(),
          getActiveBorrows(),
          getUpcomingGameNights()
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
          recentUsers
        });
      } catch (error) {
        console.error('Error fetching dashboard metrics:', error);
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

      {/* User Management Section */}
      <div className="mt-8">
        <UserManagement />
      </div>
    </div>
  );
};

export default AdminDashboard;
