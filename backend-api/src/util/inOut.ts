/**
 * inOut.ts
 * Defines functions for reading / outputting files:
 * - getNamedCVs: reads all CVs from the 'public/CVs' directory
 * - getCVinfo: reads the 'public/cv_info.json' file
*/
export { getNamedCVs, getCVinfo, saveCV, getCLinfo };

import fs from "fs";
import { CV } from "shared";

const public_dir = '/Users/romanhudaj/Desktop/PROJECTS/JobTool/backend-api/public';
const cv_dir = `${public_dir}/CVs`;

/* ************************************************
*                    CV RELATED                   *
* ************************************************/

/**
 * All the CVs are located in json files (matching the CV interface )
 * and are stored in the 'public/CVs' directory.
*/
function getNamedCVs(): { name: string, data: CV }[] | undefined {
    return fs.readdirSync(cv_dir).map((f_name: string) => {
        const [name, type] = f_name.split('.')
        if (type !== 'json')
            // not a json file
            return;
        else {
            // read the file and parse the JSON
            console.log('\tFound CV: ', name);
            const cv: CV = JSON.parse(fs.readFileSync(`${cv_dir}/${f_name}`, 'utf8'));
            return {name: name, data: cv};
        }
    });
};

function getCVinfo(): any {
    return JSON.parse(
        fs.readFileSync(`${public_dir}/cv_info.json`, 'utf8')
    );
};

function saveCV(name: string, cv: CV): void {
    const fileName = name + '.json';
    console.log('saving:', fileName);
    fs.writeFileSync(`${cv_dir}/${fileName}`, JSON.stringify(cv));
};

/* ************************************************
*                    CL RELATED                   *
* ************************************************/

function getCLinfo(): any {
    return JSON.parse(
        fs.readFileSync(`${public_dir}/cl_info.json`, 'utf8')
    );
};