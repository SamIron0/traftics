import { RecordedEvent, Session } from '@session-recorder/types';
import { sanitizeInputValue } from './utils/privacy';
import { getElementId } from './utils/dom';
import { sendEvents } from './transport';
import { throttle } from './utils/throttle';

export class SessionRecorder {
  private events: RecordedEvent[] = [];
  private sessionId: string;
  private readonly siteId: string;
  private readonly collectorUrl: string;
  private startTime: number;
  private uploadInterval: ReturnType<typeof setInterval> | null = null;

  constructor({ siteId, collectorUrl }: { siteId: string; collectorUrl: string }) {
    this.siteId = siteId;
    this.collectorUrl = collectorUrl;
    this.sessionId = crypto.randomUUID();
    this.startTime = Date.now();
    
    // Bind methods
    this.handleMouseMove = throttle(this.handleMouseMove.bind(this), 50);
    this.handleScroll = throttle(this.handleScroll.bind(this), 100);
  }

  start() {
    this.recordPageView();
    this.attachEventListeners();
    this.startEventUpload();
    this.recordInitialState();
  }

  stop() {
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('click', this.handleClick);
    document.removeEventListener('scroll', this.handleScroll);
    document.removeEventListener('input', this.handleInput);
    
    if (this.uploadInterval) {
      clearInterval(this.uploadInterval);
    }
  }

  private recordInitialState() {
    this.addEvent({
      type: 'metadata',
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      screenResolution: {
        width: window.screen.width,
        height: window.screen.height
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    });
  }

  private recordPageView() {
    this.addEvent({
      type: 'pageview',
      url: window.location.href,
      title: document.title,
      timestamp: Date.now()
    });
  }

  private attachEventListeners() {
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('click', this.handleClick.bind(this));
    document.addEventListener('scroll', this.handleScroll.bind(this));
    document.addEventListener('input', this.handleInput.bind(this));
  }

  private addEvent(event: RecordedEvent) {
    this.events.push(event);
  }

  private startEventUpload() {
    setInterval(() => {
      if (this.events.length === 0) return;
      
      const eventsToSend = [...this.events];
      this.events = [];
      
      sendEvents(this.collectorUrl, {
        id: this.sessionId,
        siteId: this.siteId,
        events: eventsToSend
      });
    }, 5000);
  }

  // Event handlers
  private handleMouseMove(e: MouseEvent) {
    this.addEvent({
      type: 'mousemove',
      x: e.clientX,
      y: e.clientY,
      timestamp: Date.now()
    });
  }

  private handleClick(e: MouseEvent) {
    this.addEvent({
      type: 'click',
      x: e.clientX,
      y: e.clientY,
      timestamp: Date.now()
    });
  }

  private handleScroll() {
    this.addEvent({
      type: 'scroll',
      x: window.scrollX,
      y: window.scrollY,
      timestamp: Date.now()
    });
  }

  private handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    this.addEvent({
      type: 'input',
      elementId: getElementId(target),
      value: sanitizeInputValue(target),
      timestamp: Date.now()
    });
  }
}
