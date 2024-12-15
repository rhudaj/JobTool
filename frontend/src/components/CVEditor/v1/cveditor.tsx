import "../cveditor.scss";
import { CV, Experience, Link } from "shared";
import { TextEditDiv } from "../../TextEditDiv/texteditdiv";
import React, { forwardRef, useImperativeHandle } from "react";
import { useImmer } from "use-immer";
import { Grid } from "../grid";
import { joinClassNames } from "../../../hooks/joinClassNames";
import { BucketComponent } from "../../dnd/dnd";
import { BucketTypes } from "../../dnd/types/types";


// CUSTOM SUB COMPONENTS

const ExperienceUI = (
	props: Experience
	& { onUpdate?: (newExp: Experience) => void }
) => {

	const handleUpdate = (field: keyof Experience, value: any) => {
		if (props.onUpdate) {
			props.onUpdate({ ...props, [field]: value });
		}
	};

	// Map each entry in the Experience object to a <TextEditDiv> component:

	let sideTitleEl;
	let content;

	if (typeof props.side_title === "string") {
		sideTitleEl = <TextEditDiv tv={props.side_title} onUpdate={val => handleUpdate('side_title', val)} />
	} else {
		sideTitleEl = <LinkUI {...props.side_title} />
	}

	if (props.points.length === 1) {
		content = <TextEditDiv tv={props.points[0]} onUpdate={(val) => handleUpdate('points', [val])} />
	} else {
		content = (
			<ul className="exp-points">
				{ props.points.map((p, index) => (
					<li key={index}>
						<TextEditDiv tv={p} onUpdate={(val) => {
							const newPoints = [...props.points];
							newPoints[index] = val;
							handleUpdate('points', newPoints);
						}} />
					</li>
				)) }
			</ul>
		)
	}

	return (
		<div className="experience">

			{/* ------------ COLUMN 1 ------------ */}

			<TextEditDiv tv={props.date_range} className="date-range" onUpdate={val => handleUpdate('date_range', val)} />

			{/* ------------ COLUMN 2 ------------ */}

			<div className="exp-col-2">

				{/* ------------ ROWS ------------ */}

				<div className="titles">
					<TextEditDiv tv={props.title} className="title" onUpdate={val => handleUpdate('title', val)} />
					{sideTitleEl}
				</div>

				<div className="exp-content">{content}</div>

				<DelimitedList items={props.tech} delimiter=" / " onUpdate={val => handleUpdate('tech', val)} />

			</div>
		</div>
	);
};

const Section = (props: {
    head: string;
    id?: string;
    children: React.ReactNode;
}) => {
	return (
		<div className="section" id={props.id}>
			<div className="sec-head">
				<p>{props.head}</p>
				<hr />
			</div>
			<div className="sec-content">{props.children}</div>
		</div>
	)
};

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

	// Split up the CV to make it easier to manage
	const [CV, setCV] = useImmer<CV>(props.cv);

	// give the parent 'App' access to localJI
	useImperativeHandle(ref, () => ({
		getCV: () => CV
	}));

	if (!CV) return null;

	const bt = BucketTypes["experiences"];

	// -------------- RENDER --------------

	const rows_cols = [
		[
			(
				<div id="name-title">
					<div id="div-full-name">ROMAN HUDAJ</div>
					<TextEditDiv tv={CV.personalTitle} id="div-personal-title" onUpdate={val => {
						setCV(draft => {
							draft.personalTitle = val
						})
					}}/>
				</div>
			),
			(
				<div id="div-links">
					{CV.links.map(link => (
						<LinkUI {...link} />
					))}
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
		(
			<Section head="EXPERIENCE">
				<BucketComponent
					id="jobs"
					values={CV.experiences["jobs"]}
					item_type={bt.item_type}
					isVertical={bt.isVertical}
					DisplayItem={bt.DisplayItem}
					DisplayItems={bt.DisplayItems}
					onUpdate={(newItems) => {
						setCV(draft => {
							draft.experiences.jobs = newItems
						})
					}}
				/>
			</Section>
		),
		(
			<Section head="PROJECTS">
				<BucketComponent
					id="projects"
					values={CV.experiences["projects"]}
					item_type={bt.item_type}
					isVertical={bt.isVertical}
					DisplayItem={bt.DisplayItem}
					DisplayItems={bt.DisplayItems}
					onUpdate={(newItems) => {
						setCV(draft => {
							draft.experiences.projects = newItems
						})
					}}
				/>
			</Section>
		),
		(
			<Section head="EDUCATION">
				<ExperienceUI {...CV.experiences["education"][0]} onUpdate={newExp => {
					setCV(draft => {
						draft.experiences.education = [ newExp ]
					})
				}} />
			</Section>
		)
	];

	if (props.cv)
		return <Grid id="cv-editor" rows_cols={rows_cols} rowGapPct="1" colGapPct="2"/>;
	else
		return null;
});


export { CVEditor, ExperienceUI }
