import React from 'react';
import { useQuery } from '@tanstack/react-query';
export function SessionPlayer({ sessionId }) {
    const [currentTime, setCurrentTime] = React.useState(0);
    const [isPlaying, setIsPlaying] = React.useState(false);
    const iframeRef = React.useRef(null);
    const { data: session } = useQuery(['session', sessionId], async () => {
        const response = await fetch(`/api/sessions/${sessionId}`);
        return response.json();
    });
    React.useEffect(() => {
        if (!isPlaying || !session)
            return;
        const interval = setInterval(() => {
            const events = session.events.filter((event) => event.timestamp <= session.startedAt + currentTime);
            if (iframeRef.current?.contentWindow) {
                iframeRef.current.contentWindow.postMessage({ events }, '*');
            }
            setCurrentTime(time => time + 100);
        }, 100);
        return () => clearInterval(interval);
    }, [isPlaying, session, currentTime]);
    return (<div className="h-full flex flex-col">
      <div className="flex-1 relative">
        <iframe ref={iframeRef} className="w-full h-full" src={session?.url} sandbox="allow-same-origin"/>
      </div>
      <div className="h-20 border-t p-4">
        <button onClick={() => setIsPlaying(!isPlaying)} className="px-4 py-2 bg-blue-500 text-white rounded">
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <input type="range" min={0} max={session?.duration || 0} value={currentTime} onChange={e => setCurrentTime(Number(e.target.value))} className="ml-4 w-96"/>
      </div>
    </div>);
}
