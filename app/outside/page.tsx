"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Plus } from "lucide-react"
import Link from "next/link"
import { Owners } from "./owners"
import { Trucks } from "./trucks"
import { Trailers } from "./trailers"
import { Drivers } from "./drivers"

export default function OutsidePage() {
  const [selectedTab, setSelectedTab] = useState("owners")

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <h2 className="text-3xl font-bold tracking-tight">Outside Management</h2>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Records
          </Button>
          <Button asChild>
            <Link href={`/outside/${selectedTab}/add`}>
              <Plus className="mr-2 h-4 w-4" />
              Add {selectedTab.slice(0, -1)}
            </Link>
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="owners">Owners</TabsTrigger>
          <TabsTrigger value="trucks">Trucks</TabsTrigger>
          <TabsTrigger value="trailers">Trailers</TabsTrigger>
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
        </TabsList>

        <TabsContent value="owners">
          <Owners />
        </TabsContent>

        <TabsContent value="trucks">
          <Trucks />
        </TabsContent>

        <TabsContent value="trailers">
          <Trailers />
        </TabsContent>

        <TabsContent value="drivers">
          <Drivers />
        </TabsContent>
      </Tabs>
    </div>
  )
}