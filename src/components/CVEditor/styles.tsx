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

export class StyleManager {
	static BASE_SIZE = 0.26;
	static styles = {
		page_padding_sides: 25,
		page_padding_top: 20,
		bullet_point_gap: 3,
		experiences_gap: 5,
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

	static getVal(key: StyleKeys): number {
		return StyleManager.styles[key] * this.BASE_SIZE;
	}

	// Getter: Returns the computed style as a string
	static get(key: StyleKeys): string {
		return get_style(StyleManager.styles[key]);
	}

	// Setter: Updates the value
	static set(key: StyleKeys, value: number): void {
		StyleManager.styles[key] = value;
	}

	// Get all computed styles
	static getAll(): Record<StyleKeys, string> {
		return Object.fromEntries(
			Object.entries(StyleManager.styles).map(([key, val]) => [key, get_style(val as number)])
		) as Record<StyleKeys, string>;
	}
}

// Define dynamic getters & setters manually (No static block)
Object.keys(StyleManager.styles).forEach((key) => {
	Object.defineProperty(StyleManager, key, {
		get: () => StyleManager.get(key as StyleKeys),
		set: (value: number) => StyleManager.set(key as StyleKeys, value),
		enumerable: true,
	});
});
