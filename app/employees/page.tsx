"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, PencilIcon, Plus, Eye, Trash2, Users, ArrowUpDown, FileText } from "lucide-react"
import * as XLSX from 'xlsx'
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { fetchApi, API_URL } from "@/lib/utils"

interface Employee {
  employee: string
  refered_as: string | null
  designation: string | null
  salary: number
  nationality: string
  visa_outstanding: number
  advance_avl: number
  visa_under: string
  visa_exp: string | null
  eid: string | null
  health_ins_exp: string | null
  emp_ins_exp: string | null
  license_exp: string | null
  contact_no?: string | null
  whatsapp_no?: string | null
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [companies, setCompanies] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [filterName, setFilterName] = useState("")
  const [filterCompany, setFilterCompany] = useState("all")
  const [sortByVisa, setSortByVisa] = useState(false)
  const [sortByVisaOutstanding, setSortByVisaOutstanding] = useState(false)
  const [sortByAdvance, setSortByAdvance] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [filterDesignation, setFilterDesignation] = useState("")
  const [sortByInsurance, setSortByInsurance] = useState(false)
  const [sortByLicense, setSortByLicense] = useState(false)

  useEffect(() => {
    fetchEmployees()
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const response = await fetch(`${API_URL}/company-under`)
      if (!response.ok) throw new Error('Failed to fetch companies')
      const data = await response.json()
      setCompanies(data)
    } catch (error) {
      console.error('Error fetching companies:', error)
    }
  }

  const fetchEmployees = async () => {
    try {
      const data = await fetchApi('/employees')
      setEmployees(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching employees:', error)
      setEmployees([])
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (employee: Employee) => {
    setEmployeeToDelete(employee)
    setDeleteDialogOpen(true)
    setDeleteError(null)
  }

  const handleDelete = async () => {
    if (!employeeToDelete) return

    try {
      await fetchApi(`/employees/${encodeURIComponent(employeeToDelete.employee)}`, {
        method: 'DELETE',
      })

      setEmployees(employees.filter(emp => emp.employee !== employeeToDelete.employee))
      setDeleteDialogOpen(false)
      setEmployeeToDelete(null)
      setDeleteError(null)
    } catch (error) {
      console.error('Error deleting employee:', error)
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete employee')
    }
  }
  function parseDDMMYYYY(dateStr: string | null): Date | null {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split("-");
    return new Date(+year, +month - 1, +day); // Month is 0-indexed
  }
  const filteredEmployees = employees
    .filter(emp => {
      const nameMatch = emp.refered_as?.toLowerCase().includes(filterName.toLowerCase())
      const companyMatch = filterCompany === "all" || emp.visa_under === filterCompany
      const designationMatch = !filterDesignation || (emp.designation?.toLowerCase().includes(filterDesignation.toLowerCase()))
      return nameMatch && companyMatch && designationMatch
    })
    .sort((a, b) => {
      if (sortByVisaOutstanding) {
        return b.visa_outstanding - a.visa_outstanding
      }
      if (sortByAdvance) {
        return b.advance_avl - a.advance_avl
      }
      if (sortByInsurance) {
        const aDate = parseDDMMYYYY(a.health_ins_exp);
        const bDate = parseDDMMYYYY(b.health_ins_exp);
        if (!aDate && !bDate) return 0;
        if (!aDate) return 1;
        if (!bDate) return -1;
        return aDate.getTime() - bDate.getTime();
      }
      
      if (sortByLicense) {
        const aDate = parseDDMMYYYY(a.license_exp);
        const bDate = parseDDMMYYYY(b.license_exp);
        if (!aDate && !bDate) return 0;
        if (!aDate) return 1;
        if (!bDate) return -1;
        return aDate.getTime() - bDate.getTime();
      }
      if (sortByVisa) {
        const aDate = parseDDMMYYYY(a.visa_exp);
        const bDate = parseDDMMYYYY(b.visa_exp);
        if (!aDate && !bDate) return 0;
        if (!aDate) return 1;
        if (!bDate) return -1;
        return aDate.getTime() - bDate.getTime();
      }
      return 0
    })

  const companyEmployeeCounts = companies.reduce((acc, company) => {
    acc[company] = employees.filter(emp => emp.visa_under === company).length
    return acc
  }, {} as Record<string, number>)

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredEmployees)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees")
    XLSX.writeFile(workbook, "employees.xlsx")
  }

  const downloadMasterExcel = () => {
    const masterData = employees.map(emp => ({
      "Full Name": emp.employee,
      "Referred As": emp.refered_as || "",
      "Emirates ID": emp.eid || "",
      "Designation": emp.designation || "",
      "Contact Number": emp.contact_no || "",
      "WhatsApp Number": emp.whatsapp_no || "",
      "Salary": emp.salary,
      "Nationality": emp.nationality || "",
      "Outstanding": emp.visa_outstanding,
      "Advance Available": emp.advance_avl,
      "Visa Under": emp.visa_under,
      "Visa Expiry": emp.visa_exp || "",
      "Health Insurance Expiry": emp.health_ins_exp || "",
      "Employment Insurance Expiry": emp.emp_ins_exp || "",
      "License Expiry": emp.license_exp || ""
    }))

    const worksheet = XLSX.utils.json_to_sheet(masterData)
    
    const columnWidths = [
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
    ]
    worksheet['!cols'] = columnWidths

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employee Details")
    XLSX.writeFile(workbook, "employee_master_data.xlsx")
  }

  const handleEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee)
    setDialogOpen(true)
  }

  return (
    <div className="flex flex-col h-screen overflow-x-auto">
      <div className="p-8 space-y-8 flex-1 overflow-y-auto min-w-[1400px]">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <h2 className="text-3xl font-bold tracking-tight">Employees Management</h2>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
            <Button onClick={downloadMasterExcel} variant="outline" className="w-full sm:w-auto">
              <Download className="mr-2 h-4 w-4" />
              Export Master Data
            </Button>
            <Button onClick={downloadExcel} variant="outline" className="w-full sm:w-auto">
              <Download className="mr-2 h-4 w-4" />
              Export Current View
            </Button>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/employees/add">
                <Plus className="mr-2 h-4 w-4" />
                Add Employee
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {companies.map(company => (
            <Card key={company}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{company} Employees</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{companyEmployeeCounts[company]}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Employee List</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-4 mt-4">
              <Input
                placeholder="Filter by name"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                className="w-full sm:max-w-xs"
              />
              <Input
                placeholder="Filter by designation"
                value={filterDesignation}
                onChange={(e) => setFilterDesignation(e.target.value)}
                className="w-full sm:max-w-xs"
              />
              <Select value={filterCompany} onValueChange={setFilterCompany}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  {companies.map(company => (
                    <SelectItem key={company} value={company}>{company}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Emirates ID</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => {
                      setSortByVisaOutstanding(!sortByVisaOutstanding)
                      setSortByAdvance(false)
                      setSortByInsurance(false)
                      setSortByLicense(false)
                      setSortByVisa(false)
                    }}
                  >
                    Outstanding
                    <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => {
                      setSortByAdvance(!sortByAdvance)
                      setSortByVisaOutstanding(false)
                      setSortByInsurance(false)
                      setSortByLicense(false)
                      setSortByVisa(false)
                    }}
                  >
                    Advance Available
                    <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                  </TableHead>
                  <TableHead>Visa Under</TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => {
                      setSortByVisa(!sortByVisa)
                      setSortByVisaOutstanding(false)
                      setSortByAdvance(false)
                      setSortByInsurance(false)
                      setSortByLicense(false)
                    }}
                  >
                    Visa Validity
                    <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => {
                      setSortByInsurance(!sortByInsurance)
                      setSortByVisaOutstanding(false)
                      setSortByAdvance(false)
                      setSortByVisa(false)
                      setSortByLicense(false)
                    }}
                  >
                    Insurance Expiry
                    <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => {
                      setSortByLicense(!sortByLicense)
                      setSortByVisaOutstanding(false)
                      setSortByAdvance(false)
                      setSortByVisa(false)
                      setSortByInsurance(false)
                    }}
                  >
                    License Expiry
                    <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center">No employees found</TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((emp) => (
                    <TableRow key={emp.employee}>
                      <TableCell 
                        className="font-medium cursor-pointer hover:text-blue-600"
                        onClick={() => handleEmployeeClick(emp)}
                      >
                        {emp.refered_as}
                      </TableCell>
                      <TableCell>{emp.designation || 'N/A'}</TableCell>
                      <TableCell>{emp.eid || 'N/A'}</TableCell>
                      <TableCell>{emp.contact_no || 'N/A'}</TableCell>
                      <TableCell>{emp.visa_outstanding}</TableCell>
                      <TableCell>{emp.advance_avl}</TableCell>
                      <TableCell>{emp.visa_under}</TableCell>
                      <TableCell>{emp.visa_exp || 'Not set'}</TableCell>
                      <TableCell>{emp.health_ins_exp || 'Not set'}</TableCell>
                      <TableCell>{emp.license_exp || 'Not set'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEmployeeClick(emp)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/employees/edit/${encodeURIComponent(emp.employee)}`}>
                              <PencilIcon className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/employees/${encodeURIComponent(emp.employee)}/documents`}>
                              <FileText className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteClick(emp)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Full Name</p>
                  <p className="mt-1">{selectedEmployee.employee}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Referred As</p>
                  <p className="mt-1">{selectedEmployee.refered_as}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Emirates ID</p>
                  <p className="mt-1">{selectedEmployee.eid || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Designation</p>
                  <p className="mt-1">{selectedEmployee.designation || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Contact Number</p>
                  <p className="mt-1">{selectedEmployee.contact_no || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">WhatsApp Number</p>
                  <p className="mt-1">{selectedEmployee.whatsapp_no || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Salary</p>
                  <p className="mt-1">{selectedEmployee.salary}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Nationality</p>
                  <p className="mt-1">{selectedEmployee.nationality}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Visa Under</p>
                  <p className="mt-1">{selectedEmployee.visa_under}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Visa Expiry</p>
                  <p className="mt-1">{selectedEmployee.visa_exp || "Not set"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Outstanding</p>
                  <p className="mt-1">{selectedEmployee.visa_outstanding}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Advance Available</p>
                  <p className="mt-1">{selectedEmployee.advance_avl}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Health Insurance Expiry</p>
                  <p className="mt-1">{selectedEmployee.health_ins_exp || "Not set"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Employment Insurance Expiry</p>
                  <p className="mt-1">{selectedEmployee.emp_ins_exp || "Not set"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">License Expiry</p>
                  <p className="mt-1">{selectedEmployee.license_exp || "Not set"}</p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button asChild>
                  <Link href={`/employees/${encodeURIComponent(selectedEmployee.employee)}/documents`}>
                    <FileText className="mr-2 h-4 w-4" />
                    View Documents
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Employee</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {employeeToDelete?.refered_as}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deleteError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{deleteError}</span>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setEmployeeToDelete(null)
                setDeleteError(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}