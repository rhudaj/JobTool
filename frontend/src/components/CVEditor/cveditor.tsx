import "./cveditor.css"
import { CV, Experience } from "shared";
import { TextEditDiv, TrackVal } from "../TextEditDiv/texteditdiv";
import { forwardRef, useImperativeHandle, useState } from "react";

export const CVEditor = forwardRef((props: { cv: CV }, ref: React.ForwardedRef<any>) => {

    const [value, setValue] = useState({
        personalTitle: new TrackVal(props.cv.personalTitle),
        summary: new TrackVal(props.cv.summary),
        languages: new TrackVal(props.cv.languages),
        technologies: new TrackVal(props.cv.technologies),
        experiences: props.cv.experiences.map(exp => ({
            title: new TrackVal(exp.title),
            side_title: new TrackVal(exp.side_title),
            date_range: new TrackVal(exp.date_range),
            points: exp.points.map(p => new TrackVal(p)),
            tech: new TrackVal(exp.tech)
        })),
        projects: props.cv.projects.map(proj => ({
            title: new TrackVal(proj.title),
            side_title: new TrackVal(proj.side_title),
            date_range: new TrackVal(proj.date_range),
            points: proj.points.map(p => new TrackVal(p)),
            tech: new TrackVal(proj.tech)
        })),
        education: {
            title: new TrackVal(props.cv.education.title),
            side_title: new TrackVal(props.cv.education.side_title),
            date_range: new TrackVal(props.cv.education.date_range),
            points: props.cv.education.points.map(p => new TrackVal(p)),
            tech: new TrackVal(props.cv.education.tech)
        },
        links: props.cv.links.map(l => ({
            url: new TrackVal(l.url),
            icon: new TrackVal(l.icon),
            text: new TrackVal(l.text)
        }))
    });

    // give the parent 'App' access to localJI
    useImperativeHandle(ref, () => ({
        getCV(): CV { return {
            personalTitle: value.personalTitle.value,
            summary: value.summary.value,
            languages: value.languages.value,
            technologies: value.technologies.value,
            experiences: value.experiences.map(exp => ({
                title: exp.title.value,
                side_title: exp.side_title.value,
                date_range: exp.date_range.value,
                points: exp.points.map(p => p.value),
                tech: exp.tech.value
            })),
            projects: value.projects.map(proj => ({
                title: proj.title.value,
                side_title: proj.side_title.value,
                date_range: proj.date_range.value,
                points: proj.points.map(p => p.value),
                tech: proj.tech.value
            })),
            education: {
                title: value.education.title.value,
                side_title: value.education.side_title.value,
                date_range: value.education.date_range.value,
                points: value.education.points.map(p => p.value),
                tech: value.education.tech.value
            },
            links: value.links.map(l => ({
                url: l.url.value,
                icon: l.icon.value,
                text: l.text.value
            }))
        }; }
    }));


    const ExperienceUI = (props: Experience) => (
        <div className="experience">
            <div className="exp-col-1">
                <div className="exp-date">{props.date_range}</div>
            </div>
            <div className="exp-col-2">
                <div className="titles">
                    <TextEditDiv text={props.title} className="exp-title"/>
                    <TextEditDiv text={props.side_title} className="exp-side-title"/>
                </div>
                <div className="exp-content">
                    {
                        props.points.length === 1
                        ? <TextEditDiv text={props.points[0]}/>
                        : (
                            <ul className="bullet-points">
                                { props.points.map(p =><li><TextEditDiv text={p}/></li>) }
                            </ul>
                        )
                    }
                </div>
                <TextEditDiv text={props.tech as any} id="tech-list"/>
            </div>
        </div>
    );

    const Section = (props: { head: string, id?: string, children: React.ReactNode }) => (
        <div className="sec" id={props.id} >
            <div className="sec-head">
                <p>{props.head}</p>
                <hr/>
            </div>
            <div className="sec-content">
                {props.children}
            </div>
        </div>
    );

    const Link = (props: { url: any, icon: any, text?: any }) => (
        <div className="link">
            <a className="link" href={props.url}>
                <i className={props.icon}/>
                <TextEditDiv text={props.text} id="link-text"/>
            </a>
        </div>
    );

    if (!props.cv) return null;
    return (
        <div id="cv-editor">
            <div id="row-1">
                <div id="name-title">
                    <div id="div-full-name">ROMAN HUDAJ</div>
                    <TextEditDiv text={value.personalTitle} id="div-personal-title"/>
                </div>
                <div id="div-links">
                    {
                        value.links.map(l=>(
                            <Link url={l.url} icon={l.icon} text={l.text}/>
                        ))
                    }
                </div>
            </div>
            <div id="row-2">
                <Section head="SUMMARY" id="section-summary">
                    <TextEditDiv text={value.summary} id="summary"/>
                </Section>
                <Section head="SKILLS" id="section-skills">
                    <div className="sub-sec">
                        <div className="sub-sec-head">Languages:</div>
                        <TextEditDiv text={value.languages} id="languages"/>
                    </div>
                    <div className="sub-sec">
                        <div className="sub-sec-head">Technology:</div>
                        <TextEditDiv text={value.technologies} id="technologies"/>
                    </div>
                </Section>
            </div>
            <div id="row-3">
                <Section head="EXPERIENCES" id="experiences">
                    {
                        value.experiences.map(exp=>(
                            <ExperienceUI {...exp as any}/>
                        ))
                    }
                </Section>
            </div>
            <div id="row-4">
                <Section head="PROJECTS" id="projects">
                    {
                        value.projects.map(proj=>(
                            <ExperienceUI
                                title={proj.title as any}
                                side_title={ <Link url={proj.side_title} icon="fa fa-link"/> as any }
                                date_range={proj.date_range as any}
                                tech={proj.tech as any}
                                points={proj.points as any}
                            />
                        ))
                    }
                </Section>
            </div>
            <div id="row-5">
                <Section head="EDUCATION" id="education">
                    <ExperienceUI {...value.education as any}/>
                </Section>
            </div>
        </div>
    );
});
