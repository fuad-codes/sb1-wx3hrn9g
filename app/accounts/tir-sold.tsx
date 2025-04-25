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
import type { TIRSoldRecord } from "../api/interfaces"

const mockTIRSold: TIRSoldRecord[] = [
  {
    id: "TIRS001",
    tir_number: "TIR123456",
    date: "2024-03-20",
    buy_price: 1000,
    sell_price: 1500,
    profit: 500,
    buyer: "ABC Transport",
    payment_method: "bank",
    payment_status: "completed",
    reference_no: "REF-001",
    remarks: "Regular sale"
  }
]

export function TIRSold() {
  const [records, setRecords] = useState<TIRSoldRecord[]>(mockTIRSold)
  const [filterTIR, setFilterTIR] = useState("")
  const [sortByProfit, setSortByProfit] = useState(false)

  const totalProfit = records.reduce((sum, record) => sum + record.profit, 0)
  const pendingPayments = records
    .filter(r => r.payment_status === 'pending')
    .reduce((sum, record) => sum + record.sell_price, 0)

  const filteredRecords = records
    .filter(record =>
      record.tir_number.toLowerCase().includes(filterTIR.toLowerCase()) ||
      record.buyer.toLowerCase().includes(filterTIR.toLowerCase())
    )
    .sort((a, b) => {
      if (sortByProfit) {
        return b.profit - a.profit
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
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${pendingPayments.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>TIR Sales Records</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-4 mt-4">
            <Input
              placeholder="Search by TIR number or buyer"
              value={filterTIR}
              onChange={(e) => setFilterTIR(e.target.value)}
              className="w-full sm:max-w-xs"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>TIR Number</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Buy Price</TableHead>
                <TableHead>Sell Price</TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => setSortByProfit(!sortByProfit)}
                >
                  Profit
                  <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                </TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.tir_number}</TableCell>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>${record.buy_price.toFixed(2)}</TableCell>
                  <TableCell>${record.sell_price.toFixed(2)}</TableCell>
                  <TableCell>${record.profit.toFixed(2)}</TableCell>
                  <TableCell>{record.buyer}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      record.payment_status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {record.payment_status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/accounts/tir-sold/edit/${record.id}`}>
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