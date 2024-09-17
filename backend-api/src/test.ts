import { cv } from "./CV/cv.js";
import { outputCVPDF } from "./CV/toPDF.js";

outputCVPDF(cv, process.cwd() + '/public/cv.pdf');