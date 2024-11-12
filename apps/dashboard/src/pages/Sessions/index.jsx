import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { SessionList } from '../../components/sessions/SessionList';
import { SessionPlayer } from '../../components/sessions/SessionPlayer';
import { apiRequest } from '../../lib/api';
export default function SessionsPage() {
    const [selectedSessionId, setSelectedSessionId] = React.useState(null);
    const { data: sessions, isLoading } = useQuery(['sessions'], async () => {
        const response = await apiRequest('/sessions');
        return response.json();
    });
    if (isLoading) {
        return <div>Loading...</div>;
    }
    return (<div className="flex h-screen">
      <div className="w-1/3 border-r">
        <SessionList sessions={sessions} onSelectSession={setSelectedSessionId} selectedSessionId={selectedSessionId}/>
      </div>
      <div className="w-2/3">
        {selectedSessionId ? (<SessionPlayer sessionId={selectedSessionId}/>) : (<div className="flex items-center justify-center h-full text-gray-500">
            Select a session to view recording
          </div>)}
      </div>
    </div>);
}
