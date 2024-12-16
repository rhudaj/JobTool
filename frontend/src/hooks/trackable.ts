
/**
 * TODO:
 * Since every TrackVal is placed inside of a TextEditDiv,
 * the 2 things should be coupled together. */
class TrackVal<T> extends String {
    private _value: T;
    private listeners: Set<(newValue: T) => void> = new Set();

    constructor(initialValue: T) {
        super();
        this._value = initialValue;
    }

    // Getter for the current value
    get value(): T {
        return this._value;
    }

    // Setter to update the value and notify listeners
    set value(newValue: T) {
      if (newValue !== this._value) {
        this._value = newValue;
        this.listeners.forEach((callback) => callback(newValue));
      }
    }
};

/**
 * TODO: values should not need to be turned into a TrackVal if they don't change
 * i.e. they aren't exposed as text that the user can edit (such as a link icons or urls).
 * The object should define what values are NOT trackable
 * (e.g. each value should be turned into {track: boolean, value: string})
 */
const wrapTrackable = (obj: any): any => {

    // 3 CASES
    if (Array.isArray(obj)) {
        // 1: ARRAY (RECURSIVE)
        return obj.map(wrapTrackable);
    } else if (typeof obj === "object" && obj !== null) {
        // 2: OBJECT (RECURSIVE)
        return Object.fromEntries(
            Object.entries(obj).map(([key, value]) => [
                key,
                wrapTrackable(value),
            ])
        );
    } else {
        // 3: PRIMITIVE (BASE CASE)
        return new TrackVal(obj);
    }
};

const unwrapTrackable = (obj: any): any => {
	// 3 CASES
    if (obj instanceof TrackVal) {
		// 1: TRACKVAL (BASE CASE)
        return obj.value;
    } else if (Array.isArray(obj)) {
		// 2: ARRAY (RECURSIVE)
		return obj.map(unwrapTrackable);
	} else if (typeof obj === "object" && obj !== null) {
		// 3: OBJECT (RECURSIVE)
        return Object.fromEntries(
            Object.entries(obj).map(([key, value]) => [
                key,
                unwrapTrackable(value),
            ])
        );
    } else {
        return obj;
    }
};

/*
    const TEST = (obj: any) => {
        // If working correctly,
        const wrap = wrapTrackable(obj);
        const unwrap = unwrapTrackable(wrap);
        const failed = JSON.stringify(obj) !== JSON.stringify(unwrap);
        console.log(`TEST ${failed ? "FAILED" : "PASSED"}`);
    }
*/


export { TrackVal, wrapTrackable, unwrapTrackable };