import dts from 'rollup-plugin-dts';
export default [
    {
        input: 'dist/index.d.ts',
        output: {
            file: 'index.d.ts'
        },
        plugins: [dts()]
    }
]
// export default {
//     input: 'dist/index.js',
//     output: {
//         file: 'index.js'
//     }
// }