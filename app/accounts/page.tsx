"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Plus } from "lucide-react"
import Link from "next/link"
import { Income } from "./income"
import { Expenses } from "./expenses"
import { ProfitMaster } from "./profit-master"
import { InvestorShare } from "./investor-share"
import { TIRSold } from "./tir-sold"

export default function AccountsPage() {
  const [selectedTab, setSelectedTab] = useState("income")

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <h2 className="text-3xl font-bold tracking-tight">Accounts Management</h2>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Records
          </Button>
          <Button asChild>
            <Link href={`/accounts/${selectedTab}/add`}>
              <Plus className="mr-2 h-4 w-4" />
              Add Record
            </Link>
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="profit-master">Profit Master</TabsTrigger>
          <TabsTrigger value="investor-share">Investor Share</TabsTrigger>
          <TabsTrigger value="tir-sold">TIR Sold</TabsTrigger>
        </TabsList>

        <TabsContent value="income">
          <Income />
        </TabsContent>

        <TabsContent value="expenses">
          <Expenses />
        </TabsContent>

        <TabsContent value="profit-master">
          <ProfitMaster />
        </TabsContent>

        <TabsContent value="investor-share">
          <InvestorShare />
        </TabsContent>

        <TabsContent value="tir-sold">
          <TIRSold />
        </TabsContent>
      </Tabs>
    </div>
  )
}