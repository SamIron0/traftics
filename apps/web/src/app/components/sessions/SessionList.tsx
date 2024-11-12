import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Session } from '@session-recorder/types';
import { PageViewEvent } from '@session-recorder/types';
import { RecordedEvent } from '@session-recorder/types';

interface Props {
  sessions: Session[];
  selectedSessionId: string | null;
  onSelectSession: (id: string) => void;
}

export function SessionList({ sessions, selectedSessionId, onSelectSession }: Props) {
  if (!sessions?.length) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No sessions recorded yet
      </div>
    );
  }

  return (
    <div className="divide-y">
      {sessions.map(session => (
        <button
          key={session.id}
          onClick={() => onSelectSession(session.id)}
          className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
            selectedSessionId === session.id ? 'bg-blue-50' : ''
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="font-medium truncate">
              {new URL(session.events[0]?.type === 'pageview' ? (session.events[0] as PageViewEvent).url : '').pathname}
            </div>
            <div className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(session.startedAt), { addSuffix: true })}
            </div>
          </div>
          
          <div className="text-sm text-gray-600 mb-1">
            Duration: {Math.round(session.duration / 1000)}s
          </div>
          
          <div className="flex gap-4 text-sm text-gray-500">
            <div>
              {session.screenResolution.width}x{session.screenResolution.height}
            </div>
            <div className="truncate flex-1">
              {session.userAgent}
            </div>
          </div>
          
          <div className="mt-2 flex gap-2">
            {session.events.reduce((tags: string[], event: RecordedEvent) => {
              if (!tags.includes(event.type)) {
                tags.push(event.type);
              }
              return tags;
            }, [] as string[]).map((type: string) => (
              <span
                key={type}
                className="px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs"
              >
                {type}
              </span>
            ))}
          </div>
        </button>
      ))}
    </div>
  );
}
