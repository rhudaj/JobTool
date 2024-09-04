%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% This class originates from: http://www.LaTeXTemplates.com, by Omar Roldan
%----------------------------------------------------------------------------------------
%	CLASS CONFIGURATION
%----------------------------------------------------------------------------------------

\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{developercv}[2023/10/12 Developer CV class v2.0]

\DeclareOption*{\PassOptionsToClass{\CurrentOption}{extarticle}} % Pass through any options to the base class
\ProcessOptions\relax % Process given options

\LoadClass{extarticle} % Load the base class

%----------------------------------------------------------------------------------------
%	PACKAGES AND OTHER DOCUMENT CONFIGURATIONS
%----------------------------------------------------------------------------------------

\setlength{\parindent}{0mm} % Suppress paragraph indentation

\usepackage[hidelinks]{hyperref} % Required for links but hide the default boxes around links

\pagestyle{empty} % No headers or footers

\usepackage{moresize} % Provides more font size commands (\HUGE and \ssmall)
\usepackage{enumitem}
\usepackage{xparse}


\usepackage{listofitems}


%----------------------------------------------------------------------------------------
%	PAGE LAYOUT
%----------------------------------------------------------------------------------------

\usepackage{geometry} % Required for adjusting page dimensions and margins

\geometry{
	paper=a4paper, % Paper size, change to letterpaper for US letter size
	top=1.45cm, % Top margin        (*** WAS 1.6 ***)
	bottom=1.45cm, % Bottom margin  (*** WAS 1.6 ***)
	left=1.6cm, % Left margin
	right=1.6cm, % Right margin
	headheight=0.75cm, % Header height
	footskip=1cm, % Space from the bottom margin to the baseline of the footer
	headsep=0.5cm, % Space from the top margin to the baseline of the header
	%showframe, % Uncomment to show how the type block is set on the page
}

\def\topSpace{-12pt}
\def\halfTopSpace{-6pt}

%----------------------------------------------------------------------------------------
%	FONTS
%----------------------------------------------------------------------------------------

\usepackage[utf8]{inputenc} % Required for inputting international characters
\usepackage[T1]{fontenc} % Output font encoding for international characters

\usepackage[default]{raleway}
%\usepackage[defaultsans]{droidsans}
%\usepackage{cmbright}

\renewcommand*\familydefault{\sfdefault} % Force the sans-serif version of any font used

%------------------------------------------------

\usepackage{fontawesome} % Required for FontAwesome icons

% Command to output an icon in a black square box with text to the right
\newcommand{\icon}[3]{% The first parameter is the FontAwesome icon name, the second is the box size and the third is the text
	\vcenteredhbox{\colorbox{white}{\makebox(#2, #2){\textcolor{black}{\Large\csname fa#1\endcsname}}}}% Icon and box
	\hspace{0.1cm}% Whitespace
	\vcenteredhbox{\textcolor{black}{#3}}% Text
}

%----------------------------------------------------------------------------------------
%	GRAPHICS DEFINITIONS
%---------------------------------------------------------------------------------------- 

\usepackage{tikz} % Required for creating the plots
\usetikzlibrary{shapes, backgrounds}
\tikzset{x=1cm, y=1cm} % Default tikz units

% Command to vertically centre adjacent content
\newcommand{\vcenteredhbox}[1]{% The only parameter is for the content to centre
	\begingroup%
		\setbox0=\hbox{#1}\parbox{\wd0}{\box0}%
	\endgroup%
}

%----------------------------------------------------------------------------------------
%	CUSTOM SECTIONS
%----------------------------------------------------------------------------------------
\def\Vhrulefill{\leavevmode\leaders\hrule height 0.7ex depth \dimexpr0.4pt-0.7ex\hfill\kern0pt}

% Command to output section title headings
\newcommand{\cvsect}[1]{% The only parameter is the section text
    % \vspace{\baselineskip} % Whitespace before the section title % *** COMMENTED OUT 
    \textcolor{black}{ \MakeUppercase{\textbf{#1}}} \hspace{4pt} \Vhrulefill \\% Section title
}

%----------------------------------------------------------------------------------------
%	LINKS
%----------------------------------------------------------------------------------------

% #1: box-size
% #2: obect with the type { {<icon name>} {<display text>} {<url>}
\newcommand{\customLink}[2]{
    \begingroup % keeps the temp macro def'n (\tempIcon) inside this group.
        \def\tempIcon##1##2##3{%
            \IconTextLink{#1}{##1}{##2}{##3}%
        }%
        \expandafter\expandafter\expandafter\tempIcon\expandafter#2%    \\ extracting the 3 components and passing them to \tempIcon
    \endgroup
}

% Create a link with icon and display text
%   #0: box-size
%   #1: icon
%   #2: display text
%   #3: url 
\newcommand{\IconTextLink}[4] {
    \icon{#2}{#1}{\href{#4}{#3}}
}


%----------------------------------------------------------------------------------------
%	ENTRY LISTS
%----------------------------------------------------------------------------------------

\usepackage{longtable} % Required for tables that span multiple pages
\setlength{\LTpre}{0pt} % Remove default whitespace before longtable
\setlength{\LTpost}{0pt} % Remove default whitespace after longtable

\setlength{\tabcolsep}{0pt} % No spacing between table columns

% Environment to hold a new list of entries
\newenvironment{entrylist}{
	\begin{longtable}[H]{l l}
}{
	\end{longtable}
}

% #1: leftmost date(s) text
% #2: the bold entry heading 
% #3: the bold right-aligned entry qualifier
% #4: the entry description
\newcommand{\entry}[4]{
	\parbox[t]{0.12\textwidth}{ % 17.5% of the text width of the page
	   \small #1 % Leftmost entry date(s) text
	} % *** I REMOVED AN '&' FROM THE START OF THE NEXT LINE
	\parbox[t]{0.88\textwidth}{% 82.5% of the text width of the page
		\textbf{#2}% Entry heading text
		\hfill% Horizontal whitespace
		{\footnotesize \textbf{\textcolor{black}{#3}}}\\% Right-aligned entry qualifier text
		#4 % Entry description text
	}\\\\}
 
% Define the command to handle an unknown number of arguments
\newcommand{\TechUsedList}[1]{
    \setsepchar{,}  % seperator for \mylist
    \readlist*\mylist{#1} % star option removes surrounding whitespace
    \foreachitem \x \in \mylist[]{
        \ifnum \xcnt=1 {}
        \else {/}
        \fi \texttt{\x}
    }
}

%custom bulet point list
\newenvironment{customItemize}
{\begin{list}{\scalebox{.5}{$\bullet$}}{
\itemsep=3pt
\topsep=3pt
\parsep=0pt
\partopsep=0pt
\leftmargin=0pt
}}{\end{list}}


% #1: date
% #2: Title
% #3: Company
% #4: Bullet Points
% #5: technology used
\newcommand{\ExperienceEntry}[5]{
    \entry
        {#1}    % date
        {#2}    % title
        {#3}    % company 
        {
            \vspace{\topSpace}
            \begin{list}{\scalebox{.5}{$\bullet$}} {
                    \itemsep=3pt
                    \topsep=3pt
                    \parsep=0pt
                    \partopsep=0pt
                    \leftmargin=0pt
                }
            \ProcessList{#4}{\item }
            \end{list}
            \TechUsedList{#5}
        }        
}

% #1: date
% #2: Title
% #3: Link
% #4: Description
\newcommand{\ProjectEntry}[5]{
    \entry
        {#1}
        {#2}
        {\hyperlink{#3}{\icon{Link}{11}}}
        {
            {#4} 
            \vspace{3pt}\\
            \TechUsedList{#5}
        }    
}



% ExperienceEntry list
\newcommand{\ExperienceList}[1]{%
    \foreach \x in #1{%
        \\
        \expandafter\ExperienceEntry \x
    }%
}

% ProjectEntry list
\newcommand{\ProjectList}[1]{%
    \foreach \x in #1{%
        \\ 
        \expandafter\ProjectEntry \x %
    }%
}
