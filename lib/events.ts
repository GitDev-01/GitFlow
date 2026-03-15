import { EventEmitter } from 'events';

// In a dev environment, we attach this to 'global' so 
// Next.js HMR doesn't create multiple emitters.
const globalForEvents = global as unknown as { eventBus: EventEmitter };
export const eventBus = globalForEvents.eventBus || new EventEmitter();

if (process.env.NODE_ENV !== 'production') globalForEvents.eventBus = eventBus;