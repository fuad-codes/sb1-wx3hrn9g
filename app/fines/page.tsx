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
import { Download, PencilIcon, Plus, Eye, Trash2, ArrowUpDown } from "lucide-react"
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

interface Fine {
  id: string
  date: string
  driver_name: string
  truck_number: string
  vehicle_under: string
  amount: number
  details: string
  status: 'pending' | 'paid' | 'overdue'
  country: string
  fine_type: string
  due_date: string
  penalty_amount: number
  driver_fault: boolean
  reason: string
}

export default function FinesPage() {
  const [fines, setFines] = useState<Fine[]>([])
  const [loading, setLoading] = useState(true)
  const [filterDriver, setFilterDriver] = useState("")
  const [filterReason, setFilterReason] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterDriverFault, setFilterDriverFault] = useState("all")
  const [selectedFine, setSelectedFine] = useState<Fine | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [fineToDelete, setFineToDelete] = useState<Fine | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [sortByAmount, setSortByAmount] = useState(false)

  useEffect(() => {
    fetchFines()
  }, [])

  const fetchFines = async () => {
    try {
      const data = await fetchApi('/fines')
      setFines(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching fines:', error)
      setFines([])
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (fine: Fine) => {
    setFineToDelete(fine)
    setDeleteDialogOpen(true)
    setDeleteError(null)
  }

  const handleDelete = async () => {
    if (!fineToDelete) return

    try {
      await fetchApi(`/fines/${fineToDelete.id}`, {
        method: 'DELETE',
      })

      setFines(fines.filter(f => f.id !== fineToDelete.id))
      setDeleteDialogOpen(false)
      setFineToDelete(null)
      setDeleteError(null)
    } catch (error) {
      console.error('Error deleting fine:', error)
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete fine')
    }
  }

  const filteredFines = fines
    .filter(fine => {
      const driverMatch = fine.driver_name.toLowerCase().includes(filterDriver.toLowerCase())
      const reasonMatch = fine.reason?.toLowerCase().includes(filterReason.toLowerCase()) ?? true
      const statusMatch = filterStatus === "all" || fine.status === filterStatus
      const driverFaultMatch = filterDriverFault === "all" || 
        (filterDriverFault === "yes" && fine.driver_fault) ||
        (filterDriverFault === "no" && !fine.driver_fault)
      return driverMatch && reasonMatch && statusMatch && driverFaultMatch
    })
    .sort((a, b) => {
      if (sortByAmount) {
        return b.amount - a.amount
      }
      return 0
    })

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredFines)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Fines")
    XLSX.writeFile(workbook, "fines.xlsx")
  }

  const downloadMasterExcel = () => {
    const masterData = fines.map(fine => ({
      "Date": fine.date,
      "Driver": fine.driver_name,
      "Truck Number": fine.truck_number,
      "Vehicle Under": fine.vehicle_under,
      "Amount": fine.amount,
      "Penalty Amount": fine.penalty_amount,
      "Total Amount": fine.amount + fine.penalty_amount,
      "Status": fine.status,
      "Due Date": fine.due_date,
      "Country": fine.country,
      "Fine Type": fine.fine_type,
      "Driver Fault": fine.driver_fault ? "Yes" : "No",
      "Reason": fine.reason || "",
      "Details": fine.details || ""
    }))

    const worksheet = XLSX.utils.json_to_sheet(masterData)
    
    const columnWidths = [
      { wch: 12 }, // Date
      { wch: 20 }, // Driver
      { wch: 15 }, // Truck Number
      { wch: 15 }, // Vehicle Under
      { wch: 12 }, // Amount
      { wch: 12 }, // Penalty Amount
      { wch: 12 }, // Total Amount
      { wch: 10 }, // Status
      { wch: 12 }, // Due Date
      { wch: 10 }, // Country
      { wch: 15 }, // Fine Type
      { wch: 12 }, // Driver Fault
      { wch: 40 }, // Reason
      { wch: 40 }, // Details
    ]
    worksheet['!cols'] = columnWidths

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Fine Details")
    XLSX.writeFile(workbook, "fines_master_data.xlsx")
  }

  const totalFines = fines.length
  const totalAmount = fines.reduce((sum, fine) => sum + fine.amount + fine.penalty_amount, 0)
  const pendingFines = fines.filter(fine => fine.status === 'pending').length
  const driverFaults = fines.filter(fine => fine.driver_fault).length

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <h2 className="text-3xl font-bold tracking-tight">Fines Management</h2>
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
            <Link href="/fines/add">
              <Plus className="mr-2 h-4 w-4" />
              Add Fine
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFines}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">د.إ {totalAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Fines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingFines}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Driver Faults</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{driverFaults}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fine Records</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-4 mt-4">
            <Input
              placeholder="Filter by driver"
              value={filterDriver}
              onChange={(e) => setFilterDriver(e.target.value)}
              className="w-full sm:max-w-xs"
            />
            <Input
              placeholder="Filter by reason"
              value={filterReason}
              onChange={(e) => setFilterReason(e.target.value)}
              className="w-full sm:max-w-xs"
            />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterDriverFault} onValueChange={setFilterDriverFault}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by driver fault" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="yes">Driver Fault</SelectItem>
                <SelectItem value="no">Not Driver Fault</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Truck</TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => setSortByAmount(!sortByAmount)}
                >
                  Amount
                  <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Driver Fault</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : filteredFines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">No fines found</TableCell>
                </TableRow>
              ) : (
                filteredFines.map((fine) => (
                  <TableRow key={fine.id}>
                    <TableCell>{fine.date}</TableCell>
                    <TableCell>{fine.driver_name}</TableCell>
                    <TableCell>{fine.truck_number}</TableCell>
                    <TableCell>د.إ {(fine.amount + fine.penalty_amount).toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        fine.status === 'paid' ? 'bg-green-100 text-green-800' :
                        fine.status === 'overdue' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {fine.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        fine.driver_fault ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {fine.driver_fault ? 'Yes' : 'No'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => {
                          setSelectedFine(fine)
                          setDialogOpen(true)
                        }}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/fines/edit/${fine.id}`}>
                            <PencilIcon className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteClick(fine)}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Fine Details</DialogTitle>
          </DialogHeader>
          {selectedFine && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="mt-1">{selectedFine.date}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Driver</p>
                  <p className="mt-1">{selectedFine.driver_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Truck Number</p>
                  <p className="mt-1">{selectedFine.truck_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Vehicle Under</p>
                  <p className="mt-1">{selectedFine.vehicle_under}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Fine Amount</p>
                  <p className="mt-1">د.إ {selectedFine.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Penalty Amount</p>
                  <p className="mt-1">د.إ {selectedFine.penalty_amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Amount</p>
                  <p className="mt-1">د.إ {(selectedFine.amount + selectedFine.penalty_amount).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className="mt-1">{selectedFine.status}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Due Date</p>
                  <p className="mt-1">{selectedFine.due_date}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Country</p>
                  <p className="mt-1">{selectedFine.country}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Fine Type</p>
                  <p className="mt-1">{selectedFine.fine_type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Driver Fault</p>
                  <p className="mt-1">{selectedFine.driver_fault ? 'Yes' : 'No'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">Reason</p>
                  <Textarea
                    value={selectedFine.reason || ''}
                    className="mt-1"
                    readOnly
                  />
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">Details</p>
                  <Textarea
                    value={selectedFine.details || ''}
                    className="mt-1"
                    readOnly
                  />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Fine</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this fine record? This action cannot be undone.
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
                setFineToDelete(null)
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