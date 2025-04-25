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
import { PencilIcon, Eye, Trash2, ArrowUpDown } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { fetchApi } from "@/lib/utils"

interface MiscellaneousRecord {
  id: string
  date: string
  category: string
  description: string
  amount: number
  payment_method: 'cash' | 'bank' | 'cheque'
  reference_no?: string
  status: 'pending' | 'completed'
  remarks?: string
}

export function Miscellaneous() {
  const [records, setRecords] = useState<MiscellaneousRecord[]>([
    {
      id: "MISC001",
      date: "2024-03-25",
      category: "office",
      description: "Office supplies purchase",
      amount: 350,
      payment_method: "cash",
      reference_no: "REF-M123",
      status: "completed",
      remarks: "Monthly office supplies"
    },
    {
      id: "MISC002",
      date: "2024-03-28",
      category: "utilities",
      description: "Electricity bill payment",
      amount: 750,
      payment_method: "bank",
      reference_no: "REF-M124",
      status: "completed",
      remarks: "March electricity bill"
    },
    {
      id: "MISC003",
      date: "2024-04-01",
      category: "rent",
      description: "Office rent payment",
      amount: 5000,
      payment_method: "cheque",
      reference_no: "REF-M125",
      status: "pending",
      remarks: "April office rent"
    }
  ])
  const [filterCategory, setFilterCategory] = useState("")
  const [selectedRecord, setSelectedRecord] = useState<MiscellaneousRecord | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState<MiscellaneousRecord | null>(null)
  const [sortByAmount, setSortByAmount] = useState(false)

  const totalAmount = records.reduce((sum, record) => sum + record.amount, 0)
  const pendingAmount = records
    .filter(r => r.status === 'pending')
    .reduce((sum, record) => sum + record.amount, 0)

  const filteredRecords = records
    .filter(record =>
      record.category.toLowerCase().includes(filterCategory.toLowerCase()) ||
      record.description.toLowerCase().includes(filterCategory.toLowerCase())
    )
    .sort((a, b) => {
      if (sortByAmount) {
        return b.amount - a.amount
      }
      return 0
    })

  const handleDelete = (id: string) => {
    setRecords(records.filter(r => r.id !== id))
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Miscellaneous</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${pendingAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Miscellaneous Records</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-4 mt-4">
            <Input
              placeholder="Filter by category or description"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full sm:max-w-xs"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => setSortByAmount(!sortByAmount)}
                >
                  Amount
                  <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                </TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.date}</TableCell>
                  <TableCell className="capitalize">{record.category}</TableCell>
                  <TableCell>{record.description}</TableCell>
                  <TableCell>${record.amount.toFixed(2)}</TableCell>
                  <TableCell className="capitalize">{record.payment_method}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      record.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {record.status}
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
                        <Link href={`/accounts/miscellaneous/edit/${record.id}`}>
                          <PencilIcon className="h-4 w-4" />
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
            <DialogTitle>Miscellaneous Record Details</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="mt-1">{selectedRecord.date}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Category</p>
                  <p className="mt-1 capitalize">{selectedRecord.category}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">Description</p>
                  <p className="mt-1">{selectedRecord.description}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Amount</p>
                  <p className="mt-1">${selectedRecord.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Payment Method</p>
                  <p className="mt-1 capitalize">{selectedRecord.payment_method}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Reference Number</p>
                  <p className="mt-1">{selectedRecord.reference_no || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className="mt-1 capitalize">{selectedRecord.status}</p>
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
          <p>Are you sure you want to delete this miscellaneous record? This action cannot be undone.</p>
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