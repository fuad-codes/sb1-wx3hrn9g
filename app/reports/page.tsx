"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText, Printer, BarChart3 } from "lucide-react"
import { AdvancePaid } from "./advance-paid"
import { DieselExpense } from "./diesel-expense"
import { TirUsed } from "./tir-used"

export default function ReportsPage() {
  const [selectedTab, setSelectedTab] = useState("advance-paid")

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <h2 className="text-3xl font-bold tracking-tight">Reports & Analytics</h2>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Reports
          </Button>
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print Reports
          </Button>
          <Button>
            <BarChart3 className="mr-2 h-4 w-4" />
            Generate Analytics
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reports Overview</CardTitle>
          <CardDescription>
            Comprehensive reports and analytics for your business operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Select a report type from the tabs below to view detailed information and analytics.
            You can export or print reports for your records.
          </p>
        </CardContent>
      </Card>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="advance-paid">Advance Paid</TabsTrigger>
          <TabsTrigger value="diesel-expense">Diesel Expense</TabsTrigger>
          <TabsTrigger value="tir-used">TIR Used</TabsTrigger>
        </TabsList>

        <TabsContent value="advance-paid">
          <AdvancePaid />
        </TabsContent>

        <TabsContent value="diesel-expense">
          <DieselExpense />
        </TabsContent>

        <TabsContent value="tir-used">
          <TirUsed />
        </TabsContent>
      </Tabs>
    </div>
  )
}