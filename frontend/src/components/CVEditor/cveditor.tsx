import "./cveditor.css";
import { CV } from "shared";
import { TextEditDiv } from "../TextEditDiv/texteditdiv";
import { forwardRef, useImperativeHandle, useState } from "react";
import { BucketComponent, DragDropItem } from "../dnd/dnd";
import { joinClassNames } from "../../hooks/joinClassNames";

// CUSTOM SUB COMPONENTS

const ExperienceUI = (props: any) => {

	// TODO: this is hacky, need to improve.
	let sideTitleEl = (props.side_title as string).startsWith("http") ? (
		<Link url={props.side_title} icon="fa fa-link" />
	) : (
		<TextEditDiv tv={props.side_title} className="side-title"/>
	);

	const Tech = () => (
		<BucketComponent
			bucket={{ id: "Tech", values: props.tech }}
			isVertical={false}
			DisplayItems={(props) => <DelimitedList delimiter=" / " className="exp-tech" {...props} />}
		/>
	);

    return (
		<div className="experience">

			{/* ------------ COLUMN 1 ------------ */}

			<TextEditDiv tv={props.date_range} className="date-range" />

			{/* ------------ COLUMN 2 ------------ */}

			<div className="exp-col-2">

				{/* ------------ ROW 1 ------------ */}

				<div className="titles">
					<TextEditDiv tv={props.title} className="title" />
					{sideTitleEl}
				</div>

				{/* ------------ ROW 2 ------------ */}

				<div className="exp-content">
					{ props.points.length === 1 ? (
						<TextEditDiv tv={props.points[0]} />
					) : (
						<ul className="exp-points">
							{props.points.map((bullet_point: string) => (
								<li>
									<TextEditDiv tv={bullet_point} />
								</li>
							))}
						</ul>
					)}
				</div>

				{/* ------------ ROW 3 ------------ */}

				<Tech />

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
		<div className="sec" id={props.id}>
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

// MAIN COMPONENT

export const CVEditor = forwardRef((
	props: { cv: CV },
	ref: React.ForwardedRef<any>
) => {

	// Keep track each value in the CV
	const VAL: CV = props.cv;

	// give the parent 'App' access to localJI
	useImperativeHandle(ref, () => ({
		// NOTE: no purpose.
		getCV: () => props.cv
	}));

	// ----------------- SUB COMPONENTS -----------------

	const Languages = () => (
		<BucketComponent
			bucket = {{ id: "Languages", values: VAL.languages }}
			isVertical={false}
			DisplayItem={(props) => <>{props.item.value}</>}
			DisplayItems={(props) => <DelimitedList delimiter=", " {...props} />}
		/>
	)

	const Technologies = () => (
		<BucketComponent
			bucket = {{ id: "Technologies", values: VAL.technologies }}
			isVertical={false}
			DisplayItem={(props) => <>{props.item.value}</>}
			DisplayItems={(props) => <DelimitedList delimiter=", " {...props} />}
		/>
	)

	const Summary = () => (
		<DragDropItem
			item = {{
				id: "summary",
				value: VAL.summary
			}}
		/>
	)

	// ----------------- RENDER -----------------

	if (!props.cv) return null;
	return (
		<div id="cv-editor">

			<div className="rows">

				{/* ---------- ROW 1 ---------- */}

				<div className="columns">

					<div id="name-title">
						<div id="div-full-name">ROMAN HUDAJ</div>
						<TextEditDiv tv={VAL.personalTitle} id="div-personal-title"/>
					</div>

					<div id="div-links">
						{VAL.links.map((l) => (
							<Link url={l.url} icon={l.icon} text={l.text} />
						))}
					</div>

				</div>

				{/* ---------- ROW 2 ---------- */}

				<div className="columns">

					{/* ---------- COL 1 ---------- */}

					<Section head="SUMMARY" id="section-summary">
						{/* <TextEditDiv tv={VAL.summary} id="summary" /> */}
						<Summary />
					</Section>

					{/* ---------- COL 2 ---------- */}

					<Section head="SKILLS" id="section-skills">

						<div className="sub-sec">
							<div className="sub-sec-head">Languages:</div>
							<Languages />
						</div>

						<div className="sub-sec">
							<div className="sub-sec-head">Technology:</div>
							<div className="delimited-list">
								<Technologies />
							</div>
						</div>

					</Section>

				</div>

				{/* ---------- ROW 3 ---------- */}

				<Section head="EXPERIENCES" id="experiences">
					{VAL.experiences.map((exp) => (
						<ExperienceUI {...exp} />
					))}
				</Section>

				{/* ---------- ROW 4 ---------- */}

				<Section head="PROJECTS" id="projects">
					{
						VAL.projects.map((proj: any) => (
							<ExperienceUI {...proj}/>
						))
					}
				</Section>

			{/* ---------- ROW 5 ---------- */}

				<Section head="EDUCATION" id="education">
					<ExperienceUI {...VAL.education} />
				</Section>

			</div>

		</div>
	);
});
