import { NavBar } from "@/components/nav-bar"

export default function AuthProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // For now, no auth check - but the structure is ready for future auth implementation

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <NavBar />
      <div className="flex-1 overflow-y-auto flex flex-col">{children}</div>
    </div>
  )
}
