import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SalaryPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Salary Management</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Salary Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              View and manage salary information for your organization.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}