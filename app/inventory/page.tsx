"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Plus } from "lucide-react"
import Link from "next/link"
import { TIR } from "./tir"
import { Parts } from "./parts"

export default function InventoryPage() {
  const [selectedTab, setSelectedTab] = useState("tir")

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <h2 className="text-3xl font-bold tracking-tight">Inventory Management</h2>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Records
          </Button>
          <Button asChild>
            <Link href={`/inventory/${selectedTab}/add`}>
              <Plus className="mr-2 h-4 w-4" />
              Add {selectedTab === "tir" ? "TIR" : "Part"}
            </Link>
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="tir">TIR</TabsTrigger>
          <TabsTrigger value="parts">Parts</TabsTrigger>
        </TabsList>

        <TabsContent value="tir">
          <TIR />
        </TabsContent>

        <TabsContent value="parts">
          <Parts />
        </TabsContent>
      </Tabs>
    </div>
  )
}