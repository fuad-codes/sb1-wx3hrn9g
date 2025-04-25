"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PencilIcon, Eye, Trash2, ArrowUpDown } from "lucide-react"
import Link from "next/link"
import type { ProfitRecord } from "../api/interfaces"

const mockProfits: ProfitRecord[] = [
  {
    id: "PRF001",
    month: "March",
    year: 2024,
    total_income: 50000,
    total_expenses: 30000,
    net_profit: 20000,
    details: {
      income_breakdown: {
        trips: 45000,
        rental: 3000,
        other: 2000
      },
      expense_breakdown: {
        maintenance: 10000,
        fuel: 8000,
        salary: 5000,
        visa: 2000,
        insurance: 3000,
        other: 2000
      }
    }
  }
]

export function ProfitMaster() {
  const [records, setRecords] = useState<ProfitRecord[]>(mockProfits)
  const [filterYear, setFilterYear] = useState("")
  const [sortByProfit, setSortByProfit] = useState(false)

  const totalProfit = records.reduce((sum, record) => sum + record.net_profit, 0)
  const averageProfit = totalProfit / records.length

  const filteredRecords = records
    .filter(record =>
      record.year.toString().includes(filterYear)
    )
    .sort((a, b) => {
      if (sortByProfit) {
        return b.net_profit - a.net_profit
      }
      return 0
    })

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalProfit.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Monthly Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${averageProfit.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profit Records</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-4 mt-4">
            <Input
              placeholder="Filter by year"
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full sm:max-w-xs"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Total Income</TableHead>
                <TableHead>Total Expenses</TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => setSortByProfit(!sortByProfit)}
                >
                  Net Profit
                  <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.month}</TableCell>
                  <TableCell>{record.year}</TableCell>
                  <TableCell>${record.total_income.toFixed(2)}</TableCell>
                  <TableCell>${record.total_expenses.toFixed(2)}</TableCell>
                  <TableCell>${record.net_profit.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/accounts/profit-master/edit/${record.id}`}>
                          <PencilIcon className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}