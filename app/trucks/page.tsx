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
import { Download, PencilIcon, Plus, Eye, Trash2, ArrowUpDown, FileText } from "lucide-react"
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

interface Truck {
  truck_number: string
  driver: string | null
  year: number
  vehicle_under: string
  trailer_no: string | null
  country: string
  mulkiya_exp: string | null
  ins_exp: string | null
  truck_value: number | null
}

export default function TrucksPage() {
  const [trucks, setTrucks] = useState<Truck[]>([])
  const [companies, setCompanies] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [filterTruckNumber, setFilterTruckNumber] = useState("")
  const [filterDriver, setFilterDriver] = useState("")
  const [filterCountry, setFilterCountry] = useState("all")
  const [filterCompany, setFilterCompany] = useState("all")
  const [sortByYear, setSortByYear] = useState<'asc' | 'desc' | null>(null)
  const [sortByMulkiya, setSortByMulkiya] = useState(false)
  const [sortByIns, setSortByIns] = useState(false)
  const [selectedTruck, setSelectedTruck] = useState<Truck | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [truckToDelete, setTruckToDelete] = useState<Truck | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    fetchTrucks()
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const data = await fetchApi('/company-under')
      setCompanies(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching companies:', error)
      setCompanies([])
    }
  }

  const fetchTrucks = async () => {
    try {
      const data = await fetchApi('/trucks')
      setTrucks(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching trucks:', error)
      setTrucks([])
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (truck: Truck) => {
    setTruckToDelete(truck)
    setDeleteDialogOpen(true)
    setDeleteError(null)
  }

  const handleDelete = async () => {
    if (!truckToDelete) return

    try {
      await fetchApi(`/trucks/${encodeURIComponent(truckToDelete.truck_number)}`, {
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

  function parseDDMMYYYY(dateStr: string | null): Date | null {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split("-");
    return new Date(+year, +month - 1, +day); // Month is 0-indexed
  }

  const filteredTrucks = trucks
    .filter(truck => {
      const truckNumberMatch = truck.truck_number.toLowerCase().includes(filterTruckNumber.toLowerCase())
      const driverMatch = !filterDriver || (truck.driver?.toLowerCase().includes(filterDriver.toLowerCase()))
      const countryMatch = filterCountry === "all" || truck.country === filterCountry
      const companyMatch = filterCompany === "all" || truck.vehicle_under === filterCompany
      return truckNumberMatch && driverMatch && countryMatch && companyMatch
    })
    .sort((a, b) => {
      if (sortByYear === 'asc') {
        return a.year - b.year
      }
      if (sortByYear === 'desc') {
        return b.year - a.year
      }
      if (sortByMulkiya) {
        const aDate = parseDDMMYYYY(a.mulkiya_exp);
        const bDate = parseDDMMYYYY(b.mulkiya_exp);
        if (!aDate && !bDate) return 0;
        if (!aDate) return 1;
        if (!bDate) return -1;
        return aDate.getTime() - bDate.getTime();
      }
      if (sortByIns) {
        const aDate = parseDDMMYYYY(a.ins_exp);
        const bDate = parseDDMMYYYY(b.ins_exp);
        if (!aDate && !bDate) return 0;
        if (!aDate) return 1;
        if (!bDate) return -1;
        return aDate.getTime() - bDate.getTime();
      }
      return 0
    })

  const totalTrucks = trucks.length
  const saudiTrucks = trucks.filter(t => t.country === "SAUDI").length
  const omanTrucks = trucks.filter(t => t.country === "OMAN").length
  const localTrucks = trucks.filter(t => t.country === "LOCAL").length
  const myshaCount = trucks.filter(t => t.vehicle_under === "MYSHA").length
  const saqrCount = trucks.filter(t => t.vehicle_under === "SAQR").length

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredTrucks)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Trucks")
    XLSX.writeFile(workbook, "trucks.xlsx")
  }

  const downloadMasterExcel = () => {
    const masterData = trucks.map(truck => ({
      "Truck Number": truck.truck_number,
      "Driver": truck.driver || "",
      "Year": truck.year,
      "Vehicle Under": truck.vehicle_under,
      "Trailer Number": truck.trailer_no || "",
      "Country": truck.country,
      "Mulkiya Expiry": truck.mulkiya_exp || "",
      "Insurance Expiry": truck.ins_exp || "",
      "Truck Value": truck.truck_value || ""
    }))

    const worksheet = XLSX.utils.json_to_sheet(masterData)
    
    const columnWidths = [
      { wch: 25},
      { wch: 40 },
      { wch: 10 },
      { wch: 10 },
      { wch: 40 },
      { wch: 15 },
      { wch: 25 },
      { wch: 25 },
      { wch: 20 },
    ]
    worksheet['!cols'] = columnWidths

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Truck Details")
    XLSX.writeFile(workbook, "truck_master_data.xlsx")
  }

  const handleTruckClick = (truck: Truck) => {
    setSelectedTruck(truck)
    setDialogOpen(true)
  }

  return (
    <div className="flex flex-col h-screen overflow-x-auto">
      <div className="p-8 space-y-8 flex-1 overflow-y-auto min-w-[1400px]">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <h2 className="text-3xl font-bold tracking-tight">Trucks Management</h2>
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
              <Link href="/trucks/add">
                <Plus className="mr-2 h-4 w-4" />
                Add Truck
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trucks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTrucks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saudi Trucks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{saudiTrucks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Oman Trucks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{omanTrucks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Local Trucks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{localTrucks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">MYSHA Trucks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myshaCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">SAQR Trucks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{saqrCount}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Trucks Fleet</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-4 mt-4">
              <Input
                placeholder="Filter by truck number"
                value={filterTruckNumber}
                onChange={(e) => setFilterTruckNumber(e.target.value)}
                className="w-full sm:max-w-xs"
              />
              <Input
                placeholder="Search driver"
                value={filterDriver}
                onChange={(e) => setFilterDriver(e.target.value)}
                className="w-full sm:max-w-xs"
              />
              <Select value={filterCountry} onValueChange={setFilterCountry}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  <SelectItem value="SAUDI">Saudi</SelectItem>
                  <SelectItem value="OMAN">Oman</SelectItem>
                  <SelectItem value="LOCAL">Local</SelectItem>
                </SelectContent>
              </Select>
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Truck Number</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => {
                        if (sortByYear === null) setSortByYear('asc')
                        else if (sortByYear === 'asc') setSortByYear('desc')
                        else setSortByYear(null)
                        setSortByMulkiya(false)
                        setSortByIns(false)
                      }}
                    >
                      Year
                      <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                    </TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => {
                        setSortByMulkiya(!sortByMulkiya)
                        setSortByYear(null)
                        setSortByIns(false)
                      }}
                    >
                      Mulkiya Expiry
                      <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => {
                        setSortByMulkiya(false)
                        setSortByYear(null)
                        setSortByIns(!sortByIns)
                      }}
                    >
                      Insurance Expiry
                      <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                    </TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Trailer</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center">Loading...</TableCell>
                    </TableRow>
                  ) : filteredTrucks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center">No trucks found</TableCell>
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
                        <TableCell>{truck.driver || 'Unassigned'}</TableCell>
                        <TableCell>{truck.year}</TableCell>
                        <TableCell>{truck.vehicle_under}</TableCell>
                        <TableCell>{truck.mulkiya_exp || 'Not set'}</TableCell>
                        <TableCell>{truck.ins_exp || 'Not set'}</TableCell>
                        <TableCell>{truck.country || 'Not set'}</TableCell>
                        <TableCell>{truck.trailer_no || 'Not set'}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleTruckClick(truck)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/trucks/edit/${encodeURIComponent(truck.truck_number)}`}>
                                <PencilIcon className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/trucks/${encodeURIComponent(truck.truck_number)}/documents`}>
                                <FileText className="h-4 w-4" />
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
            </div>
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
                    <p className="text-sm font-medium text-gray-500">Driver</p>
                    <p className="mt-1">{selectedTruck.driver || 'Unassigned'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Trailer Number</p>
                    <p className="mt-1">{selectedTruck.trailer_no || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Year</p>
                    <p className="mt-1">{selectedTruck.year}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Vehicle Under</p>
                    <p className="mt-1">{selectedTruck.vehicle_under}</p>
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
                  <div>
                    <p className="text-sm font-medium text-gray-500">Truck Value</p>
                    <p className="mt-1">د.إ {selectedTruck.truck_value || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button asChild>
                    <Link href={`/trucks/${encodeURIComponent(selectedTruck.truck_number)}/documents`}>
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
    </div>
  )
}