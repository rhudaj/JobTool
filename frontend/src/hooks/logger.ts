/**
 * Logger hook
 * Provides the component with a function that logs the given message with the name of the component before the message.
 * So they construct it with the name of the component, and then they can call it with just the message.
 */
function useLogger(componentName: string) {
    return (message: string, ...args: any[]) => {
        console.log(componentName + ":\n\t", message, ...args);
    };
}

export { useLogger };