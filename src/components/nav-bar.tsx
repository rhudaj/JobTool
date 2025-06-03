"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface NavBarProps {
  user?: { name: string; email: string }
  className?: string
}

export function NavBar({ user, className }: NavBarProps) {
  const pathname = usePathname()

  const navigation = [
    { name: "Resume Builder", href: "/resume" },
    { name: "Cover Letter", href: "/cover-letter" },
    { name: "Job Analyze", href: "/job-analyze" },
  ]

  return (
    <nav className="bg-[#282c34] border-b-2 border-black p-4 pl-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl text-white font-bold">Job Tool</h1>
        <div className="flex gap-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "px-4 py-2 rounded-md text-lg font-medium transition-colors",
                pathname === item.href
                  ? "bg-white text-[#282c34]"
                  : "text-white hover:bg-white/20"
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
