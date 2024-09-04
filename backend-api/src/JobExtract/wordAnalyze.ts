import { WordOccurences } from "shared";

const commonWords = [ "are", "is", "the", "be", "to", "of", "and", "a", "in", "that", "have", "I", "it", "for", "not", "on", "with", "he", "as", "you", "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", "one", "all", "would", "there", "their", "what", "so", "up", "out", "if", "about", "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", "no", "just", "him", "know", "take", "people", "into", "year", "your", "good", "some", "could", "them", "see", "other", "than", "then", "now", "look", "only", "come", "its", "over", "think", "also", "back", "after", "use", "two", "how", "our", "work", "first", "well", "way", "even", "new", "want", "because", "any", "these", "give", "day", "most", "us" ];
const language_list = [ "A.NET", "A-0 System", "A+", "ABAP", "ABC", "ABC ALGOL", "ACC", "Accent", "Ace Distributed Application Specification Language", "Action!", "ActionScript", "Actor", "Ada", "Adenine", "AdvPL", "Agda", "Agilent VEE", "Agora", "AIMMS", "Aldor", "Alef", "ALF", "ALGOL 58", "ALGOL 60", "ALGOL 68", "ALGOL W", "Alice ML", "Alma-0", "AmbientTalk", "Amiga E", "AMPL", "Analitik", "AngelScript", "Apache Pig latin", "Apex", "APL", "App Inventor for Android's visual block language", "AppleScript", "APT", "Arc", "ArkTS", "ARexx", "Argus", "Assembly language", "AutoHotkey", "AutoIt", "AutoLISP / Visual LISP", "Averest", "AWK", "Axum", "B", "Babbage", "Ballerina", "Bash", "BASIC", "Batch file", "bc", "BCPL", "BeanShell", "BETA", "BLISS", "Blockly", "BlooP", "Boo", "Boomerang", "Bosque", "C", "C--", "C++", "C*", "C#", "C/AL", "Caché ObjectScript", "C Shell", "Caml", "Carbon", "Catrobat", "Cayenne", "Cecil", "CESIL", "Céu", "Ceylon", "CFEngine", "Cg", "Ch", "Chapel", "Charm", "CHILL", "CHIP-8", "ChucK", "Cilk", "Claire", "Clarion", "Clean", "Clipper", "CLIPS", "CLIST", "Clojure", "CLU", "CMS-2", "COBOL", "CobolScript", "Cobra", "CoffeeScript", "ColdFusion", "COMAL", "COMIT", "Common Intermediate Language", "Common Lisp", "COMPASS", "Component Pascal", "COMTRAN", "Concurrent Pascal", "Constraint Handling Rules", "Control Language", "Coq", "CORAL, Coral 66", "CorVision", "COWSEL", "CPL", "Cryptol", "Crystal", "Csound", "Cuneiform", "Curl", "Curry", "Cybil", "Cyclone", "Cypher Query Language", "Cython", "CEEMAC", "D", "Dart", "Darwin", "DataFlex", "Datalog", "DATATRIEVE", "dBase", "dc", "DCL", "Delphi", "DIBOL", "DinkC", "Dog", "Draco", "DRAKON", "Dylan", "DYNAMO", "DAX", "E", "Ease", "Easy PL/I", "EASYTRIEVE PLUS", "ECMAScript", "Edinburgh IMP", "EGL", "Eiffel", "ELAN", "Elixir", "Elm", "Emacs Lisp", "Emerald", "Epigram", "EPL", "Erlang", "es", "Escher", "ESPOL", "Esterel", "Etoys", "Euclid", "Euler", "Euphoria", "EusLisp Robot Programming Language", "CMS EXEC", "EXEC 2", "Executable UML", "Ezhil", "F", "F#", "F*", "Factor", "Fantom", "FAUST", "FFP", "fish", "Fjölnir", "FL", "Flavors", "Flex", "Flix", "FlooP", "FLOW-MATIC", "FOCAL", "FOCUS", "FOIL", "FORMAC", "@Formula", "Forth", "Fortran", "Fortress", "FP", "FoxBase/FoxPro", "Franz Lisp", "Futhark", "Game Maker Language", "GameMonkey Script", "General Algebraic Modeling System", "GAP", "G-code", "GDScript", "Geometric Description Language", "GEORGE", "Gleam", "OpenGL Shading Language", "GNU E", "GNU Ubiquitous Intelligent Language for Extensions", "Go", "Go!", "Game Oriented Assembly Lisp", "Gödel", "Golo", "Good Old Mad", "Google Apps Script", "Gosu", "GOTRAN", "General Purpose Simulation System", "GraphTalk", "GRASS", "Grasshopper", "Groovy", "Hack", "HAGGIS", "HAL/S", "Halide", "Hamilton C shell", "Harbour", "Hartmann pipelines", "Haskell", "Haxe", "Hermes", "High Level Assembly", "High Level Shader Language", "Hollywood", "HolyC", "Hop", "Hopscotch", "Hope", "Hume", "HyperTalk", "Hy", "Io", "Icon", "IBM Basic assembly language", "IBM Informix-4GL", "IBM RPG", "IDL", "Idris", "Inform", "ISLISP", "J", "J#", "J++", "JADE", "Jai", "JAL", "Janus", "Janus", "JASS", "Java", "JavaFX Script", "JavaScript", "Jess", "JCL", "JEAN", "Join Java", "JOSS", "Joule", "JOVIAL", "Joy", "jq", "JScript", "JScript .NET", "Julia", "Jython", "K", "Kaleidoscope", "Karel", "KEE", "Kixtart", "Klerer-May System", "KIF", "Kojo", "Kotlin", "KRC", "KRL", "KRL", "KRYPTON", "KornShell", "Kodu", "Kv", "LabVIEW", "Ladder", "LANSA", "Lasso", "LC-3", "Lean", "Legoscript", "LIL", "LilyPond", "Limbo", "LINC", "Lingo", "LINQ", "LIS", "LISA", "Language H", "Lisp", "Lithe", "Little b", "LLL", "Logo", "Logtalk", "LotusScript", "LPC", "LSE", "LSL", "LiveCode", "LiveScript", "Lua", "Lucid", "Lustre", "LYaPAS", "Lynx", "M Formula language", "M4", "M#", "Machine code", "MAD", "MAD/I", "Magik", "Magma", "Maple", "MAPPER", "MARK-IV", "Mary", "MATLAB", "MASM Microsoft Assembly x86", "MATH-MATIC", "Maude system", "Maxima", "Max", "MaxScript internal language 3D Studio Max", "Maya", "MDL", "Mercury", "Mesa", "MHEG-5", "Microcode", "Microsoft Power Fx", "MIIS", "MIMIC", "Mirah", "Miranda", "MIVA Script", "ML", "Model 204", "Modelica", "Malbolge", "Modula", "Modula-2", "Modula-3", "Mohol", "Mojo", "MOO", "Mortran", "Mouse", "MPD", "MSL", "MUMPS", "MuPAD", "Mutan", "Mystic Programming Language", "NASM", "Napier88", "Neko", "Nemerle", "NESL", "Net.Data", "NetLogo", "NetRexx", "NewLISP", "NEWP", "Newspeak", "NewtonScript", "Nial", "Nickle", "Nim", "Nix", "NPL", "Not eXactly C", "Not Quite C", "NSIS", "Nu", "NWScript", "NXT-G", "o:XML", "Oak", "Oberon", "OBJ2", "Object Lisp", "ObjectLOGO", "Object REXX", "Object Pascal", "Objective-C", "Obliq", "OCaml", "occam", "occam-π", "Octave", "OmniMark", "Opa", "Opal", "Open Programming Language", "OpenCL", "OpenEdge Advanced Business Language", "OpenVera", "OpenQASM", "OPS5", "OptimJ", "Orc", "ORCA/Modula-2", "Oriel", "Orwell", "Oxygene", "Oz", "P", "P4", "P′′", "ParaSail", "PARI/GP", "Pascal", "Pascal Script", "PCASTL", "PCF", "PEARL", "PeopleCode", "Perl", "PDL", "Pharo", "PHP", "Pico", "Picolisp", "Pict", "Pike", "PILOT", "Pipelines", "Pizza", "PL-11", "PL/0", "PL/B", "PL/C", "PL/I", "PL/M", "PL/P", "PL/S", "PL/SQL", "PL360", "PLANC", "Plankalkül", "Planner", "PLEX", "PLEXIL", "Plus", "POP-11", "POP-2", "PostScript", "PortablE", "POV-Ray SDL", "Powerhouse", "PowerBuilder", "PowerShell", "PPL", "Processing", "Processing.js", "Prograph", "Project Verona", "Prolog", "PROMAL", "Promela", "PROSE modeling language", "PROTEL", "Pro*C", "Pure", "Pure Data", "PureScript", "PWCT", "Python", "Q", "Q#", "Qalb", "Quantum Computation Language", "QtScript", "QuakeC", "QPL", ".QL", "R", "R++", "Racket", "Raku", "RAPID", "Rapira", "Ratfiv", "Ratfor", "rc", "Reason", "REBOL", "Red", "Redcode", "REFAL", "REXX", "Ring", "ROOP", "RPG", "RPL", "RSL", "RTL/2", "Ruby", "Rust", "S", "S2", "S3", "S-Lang", "S-PLUS", "SA-C", "SabreTalk", "SAIL", "SAKO", "SAS", "SASL", "Sather", "Sawzall", "Scala", "Scheme", "Scilab", "Scratch", "ScratchJr", "Script.NET", "Sed", "Seed7", "Self", "SenseTalk", "SequenceL", "Serpent", "SETL", "Short Code", "SIMPOL", "SIGNAL", "SiMPLE", "SIMSCRIPT", "Simula", "Simulink", "SISAL", "SKILL", "SLIP", "SMALL", "Smalltalk", "SML", "Strongtalk", "Snap!", "SNOBOL", "Snowball", "SOL", "Solidity", "SOPHAEROS", "Source", "SPARK", "Speakeasy", "Speedcode", "SPIN", "SP/k", "SPL", "SPS", "SQL", "SQR", "Squeak", "Squirrel", "SR", "S/SL", "Starlogo", "Strand", "Stata", "Stateflow", "Subtext", "SBL", "SuperCollider", "Superplan", "SuperTalk", "Swift", "Swift", "SYMPL", "T", "TACL", "TADS", "TAL", "Tcl", "Tea", "TECO", "TELCOMP", "TeX", "TEX", "TIE", "TMG", "Tom", "Toi", "Topspeed", "TPU", "Trac", "TTM", "T-SQL", "Transcript", "TTCN", "Turing", "TUTOR", "TXL", "TypeScript", "Tynker", "Ubercode", "UCSD Pascal", "Umple", "Unicon", "Uniface", "UNITY", "UnrealScript", "V", "Vala", "Verse", "Vim script", "Viper", "Visual DataFlex", "Visual DialogScript", "Visual FoxPro", "Visual J++", "Visual LISP", "Visual Objects", "Visual Prolog", "WATFIV, WATFOR", "WebAssembly", "WebDNA", "Whiley", "Winbatch", "Wolfram Language", "Wyvern", "X++", "X10", "xBase++", "XBL", "XC", "xHarbour", "XL", "Xojo", "XOTcl", "Xod", "XPL", "XPL0", "XQuery", "XSB", "XSLT", "Xtend", "Yorick", "YQL", "Z++", "Z shell", "Zebra, ZPL, ZPL2", "ZetaLisp", "Zig", "Zonnon", "ZOPL", "ZPL" ].map(w=>w.toLowerCase());

/**
 * seperate words by: space | new line | punctuation followed by a space
*/
export function getWords(txt: string) {
    const words = txt.match(/[^( |\n|(.|?|!|,) )]+/g) || [];
    // Change all to lower-case (for comparison)
    const uncasedWords = words.map((w) => w.toLowerCase());
    return uncasedWords;
};

/**
 * @param words
 * @param min
 * @returns sorted map of words w' # occurences
 */
export function getWordOccurences(words: string[], min=1): WordOccurences {
    // Filter undesired words
    const desiredWords = words
        .filter(w => w.length > min)                    // no singular chars
        .filter(w => commonWords.indexOf(w)===-1)       // no common words

    console.log("# desired words = ", desiredWords.length);

    // Turn it into a map of { word : occurences }
    const map: WordOccurences = [];
    desiredWords.forEach((w) => {
        const i = map.findIndex(item=>item[0]===w)
        if(i === -1) map.push([w, 1])   // new word
        else map[i][1] ++;     // existing word
    });

    console.log("# unique words = ", map.length);

    // Remove words with only 1 occurence
    const overMin = map.filter(item=>item[1] >= min);

    // Sort by highest # occurences
    const sortedEntries = overMin.sort((a, b) => b[1] - a[1]);

    console.log("Final # entries = ", sortedEntries.length);

    return sortedEntries as WordOccurences;
};

export function findProgrammingLanguages(wordList: string[], uncased=true) {
    return wordList.filter(w=>language_list.indexOf(w) !== -1);
};