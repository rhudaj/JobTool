// import "./cveditor.scss";
import { CV, Experience } from "shared";
import { TextEditDiv } from "../../TextEditDiv/texteditdiv";
import React from "react";
import { BucketComponent, DragDropItem } from "../../dnd/dnd";
import { joinClassNames } from "../../../hooks/joinClassNames";
import { Grid } from "../grid";

// CUSTOM SUB COMPONENTS

const ExperienceUI = (props: Experience & { onUpdate?: (newExp: Experience) => void }) => {

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

				{/* ----------- TECH ---------- */}

				<BucketOrText
					id="Tech"
					delim=" / "
					values={props.tech}
					onUpdate={vals => props.onUpdate({ ...props, tech: vals })}
				/>

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
function BucketOrText(props: {
	id: string,
	values: string[],
	delim: string,
	onUpdate?: (newVals: string[]) => void
}) {

	// true => bucket, false => text
	const [mode, setMode] = React.useState(true);

	return (
		<div className="bucket-or-text" onDoubleClick={()=>setMode(false)} onBlur={()=>setMode(true)}>
			{
				mode ?
				<BucketComponent
					id={props.id}
					values={props.values}
					item_type={props.id}
					isVertical={false}
					DisplayItem={displayProps => <TextEditDiv tv={displayProps.value}/>}
					DisplayItems={displayProps => <DelimitedList delimiter={props.delim} {...displayProps} />}
					onUpdate={props.onUpdate}
				/> :
				<TextEditDiv tv={props.values.join(props.delim)} onUpdate={(val)=>props.onUpdate(val.split(props.delim))}/>
			}
		</div>
	)
};

// MAIN COMPONENT
function CVEditor(props: { cv: CV }) {

	// Keep track each value in the CV
	const [CV, setCV] = React.useState(props.cv);

	// ----------------- SUB COMPONENTS -----------------

	const Languages = () => (
		<BucketOrText id="languages" values={CV.languages} delim=", " onUpdate={(vals)=> setCV(prev => {
			let copy = structuredClone(prev)
			copy.languages = vals
			return copy
		})}/>
	)

	const Technologies = () => (
		<BucketOrText id="technologies" values={CV.technologies} delim=", " onUpdate={(vals)=> setCV(prev => {
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
			id="experiences"
			values={CV.experiences}
			item_type="experiences"
			isVertical={true}
			DisplayItem={(props) => <ExperienceUI {...props.value} />}
			DisplayItems={(props) => <div className="experience-list">{props.children}</div>}
			onUpdate={(newVals) => setCV(prev => {
				let copy = structuredClone(prev)
				copy.experiences = newVals
				return copy
			})}
		/>
	)

	const Projects = () => (
		<BucketComponent
			id="projects"
			values={CV.projects }
			item_type="projects"
			isVertical={true}
			DisplayItem={(props) => <ExperienceUI {...props.value} />}
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

	if (!CV) return null;
	return (
		<Grid id="cv-editor" rows_cols={rows_cols}/>
	);
};


export { CVEditor, ExperienceUI }
