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
import { Download, PencilIcon, Plus, Eye, Trash2 } from "lucide-react"
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
import { fetchApi } from "@/lib/utils"

interface Fine {
  id: number
  trip_id: number | null
  reason: string | null
  truck_number: string | null
  driver_name: string | null
  driver_fault: boolean | null
  fine_date: string | null
  amount: number
  payment_status: string
}

export default function FinesPage() {
  const [fines, setFines] = useState<Fine[]>([])
  const [loading, setLoading] = useState(true)
  const [filterDriver, setFilterDriver] = useState("")
  const [filterTruck, setFilterTruck] = useState("")
  const [selectedFine, setSelectedFine] = useState<Fine | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [fineToDelete, setFineToDelete] = useState<Fine | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

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

  const filteredFines = fines.filter(fine => {
    const driverMatch = fine.driver_name?.toLowerCase().includes(filterDriver.toLowerCase()) ?? true
    const truckMatch = fine.truck_number?.toLowerCase().includes(filterTruck.toLowerCase()) ?? true
    return driverMatch && truckMatch
  })

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredFines)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Fines")
    XLSX.writeFile(workbook, "fines.xlsx")
  }

  const totalFines = fines.length
  const totalAmount = fines.reduce((sum, fine) => sum + fine.amount, 0)
  const pendingFines = fines.filter(fine => fine.payment_status === 'pending').length
  const driverFaults = fines.filter(fine => fine.driver_fault).length

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <h2 className="text-3xl font-bold tracking-tight">Fines Management</h2>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
          <Button onClick={downloadExcel} variant="outline" className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Export Records
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
            <div className="text-2xl font-bold">${totalAmount.toFixed(2)}</div>
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
              placeholder="Filter by truck"
              value={filterTruck}
              onChange={(e) => setFilterTruck(e.target.value)}
              className="w-full sm:max-w-xs"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Truck</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Driver Fault</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : filteredFines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">No fines found</TableCell>
                </TableRow>
              ) : (
                filteredFines.map((fine) => (
                  <TableRow key={fine.id}>
                    <TableCell>{fine.id}</TableCell>
                    <TableCell>{fine.fine_date}</TableCell>
                    <TableCell>{fine.driver_name || 'N/A'}</TableCell>
                    <TableCell>{fine.truck_number || 'N/A'}</TableCell>
                    <TableCell>${fine.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        fine.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {fine.payment_status}
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
                        <Button variant="ghost" size="icon" onClick={() => setSelectedFine(fine)}>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fine Details</DialogTitle>
          </DialogHeader>
          {selectedFine && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">ID</p>
                  <p className="mt-1">{selectedFine.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Trip ID</p>
                  <p className="mt-1">{selectedFine.trip_id || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="mt-1">{selectedFine.fine_date}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Driver</p>
                  <p className="mt-1">{selectedFine.driver_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Truck</p>
                  <p className="mt-1">{selectedFine.truck_number || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Amount</p>
                  <p className="mt-1">${selectedFine.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className="mt-1">{selectedFine.payment_status}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Driver Fault</p>
                  <p className="mt-1">{selectedFine.driver_fault ? 'Yes' : 'No'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">Reason</p>
                  <p className="mt-1">{selectedFine.reason || 'N/A'}</p>
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
              Are you sure you want to delete fine #{fineToDelete?.id}? This action cannot be undone.
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