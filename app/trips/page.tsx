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
import { GB as UAE, SA, OM, QA, KW, BH, JO } from 'country-flag-icons/react/3x2'

interface Trip {
  return_load: boolean | null
  date: string | null
  destination_country: string
  service_provider: string
  client: string
  trip_description: string | null
  truck_no: string | null
  driver: string | null
  other_truck_no: string | null
  other_driver: string | null
  other_driver_contact: number | null
  company_rate: number
  driver_rate: number
  diesel: number
  diesel_sold: number | null
  advance: number | null
  advance_usage_details: string | null
  advance_expense: number | null
  trip_rate: number | null
  uae_border: number | null
  uae_border_details: string | null
  international_border: number | null
  international_border_details: string | null
  extra_delivery: number | null
  extra_delivery_details: string | null
  driver_extra_rate: number | null
  extra_charges: number | null
  extra_charges_details: string | null
  lpo_no: string | null
  dio_no: string | null
  tir_no: string | null
  tir_price: number | null
  investor1_share: number | null
  investor2_share: number | null
  investor3_share: number | null
  investor4_share: number | null
  investor5_share: number | null
  custom: number | null
  paid_by_client: number | null
  paid_by_client_details: string | null
  receivable_client: number | null
  receivable_status: string | null
  outsource_payment: number | null
  payable_status: string | null
  truck_profit: number | null
  company_profit: number | null
  other_owner: string | null
  other_owner_number: string | null
}

const countryFlags = {
  UAE: UAE,
  SA: SA,
  OM: OM,
  QA: QA,
  KW: KW,
  BH: BH,
  JO: JO
}

const countryNames = {
  UAE: "United Arab Emirates",
  SA: "Saudi Arabia",
  OM: "Oman",
  QA: "Qatar",
  KW: "Kuwait",
  BH: "Bahrain",
  JO: "Jordan"
}

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [filterTruck, setFilterTruck] = useState("")
  const [filterDriver, setFilterDriver] = useState("")
  const [filterClient, setFilterClient] = useState("")
  const [filterCountry, setFilterCountry] = useState("all")
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [sortByDate, setSortByDate] = useState(false)

  useEffect(() => {
    fetchTrips()
  }, [])

  const fetchTrips = async () => {
    try {
      const data = await fetchApi('/trips')
      setTrips(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching trips:', error)
      setTrips([])
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (trip: Trip) => {
    setTripToDelete(trip)
    setDeleteDialogOpen(true)
    setDeleteError(null)
  }

  const handleDelete = async () => {
    if (!tripToDelete) return

    try {
      await fetchApi(`/trips/${tripToDelete.truck_no}`, {
        method: 'DELETE',
      })

      setTrips(trips.filter(t => t.truck_no !== tripToDelete.truck_no))
      setDeleteDialogOpen(false)
      setTripToDelete(null)
      setDeleteError(null)
    } catch (error) {
      console.error('Error deleting trip:', error)
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete trip')
    }
  }

  const filteredTrips = trips
    .filter(trip => {
      const truckMatch = trip.truck_no?.toLowerCase().includes(filterTruck.toLowerCase()) ?? true
      const driverMatch = trip.driver?.toLowerCase().includes(filterDriver.toLowerCase()) ?? true
      const clientMatch = trip.client.toLowerCase().includes(filterClient.toLowerCase())
      const countryMatch = filterCountry === "all" || trip.destination_country === filterCountry
      return truckMatch && driverMatch && clientMatch && countryMatch
    })
    .sort((a, b) => {
      if (sortByDate) {
        return new Date(b.date || '').getTime() - new Date(a.date || '').getTime()
      }
      return 0
    })

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredTrips)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Trips")
    XLSX.writeFile(workbook, "trips.xlsx")
  }

  const downloadMasterExcel = () => {
    const masterData = trips.map(trip => ({
      "Date": trip.date || "",
      "Destination": countryNames[trip.destination_country as keyof typeof countryNames],
      "Client": trip.client,
      "Service Provider": trip.service_provider,
      "Description": trip.trip_description || "",
      "Return Load": trip.return_load ? "Yes" : "No",
      "Truck Number": trip.truck_no || "",
      "Driver": trip.driver || "",
      "Company Rate": trip.company_rate,
      "Driver Rate": trip.driver_rate,
      "Trip Rate": trip.trip_rate || 0,
      "Diesel": trip.diesel,
      "Advance": trip.advance || 0,
      "Extra Delivery": trip.extra_delivery || 0,
      "Extra Charges": trip.extra_charges || 0,
      "TIR Number": trip.tir_no || "",
      "TIR Price": trip.tir_price || 0,
      "Truck Profit": trip.truck_profit || 0,
      "Company Profit": trip.company_profit || 0,
      "Payment Status": trip.receivable_status
    }))

    const worksheet = XLSX.utils.json_to_sheet(masterData)
    
    const columnWidths = [
      { wch: 12 }, // Date
      { wch: 20 }, // Destination
      { wch: 20 }, // Client
      { wch: 20 }, // Service Provider
      { wch: 30 }, // Description
      { wch: 12 }, // Return Load
      { wch: 15 }, // Truck Number
      { wch: 20 }, // Driver
      { wch: 15 }, // Company Rate
      { wch: 15 }, // Driver Rate
      { wch: 15 }, // Trip Rate
      { wch: 12 }, // Diesel
      { wch: 12 }, // Advance
      { wch: 15 }, // Extra Delivery
      { wch: 15 }, // Extra Charges
      { wch: 15 }, // TIR Number
      { wch: 12 }, // TIR Price
      { wch: 15 }, // Truck Profit
      { wch: 15 }, // Company Profit
      { wch: 15 }, // Payment Status
    ]
    worksheet['!cols'] = columnWidths

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Trip Details")
    XLSX.writeFile(workbook, "trip_master_data.xlsx")
  }

  const totalTrips = trips.length
  const totalRevenue = trips.reduce((sum, trip) => sum + (trip.company_profit || 0), 0)
  const pendingPayments = trips.filter(t => t.receivable_status === 'UNPAID').length
  const completedTrips = trips.filter(t => t.receivable_status === 'PAID').length

  const CountryFlag = ({ country }: { country: string }) => {
    const Flag = countryFlags[country as keyof typeof countryFlags]
    return Flag ? <Flag className="w-6 h-4 inline-block mr-2" /> : null
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <h2 className="text-3xl font-bold tracking-tight">Trips Management</h2>
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
            <Link href="/trips/add">
              <Plus className="mr-2 h-4 w-4" />
              Add Trip
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTrips}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Trips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTrips}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trip Records</CardTitle>
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
            <Input
              placeholder="Filter by client"
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
              className="w-full sm:max-w-xs"
            />
            <Select value={filterCountry} onValueChange={setFilterCountry}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {Object.entries(countryNames).map(([code, name]) => (
                  <SelectItem key={code} value={code}>
                    <div className="flex items-center">
                      <CountryFlag country={code} />
                      {name}
                    </div>
                  </SelectItem>
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
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => setSortByDate(!sortByDate)}
                  >
                    Date
                    <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                  </TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Truck</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Company Rate</TableHead>
                  <TableHead>Driver Rate</TableHead>
                  <TableHead>Trip Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : filteredTrips.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center">No trips found</TableCell>
                  </TableRow>
                ) : (
                  filteredTrips.map((trip, index) => (
                    <TableRow key={index}>
                      <TableCell>{trip.date}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <CountryFlag country={trip.destination_country} />
                          {countryNames[trip.destination_country as keyof typeof countryNames]}
                        </div>
                      </TableCell>
                      <TableCell>{trip.client}</TableCell>
                      <TableCell>{trip.truck_no || 'N/A'}</TableCell>
                      <TableCell>{trip.driver || 'N/A'}</TableCell>
                      <TableCell>${trip.company_rate}</TableCell>
                      <TableCell>${trip.driver_rate}</TableCell>
                      <TableCell>${trip.trip_rate || 0}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          trip.receivable_status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {trip.receivable_status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => {
                            setSelectedTrip(trip)
                            setDialogOpen(true)
                          }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/trips/edit/${trip.truck_no}`}>
                              <PencilIcon className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/trips/${trip.truck_no}/documents`}>
                              <FileText className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteClick(trip)}
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
            <DialogTitle>Trip Details</DialogTitle>
          </DialogHeader>
          {selectedTrip && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="mt-1">{selectedTrip.date}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Destination</p>
                  <p className="mt-1 flex items-center">
                    <CountryFlag country={selectedTrip.destination_country} />
                    {countryNames[selectedTrip.destination_country as keyof typeof countryNames]}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Client</p>
                  <p className="mt-1">{selectedTrip.client}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Service Provider</p>
                  <p className="mt-1">{selectedTrip.service_provider}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Description</p>
                  <p className="mt-1">{selectedTrip.trip_description || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Return Load</p>
                  <p className="mt-1">{selectedTrip.return_load ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Truck</p>
                  <p className="mt-1">{selectedTrip.truck_no || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Driver</p>
                  <p className="mt-1">{selectedTrip.driver || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Company Rate</p>
                  <p className="mt-1">${selectedTrip.company_rate}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Driver Rate</p>
                  <p className="mt-1">${selectedTrip.driver_rate}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Trip Rate</p>
                  <p className="mt-1">${selectedTrip.trip_rate || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Diesel</p>
                  <p className="mt-1">${selectedTrip.diesel}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Advance</p>
                  <p className="mt-1">${selectedTrip.advance || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Extra Delivery</p>
                  <p className="mt-1">${selectedTrip.extra_delivery || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Extra Charges</p>
                  <p className="mt-1">${selectedTrip.extra_charges || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">TIR Number</p>
                  <p className="mt-1">{selectedTrip.tir_no || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">TIR Price</p>
                  <p className="mt-1">${selectedTrip.tir_price || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Truck Profit</p>
                  <p className="mt-1">${selectedTrip.truck_profit || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Company Profit</p>
                  <p className="mt-1">${selectedTrip.company_profit || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Payment Status</p>
                  <p className="mt-1">{selectedTrip.receivable_status}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Trip</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this trip? This action cannot be undone.
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
                setTripToDelete(null)
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