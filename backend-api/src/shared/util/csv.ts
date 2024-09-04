import * as fs from "fs"
/** File Description
 * @purpose Output list of objects (ie: job list) to csv
*/

function Append2Csv<T>(PATH: string, rowObjects: T[]) {
    const csv_rows: string[] = [];
    const KEYS: string[] = Object.keys(rowObjects[0]);

    const new_file = (!fs.existsSync(PATH) || fs.statSync(PATH).size == 0)

    // For a new file, add a row for headers

        if(new_file) {
            // <- file doesn't exist or is empty.
            const headers = KEYS.join(',');
            csv_rows.push(headers);
        }

    // Turn each object into a row

        rowObjects.forEach(obj => {
            const values = KEYS.map(key => {
                let value = obj[key];
                if (typeof value === 'object') value = JSON.stringify(value);
                // <- value is a string
                if (typeof value === 'string') {
                    if (value.includes(','))    value = `"${value.replace(/"/g, '""')}"`;  // Escape double quotes inside the value
                    if (value.includes('\n'))   value = value.replace(/\n/g, ' ');        // Replace newline characters with spaces
                }
                return value;
            });
            const row = values.join(',');
            csv_rows.push(row);
        });

    // Each data row should be on a new line

        let new_lines = new_file ? '' : '\n';   // Start on new line if appending to existing file
        new_lines += csv_rows.join('\n');

    // Append to the file

        fs.writeFile(PATH, new_lines, { flag: 'a' }, (err) => console.log(err));
};

export { Append2Csv }