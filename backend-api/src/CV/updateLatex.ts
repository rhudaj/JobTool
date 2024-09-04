import { outFile } from "../shared/util/files.js";
import { CV } from "shared";

/**
 * Handling Special characters
 * @note special characters: & % $ # _ { } ~ ^ \
 * @note the first 7 of them can be typeset by prepending a backslash; otherwise use: \textasciitilde, \textasciicircum, and \textbackslash.
 */
const texEscape = (text: string) =>
    text.replace(/[&%$#_{}]/g, (match) => {
        return "\\" + match;
    });

export async function UpdateLatexCV(cv: CV) {
    const text = `
\\def\\personalTitle{${cv.personalTitle}}
\\def\\summary{${texEscape(cv.summary)}}
\\def\\languages{${cv.languages.join(", ")}}
\\def\\technologies{${cv.technologies.join(", ")}}
\\def\\courses{${cv.courses.join(", ")}}
\\def\\links{
${cv.links.map(L=>
`    {
        {${L.icon}}
        {${L.text}}
        {${L.url}}
    }`).join(',\n')}
}
\\def\\experiences{
${cv.experiences.map(E=>
`    {
        {${E.date_range}}
        {${E.title}}
        {${E.company}}
        {
            ${E.bulletPoints.map(BP=>`{${texEscape(BP)}}`).join('\n\t\t\t')}
        }
        {${E.tech.join(", ")}}
    }`).join(',\n')}
}
\\def\\projects{
${cv.projects.map(P=>
`    {
        {${P.date_range}}
        {${P.title}}
        {${P.url}}
        {${texEscape(P.description)}}
        {${P.tech.join(", ")}}
    }`).join(',\n')}
}`;

    outFile("/latex/variables.tex", text);
};
