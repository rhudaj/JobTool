import "./cveditor2.sass";
import { CV, Experience, Link, MonthYear, DateRange } from "shared";
import { TextEditDiv } from "../../TextEditDiv/texteditdiv";
import React, { forwardRef, useEffect, useImperativeHandle } from "react";
import { useImmer } from "use-immer";
import { Grid } from "../grid";
import { joinClassNames } from "../../../hooks/joinClassNames";
import ItemBucket from "../../dnd/ItemBucket";
import { BucketTypes } from "../../dnd/types";
import { format } from "date-fns"

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
					{props.role && <TextEditDiv className="role" tv={props.role} onUpdate={val => handleUpdate('role', val)} />}
					{props.location && <div className="location">{props.location}</div>}
				</div>
			</div>
			{/* ROW 2 */}
			<div className="exp-content">
				<ul
					className="exp-points"
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

	const monthYear2str = (my: MonthYear): string => (
		format(new Date(my.year, my.month - 1), "MMM yyyy") // Format as "Aug. 2024"
	);

	const strFromDateRange = (dr: DateRange) => (
		monthYear2str(dr.start) + DELIM + (dr.end && dr.end.month ? monthYear2str(dr.end) : "Present")
	);

	return (
		<div className="date-range">
			{strFromDateRange(props.dateRange)}
		</div>
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

	useEffect(() => {
		setCV(props.cv);
	}, [props.cv]);

	useImperativeHandle(ref, () => ({
		getCV: () => CV
	}));

	// -------------- RENDER --------------

	if (!CV) {
		return null;
	}

	const bt = BucketTypes["experiences"];
	const experience_sections = [];
	for (const category in CV.experiences) {
		experience_sections.push(
			<Section head={category.toUpperCase()}>
				<ItemBucket
					id={category}
					values={CV.experiences[category]}
					item_type={bt.item_type}
					isVertical={bt.isVertical}
					displayItemsClass={bt.displayItemsClass}
					onUpdate={(newItems) => {
						setCV(draft => {
							draft.experiences[category] = newItems
						})
					}}
				>
					{CV.experiences[category].map((exp, i) => (
						<ExperienceUI key={i} {...exp} onUpdate={(newExp: Experience) => {
							setCV(draft => {
								draft.experiences[category][i] = newExp
							})
						}} />
					))}
				</ItemBucket>
			</Section>
		);
	}

	// TODO: add name to CV object
	const rows_cols = [
		(
			<div id="full-name" key="name">Roman Hudaj</div>
		),
		(
			<div id="links">
				{CV.links.map((l,i) => <LinkUI key={i} {...l} /> )}
			</div>
		),
		(
			<Section id="sec-summary" head="summary">
				<TextEditDiv tv={CV.summary} id="summary" onUpdate={val => {
					setCV(draft => {
						draft.summary = val
					})
				}}/>
				<div className="sub-sec">
					<div className="sub-sec-head">Languages:</div>
					<DelimitedList items={CV.languages} delimiter=", " onUpdate={vals=> {
						setCV(draft => {
							draft.languages = vals
						})
					}}/>
				</div>
				<div className="sub-sec">
					<div className="sub-sec-head">Technology:</div>
					<DelimitedList items={CV.technologies} delimiter=", " onUpdate={vals=> {
						setCV(draft => {
							draft.technologies = vals
						})
					}}/>
				</div>
			</Section>
		),
		// LAST 3 ROWS ARE EXPERIENCES (each held in ItemBucket)
		...experience_sections
	];

	return <Grid id="cv-editor" rows_cols={rows_cols} rowGapPct="1" colGapPct="2"/>;
});


export { CVEditor, ExperienceUI }
