import { serializedNodeWithId } from 'rrweb-snapshot';
import { createCache, createMirror, rebuild } from 'rrweb-snapshot';
import type { eventWithTime } from '@rrweb/types';

export async function rebuildDOMFromSnapshot(events: eventWithTime[]): Promise<HTMLElement | null> {
  try {
    const firstSnapshot = events.find(event => event.type === 2);
    
    if (!firstSnapshot?.data.node) {
      console.error('No snapshot found in events');
      return null;
    }

    // Create a temporary container
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    document.body.appendChild(container);

    // Rebuild the DOM from the snapshot
    const mirror = rebuild(firstSnapshot.data.node as serializedNodeWithId, {
      doc: document,
      mirror: createMirror(),
      hackCss: true,
      cache: createCache(),
    });

    if (mirror) {
      container.appendChild(mirror);
      return container;
    }

    return null;
  } catch (error) {
    console.error('Error rebuilding DOM:', error);
    return null;
  }
}

export function cleanupRebuiltDOM(container: HTMLElement | null) {
  if (container && container.parentNode) {
    container.parentNode.removeChild(container);
  }
} 