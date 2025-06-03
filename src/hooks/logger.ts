/**
 * Logger hook
 * Provides the component with a function that logs the given message with the name of the component before the message.
 * So they construct it with the name of the component, and then they can call it with just the message.
 */
export function useLogger(componentName: string) {

    const log = (message: string, ...args: any[]) => {
        console.log(componentName + ":\n\t", message, ...args);
    };

    const warn = (message: string, ...args: any[]) => {
        console.warn(componentName + ":\n\t", message, ...args);
    };

    const error = (message: string, ...args: any[]) => {
        console.error(componentName + ":\n\t", message, ...args);
    };

    // can specify return value as: log || || [log] || [log, warn] || [log, warn, error]
    const loggerArray = [log, warn, error];
    return Object.assign(log, { [Symbol.iterator]: () => loggerArray[Symbol.iterator]() }); // `log` is the default export
}