export class EventBus {
    constructor() {
        this.listeners = new Map();
    }

    on(event, callback, context = null) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push({ callback, context });
        return this; // Allow chaining
    }

    once(event, callback, context = null) {
        const wrapper = (...args) => {
            callback.apply(context, args);
            this.off(event, wrapper);
        };
        this.on(event, wrapper, context);
        return this;
    }

    off(event, callback) {
        const handlers = this.listeners.get(event);
        if (handlers) {
            this.listeners.set(event, handlers.filter(h => h.callback !== callback));
        }
        return this;
    }

    emit(event, payload = {}) {
        const handlers = this.listeners.get(event);
        if (handlers) {
            handlers.forEach(({ callback, context }) => {
                try {
                    callback.call(context, payload);
                } catch (error) {
                    console.error(`EventBus error on '${event}':`, error);
                }
            });
        }
        return this;
    }

    removeAllListeners(event = null) {
        if (event) {
            this.listeners.delete(event);
        } else {
            this.listeners.clear();
        }
    }
}

// Global singleton instance
export const gameEvents = new EventBus();
