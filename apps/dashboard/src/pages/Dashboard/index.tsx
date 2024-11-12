import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../../lib/api';

interface Stats {
  totalSessions: number;
  averageDuration: number;
  activeUsers: number;
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<Stats>(['stats'], async () => {
    const response = await apiRequest('/stats');
    return response.json();
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Sessions</h3>
          <p className="text-3xl font-bold">{stats?.totalSessions}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Average Duration</h3>
          <p className="text-3xl font-bold">{stats?.averageDuration}s</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Active Users</h3>
          <p className="text-3xl font-bold">{stats?.activeUsers}</p>
        </div>
      </div>
    </div>
  );
}
