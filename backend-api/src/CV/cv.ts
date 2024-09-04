import { CV } from "shared";

export let cv: CV = {
    "personalTitle": "Software Developer",
    "summary": "Dynamic, agile software full-stack software developer with rapid adaptability to emerging technologies, a keen aptitude for grasping intricate concepts and solving problems with automation and data science.",
    "languages": ["Python", "SQL", "JavaScript", "TypeScript", "C++", "C", "HTML", "CSS"],
    "technologies": ["ReactJS", "NodeJS", "Git", "Alteryx", "SQL Server", "MySQL", "Numpy/Pandas/Selenium", "Excel"],
    "courses": ["Databases", "UI", "Networks", "Algorithms"],
    "links": [
        {
            "icon": "Globe",
            "text": "roman-hudaj.com",
            "url": "https://github.com/rhudaj"
        },
        {
            "icon": "Github",
            "text": "github.com/rhudaj",
            "url": "https://github.com/rhudaj"
        },
        {
            "icon": "Envelope",
            "text": "rhudaj@uwaterloo.ca",
            "url": "mailto:rhudaj@uwaterloo.ca"
        },
        {
            "icon": "Linkedin",
            "text": "/in/rhudaj",
            "url": "https://www.linkedin.com/rhudaj"
        }
    ],
    "experiences": [
        {
            "date_range": "4/23 - 9/23",
            "title": "Software Product Management Intern",
            "company": "Environics Analytics",
            "bulletPoints": [
                "Developed an automated pipeline with Alteryx and the API of an AI model to parse and translate data product documents and variable lists to French, resulting in savings of tens of thousands per product.",
                "Created a user-friendly app with Python/QT to extract client usage data of company products from databases; provided ease of data access and analysis by non-technical teams.",
                "Enhanced databases to monitor client usage of products/APIs to formulate an optimized product pricing strategy and ultimately increase profitability and user satisfaction."
            ],
            "tech": ["SQL", "Alteryx", "Python", "Azure"]
        },
        {
            "date_range": "5/24 - 9/24",
            "title": "Product Assistant",
            "company": "Timeplay",
            "bulletPoints": [
                "Improved UI for lottery and instant-win games using React and TypeScript, supporting the rollout of a gaming platform on cruise ships from inception to deployment.",
                "Optimized data structures and improved frontend tools for admin management on cruise ships, reducing data redundancy and enhancing usability based on client feedback.",
                "Prioritized and deployed new game features through Jira, coordinating with stakeholders to ensure timely updates, which led to a 30% increase in game engagement."
            ],
            "tech": ["Jira", "Node.js", "Docker", "React"]
        },
        {
            "date_range": "1/22 - 8/22",
            "title": "Student Engineer",
            "company": "Martinrea",
            "bulletPoints": [
                "Spearheaded a major project to optimize the flow of materials across a large facility; improved system for collecting and analyzing data to plan the project; resulted in increased output and cost efficiency.",
                "Implemented a supply chain tracking system using SQL and advanced Excel for proactive identification of issues, enabling timely alerts to managers and achieving estimated $11,000 annual cost savings."
            ],
            "tech": ["SQL", "Excel"]
        }

    ],
    "projects": [
        {
            "date_range": "5/24 - Pres",
            "title": "Automated Restaurant Reservation Business",
            "url": "https://github.com/rhudaj/Automated-Job-Applications",
            "description": "Created a fully automated reservation system using TypeScript and Node.js through API requests, to secure hard-to-get reservations at world-popular restaurants for clients generating $X,XXX a month // Deployed the project on Google Cloud, utilizing Scheduler for automated tasks, Firestore for managing data, and cloud storage for transaction and listing records, ensuring a scalable and reliable system.",
            "tech": ["TypeScript", "Node", "Google Cloud"]
        },
        {
            "date_range": "5/23 - 7/23",
            "title": "Database Interface App",
            "url": "github.com/rhudaj/DatabaseInterfaceApp",
            "description": "Created a efficient, user-friendly app to interact with a database featuring: Connection to any specified database via ODBC // Intuitive UI for table selection and data filtering, dynamically generated in real-time by efficiently handling of millions of records via Pandas, optimized display algorithms and batch querying // crash-safe via multi-threading // MVC architecture.",
            "tech": ["Python", "SQL"]
        },
        {
            "date_range": "1/24 - 4/24",
            "title": "Voice-to-Instrument Translator",
            "url": "https://github.com/rhudaj/Real-Time-Voice-to-Instrument-Translator",
            "description": "Developed an app enabling real-time translation of human voice into various musical instruments // Utilized Python (Numpy) to implement  advanced probabilistic algorithms for detecting: pitch, tempo and note-onsets // Exposed the backend as a REST API to integrate with a GUI built with React.",
            "tech": ["Python", "React"]
        }
    ]
}
