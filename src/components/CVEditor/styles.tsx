import { create } from 'zustand';

// NOTE: all units are in cqw (custom quarter width)
const BASE_SIZE = 0.26;

type StyleKeys =
	| "page_padding_sides"
	| "page_padding_top"
	| "experiences_gap"
	| "bullet_point_gap"
	| "hr_line_width"
	| "exp_indent"
	| "link_col_gap"
	| "text_line_height"
	| "sec_row_gap"
	| "sec_head_line_gap"
	| "sec_head_line_height"
	| "p_font"
	| "name_font"
	| "exp_row_gap";

// Callback to notify when styles change
let onStyleChange: (() => void) | null = null;

export const setStyleChangeCallback = (callback: () => void) => {
	onStyleChange = callback;
};

// TODO: should all units be 'cqw'? Shouldnt some be 'cqh' (e.g. sec_row_gap)
const get_style = (val: number) => `${val * BASE_SIZE}cqw`;

/*
Note: in tailwind

	CAN DO this:

	className={`flex gap-[${getSomeNumber()}cqh]`}

		- the dynamic value is a number

	NOT this:

	className={`flex gap-[${getSomeString()}]`}

		- the dynamic values is a "<number><unit>"
*/

const defaultStyles = {
	page_padding_sides: 25,
	page_padding_top: 20,
	bullet_point_gap: 2.5,
	experiences_gap: 4,
	exp_row_gap: 2,
	hr_line_width: .5,
	exp_indent: 13,
	link_col_gap: 3,
	text_line_height: 7,
	sec_row_gap: 6,
	sec_head_line_gap: 3,
	sec_head_line_height: .5,
	p_font: 6,
	name_font: 12,
};

interface StyleStore {
	styles: typeof defaultStyles;
	setStyle: (key: StyleKeys, value: number) => void;
	getStyle: (key: StyleKeys) => string;
	getVal: (key: StyleKeys) => number;
	getAllStyles: () => Record<StyleKeys, string>;
}

const useStyleStore = create<StyleStore>((set, get) => ({
	styles: defaultStyles,
	setStyle: (key, value) => {
		set(state => ({ styles: { ...state.styles, [key]: value } }));
		// Trigger callback to update BucketTypes
		if (onStyleChange) {
			onStyleChange();
		}
	},
	getStyle: (key) => get_style(get().styles[key]),
	getVal: (key) => get().styles[key] * BASE_SIZE,
	getAllStyles: () => {
		const styles = get().styles;
		return Object.fromEntries(
			Object.entries(styles).map(([key, val]) => [key, get_style(val)])
		) as Record<StyleKeys, string>;
	}
}));

// Export the hook for components
export const useStyles = useStyleStore;

// Create a static StyleManager that reads from the store
export const StyleManager = {
	get BASE_SIZE() { return BASE_SIZE; },
	get styles() { return useStyleStore.getState().styles; },

	getVal(key: StyleKeys): number {
		return useStyleStore.getState().getVal(key);
	},

	get(key: StyleKeys): string {
		return useStyleStore.getState().getStyle(key);
	},

	set(key: StyleKeys, value: number): void {
		useStyleStore.getState().setStyle(key, value);
	},

	getAll(): Record<StyleKeys, string> {
		return useStyleStore.getState().getAllStyles();
	}
};
