import "./cveditor.scss";
import { CV } from "shared";
import { TextEditDiv } from "../../TextEditDiv/texteditdiv";
import React, { forwardRef, useImperativeHandle } from "react";
import { BucketComponent, DragDropItem } from "../../dnd/dnd";
import { joinClassNames } from "../../../hooks/joinClassNames";
import { Grid } from "./grid";

// CUSTOM SUB COMPONENTS

const ExperienceUI = (props: any) => {

	// TODO: this is hacky, need to improve.
	let sideTitleEl = (props.side_title as string).startsWith("http") ?
		<Link url={props.side_title} icon="fa fa-link" /> :
		<TextEditDiv tv={props.side_title} className="side-title"/>

	let content = (props.points.length === 1) ?
		<TextEditDiv tv={props.points[0]} /> :
		<ul className="exp-points">
			{props.points.map((bullet_point: string) => (
				<li>
					<TextEditDiv tv={bullet_point} />
				</li>
			))}
		</ul>

	const tech = (
		<BucketComponent
			bucket={{ id: "Tech", values: props.tech }}
			isVertical={false}
			DisplayItems={(props) => <DelimitedList delimiter=" / " className="exp-tech" {...props} />}
		/>
	);

    return (
		<div className="experience">

			{/* ------------ COLUMNS ------------ */}

			<TextEditDiv tv={props.date_range} className="date-range" />

			<div className="exp-col-2">

				{/* ------------ ROWs ------------ */}

				<div className="titles">
					<TextEditDiv tv={props.title} className="title" />
					{sideTitleEl}
				</div>

				<div className="exp-content"> {content} </div>

				{tech}

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

// For displaying bucket items
function DelimitedList(props: { children: JSX.Element[], delimiter: string, className?: string }) {
	return (
		<div className={joinClassNames("delimited-list", props.className)}>
			{props.children.map((child, i) => (
				<>
					{child}
					{ i >= props.children.length-1 ? null : <span>{props.delimiter}</span> }
				</>
			))}
		</div>
	);
};


// TODO: this is only a (poor) temporary solution.
function BucketOrText(props: { id: string, values: string[], onUpdate?: (newVals: string[]) => void }) {

	// true => bucket, false => text
	const [mode, setMode] = React.useState(true);

	const DELIM = ", ";

	return (
		<div className="bucket-or-text" onDoubleClick={()=>setMode(false)} onBlur={()=> setMode(true)}>
			{
				mode ?
				<BucketComponent
					bucket = {{ id: props.id, values: props.values }}
					isVertical={false}
					DisplayItem={(props) => <TextEditDiv tv={props.item.value}/>}
					DisplayItems={(props) => <DelimitedList delimiter={DELIM} {...props} />}
				/> :
				<TextEditDiv tv={props.values.join(DELIM)} onUpdate={(val)=>props.onUpdate(val.split(DELIM))}/>
			}
		</div>
	)
};

// MAIN COMPONENT
const CVEditor = forwardRef((
	props: { cv: CV },
	ref: React.ForwardedRef<any>
) => {

	// Keep track each value in the CV
	const [CV, setCV] = React.useState(props.cv);

	// give the parent 'App' access to localJI
	useImperativeHandle(ref, () => ({
		// NOTE: no purpose.
		getCV: () => props.cv
	}));

	// ----------------- SUB COMPONENTS -----------------

	const Languages = () => (
		<BucketOrText id="Languages" values={CV.languages} onUpdate={(vals)=> setCV(prev => {
			let copy = structuredClone(prev)
			copy.languages = vals
			return copy
		})} />
	)

	const Technologies = () => (
		<BucketOrText id="Technologies" values={CV.technologies} onUpdate={(vals)=> setCV(prev => {
			let copy = structuredClone(prev)
			copy.technologies = vals
			return copy
		})}/>
	)

	const Summary = () => (
		<DragDropItem
			item = {{
				id: "summary",
				value: CV.summary
			}}
		/>
	)

	const Experiences = () => (
		<BucketComponent
			bucket = {{ id: "Experiences", values: CV.experiences }}
			isVertical={true}
			DisplayItem={(props) => <ExperienceUI {...props.item.value} />}
			DisplayItems={(props) => <div className="experience-list">{props.children}</div>}
		/>
	)

	const Projects = () => (
		<BucketComponent
			bucket = {{ id: "Projects", values: CV.projects }}
			isVertical={true}
			DisplayItem={(props) => <ExperienceUI {...props.item.value} />}
			DisplayItems={(props) => <div className="experience-list">{props.children}</div>}
		/>
	)

	const rows_cols = [
		// ---------- ROW 1 ----------
		[
			// ---------- COLUMNS ----------
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
			)
		],
		// ---------- ROW 2 ----------
		[
			// ---------- COLUMN 1 ----------
			(
				<Section head="SUMMARY" id="section-summary">
					<Summary />
				</Section>
			),
			// ---------- COLUMN 2 ----------
			(
				<Section head="SKILLS" id="section-skills">
					<div className="sub-sec">
						<div className="sub-sec-head">Languages:</div>
						<Languages />
					</div>
					<div className="sub-sec">
						<div className="sub-sec-head">Technology:</div>
						<Technologies />
					</div>
				</Section>
			)
		],
		(
			<Section head="EXPERIENCES" id="experiences">
				<Experiences />
			</Section>
		),
		(
			<Section head="PROJECTS" id="projects">
				<Projects />
			</Section>
		),
		(
			<Section head="EDUCATION" id="education">
				<ExperienceUI {...CV.education} />
			</Section>
		)
	]

	// ----------------- RENDER -----------------

	if (!props.cv) return null;
	return (
		<Grid id="cv-editor" rows_cols={rows_cols}/>
	);
});


export { CVEditor, ExperienceUI }
