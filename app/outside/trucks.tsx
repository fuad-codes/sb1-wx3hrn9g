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
import { PencilIcon, Eye, Trash2, Truck, ArrowUpDown } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import type { OutsideTruck } from "../api/interfaces"
import { fetchApi } from "@/lib/utils"

export function Trucks() {
  const [trucks, setTrucks] = useState<OutsideTruck[]>([])
  const [loading, setLoading] = useState(true)
  const [filterTruck, setFilterTruck] = useState("")
  const [filterDriver, setFilterDriver] = useState("")
  const [filterCompany, setFilterCompany] = useState("all")
  const [filterOwner, setFilterOwner] = useState("all")
  const [sortByMulkiya, setSortByMulkiya] = useState(false)
  const [companies, setCompanies] = useState<string[]>([])
  const [owners, setOwners] = useState<string[]>([])
  const [selectedTruck, setSelectedTruck] = useState<OutsideTruck | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [truckToDelete, setTruckToDelete] = useState<OutsideTruck | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    fetchTrucks()
    fetchCompanies()
    fetchOwners()
  }, [])

  const fetchTrucks = async () => {
    try {
      const data = await fetchApi('/other-trucks')
      setTrucks(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching trucks:', error)
      setTrucks([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCompanies = async () => {
    try {
      const data = await fetchApi('/company-under')
      setCompanies(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching companies:', error)
      setCompanies([])
    }
  }

  const fetchOwners = async () => {
    try {
      const data = await fetchApi('/other-owners')
      setOwners(data.map((owner: any) => owner.name))
    } catch (error) {
      console.error('Error fetching owners:', error)
      setOwners([])
    }
  }

  const handleDeleteClick = (truck: OutsideTruck) => {
    setTruckToDelete(truck)
    setDeleteDialogOpen(true)
    setDeleteError(null)
  }

  const handleDelete = async () => {
    if (!truckToDelete) return

    try {
      await fetchApi(`/other-trucks/${encodeURIComponent(truckToDelete.truck_number)}`, {
        method: 'DELETE',
      })

      setTrucks(trucks.filter(t => t.truck_number !== truckToDelete.truck_number))
      setDeleteDialogOpen(false)
      setTruckToDelete(null)
      setDeleteError(null)
    } catch (error) {
      console.error('Error deleting truck:', error)
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete truck')
    }
  }

  const filteredTrucks = trucks
    .filter(truck => {
      const truckMatch = truck.truck_number.toLowerCase().includes(filterTruck.toLowerCase())
      const driverMatch = !filterDriver || (truck.driver?.toLowerCase().includes(filterDriver.toLowerCase()))
      const companyMatch = filterCompany === "all" || truck.vehicle_under === filterCompany
      const ownerMatch = filterOwner === "all" || truck.owner === filterOwner
      return truckMatch && driverMatch && companyMatch && ownerMatch
    })
    .sort((a, b) => {
      if (sortByMulkiya) {
        if (!a.mulkiya_exp && !b.mulkiya_exp) return 0
        if (!a.mulkiya_exp) return 1
        if (!b.mulkiya_exp) return -1
        return new Date(a.mulkiya_exp).getTime() - new Date(b.mulkiya_exp).getTime()
      }
      return 0
    })

  const handleTruckClick = (truck: OutsideTruck) => {
    setSelectedTruck(truck)
    setDialogOpen(true)
  }

  const totalTrucks = trucks.length
  const trucksWithTrailer = trucks.filter(t => t.trailer_no).length
  const trucksWithoutTrailer = totalTrucks - trucksWithTrailer

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trucks</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTrucks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Trailer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trucksWithTrailer}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Without Trailer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trucksWithoutTrailer}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Truck List</CardTitle>
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
            <Select value={filterOwner} onValueChange={setFilterOwner}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by owner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Owners</SelectItem>
                {owners.map(owner => (
                  <SelectItem key={owner} value={owner}>{owner}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Truck Number</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Trailer No</TableHead>
                <TableHead>Country</TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => setSortByMulkiya(!sortByMulkiya)}
                >
                  Mulkiya Expiry
                  <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : filteredTrucks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">No trucks found</TableCell>
                </TableRow>
              ) : (
                filteredTrucks.map((truck) => (
                  <TableRow key={truck.truck_number}>
                    <TableCell 
                      className="font-medium cursor-pointer hover:text-blue-600"
                      onClick={() => handleTruckClick(truck)}
                    >
                      {truck.truck_number}
                    </TableCell>
                    <TableCell>{truck.owner}</TableCell>
                    <TableCell>{truck.driver || 'Unassigned'}</TableCell>
                    <TableCell>{truck.vehicle_under}</TableCell>
                    <TableCell>{truck.trailer_no || 'N/A'}</TableCell>
                    <TableCell>{truck.country}</TableCell>
                    <TableCell>{truck.mulkiya_exp || 'Not set'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleTruckClick(truck)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/outside/trucks/edit/${encodeURIComponent(truck.truck_number)}`}>
                            <PencilIcon className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteClick(truck)}
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
            <DialogTitle>Truck Details</DialogTitle>
          </DialogHeader>
          {selectedTruck && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Truck Number</p>
                  <p className="mt-1">{selectedTruck.truck_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Owner</p>
                  <p className="mt-1">{selectedTruck.owner}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Driver</p>
                  <p className="mt-1">{selectedTruck.driver || 'Unassigned'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Year</p>
                  <p className="mt-1">{selectedTruck.year || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Vehicle Under</p>
                  <p className="mt-1">{selectedTruck.vehicle_under}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Trailer Number</p>
                  <p className="mt-1">{selectedTruck.trailer_no || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Country</p>
                  <p className="mt-1">{selectedTruck.country}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Mulkiya Expiry</p>
                  <p className="mt-1">{selectedTruck.mulkiya_exp || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Insurance Expiry</p>
                  <p className="mt-1">{selectedTruck.ins_exp || 'Not set'}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Truck</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete truck {truckToDelete?.truck_number}? This action cannot be undone.
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
                setTruckToDelete(null)
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