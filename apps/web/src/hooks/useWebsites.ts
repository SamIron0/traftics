import { useQuery } from '@tanstack/react-query';
import { Website } from '@session-recorder/types';

export function useWebsites() {
  return useQuery<Website[]>(['websites'], async () => {
    const response = await fetch('/api/websites');
    return response.json();
  });
}