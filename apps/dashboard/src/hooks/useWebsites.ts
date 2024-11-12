import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../lib/api';
import { Website } from '../../../api/src/models/website.model';

export function useWebsites() {
  return useQuery<Website[]>(['websites'], async () => {
    const response = await apiRequest('/websites');
    return response.json();
  });
}