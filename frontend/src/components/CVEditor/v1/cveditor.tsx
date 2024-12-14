import "../cveditor.scss";
import { CV, Experience } from "shared";
import { TextEditDiv } from "../../TextEditDiv/texteditdiv";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { TrackVal, wrapTrackable, unwrapTrackable } from "../../../hooks/trackable";
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

	let sideTitleEl = (props.side_title as string).startsWith("http") ?
		<Link url={props.side_title} icon="fa fa-link" /> :
		<TextEditDiv tv={props.side_title} className="side-title" onUpdate={(val) => handleUpdate('side_title', val)} />

	let content = (props.points.length === 1) ?
		<TextEditDiv tv={props.points[0]} onUpdate={(val) => handleUpdate('points', [val])} /> :
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

const Link = (props: {
	url: string,
	icon: string,
	text?: string // only the link-text is editable
}) => {

	return (
		<div className="link">
			<a className="link" href={props.url}>
				<i className={props.icon} />
				{ props.text ? <TextEditDiv tv={props.text} id="link-text" /> : null }
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

	const txt = props.items.join(props.delimiter);

	const onUpdate = (newVal: string) => {
		if (props.onUpdate) {
			const newItems = newVal.split(props.delimiter);
			props.onUpdate(newItems);
		}
	};

	const classNames = joinClassNames("delimited-list", props.className);

	return (
		<div className={classNames}>
			<TextEditDiv tv={txt} onUpdate={onUpdate} />
		</div>
	);
}

// MAIN COMPONENT

const CVEditor = forwardRef((
	props: { cv: CV },
	ref: React.ForwardedRef<any>
) => {

	// Keep track each value in the CV
	const [CV, setCV] = useState<CV>(props.cv);

	useEffect(()=>{
		setCV(props.cv);
	}, [props.cv])

	const updateCV = (newCV: CV) => {
		const copy = structuredClone(newCV);
		setCV(copy);
	};

	// give the parent 'App' access to localJI
	useImperativeHandle(ref, () => ({
		getCV: () => CV
	}));

	const ExperienceBucket = () => {
		const bt = BucketTypes["experiences"];
		return (
			<BucketComponent
				id="experiences"
				values={CV.experiences}
				item_type={bt.item_type}
				isVertical={bt.isVertical}
				DisplayItem={bt.DisplayItem}
				DisplayItems={bt.DisplayItems}
				onUpdate={(newItems) => {
					updateCV({ ...CV, experiences: newItems });
				}}
			/>
		)
	};

	const ProjectBucket = () => {
		const bt = BucketTypes["experiences"];
		return (
			<BucketComponent
				id="projects"
				values={CV.projects}
				item_type={bt.item_type}
				isVertical={bt.isVertical}
				DisplayItem={bt.DisplayItem}
				DisplayItems={bt.DisplayItems}
				onUpdate={(newItems) => {
					updateCV({ ...CV, projects: newItems });
				}}
			/>
		)
	}

	const rows_cols = [
		[
		(
			<div id="name-title">
				<div id="div-full-name">ROMAN HUDAJ</div>
				<TextEditDiv tv={CV.personalTitle} id="div-personal-title"/>
			</div>
		),
		(
			<div id="div-links">
				{CV.links.map((l) => (
					<Link url={l.url} icon={l.icon} text={l.text} />
				))}
			</div>
		),
		],
		[
			(
				<Section head="SUMMARY" id="section-summary">
					<TextEditDiv tv={CV.summary} id="summary" />
				</Section>
			),
			(
				<Section head="SKILLS" id="section-skills">

					<div className="sub-sec">
						<div className="sub-sec-head">Languages:</div>
							<DelimitedList items={CV.languages} delimiter=", " />
					</div>

					<div className="sub-sec">
						<div className="sub-sec-head">Technology:</div>
						<DelimitedList items={CV.technologies} delimiter=", " />
					</div>

				</Section>
			)
		],
		(
			<Section head="EXPERIENCES">
				<ExperienceBucket/>
			</Section>
		),
		(
			<Section head="PROJECTS">
				<ProjectBucket/>
			</Section>
		),
		(
			<Section head="EDUCATION">
				<ExperienceUI {...CV.education} />
			</Section>
		)
	];

	if (props.cv)
		return <Grid id="cv-editor" rows_cols={rows_cols} rowGapPct="1" colGapPct="2"/>;
	else
		return null;
});


export { CVEditor, ExperienceUI }
