import "./cveditor2.sass";
import { CV, Experience, Link } from "shared";
import { TextEditDiv } from "../../TextEditDiv/texteditdiv";
import React, { forwardRef, useEffect, useImperativeHandle } from "react";
import { useImmer } from "use-immer";
import { Grid } from "../grid";
import { joinClassNames } from "../../../hooks/joinClassNames";
import ItemBucket from "../../dnd/ItemBucket";
import { BucketTypes } from "../../dnd/types";

const Section = (props: {
    head: string;
    id?: string;
    children: React.ReactNode;
}) => {

	const formatHeader = (head: string) => (
		head.charAt(0).toUpperCase() + head.slice(1).toLowerCase()
	);

	return (
		<div className="section" id={props.id}>
			<div className="sec-head">
				<p>{formatHeader(props.head)}</p>
				<hr />
			</div>
			<div className="sec-content">{props.children}</div>
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
					<DateUI {...props.date} onUpdate={val => handleUpdate('date', val)} />

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
					{ props.description.map((descrItem, i) => (
						<li key={i}>
							<TextEditDiv tv={descrItem} onUpdate={val => {
								const newPoints = [...props.description];
								newPoints[i] = val;
								handleUpdate('description', newPoints);
							}} />
						</li>
					)) }
				</ul>
			</div>
			{/* ROW 3 */}
			<DelimitedList className="item-list" items={props.item_list} delimiter=" / " onUpdate={val => handleUpdate('item_list', val)} />
		</div>
	);
};

const DateUI = (props: {start: string, end: string} & { onUpdate?: any }) => {

	const strFromDate = (date: {start: string, end?: string}) => (
		date.start + "-" + (date.end ?? "Pres ")
	)
	const dateFromStr = (dateStr: string) => {
		const parts = dateStr.split("-")
		const start = parts[0]
		var end = parts[1]
		if (end === "Pres ") {
			end = undefined
		}
		return {start: start, end: end}
	}

	return (
		<TextEditDiv
			className="date-range"
			tv={strFromDate(props)}
			onUpdate={val => props.onUpdate(dateFromStr(val))}
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

	const rows_cols = [
		[
			(
				<div id="name-title">
					<div key={"name"} id="div-full-name">ROMAN HUDAJ</div>
					<TextEditDiv key="pt" id="div-personal-title" tv={CV["personalTitle"]} onUpdate={val => {
						setCV(draft => {
							draft["personalTitle"] = val
						})
					}}/>
				</div>
			),
			(
				<div id="div-links">
					{CV.links.map((link,i) => <LinkUI key={i} {...link} /> )}
				</div>
			),
		],
		[
			(
				<Section head="SUMMARY" id="section-summary">
					<TextEditDiv tv={CV.summary} id="summary" onUpdate={val => {
						setCV(draft => {
							draft.summary = val
						})
					}}/>
				</Section>
			),
			(
				<Section head="SKILLS" id="section-skills">
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
			)
		],
		// LAST 3 ROWS ARE EXPERIENCES (each held in ItemBucket)
		...experience_sections
	];

	return <Grid id="cv-editor" rows_cols={rows_cols} rowGapPct="1" colGapPct="2"/>;
});


export { CVEditor, ExperienceUI }
