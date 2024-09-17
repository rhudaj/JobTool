import "./cveditor.css"
import { CV } from "shared";
import { ReactElement } from "react";

export function CVEditor(P: {cv: CV}) {

    const Section = (props: {
        head: string,
        id?: string,
        children: React.ReactNode | ReactElement
    }) => {
        return (
            <div className="sec" id={props.id}>
                <div className="sec-head">
                    <p>{props.head}</p>
                    <hr/>
                    {/* <span className="hor-line"/> */}
                </div>
                <div className="sec-content">
                    {props.children}
                </div>
            </div>
        );
    };

    const Experience = (props: {
        title: string,
        side_title: string | ReactElement,
        date: string,
        item_list?: string[]
        content: string | string[]
    }) => {

        return (
            <div className="experience">
                <div className="exp-col-1">
                    <div className="exp-date">{props.date}</div>
                </div>
                <div className="exp-col-2">
                    <div className="titles">
                        <div className="exp-title">{props.title}</div>
                        <div className="exp-side-title">{props.side_title}</div>
                    </div>
                    <div className="exp-content">
                        {
                            typeof props.content === "string"
                            ? props.content
                            : (
                                <ul className="bullet-points">
                                    {props.content.map(bp=><li>{bp}</li>)}
                                </ul>
                            )
                        }
                    </div>
                    { props.item_list ? <div className="exp-item-list">{props.item_list.join(" / ")}</div> : null }
                </div>
            </div>
        );
    };

    const Link = (props: {
        url: string,
        icon: string,
        text?: string,
    }) => {
        return (
            <div className="link">
                <a className="link" href={props.url}>
                    <i className={props.icon}/>
                    {props.text}
                </a>
            </div>
        );
    };

    return (
        <div id="A4-page">
            <div id="cv-row-grid">
                <div id="row-1">
                    <div id="div-full-name">ROMAN HUDAJ</div>
                    <div id="div-personal-title">{P.cv.personalTitle}</div>
                    <div id="div-links">
                        {
                            P.cv.links.map(l=>(
                                <Link url={l.url} icon={l.icon} text={l.text}/>
                            ))
                        }
                    </div>
                </div>
                <div id="row-2">
                    <Section head="SUMMARY" id="section-summary">
                        <div id="summary">{P.cv.summary}</div>
                    </Section>
                    <Section head="SKILLS" id="section-skills">
                        <div className="sub-sec">
                            <div className="sub-sec-head">Languages:</div>
                            <div>{P.cv.languages.join(", ")}</div>
                        </div>
                        <div className="sub-sec">
                            <div className="sub-sec-head">Technology:</div>
                            <div>{P.cv.technologies.join(", ")}</div>
                        </div>
                    </Section>
                </div>
                <div id="row-3">
                    <Section head="EXPERIENCES" id="experiences">
                        {
                            P.cv.experiences.map(exp=>(
                                <Experience
                                    title={exp.title}
                                    side_title={exp.company}
                                    date={exp.date_range}
                                    item_list={exp.tech}
                                    content={exp.bulletPoints}
                                />
                            ))
                        }
                    </Section>
                </div>
                <div id="row-4">
                    <Section head="PROJECTS" id="projects">
                        {
                            P.cv.projects.map(proj=>(
                                <Experience
                                    title={proj.title}
                                    side_title={ <Link url={proj.url} icon="fa fa-link"/> }
                                    date={proj.date_range}
                                    item_list={proj.tech}
                                    content={proj.description}
                                />
                            ))
                        }
                    </Section>
                </div>
                <div id="row-5">
                    <Section head="EDUCATION" id="education">
                        <Experience
                            title="Computer Science, Honours"
                            side_title="University of Waterloo"
                            date="9/20 - 12/24"
                            content={[
                                "Awards: Presidents Scholarship of Distinction, Dean’s Honours List",
                                `Course-Work: ${P.cv.courses}`
                            ]}
                        />
                    </Section>
                </div>
            </div>
        </div>
    );
};