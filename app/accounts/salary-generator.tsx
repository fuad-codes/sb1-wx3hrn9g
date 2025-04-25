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
import { PencilIcon, Eye, Trash2, FileText, Download, Printer, ArrowUpDown } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { fetchApi } from "@/lib/utils"

interface SalaryRecord {
  id: string
  employee_name: string
  month: string
  year: number
  base_salary: number
  overtime_hours: number
  overtime_rate: number
  overtime_amount: number
  bonus: number
  deductions: number
  deduction_reason?: string
  net_salary: number
  payment_method: 'cash' | 'bank' | 'cheque'
  payment_status: 'pending' | 'paid'
  payment_date?: string
  reference_no?: string
  remarks?: string
}

export function SalaryGenerator() {
  const [records, setRecords] = useState<SalaryRecord[]>([
    {
      id: "SAL001",
      employee_name: "John Doe",
      month: "March",
      year: 2024,
      base_salary: 3000,
      overtime_hours: 10,
      overtime_rate: 15,
      overtime_amount: 150,
      bonus: 200,
      deductions: 100,
      deduction_reason: "Advance recovery",
      net_salary: 3250,
      payment_method: "bank",
      payment_status: "paid",
      payment_date: "2024-03-31",
      reference_no: "SAL-REF-001",
      remarks: "Monthly salary"
    },
    {
      id: "SAL002",
      employee_name: "Jane Smith",
      month: "March",
      year: 2024,
      base_salary: 3500,
      overtime_hours: 5,
      overtime_rate: 18,
      overtime_amount: 90,
      bonus: 0,
      deductions: 0,
      net_salary: 3590,
      payment_method: "bank",
      payment_status: "paid",
      payment_date: "2024-03-31",
      reference_no: "SAL-REF-002"
    },
    {
      id: "SAL003",
      employee_name: "Mike Johnson",
      month: "April",
      year: 2024,
      base_salary: 2800,
      overtime_hours: 0,
      overtime_rate: 14,
      overtime_amount: 0,
      bonus: 300,
      deductions: 200,
      deduction_reason: "Advance recovery",
      net_salary: 2900,
      payment_method: "bank",
      payment_status: "pending"
    }
  ])
  const [filterEmployee, setFilterEmployee] = useState("")
  const [filterMonth, setFilterMonth] = useState("all")
  const [filterYear, setFilterYear] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedRecord, setSelectedRecord] = useState<SalaryRecord | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState<SalaryRecord | null>(null)
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

  const totalSalaries = records.reduce((sum, record) => sum + record.net_salary, 0)
  const pendingSalaries = records
    .filter(r => r.payment_status === 'pending')
    .reduce((sum, record) => sum + record.net_salary, 0)

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const years = [2023, 2024, 2025]

  const filteredRecords = records
    .filter(record => {
      const employeeMatch = record.employee_name.toLowerCase().includes(filterEmployee.toLowerCase())
      const monthMatch = filterMonth === "all" || record.month === filterMonth
      const yearMatch = filterYear === "all" || record.year === parseInt(filterYear)
      const statusMatch = filterStatus === "all" || record.payment_status === filterStatus
      return employeeMatch && monthMatch && yearMatch && statusMatch
    })
    .sort((a, b) => {
      if (sortByAmount) {
        return b.net_salary - a.net_salary
      }
      return 0
    })

  const handleDelete = (id: string) => {
    setRecords(records.filter(r => r.id !== id))
  }

  const handleGenerateSalaries = () => {
    // In a real implementation, this would generate salaries for all employees
    // For now, we'll just show a toast message
    alert("Salaries generated for all employees for the current month")
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Salaries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSalaries.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Salaries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${pendingSalaries.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <h3 className="text-xl font-semibold">Salary Management</h3>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
          <Button onClick={handleGenerateSalaries}>
            Generate Salaries
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Payroll
          </Button>
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print Slips
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Salary Records</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-4 mt-4">
            <Input
              placeholder="Filter by employee"
              value={filterEmployee}
              onChange={(e) => setFilterEmployee(e.target.value)}
              className="w-full sm:max-w-xs"
            />
            <Select value={filterMonth} onValueChange={setFilterMonth}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {months.map(month => (
                  <SelectItem key={month} value={month}>{month}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {years.map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Month/Year</TableHead>
                <TableHead>Base Salary</TableHead>
                <TableHead>Overtime</TableHead>
                <TableHead>Bonus</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => setSortByAmount(!sortByAmount)}
                >
                  Net Salary
                  <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.employee_name}</TableCell>
                  <TableCell>{record.month} {record.year}</TableCell>
                  <TableCell>${record.base_salary.toFixed(2)}</TableCell>
                  <TableCell>${record.overtime_amount.toFixed(2)}</TableCell>
                  <TableCell>${record.bonus.toFixed(2)}</TableCell>
                  <TableCell>${record.deductions.toFixed(2)}</TableCell>
                  <TableCell>${record.net_salary.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      record.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {record.payment_status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          setSelectedRecord(record)
                          setDialogOpen(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/accounts/salary-generator/edit/${record.id}`}>
                          <PencilIcon className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/accounts/salary-generator/${record.id}/documents`}>
                          <FileText className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => {
                          setRecordToDelete(record)
                          setDeleteDialogOpen(true)
                        }}
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

      {/* View Record Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Salary Record Details</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Employee</p>
                  <p className="mt-1">{selectedRecord.employee_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Period</p>
                  <p className="mt-1">{selectedRecord.month} {selectedRecord.year}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Base Salary</p>
                  <p className="mt-1">${selectedRecord.base_salary.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Overtime Hours</p>
                  <p className="mt-1">{selectedRecord.overtime_hours} hrs @ ${selectedRecord.overtime_rate}/hr</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Overtime Amount</p>
                  <p className="mt-1">${selectedRecord.overtime_amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Bonus</p>
                  <p className="mt-1">${selectedRecord.bonus.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Deductions</p>
                  <p className="mt-1">${selectedRecord.deductions.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Deduction Reason</p>
                  <p className="mt-1">{selectedRecord.deduction_reason || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Net Salary</p>
                  <p className="mt-1">${selectedRecord.net_salary.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Payment Method</p>
                  <p className="mt-1 capitalize">{selectedRecord.payment_method}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Payment Status</p>
                  <p className="mt-1 capitalize">{selectedRecord.payment_status}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Payment Date</p>
                  <p className="mt-1">{selectedRecord.payment_date || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Reference Number</p>
                  <p className="mt-1">{selectedRecord.reference_no || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">Remarks</p>
                  <Textarea
                    value={selectedRecord.remarks || ''}
                    readOnly
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <Button variant="outline" asChild>
                  <Link href={`/accounts/salary-generator/${selectedRecord.id}/documents`}>
                    <FileText className="mr-2 h-4 w-4" />
                    View Documents
                  </Link>
                </Button>
                <Button>
                  <Printer className="mr-2 h-4 w-4" />
                  Print Salary Slip
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Record</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this salary record? This action cannot be undone.</p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (recordToDelete) {
                  handleDelete(recordToDelete.id)
                  setDeleteDialogOpen(false)
                  setRecordToDelete(null)
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}