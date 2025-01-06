import React from 'react';
import { UserDetails, ActivityLog } from '../../services/adminService';
import { X, Package, Users, Calendar, Clock, Activity, Filter } from 'lucide-react';
import { useState } from 'react';

interface Props {
  details: UserDetails | null;
  onClose: () => void;
}

type LogFilterType = 'all' | ActivityLog['type'];

export default function UserDetailsModal({ details, onClose }: Props) {
  const [logFilter, setLogFilter] = useState<LogFilterType>('all');

  if (!details) return null;

  function getLogTypeColor(type: ActivityLog['type']): string {
    switch (type) {
      case 'game':
        return 'bg-blue-50';
      case 'borrow':
        return 'bg-green-50';
      case 'group':
        return 'bg-purple-50';
      case 'gameNight':
        return 'bg-yellow-50';
      case 'auth':
        return 'bg-red-50';
      case 'profile':
        return 'bg-gray-50';
      default:
        return 'bg-gray-50';
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center space-x-4">
            {details.profile.photoUrl && (
              <img
                src={details.profile.photoUrl}
                alt={`${details.profile.firstName} ${details.profile.lastName}`}
                className="h-12 w-12 rounded-full"
              />
            )}
            <div>
              <h2 className="text-xl font-bold">
                {details.profile.firstName} {details.profile.lastName}
              </h2>
              <p className="text-gray-500">{details.profile.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Games Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <Package className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Games ({details.games.length})</h3>
              </div>
              <div className="space-y-2">
                {details.games.map((game: any) => (
                  <div key={game.id} className="bg-white p-3 rounded shadow-sm">
                    <div className="font-medium">{game.name}</div>
                    <div className="text-sm text-gray-500">Added: {new Date(game.addedAt).toLocaleDateString()}</div>
                  </div>
                ))}
                {details.games.length === 0 && (
                  <p className="text-gray-500">No games in collection</p>
                )}
              </div>
            </div>

            {/* Groups Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Groups ({details.groups.length})</h3>
              </div>
              <div className="space-y-2">
                {details.groups.map((group: any) => (
                  <div key={group.id} className="bg-white p-3 rounded shadow-sm">
                    <div className="font-medium">{group.name}</div>
                    <div className="text-sm text-gray-500">
                      {Object.keys(group.members || {}).length} members
                    </div>
                  </div>
                ))}
                {details.groups.length === 0 && (
                  <p className="text-gray-500">Not a member of any groups</p>
                )}
              </div>
            </div>

            {/* Game Nights Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Game Nights ({details.gameNights.length})</h3>
              </div>
              <div className="space-y-2">
                {details.gameNights.map((night: any) => (
                  <div key={night.id} className="bg-white p-3 rounded shadow-sm">
                    <div className="font-medium">{night.title || 'Game Night'}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(night.date).toLocaleDateString()}
                      {night.host === details.profile.email && ' (Host)'}
                    </div>
                  </div>
                ))}
                {details.gameNights.length === 0 && (
                  <p className="text-gray-500">No game nights attended</p>
                )}
              </div>
            </div>

            {/* Borrows Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">
                  Borrows (Active: {details.borrows.active.length}, History: {details.borrows.history.length})
                </h3>
              </div>
              {details.borrows.active.length > 0 && (
                <>
                  <h4 className="font-medium mb-2">Active Borrows</h4>
                  <div className="space-y-2 mb-4">
                    {details.borrows.active.map((borrow: any) => (
                      <div key={borrow.id} className="bg-white p-3 rounded shadow-sm">
                        <div className="font-medium">{borrow.game.name}</div>
                        <div className="text-sm text-gray-500">
                          Since: {new Date(borrow.startDate).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {details.borrows.history.length > 0 && (
                <>
                  <h4 className="font-medium mb-2">Borrow History</h4>
                  <div className="space-y-2">
                    {details.borrows.history.map((borrow: any) => (
                      <div key={borrow.id} className="bg-white p-3 rounded shadow-sm">
                        <div className="font-medium">{borrow.game.name}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(borrow.startDate).toLocaleDateString()} - {' '}
                          {borrow.endDate ? new Date(borrow.endDate).toLocaleDateString() : 'Present'}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {details.borrows.active.length === 0 && details.borrows.history.length === 0 && (
                <p className="text-gray-500">No borrow history</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Logs Section */}
      <div className="p-6 border-t">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Activity Log ({details.activityLogs.length})</h3>
          </div>
          <select
            onChange={(e) => setLogFilter(e.target.value as 'all' | ActivityLog['type'])}
            className="border rounded-lg px-3 py-1"
          >
            <option value="all">All Activities</option>
            <option value="game">Games</option>
            <option value="borrow">Borrows</option>
            <option value="group">Groups</option>
            <option value="gameNight">Game Nights</option>
            <option value="auth">Authentication</option>
            <option value="profile">Profile</option>
          </select>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {details.activityLogs
            .filter(log => logFilter === 'all' || log.type === logFilter)
            .map((log, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg ${getLogTypeColor(log.type)}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{log.action}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm mt-1">{log.details}</p>
              </div>
            ))}
          {details.activityLogs.length === 0 && (
            <p className="text-gray-500 text-center py-4">No activity logs found</p>
          )}
        </div>
      </div>
    </div>
  );

}
