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
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts"
import { fetchApi } from "@/lib/utils"

interface AdvanceRecord {
  id: string
  date: string
  employee_name: string
  amount: number
  purpose: string
  trip_id?: string
  payment_method: 'cash' | 'bank' | 'cheque'
  reference_no?: string
  status: 'pending' | 'recovered' | 'partially_recovered'
  recovered_amount: number
  remaining_amount: number
}

export function AdvancePaid() {
  const [records, setRecords] = useState<AdvanceRecord[]>([
    {
      id: "ADV001",
      date: "2024-03-15",
      employee_name: "John Doe",
      amount: 500,
      purpose: "Trip expenses",
      trip_id: "TR-156",
      payment_method: "cash",
      reference_no: "REF-A001",
      status: "recovered",
      recovered_amount: 500,
      remaining_amount: 0
    },
    {
      id: "ADV002",
      date: "2024-03-20",
      employee_name: "Mike Johnson",
      amount: 1000,
      purpose: "Personal advance",
      payment_method: "bank",
      reference_no: "REF-A002",
      status: "partially_recovered",
      recovered_amount: 400,
      remaining_amount: 600
    },
    {
      id: "ADV003",
      date: "2024-03-25",
      employee_name: "Sarah Wilson",
      amount: 800,
      purpose: "Trip expenses",
      trip_id: "TR-158",
      payment_method: "cash",
      status: "pending",
      recovered_amount: 0,
      remaining_amount: 800
    }
  ])
  const [filterEmployee, setFilterEmployee] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [sortByAmount, setSortByAmount] = useState(false)
  const [employees, setEmployees] = useState<{employee: string, refered_as: string}[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const data = await fetchApi('/drivers')
      setEmployees(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching employees:', error)
      setEmployees([])
    } finally {
      setLoading(false)
    }
  }

  const totalAdvance = records.reduce((sum, record) => sum + record.amount, 0)
  const totalRecovered = records.reduce((sum, record) => sum + record.recovered_amount, 0)
  const totalOutstanding = records.reduce((sum, record) => sum + record.remaining_amount, 0)

  const filteredRecords = records
    .filter(record => {
      const employeeMatch = record.employee_name.toLowerCase().includes(filterEmployee.toLowerCase())
      const statusMatch = filterStatus === "all" || record.status === filterStatus
      const dateMatch = !dateRange.from || !dateRange.to || 
        (new Date(record.date) >= dateRange.from && new Date(record.date) <= dateRange.to)
      return employeeMatch && statusMatch && dateMatch
    })
    .sort((a, b) => {
      if (sortByAmount) {
        return b.amount - a.amount
      }
      return 0
    })

  // Prepare data for charts
  const employeeAdvanceData = employees.map(emp => {
    const employeeRecords = records.filter(r => r.employee_name === emp.employee)
    const totalAmount = employeeRecords.reduce((sum, r) => sum + r.amount, 0)
    const recoveredAmount = employeeRecords.reduce((sum, r) => sum + r.recovered_amount, 0)
    const remainingAmount = employeeRecords.reduce((sum, r) => sum + r.remaining_amount, 0)
    
    return {
      name: emp.refered_as || emp.employee,
      total: totalAmount,
      recovered: recoveredAmount,
      remaining: remainingAmount
    }
  }).filter(data => data.total > 0).slice(0, 5) // Top 5 employees with advances

  const statusData = [
    {
      name: "Recovered",
      value: records.filter(r => r.status === "recovered").reduce((sum, r) => sum + r.amount, 0)
    },
    {
      name: "Partially Recovered",
      value: records.filter(r => r.status === "partially_recovered").reduce((sum, r) => sum + r.amount, 0)
    },
    {
      name: "Pending",
      value: records.filter(r => r.status === "pending").reduce((sum, r) => sum + r.amount, 0)
    }
  ]

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Advance Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalAdvance.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recovered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRecovered.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalOutstanding.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Employees with Advances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={employeeAdvanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, '']} />
                  <Legend />
                  <Bar dataKey="total" name="Total Advance" fill="#8884d8" />
                  <Bar dataKey="recovered" name="Recovered" fill="#82ca9d" />
                  <Bar dataKey="remaining" name="Remaining" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Advance Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, '']} />
                  <Bar dataKey="value" name="Amount" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Advance Payment Records</CardTitle>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center mt-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
              <Input
                placeholder="Filter by employee"
                value={filterEmployee}
                onChange={(e) => setFilterEmployee(e.target.value)}
                className="w-full sm:max-w-xs"
              />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="partially_recovered">Partially Recovered</SelectItem>
                  <SelectItem value="recovered">Recovered</SelectItem>
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
                <TableHead>Date</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => setSortByAmount(!sortByAmount)}
                >
                  Amount
                  <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                </TableHead>
                <TableHead>Recovered</TableHead>
                <TableHead>Remaining</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Method</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>{record.employee_name}</TableCell>
                  <TableCell>{record.purpose}</TableCell>
                  <TableCell>${record.amount.toFixed(2)}</TableCell>
                  <TableCell>${record.recovered_amount.toFixed(2)}</TableCell>
                  <TableCell>${record.remaining_amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      record.status === 'recovered' ? 'bg-green-100 text-green-800' :
                      record.status === 'partially_recovered' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {record.status.replace('_', ' ')}
                    </span>
                  </TableCell>
                  <TableCell className="capitalize">{record.payment_method}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}