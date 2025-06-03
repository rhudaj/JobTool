import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome to your job application toolkit
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Resume Builder</CardTitle>
            <CardDescription>
              Create and customize your professional resume
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/resume">
              <Button className="w-full">Open Resume Builder</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Job Analyze</CardTitle>
            <CardDescription>
              Analyze job postings and get AI insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/jobs">
              <Button className="w-full">Analyze Jobs</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cover Letter Builder</CardTitle>
            <CardDescription>
              Generate tailored cover letters (Coming Soon)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
