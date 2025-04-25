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
import { Download, PencilIcon, Plus, Eye, Trash2, FileText, ArrowUpDown } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { fetchApi } from "@/lib/utils"

interface MaintenanceRecord {
  id: number
  date: string
  driver_name: string
  truck_number: string
  vehicle_under: string
  maintenance_detail: string
  credit_card: number
  bank: number
  cash: number
  vat: number
  total: number
  status: 'PAID' | 'UNPAID'
  supplier: string | null
}

export default function MaintenancePage() {
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [filterTruck, setFilterTruck] = useState("")
  const [filterDriver, setFilterDriver] = useState("")
  const [filterSupplier, setFilterSupplier] = useState<string>("all")
  const [filterStartDate, setFilterStartDate] = useState("")
  const [filterEndDate, setFilterEndDate] = useState("")
  const [sortByDate, setSortByDate] = useState<'asc' | 'desc' | null>(null)
  const [selectedMaintenance, setSelectedMaintenance] = useState<MaintenanceRecord | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [maintenanceToDelete, setMaintenanceToDelete] = useState<MaintenanceRecord | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [suppliers, setSuppliers] = useState<string[]>([])
  const [supplierError, setSupplierError] = useState<string | null>(null)

  useEffect(() => {
    fetchMaintenance()
    fetchSuppliers()
  }, [])

  const formatDateForDisplay = (dateString: string) => {
    try {
      const [year, month, day] = dateString.split('-')
      return `${day}-${month}-${year}`
    } catch {
      return dateString
    }
  }

  const formatDateForFilter = (dateString: string) => {
    try {
      const [day, month, year] = dateString.split('-')
      return `${year}-${month}-${day}`
    } catch {
      return dateString
    }
  }

  const fetchSuppliers = async () => {
    try {
      setSupplierError(null)
      const data = await fetchApi('/suppliers/names/code')
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format from suppliers API')
      }
      setSuppliers(data)
    } catch (error) {
      console.error('Error fetching suppliers:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch suppliers'
      setSupplierError(errorMessage)
      setSuppliers([])
    }
  }

  const fetchMaintenance = async () => {
    try {
      const data = await fetchApi('/maintenance')
      setMaintenance(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching maintenance records:', error)
      setMaintenance([])
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (record: MaintenanceRecord) => {
    setMaintenanceToDelete(record)
    setDeleteDialogOpen(true)
    setDeleteError(null)
  }

  const handleDelete = async () => {
    if (!maintenanceToDelete) return

    try {
      await fetchApi(`/maintenance/${maintenanceToDelete.id}`, {
        method: 'DELETE',
      })

      setMaintenance(maintenance.filter(m => m.id !== maintenanceToDelete.id))
      setDeleteDialogOpen(false)
      setMaintenanceToDelete(null)
      setDeleteError(null)
    } catch (error) {
      console.error('Error deleting maintenance record:', error)
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete maintenance record')
    }
  }

  const handleViewClick = (record: MaintenanceRecord) => {
    setSelectedMaintenance(record)
    setDialogOpen(true)
  }

  const filteredMaintenance = maintenance
    .filter(record => {
      const truckMatch = record.truck_number.toLowerCase().includes(filterTruck.toLowerCase())
      const driverMatch = record.driver_name.toLowerCase().includes(filterDriver.toLowerCase())
      const supplierMatch = filterSupplier === "all" || (record.supplier?.toLowerCase() === filterSupplier.toLowerCase())
      
      // Convert display format dates (DD-MM-YYYY) to YYYY-MM-DD for comparison
      const recordDate = formatDateForFilter(record.date)
      const dateMatch = (!filterStartDate || recordDate >= filterStartDate) && 
                       (!filterEndDate || recordDate <= filterEndDate)
      
      return truckMatch && driverMatch && supplierMatch && dateMatch
    })
    .sort((a, b) => {
      if (sortByDate === 'asc') {
        return new Date(formatDateForFilter(a.date)).getTime() - new Date(formatDateForFilter(b.date)).getTime()
      }
      if (sortByDate === 'desc') {
        return new Date(formatDateForFilter(b.date)).getTime() - new Date(formatDateForFilter(a.date)).getTime()
      }
      return 0
    })

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredMaintenance)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Maintenance")
    XLSX.writeFile(workbook, "maintenance_records.xlsx")
  }

  const downloadMasterExcel = () => {
    const masterData = maintenance.map(record => ({
      "Date": record.date,
      "Driver": record.driver_name,
      "Truck": record.truck_number,
      "Vehicle Under": record.vehicle_under,
      "Supplier": record.supplier || "",
      "Details": record.maintenance_detail,
      "Credit Card": record.credit_card,
      "Bank": record.bank,
      "Cash": record.cash,
      "VAT": record.vat,
      "Total": record.total,
      "Status": record.status
    }))

    const worksheet = XLSX.utils.json_to_sheet(masterData)
    
    const columnWidths = [
      { wch: 20 }, // Date
      { wch: 40 }, // Driver
      { wch: 35 }, // Truck
      { wch: 25 }, // Vehicle Under
      { wch: 30 }, // Supplier
      { wch: 40 }, // Details
      { wch: 25 }, // Credit Card
      { wch: 25 }, // Bank
      { wch: 25 }, // Cash
      { wch: 20 }, // VAT
      { wch: 25 }, // Total
      { wch: 30 }, // Status
    ]
    worksheet['!cols'] = columnWidths

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Maintenance Details")
    XLSX.writeFile(workbook, "maintenance_master_data.xlsx")
  }

  const totalMaintenance = filteredMaintenance.length
  const totalCost = filteredMaintenance.reduce((sum, record) => sum + record.total, 0)
  const unpaidMaintenance = filteredMaintenance.filter(m => m.status === 'UNPAID')
  const unpaidCount = unpaidMaintenance.length
  const unpaidTotal = unpaidMaintenance.reduce((sum, record) => sum + record.total, 0)

  return (
    <div className="flex flex-col h-screen overflow-x-auto">
    <div className="p-8 space-y-8 flex-1 overflow-y-auto min-w-[1400px]">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <h2 className="text-3xl font-bold tracking-tight">Maintenance Management</h2>
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
            <Link href="/maintenance/add">
              <Plus className="mr-2 h-4 w-4" />
              Add Record
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMaintenance}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">د.إ {totalCost.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unpaid Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unpaidCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unpaid Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">د.إ {unpaidTotal.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance Records</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-4 mt-4">
            <Input
              placeholder="Filter by truck number"
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
            <Select value={filterSupplier} onValueChange={setFilterSupplier}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Suppliers</SelectItem>
                {suppliers.map(supplier => (
                  <SelectItem key={supplier} value={supplier.toLowerCase()}>{supplier}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {supplierError && (
            <div className="mt-2 text-sm text-red-600">
              Error loading suppliers: {supplierError}
            </div>
          )}
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-4 mt-4">
              Date Filter:
            </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-4 mt-4">
            <Input
              type="date"
              placeholder="Start Date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="w-full sm:max-w-xs"
            />
            <Input
              type="date"
              placeholder="End Date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="w-full sm:max-w-xs"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer whitespace-nowrap"
                    onClick={() => {
                      if (sortByDate === null) setSortByDate('asc')
                      else if (sortByDate === 'asc') setSortByDate('desc')
                      else setSortByDate(null)
                    }}
                  >
                    Date
                    <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                  </TableHead>
                  <TableHead className="whitespace-nowrap">Driver</TableHead>
                  <TableHead className="whitespace-nowrap">Truck</TableHead>
                  <TableHead className="whitespace-nowrap">Supplier</TableHead>
                  <TableHead className="whitespace-nowrap">Vehicle Under</TableHead>
                  <TableHead className="whitespace-nowrap">Total</TableHead>
                  <TableHead className="whitespace-nowrap">Status</TableHead>
                  <TableHead className="whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : filteredMaintenance.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">No records found</TableCell>
                  </TableRow>
                ) : (
                  filteredMaintenance.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="whitespace-nowrap">{(record.date)}</TableCell>
                      <TableCell className="whitespace-nowrap">{record.driver_name}</TableCell>
                      <TableCell className="whitespace-nowrap">{record.truck_number}</TableCell>
                      <TableCell className="whitespace-nowrap">{record.supplier || 'N/A'}</TableCell>
                      <TableCell className="whitespace-nowrap">{record.vehicle_under || 'N/A'}</TableCell>
                      <TableCell className="whitespace-nowrap">د.إ {record.total.toFixed(2)}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          record.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {record.status}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleViewClick(record)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/maintenance/edit/${record.id}`}>
                              <PencilIcon className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/maintenance/${record.id}/documents`}>
                              <FileText className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteClick(record)}
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
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Maintenance Details</DialogTitle>
          </DialogHeader>
          {selectedMaintenance && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="mt-1">{formatDateForDisplay(selectedMaintenance.date)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Driver</p>
                  <p className="mt-1">{selectedMaintenance.driver_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Truck</p>
                  <p className="mt-1">{selectedMaintenance.truck_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Vehicle Under</p>
                  <p className="mt-1">{selectedMaintenance.vehicle_under}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Supplier</p>
                  <p className="mt-1">{selectedMaintenance.supplier || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className="mt-1">{selectedMaintenance.status}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Credit Card</p>
                  <p className="mt-1">د.إ {selectedMaintenance.credit_card.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Bank</p>
                  <p className="mt-1">د.إ {selectedMaintenance.bank.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Cash</p>
                  <p className="mt-1">د.إ {selectedMaintenance.cash.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">VAT</p>
                  <p className="mt-1">د.إ {selectedMaintenance.vat.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total</p>
                  <p className="mt-1">د.إ {selectedMaintenance.total.toFixed(2)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500 mb-2">Details</p>
                  <Textarea
                    value={selectedMaintenance.maintenance_detail}
                    readOnly
                    className="w-full min-h-[100px]"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button asChild>
                  <Link href={`/maintenance/${selectedMaintenance.id}/documents`}>
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
            <DialogTitle>Delete Maintenance Record</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this maintenance record? This action cannot be undone.
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
                setMaintenanceToDelete(null)
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
    </div>
  )
}