import "./cveditor2.sass";
import { CV, Experience, Link, MonthYear, DateRange } from "shared";
import { TextEditDiv } from "../../TextEditDiv/texteditdiv";
import React, { forwardRef, useEffect, useImperativeHandle } from "react";
import { useImmer } from "use-immer";
import { Grid } from "../template1/grid";
import { joinClassNames } from "../../../hooks/joinClassNames";
import ItemBucket from "../../dnd/ItemBucket";
import { BucketTypes } from "../../dnd/types";
import { format, parse } from "date-fns"

const Section = (props: {
    head: string;
    id?: string;
    children: React.ReactNode;
}) => {

	const formatHeader = (head: string) => (
		// head.charAt(0).toUpperCase() + head.slice(1).toLowerCase()
		head.toUpperCase()
	);

	return (
		<div className="section">
			<div className="sec-head">
				<p>{formatHeader(props.head)}</p>
				<hr />
			</div>
			<div id={props.id} className="sec-content">{props.children}</div>
		</div>
	)
};

const ExperienceUI = (props: Experience & { onUpdate?: any }) => {

	const handleUpdate = (field: keyof Experience, value: any) => {
		props.onUpdate({ ...props, [field]: value });
	};

	if (!props.title) {
		// Invalid object
		return null;
	}
	return (
		<div className="experience">
			{/* ROW 1 */}
			<div className="header-info">
				<div>
					<div>
						<TextEditDiv className="title" tv={props.title} onUpdate={val => handleUpdate('title', val)} />
						{ props.link && <LinkUI {...props.link} /> }
					</div>
					<DateUI dateRange={props.date} onUpdate={val => handleUpdate('date', val)} />
				</div>
				<div>
					{ props.role     ? <TextEditDiv className="role" tv={props.role} onUpdate={val => handleUpdate('role', val)} /> 		: null }
					{ props.location ? <TextEditDiv className="location" tv={props.location} onUpdate={val => handleUpdate('location', val)}/> 	: null }
				</div>
			</div>
			{/* ROW 2 */}
			<div className="exp-content">
				<ul
					// If only one item => don't render bullet point:
					style={{ listStyleType: props.description.length === 1 ? 'none' : 'disc' }}
				>
					<ItemBucket
						id={`${props.title}-bucket`}
						values={props.description}
						onUpdate={newPoints => {
							handleUpdate('description', newPoints);
						}}
						isVertical={true}
						replaceDisabled
						displayItemsClass="exp-points"
						deleteOnMoveDisabled
					>
						{ props.description.map((descrItem, i) => (
							<li key={i}>
								<TextEditDiv tv={descrItem} onUpdate={val => {
									const newPoints = [...props.description];
									newPoints[i] = val;
									handleUpdate('description', newPoints);
								}} />
							</li>
						)) }
					</ItemBucket>
				</ul>
			</div>
			{/* ROW 3 */}
			<DelimitedList className="item-list" items={props.item_list} delimiter=" / " onUpdate={val => handleUpdate('item_list', val)} />
		</div>
	);
};

const DateUI = (props: {
	dateRange: DateRange,
	onUpdate?: any
}) => {

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
			tv={strFromDateRange(props.dateRange)}
			onUpdate={newVal => dateRangeFromStr(newVal)}
		/>
	)
}

const LinkUI = (props: Link) => {
	return (
		<div className="link">
			<a className="link" href={props.url}>
				<i className={props.icon} />
				{ props.text && <TextEditDiv tv={props.text} id="link-text" /> }
			</a>
		</div>
	);
};

const DelimitedList = (props: {
	items: string[],
	delimiter: string,
	className?: any,
	onUpdate?: (newVals: string[]) => void
}) => {

	const onUpdate = (newVal: string) => {
		if (props.onUpdate) {
			props.onUpdate(
				newVal.split(props.delimiter)
			);
		}
	};

	const classNames = joinClassNames("delimited-list", props.className);

	return (
		<div className={classNames}>
			<TextEditDiv tv={props.items.join(props.delimiter)} onUpdate={onUpdate} />
		</div>
	);
}

// MAIN COMPONENT
const CVEditor = forwardRef((
	props: { cv: CV },
	ref: React.ForwardedRef<any>
) => {

	// -------------- STATE --------------

	const [CV, setCV] = useImmer<CV>(null);
	const [sectionOrder, setSectionOrder] = useImmer<string[]>(null);

	// initialize the CV
	useEffect(() => {
		setCV(props.cv);
	}, [props.cv]);

	// initialize the section order
	useEffect(()=>{
		if(!CV) return;
		setSectionOrder(Object.keys(CV.sections))
		console.log("section order = ", sectionOrder)
	}, [CV])

	// give parent access to CV
	useImperativeHandle(ref, () => ({
		getCV: () => CV
	}));

	// -------------- SETUP RENDER --------------

	if (!CV || !sectionOrder) {
		return null;
	}

	const bt = BucketTypes["experiences"];
	const sections_ui = sectionOrder.map(sec_head => (
		<Section head={sec_head.toUpperCase()} id={`sec-${sec_head}`}>
			{
				(sec_head !== "summary") ? (
					<ItemBucket
						id={sec_head}
						values={CV.sections[sec_head] as any[]}
						item_type={bt.item_type}
						isVertical={bt.isVertical}
						displayItemsClass={bt.displayItemsClass}
						onUpdate={(newItems) => {
							setCV(draft => {
								draft.sections[sec_head] = newItems
							})
						}}
					>
						{CV.sections[sec_head]?.map((exp, i) => (
							<ExperienceUI key={i} {...exp} onUpdate={(newExp: Experience) => {
								setCV(draft => {
									draft.sections[sec_head][i] = newExp
								})
							}} />
						))}
					</ItemBucket>
				) : (<>
					<TextEditDiv tv={CV.sections[sec_head].summary} id="summary" onUpdate={val => {
						setCV(draft => {
							draft.sections[sec_head].summary = val
						})
					}}/>
					<div className="sub-sec">
						<div className="sub-sec-head">Languages:</div>
						<DelimitedList items={CV.sections[sec_head].languages} delimiter=", " onUpdate={vals=> {
							setCV(draft => {
								draft.sections[sec_head].languages = vals
							})
						}}/>
					</div>
					<div className="sub-sec">
						<div className="sub-sec-head">Technology:</div>
						<DelimitedList items={CV.sections[sec_head].technologies} delimiter=", " onUpdate={vals=> {
							setCV(draft => {
								draft.sections[sec_head].technologies = vals
							})
						}}/>
					</div>
				</>)
			}
		</Section>
	))

	// -------------- RENDER --------------

	return (
		<div id="cv-editor">
			<div id="full-name" key="name">{CV.name}</div>
			<div id="link-list">
				{CV.links.map((l,i) => <LinkUI key={i} {...l} /> )}
			</div>
			<ItemBucket
				id="sections-bucket"
				values={sectionOrder} // only worry about tracking the string names (assumes all unique)
				isVertical={true}
				item_type="section"
				displayItemsClass="section"
				onUpdate={newSecOrder => {
					setSectionOrder([...newSecOrder])
				}}
			>{sections_ui}</ItemBucket>
		</div>
	);
});


export { CVEditor, ExperienceUI }
