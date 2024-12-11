import "./cveditor.css";
import { CV } from "shared";
import { TextEditDiv } from "../TextEditDiv/texteditdiv";
import { forwardRef, useImperativeHandle, useState } from "react";
import { TrackVal, wrapTrackable, unwrapTrackable } from "../../hooks/trackable";

// CUSTOM SUB COMPONENTS

const ExperienceUI = (props: any) => {

	// TODO: this is hacky, need to improve.
	let sideTitleEl = (props.side_title.value as string).startsWith("http") ? (
		<Link url={props.side_title.value} icon="fa fa-link" />
	) : (
		<TextEditDiv tv={props.side_title} className="side-title"/>
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
							{props.points.map((p: TrackVal<string>) => (
								<li>
									<TextEditDiv tv={p} />
								</li>
							))}
						</ul>
					)}
				</div>

				{/* ------------ ROW 3 ------------ */}

				<DelimitedList items={props.tech} delimiter=" / " />

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
	text?: TrackVal<string> // only the link-text is editable
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

const DelimitedList = (props: { items: TrackVal<string>[], delimiter: string, className?: any }) => {

	const txt = props.items.map((item) => item.value).join(props.delimiter);
	const tv = wrapTrackable(txt);

	return (
		<div className={`delimited-list ${props.className}`}>
			<TextEditDiv tv={tv} />
		</div>
	);
}

// MAIN COMPONENT

export const CVEditor = forwardRef((
	props: { cv: CV },
	ref: React.ForwardedRef<any>
) => {

	// Keep track each value in the CV
	const VAL = useState(wrapTrackable(props.cv))[0];

	// give the parent 'App' access to localJI
	useImperativeHandle(ref, () => ({
		getCV: () => unwrapTrackable(VAL)
	}));

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
							<Link url={l.url.value} icon={l.icon.value} text={l.text} />
						))}
					</div>

				</div>

				{/* ---------- ROW 2 ---------- */}

				<div className="columns">

					<Section head="SUMMARY" id="section-summary">
						<TextEditDiv tv={VAL.summary} id="summary" />
					</Section>

					<Section head="SKILLS" id="section-skills">

						<div className="sub-sec">
							<div className="sub-sec-head">Languages:</div>
								<DelimitedList items={VAL.languages} delimiter=", " />
						</div>

						<div className="sub-sec">
							<div className="sub-sec-head">Technology:</div>
							<DelimitedList items={VAL.technologies} delimiter=", " />
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
