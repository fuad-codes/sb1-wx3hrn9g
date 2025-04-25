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
import { PencilIcon, Eye, Trash2 } from "lucide-react"
import Link from "next/link"
import type { TIRRecord } from "../api/interfaces"
import { fetchApi } from "@/lib/utils"

export function TIR() {
  const [records, setRecords] = useState<TIRRecord[]>([])
  const [filterTruck, setFilterTruck] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTIRs()
  }, [])

  const fetchTIRs = async () => {
    try {
      const data = await fetchApi('/tir')
      setRecords(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching TIRs:', error)
      setRecords([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetchApi(`/tir/${id}`, {
        method: 'DELETE'
      })
      setRecords(records.filter(r => r.id !== id))
    } catch (error) {
      console.error('Error deleting TIR:', error)
    }
  }

  const activeTIRs = records.filter(r => r.status === 'active').length
  const expiredTIRs = records.filter(r => r.status === 'expired').length
  const pendingTIRs = records.filter(r => r.status === 'pending').length

  const filteredRecords = records.filter(record =>
    record.truck_number.toLowerCase().includes(filterTruck.toLowerCase())
  )

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
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
            <CardTitle className="text-sm font-medium">Expired TIRs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiredTIRs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending TIRs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTIRs}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>TIR Records</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-4 mt-4">
            <Input
              placeholder="Filter by truck number"
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
                <TableHead>TIR Number</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Truck</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">No records found</TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.number}</TableCell>
                    <TableCell>{record.issue_date}</TableCell>
                    <TableCell>{record.expiry_date}</TableCell>
                    <TableCell>{record.truck_number}</TableCell>
                    <TableCell>{record.driver_name}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        record.status === 'active' ? 'bg-green-100 text-green-800' :
                        record.status === 'expired' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {record.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/inventory/tir/edit/${record.id}`}>
                            <PencilIcon className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDelete(record.id)}
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
  )
}