import React from 'react';


export function SessionPlayer() {
  const [currentTime, setCurrentTime] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 relative">
        <iframe
          ref={iframeRef}
          className="w-full h-full"
          src={""}
          sandbox="allow-same-origin"
        />
      </div>
      <div className="h-20 border-t p-4">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <input
          type="range"
          min={0}
          max={0}
          value={currentTime}
          onChange={e => setCurrentTime(Number(e.target.value))}
          className="ml-4 w-96"
        />
      </div>
    </div>
  );
}
