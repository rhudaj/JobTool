"use client"

import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import JobAnalyze from "@/components/JobAnalyze/JobAnalyze"

export default function JobAnalyzePage() {
  return (
    <div className="h-full">
      <DndProvider backend={HTML5Backend}>
        <JobAnalyze />
      </DndProvider>
    </div>
  )
}
