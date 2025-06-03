import "@fortawesome/fontawesome-free/css/all.min.css";     // icons
import { Experience, Link, MonthYear, DateRange, CVSection, Summary } from "job-tool-shared-types";
import TextEditDiv from "../../../components/texteditdiv";
import ItemBucket from "../../../components/dnd/Bucket";
import { format, parse } from "date-fns"
import { BucketItemComponent, getBucketType, Item } from "../../../components/dnd/types";
import { StyleManager } from "./styles";
import { capitlize } from "../../../util/text";
import { JSX, useMemo } from "react";

/* ------------------------------------------------------------
					CV-ITEM-COMPONENTS
------------------------------------------------------------ */

const SectionUI: BucketItemComponent<CVSection> = ({ obj, onUpdate }) => {

	// Infer the Bucket Type from the object
	const bt = useMemo(
		() => getBucketType(obj.bucket_type),
		[obj.bucket_type]
	);

	// Create the items from the data
	const items: Item<unknown>[] = useMemo(() =>
		obj.items?.map((item: unknown, i: number)=>({
			id:    `${obj.name}-${i}`,
			value: item
		})),
		[obj.items]
	);

	// Determine the components from the data & type
	const itemComponents: JSX.Element[] = useMemo(() =>
		obj.items?.map((item: unknown, i: number) =>
			bt.DisplayItem({
				obj: item,
				onUpdate: (newObj: any) => onItemUpdate(i, newObj),
				key: `${i}-${i}`
			})
		),
		[bt, obj.items]
	);

	const Styles = StyleManager.getAll();

	const onItemUpdate = (newVal: any, i: number) => {
		const new_items = [...obj.items];
		new_items[i] = newVal;
		onUpdate?.({ ...obj, items: new_items })
	}

	const onBucketUpdate = (newVals: any[]) => {
		onUpdate?.({ ...obj, items: newVals })
	}


	if(!obj || !items || !itemComponents) return null;

	const sectionStyle = {
		rowGap: Styles.sec_row_gap,
		fontSize: Styles.p_font,
		lineHeight: Styles.text_line_height
	}

	const hrStyle = {
		height: Styles.sec_head_line_height,
		borderBottomWidth: Styles.hr_line_width
	}

	return (
		<div title="section" className="flex flex-col" style={sectionStyle}>
			<div title="sec-head" className="grid grid-cols-[min-content_1fr] gap-[1cqw] font-bold">
				<p>{obj.name.toUpperCase()}</p>
				<hr className="border-0 border-b border-black self-center" style={hrStyle}/>
			</div>
			<div
				title={`sec-${obj.name}-content`}
				style={{gap: Styles.sec_head_line_gap}}
			>
				<ItemBucket
					id={obj.name}
					items={items}
					type={obj.bucket_type}
					onUpdate={onBucketUpdate}
					onItemUpdate={onItemUpdate}
				/>
			</div>
		</div>
	)
}

const SummaryUI: BucketItemComponent<Summary> = ({ obj, onUpdate }) => {

	const handleUpdate = (key: string, newVal: any) => {
		onUpdate?.({ ...obj, [key]: newVal });
	};

	return (
		<div
			title="summary"
			className="flex flex-col gap-[.5cqh]"
		>
			<TextEditDiv tv={obj.summary} onUpdate={val => handleUpdate("summary", val)}/>
			{['languages', 'technologies'].map(subSec =>
				<div
					title="sub-section"
					key={subSec}
					className="flex gap-[.5cqw]"
				>
					<span className="font-bold">{capitlize(subSec)}:</span>
					<DelimitedList
						items={obj[subSec]}
						delimiter=", "
						onUpdate={val => handleUpdate(subSec, val)}
					/>
				</div>
			)}
		</div>
	)
}

const ExperienceUI: BucketItemComponent<Experience, {
	type: 'experience' | 'project'
	disableBucketFeatures?: boolean
}> = (props) => {

	const Styles = StyleManager.getAll();

	const handleUpdate = (field: keyof Experience, val: any) => {
		props.onUpdate?.({
			...props.obj,
			[field]: val
		});
	};

	const handleItemChange = (newVal: any, i: number) => {
		const new_description = [...props.obj.description];
		new_description[i] = newVal;
		handleUpdate('description', new_description);
	};

	const onBucketUpdate = (newVals: any[]) => {
		handleUpdate('description', newVals);
	};

	const data = props.obj;

	if (!data) return <div>No data!</div>

	const UI_elements = {
		title:  (
			<TextEditDiv className="font-bold" tv={data.title} onUpdate={val => handleUpdate('title', val)} />
		),
		role:  (
			<TextEditDiv className="italic" tv={data.role} onUpdate={val => handleUpdate('role', val)} />
		),
		item_list: (
			data.item_list.length < 2 ? null :
			<DelimitedList className="item-list" items={data.item_list} delimiter=", " onUpdate={val => handleUpdate('item_list', val)} />
		),
		date: (
			<DateUI obj={data.date} onUpdate={val => handleUpdate('date', val)} />
		),
		location: (
			<TextEditDiv className="italic" tv={data.location} onUpdate={val => handleUpdate('location', val)}/>
		),
		link: (
			<LinkUI {...data.link}/>
		),
		bulletPoints: data.description.map((item: string, i: number)=>(
			<li key={i} className="list-disc">
				<TextEditDiv
					tv={item}
					onUpdate={newVal=> handleItemChange(newVal, i)}
				/>
			</li>
		))
	};

	// -------------------------------------------------------
	// HOW WE DISPLAY DEPENDS ON PROPS.TYPE
	// -------------------------------------------------------

	const head_rows = [
		(
			props.type === "project" ?
				[ <Divided>{UI_elements.title}{UI_elements.item_list}</Divided>, UI_elements.link ] :
				[ UI_elements.title, UI_elements.date ]
		),
		(
			props.type === "project" ? null :
				[ <Divided>{UI_elements.role}{UI_elements.item_list}</Divided>, UI_elements.location ]
		)
	]

	const headRow = "flex justify-between";

	const bucketItems = data?.description?.map((item: string, i: number)=>({
		id: `${data.title}-bp${i}`,
		value: item
	}));

	return (
		<div
			title="experience"
			className="flex flex-col gap-[0.5cqh]"
			style={{rowGap: StyleManager.get("exp_row_gap")}}
		>
			{/* HEADER ROWS */}
			{head_rows.map((row, i) =>
				<div
					// title="header-row"
					key={`head-row-${i}`}
					className={headRow}
				>
					{row}
				</div>
			)}
			{/* BULLET POINTS */}
			<div className="exp-content" style={{paddingLeft: Styles.exp_indent}}>
				<ul>
					{props.disableBucketFeatures ? UI_elements.bulletPoints : (
						<ItemBucket
							id="experience"
							items={bucketItems}
							type="exp_points"
							onUpdate={onBucketUpdate}
							onItemUpdate={handleItemChange}
							replaceDisabled deleteOnMoveDisabled
							{...(props.disableBucketFeatures ? { addItemDisabled: true, deleteDisabled: true, dropDisabled: true, moveItemDisabled: true } : {})}
						/>
					)}
				</ul>
			</div>
		</div>
	);
}

/* ------------------------------------------------------------
					REUSABLE-SUB-COMPONENTS
------------------------------------------------------------ */

/** Helper for ExperienceUI */
const Divided = ({children}) => {
	return (
		<div className="flex gap-[1cqw]">
			{children[0]}
			{children[1] && <span className="italic">|</span>}
			{children[1]}
		</div>
	)
};

/** Helper for ExperienceUI */
function DateUI(props: { obj: DateRange, onUpdate?: any }) {

	const DELIM = " - ";
	const PLACEHOLDER = "Present"

	const monthYear2str = (my: MonthYear): string => (
		format(new Date(my.year, my.month - 1), "MMM yyyy") // Format as "Aug. 2024"
	);

	const strFromDateRange = (dr: DateRange) => (
		monthYear2str(dr.start) + DELIM + (dr.end && dr.end.month ? monthYear2str(dr.end) : PLACEHOLDER)
	);

	const dateRangeFromStr = (dr: string) => {
		try {
			const start_end = dr.split(DELIM);
			props.onUpdate({
				start: str2monthYear(start_end[0]),
				...(start_end[1] !== PLACEHOLDER && { end: str2monthYear(start_end[1]) }) // Only include 'end' if it's not null
			});
		} catch(err: any) {
			alert(`Invalid date range format: ${err}`);
		}
	};

	const str2monthYear = (my: string) => {
		const parsedDate = parse(my, "MMM yyyy", new Date());
		return {
			year: parsedDate.getFullYear(),
			month: parsedDate.getMonth() + 1, // JavaScript months are 0-indexed
		};
	};

	return (
		<TextEditDiv
			className="date-range"
			tv={strFromDateRange(props.obj)}
			onUpdate={newVal => dateRangeFromStr(newVal)}
		/>
	)
}

/** Helper for ExpeienceUI */
function LinkUI(props: Link) {
	// const Styles = useStyleStore().getComputedStyles();
	const Styles = StyleManager.getAll();
	return (
		<a
			title="link"
			className="flex items-center"
			style={{gap: Styles.link_col_gap}}
			href={props.url}
		>
			<i className={props.icon} />
			{ props.text && <TextEditDiv tv={props.text} id="link-text" /> }
		</a>
	);
}

/** Generic Helper */
function DelimitedList(props: {
	items: string[],
	delimiter: string,
	className?: any,
	onUpdate?: (newVals: string[]) => void
}) {

	const onUpdate = (newVal: string) => {
		if (props.onUpdate) {
			props.onUpdate(
				newVal.split(props.delimiter)
			);
		}
	};

	return (
		<div title="delimited-list" className={props.className}>
			<TextEditDiv tv={props.items.join(props.delimiter)} onUpdate={onUpdate} />
		</div>
	);
}

export { SectionUI, SummaryUI, ExperienceUI, LinkUI }