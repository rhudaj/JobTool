import "./index.css";
import ReactDOM from "react-dom/client";
import * as Sections from "./sections";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";

const tabs = [
    {
        name: "Resume Builder",
        content: <Sections.ResumeBuilder />,
    },
    // {
    //     name: "Letter",
    //     content: <Sections.CLBuilder/>,
    // },
    {
        name: "Job Analyze",
        content: <Sections.JobAnalyze />,
    },
];


function App() {
    return (
        <div className="grid grid-rows-[min-content_1fr] bg-[#282c34]">
            <div id="app-header" className="text-3xl border-b-2 border-black p-4 pl-8 text-white">
                <h1 className="">Job Tool</h1>
            </div>
            {/* SIDE-MENU : SECTION CONTAINER */}
            <TabGroup className="flex">
                <TabList id="side-menu" className="grid grid-rows-[min-content] grid-cols-[max-content] text-1.5xl p-4 gap-5">
                    {tabs.map((tab) => (
                        // MENU ITEM
                        <Tab
                            as="div"
                            key={tab.name}
                            className="p-2em border-b border-gray-500 hover:scale-100 hover:text-white active:text-white font-bold"
                        >
                            {tab.name}
                        </Tab>
                    ))}
                </TabList>
                <TabPanels
                    id="section-container"
                    className="h-full overflow-y-scroll bg-[#868686]"
                >
                    {tabs.map((tab) => (
                        <TabPanel>{tab.content}</TabPanel>
                    ))}
                </TabPanels>
            </TabGroup>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
