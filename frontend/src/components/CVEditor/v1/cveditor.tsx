import "../cveditor.scss";
import { CV } from "shared";
import { TextEditDiv } from "../../TextEditDiv/texteditdiv";
import { forwardRef, useImperativeHandle, useState } from "react";
import { TrackVal, wrapTrackable, unwrapTrackable } from "../../../hooks/trackable";
import { Grid } from "../grid";
import { joinClassNames } from "../../../hooks/joinClassNames";


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

	// TODO: does not work when saving values

	const txt = props.items.map((item) => item.value).join(props.delimiter);
	const tv = wrapTrackable(txt);

	const classNames = joinClassNames("delimited-list", props.className);

	return (
		<div className={classNames}>
			<TextEditDiv tv={tv} />
		</div>
	);
}

// MAIN COMPONENT

const CVEditor = forwardRef((
	props: { cv: CV },
	ref: React.ForwardedRef<any>
) => {

	// Keep track each value in the CV
	const VAL = useState(wrapTrackable(props.cv))[0];

	// give the parent 'App' access to localJI
	useImperativeHandle(ref, () => ({
		getCV: () => unwrapTrackable(VAL)
	}));

	const rows_cols = [
		[
		(
				<div id="name-title">
					<div id="div-full-name">ROMAN HUDAJ</div>
					<TextEditDiv tv={VAL.personalTitle} id="div-personal-title"/>
				</div>
			),
			(
				<div id="div-links">
					{VAL.links.map((l) => (
						<Link url={l.url.value} icon={l.icon.value} text={l.text} />
					))}
				</div>
			),
		],
		[
			(
				<Section head="SUMMARY" id="section-summary">
					<TextEditDiv tv={VAL.summary} id="summary" />
				</Section>
			),
			(
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
			)
		],
		(
			<Section head="EXPERIENCES" id="experience">
				{VAL.experiences.map((exp) => (
					<ExperienceUI {...exp} />
				))}
			</Section>
		),
		(
			<Section head="PROJECTS" id="projects">
			{
				VAL.projects.map((proj: any) => (
					<ExperienceUI {...proj}/>
				))
			}
			</Section>
		),
		(
			<Section head="EDUCATION" id="education">
			<ExperienceUI {...VAL.education} />
			</Section>
		)

	];

	if (props.cv) return <Grid id="cv-editor" rows_cols={rows_cols}/>;
	else return null;
});


export { CVEditor, ExperienceUI }
