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
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Pie, PieChart, Cell } from "recharts"
import { fetchApi } from "@/lib/utils"

interface DieselRecord {
  id: string
  date: string
  truck_number: string
  driver_name: string
  quantity: number
  price_per_liter: number
  total_amount: number
  location: string
  trip_id?: string
  payment_method: 'cash' | 'bank' | 'card'
  reference_no?: string
}

export function DieselExpense() {
  const [records, setRecords] = useState<DieselRecord[]>([
    {
      id: "DSL001",
      date: "2024-03-15",
      truck_number: "T-001",
      driver_name: "John Doe",
      quantity: 150,
      price_per_liter: 2.5,
      total_amount: 375,
      location: "Dubai",
      trip_id: "TR-156",
      payment_method: "card",
      reference_no: "REF-D001"
    },
    {
      id: "DSL002",
      date: "2024-03-18",
      truck_number: "T-002",
      driver_name: "Mike Johnson",
      quantity: 180,
      price_per_liter: 2.5,
      total_amount: 450,
      location: "Abu Dhabi",
      trip_id: "TR-157",
      payment_method: "cash"
    },
    {
      id: "DSL003",
      date: "2024-03-22",
      truck_number: "T-001",
      driver_name: "John Doe",
      quantity: 120,
      price_per_liter: 2.6,
      total_amount: 312,
      location: "Sharjah",
      trip_id: "TR-159",
      payment_method: "card",
      reference_no: "REF-D003"
    },
    {
      id: "DSL004",
      date: "2024-03-25",
      truck_number: "T-003",
      driver_name: "Sarah Wilson",
      quantity: 200,
      price_per_liter: 2.5,
      total_amount: 500,
      location: "Dubai",
      trip_id: "TR-160",
      payment_method: "bank",
      reference_no: "REF-D004"
    }
  ])
  const [filterTruck, setFilterTruck] = useState("")
  const [filterDriver, setFilterDriver] = useState("")
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [sortByAmount, setSortByAmount] = useState(false)
  const [trucks, setTrucks] = useState<{truck_number: string}[]>([])
  const [drivers, setDrivers] = useState<{employee: string, refered_as: string}[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      const [trucksData, driversData] = await Promise.all([
        fetchApi('/trucks'),
        fetchApi('/drivers')
      ])
      
      setTrucks(Array.isArray(trucksData) ? trucksData : [])
      setDrivers(Array.isArray(driversData) ? driversData : [])
    } catch (error) {
      console.error('Error fetching initial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalQuantity = records.reduce((sum, record) => sum + record.quantity, 0)
  const totalAmount = records.reduce((sum, record) => sum + record.total_amount, 0)
  const averagePrice = totalQuantity > 0 ? totalAmount / totalQuantity : 0

  const filteredRecords = records
    .filter(record => {
      const truckMatch = record.truck_number.toLowerCase().includes(filterTruck.toLowerCase())
      const driverMatch = record.driver_name.toLowerCase().includes(filterDriver.toLowerCase())
      const dateMatch = !dateRange.from || !dateRange.to || 
        (new Date(record.date) >= dateRange.from && new Date(record.date) <= dateRange.to)
      return truckMatch && driverMatch && dateMatch
    })
    .sort((a, b) => {
      if (sortByAmount) {
        return b.total_amount - a.total_amount
      }
      return 0
    })

  // Prepare data for charts
  const truckDieselData = trucks.map(truck => {
    const truckRecords = records.filter(r => r.truck_number === truck.truck_number)
    const totalQuantity = truckRecords.reduce((sum, r) => sum + r.quantity, 0)
    const totalAmount = truckRecords.reduce((sum, r) => sum + r.total_amount, 0)
    
    return {
      name: truck.truck_number,
      quantity: totalQuantity,
      amount: totalAmount
    }
  }).filter(data => data.quantity > 0).slice(0, 5) // Top 5 trucks by diesel consumption

  // Monthly diesel consumption
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(2024, i, 1).toLocaleString('default', { month: 'short' })
    const monthRecords = records.filter(r => {
      const recordDate = new Date(r.date)
      return recordDate.getMonth() === i && recordDate.getFullYear() === 2024
    })
    const totalQuantity = monthRecords.reduce((sum, r) => sum + r.quantity, 0)
    const totalAmount = monthRecords.reduce((sum, r) => sum + r.total_amount, 0)
    
    return {
      name: month,
      quantity: totalQuantity,
      amount: totalAmount
    }
  })

  // Payment method distribution
  const paymentMethodData = [
    {
      name: "Cash",
      value: records.filter(r => r.payment_method === "cash").reduce((sum, r) => sum + r.total_amount, 0)
    },
    {
      name: "Bank",
      value: records.filter(r => r.payment_method === "bank").reduce((sum, r) => sum + r.total_amount, 0)
    },
    {
      name: "Card",
      value: records.filter(r => r.payment_method === "card").reduce((sum, r) => sum + r.total_amount, 0)
    }
  ]

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Diesel (Liters)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuantity.toFixed(2)} L</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Price/Liter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${averagePrice.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Diesel Consumption</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip formatter={(value, name) => [
                    name === 'quantity' ? `${value} L` : `$${value}`,
                    name === 'quantity' ? 'Quantity' : 'Amount'
                  ]} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="quantity" name="Quantity (L)" stroke="#8884d8" activeDot={{ r: 8 }} />
                  <Line yAxisId="right" type="monotone" dataKey="amount" name="Amount ($)" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Payment Method Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Diesel Expense Records</CardTitle>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center mt-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
              <Input
                placeholder="Filter by truck"
                value={filterTruck}
                onChange={(e) => setFilterTruck(e.target.value)}
                className="w-full sm:max-w-xs"
              />
              <Input
                placeholder="Filter by driver"
                value={filterDriver}
                onChange={(e) => setFilterDriver(e.target.value)}
                className="w-full sm:max-w-xs"
              />
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
                <TableHead>Truck</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Quantity (L)</TableHead>
                <TableHead>Price/Liter</TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => setSortByAmount(!sortByAmount)}
                >
                  Total Amount
                  <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                </TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Payment Method</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>{record.truck_number}</TableCell>
                  <TableCell>{record.driver_name}</TableCell>
                  <TableCell>{record.quantity.toFixed(2)}</TableCell>
                  <TableCell>${record.price_per_liter.toFixed(2)}</TableCell>
                  <TableCell>${record.total_amount.toFixed(2)}</TableCell>
                  <TableCell>{record.location}</TableCell>
                  <TableCell className="capitalize">{record.payment_method}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Diesel Consumption by Truck</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={truckDieselData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip formatter={(value, name) => [
                  name === 'quantity' ? `${value} L` : `$${value}`,
                  name === 'quantity' ? 'Quantity' : 'Amount'
                ]} />
                <Legend />
                <Bar yAxisId="left" dataKey="quantity" name="Quantity (L)" fill="#8884d8" />
                <Bar yAxisId="right" dataKey="amount" name="Amount ($)" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}