import { useEffect, useRef } from "react";
import rrwebPlayer from "rrweb-player";
import "rrweb-player/dist/style.css";
import { Session } from "types/api";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface SessionPlayerProps {
  session: Session;
}

export function SessionPlayer({ session }: SessionPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<rrwebPlayer | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!containerRef.current || !session.events.length) return;
    console.log('useEffect', session.events.length);

    // Initialize new player
    playerRef.current = new rrwebPlayer({
      target: containerRef.current,
      props: {
        events: session.events,
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
        autoPlay: true,
        speedOption: [1, 2, 4, 8],
        showController: true,
        tags: {
          privacy: '.privacy',
          maskText: '.mask-text',
        }
      },
    });

    // Cleanup on unmount or when session changes
    return () => {
      if (playerRef.current) {
        // Remove the player's DOM elements
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }
        // Clear the reference
        playerRef.current = null;
      }
    };
  }, [session]);

  const handleBack = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('mode');
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="w-full h-full">
      <div className="p-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleBack}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sessions
        </Button>
      </div>
      <div ref={containerRef} className="w-full aspect-video" />
    </div>
  );
}
