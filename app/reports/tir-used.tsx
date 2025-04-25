"use client"

import { useState, useEffect } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { ArrowUpDown, Download, FileText, Printer } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Pie, PieChart, Cell } from "recharts"
import { fetchApi } from "@/lib/utils"

interface TIRUsedRecord {
  id: string
  tir_number: string
  date_used: string
  truck_number: string
  driver_name: string
  trip_id: string
  destination: string
  customs_office: string
  status: 'active' | 'completed' | 'cancelled'
  remarks?: string
}

export function TirUsed() {
  const [records, setRecords] = useState<TIRUsedRecord[]>([
    {
      id: "TIRU001",
      tir_number: "TIR123456",
      date_used: "2024-03-15",
      truck_number: "T-001",
      driver_name: "John Doe",
      trip_id: "TR-156",
      destination: "Muscat, Oman",
      customs_office: "Dubai Customs",
      status: "completed",
      remarks: "Used for regular delivery"
    },
    {
      id: "TIRU002",
      tir_number: "TIR789012",
      date_used: "2024-03-18",
      truck_number: "T-002",
      driver_name: "Mike Johnson",
      trip_id: "TR-157",
      destination: "Riyadh, Saudi Arabia",
      customs_office: "Dubai Customs",
      status: "active",
      remarks: "In transit"
    },
    {
      id: "TIRU003",
      tir_number: "TIR345678",
      date_used: "2024-03-22",
      truck_number: "T-003",
      driver_name: "Sarah Wilson",
      trip_id: "TR-159",
      destination: "Doha, Qatar",
      customs_office: "Abu Dhabi Customs",
      status: "completed"
    },
    {
      id: "TIRU004",
      tir_number: "TIR901234",
      date_used: "2024-03-25",
      truck_number: "T-001",
      driver_name: "John Doe",
      trip_id: "TR-160",
      destination: "Kuwait City, Kuwait",
      customs_office: "Dubai Customs",
      status: "cancelled",
      remarks: "Trip cancelled due to weather"
    }
  ])
  const [filterTIR, setFilterTIR] = useState("")
  const [filterDestination, setFilterDestination] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [sortByDate, setSortByDate] = useState(false)
  const [loading, setLoading] = useState(false)

  const totalTIRs = records.length
  const activeTIRs = records.filter(r => r.status === 'active').length
  const completedTIRs = records.filter(r => r.status === 'completed').length
  const cancelledTIRs = records.filter(r => r.status === 'cancelled').length

  const filteredRecords = records
    .filter(record => {
      const tirMatch = record.tir_number.toLowerCase().includes(filterTIR.toLowerCase())
      const destinationMatch = record.destination.toLowerCase().includes(filterDestination.toLowerCase())
      const statusMatch = filterStatus === "all" || record.status === filterStatus
      const dateMatch = !dateRange.from || !dateRange.to || 
        (new Date(record.date_used) >= dateRange.from && new Date(record.date_used) <= dateRange.to)
      return tirMatch && destinationMatch && statusMatch && dateMatch
    })
    .sort((a, b) => {
      if (sortByDate) {
        return new Date(b.date_used).getTime() - new Date(a.date_used).getTime()
      }
      return 0
    })

  // Prepare data for charts
  const destinationData = Array.from(
    records.reduce((acc, record) => {
      const country = record.destination.split(',')[1]?.trim() || record.destination.split(',')[0]?.trim()
      acc.set(country, (acc.get(country) || 0) + 1)
      return acc
    }, new Map<string, number>())
  ).map(([name, value]) => ({ name, value }))

  const statusData = [
    { name: "Active", value: activeTIRs },
    { name: "Completed", value: completedTIRs },
    { name: "Cancelled", value: cancelledTIRs }
  ]

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  // Monthly TIR usage
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(2024, i, 1).toLocaleString('default', { month: 'short' })
    const monthRecords = records.filter(r => {
      const recordDate = new Date(r.date_used)
      return recordDate.getMonth() === i && recordDate.getFullYear() === 2024
    })
    
    return {
      name: month,
      count: monthRecords.length
    }
  })

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total TIRs Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTIRs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active TIRs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTIRs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed TIRs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTIRs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled TIRs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cancelledTIRs}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>TIR Usage by Destination</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={destinationData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {destinationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} TIRs`, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Monthly TIR Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} TIRs`, 'Count']} />
                  <Legend />
                  <Bar dataKey="count" name="TIRs Used" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>TIR Usage Records</CardTitle>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center mt-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
              <Input
                placeholder="Filter by TIR number"
                value={filterTIR}
                onChange={(e) => setFilterTIR(e.target.value)}
                className="w-full sm:max-w-xs"
              />
              <Input
                placeholder="Filter by destination"
                value={filterDestination}
                onChange={(e) => setFilterDestination(e.target.value)}
                className="w-full sm:max-w-xs"
              />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <DateRangePicker
                value={dateRange}
                onValueChange={setDateRange}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>TIR Number</TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => setSortByDate(!sortByDate)}
                >
                  Date Used
                  <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                </TableHead>
                <TableHead>Truck</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Trip ID</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Customs Office</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.tir_number}</TableCell>
                  <TableCell>{record.date_used}</TableCell>
                  <TableCell>{record.truck_number}</TableCell>
                  <TableCell>{record.driver_name}</TableCell>
                  <TableCell>{record.trip_id}</TableCell>
                  <TableCell>{record.destination}</TableCell>
                  <TableCell>{record.customs_office}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      record.status === 'completed' ? 'bg-green-100 text-green-800' :
                      record.status === 'active' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {record.status}
                    </span>
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