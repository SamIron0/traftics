export type EventType = 
  | 'mousemove' 
  | 'click' 
  | 'scroll' 
  | 'input' 
  | 'pageview'
  | 'metadata'
  | 'dom_snapshot'
  | 'dom_mutation'
  | 'style_mutation';

export interface BaseEvent {
  type: EventType;
  timestamp: number;
}

export interface MouseEvent extends BaseEvent {
  type: 'mousemove' | 'click';
  x: number;
  y: number;
}

export interface ScrollEvent extends BaseEvent {
  type: 'scroll';
  x: number;
  y: number;
}

export interface InputEvent extends BaseEvent {
  type: 'input';
  elementId?: string;
  value: string;
}

export interface PageViewEvent extends BaseEvent {
  type: 'pageview';
  url: string;
  title: string;
}

export interface MetadataEvent extends BaseEvent {
  type: 'metadata';
  userAgent: string;
  screenResolution: {
    width: number;
    height: number;
  };
  viewport: {
    width: number;
    height: number;
  };
}

export interface DOMSnapshotEvent extends BaseEvent {
  type: 'dom_snapshot';
  html: string;
  styles: {
    href: string;
    content: string;
  }[];
}

export interface DOMutationEvent extends BaseEvent {
  type: 'dom_mutation';
  mutations: {
    type: 'childList' | 'attributes' | 'characterData';
    target: string; // serialized node path
    addedNodes?: string[];
    removedNodes?: string[];
    attributeName?: string;
    attributeValue?: string;
    textContent?: string;
  }[];
}

export interface StyleMutationEvent extends BaseEvent {
  type: 'style_mutation';
  stylesheet: string;
  href: string;
}

export type RecordedEvent = 
  | MouseEvent 
  | ScrollEvent 
  | InputEvent 
  | PageViewEvent
  | MetadataEvent
  | DOMSnapshotEvent
  | DOMutationEvent
  | StyleMutationEvent;
