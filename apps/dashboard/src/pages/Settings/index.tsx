import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../lib/api';

interface Website {
  id: string;
  name: string;
  domain: string;
}

export default function Settings() {
  const queryClient = useQueryClient();
  const [newWebsite, setNewWebsite] = React.useState({ name: '', domain: '' });

  const { data: websites, isLoading } = useQuery<Website[]>(['websites'], async () => {
    const response = await apiRequest('/websites');
    return response.json();
  });

  const createWebsite = useMutation(
    async (data: typeof newWebsite) => {
      const response = await apiRequest('/websites', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['websites']);
        setNewWebsite({ name: '', domain: '' });
      },
    }
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Settings</h1>
      
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Add Website</h2>
        <form 
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            createWebsite.mutate(newWebsite);
          }}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              value={newWebsite.name}
              onChange={e => setNewWebsite(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Domain</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              value={newWebsite.domain}
              onChange={e => setNewWebsite(prev => ({ ...prev, domain: e.target.value }))}
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            disabled={createWebsite.isLoading}
          >
            {createWebsite.isLoading ? 'Adding...' : 'Add Website'}
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Your Websites</h2>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div className="divide-y">
            {websites?.map(website => (
              <div key={website.id} className="py-4">
                <h3 className="font-medium">{website.name}</h3>
                <p className="text-gray-500">{website.domain}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
