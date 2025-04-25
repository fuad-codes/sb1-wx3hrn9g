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
import { PencilIcon, Eye, Trash2, FileText, Users } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import type { OutsideEmployee } from "../api/interfaces"
import { fetchApi } from "@/lib/utils"

export function Drivers() {
  const [drivers, setDrivers] = useState<OutsideEmployee[]>([])
  const [loading, setLoading] = useState(true)
  const [filterName, setFilterName] = useState("")
  const [filterCompany, setFilterCompany] = useState("all")
  const [filterOwner, setFilterOwner] = useState("all")
  const [companies, setCompanies] = useState<string[]>([])
  const [owners, setOwners] = useState<string[]>([])
  const [selectedDriver, setSelectedDriver] = useState<OutsideEmployee | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [driverToDelete, setDriverToDelete] = useState<OutsideEmployee | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    fetchDrivers()
    fetchCompanies()
    fetchOwners()
  }, [])

  const fetchDrivers = async () => {
    try {
      const data = await fetchApi('/other-employees')
      setDrivers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching drivers:', error)
      setDrivers([])
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

  const handleDeleteClick = (driver: OutsideEmployee) => {
    setDriverToDelete(driver)
    setDeleteDialogOpen(true)
    setDeleteError(null)
  }

  const handleDelete = async () => {
    if (!driverToDelete) return

    try {
      await fetchApi(`/other-employees/${encodeURIComponent(driverToDelete.employee)}`, {
        method: 'DELETE',
      })

      setDrivers(drivers.filter(d => d.employee !== driverToDelete.employee))
      setDeleteDialogOpen(false)
      setDriverToDelete(null)
      setDeleteError(null)
    } catch (error) {
      console.error('Error deleting driver:', error)
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete driver')
    }
  }

  const filteredDrivers = drivers.filter(driver => {
    const nameMatch = driver.employee.toLowerCase().includes(filterName.toLowerCase())
    const companyMatch = filterCompany === "all" || driver.visa_under === filterCompany
    const ownerMatch = filterOwner === "all" || driver.owner === filterOwner
    return nameMatch && companyMatch && ownerMatch
  })

  const handleDriverClick = (driver: OutsideEmployee) => {
    setSelectedDriver(driver)
    setDialogOpen(true)
  }

  const totalDrivers = drivers.length
  const driversWithLicense = drivers.filter(d => d.license_exp).length
  const driversWithoutLicense = totalDrivers - driversWithLicense

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Drivers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDrivers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With License</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{driversWithLicense}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Without License</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{driversWithoutLicense}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Driver List</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-4 mt-4">
            <Input
              placeholder="Filter by name"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
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
                <TableHead>Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Visa Under</TableHead>
                <TableHead>Nationality</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : filteredDrivers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">No drivers found</TableCell>
                </TableRow>
              ) : (
                filteredDrivers.map((driver) => (
                  <TableRow key={driver.employee}>
                    <TableCell 
                      className="font-medium cursor-pointer hover:text-blue-600"
                      onClick={() => handleDriverClick(driver)}
                    >
                      {driver.employee}
                    </TableCell>
                    <TableCell>{driver.owner}</TableCell>
                    <TableCell>{driver.designation || 'N/A'}</TableCell>
                    <TableCell>{driver.contact_no || 'N/A'}</TableCell>
                    <TableCell>{driver.visa_under}</TableCell>
                    <TableCell>{driver.nationality}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleDriverClick(driver)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/outside/drivers/edit/${encodeURIComponent(driver.employee)}`}>
                            <PencilIcon className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/outside/drivers/${encodeURIComponent(driver.employee)}/documents`}>
                            <FileText className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteClick(driver)}
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
            <DialogTitle>Driver Details</DialogTitle>
          </DialogHeader>
          {selectedDriver && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Full Name</p>
                  <p className="mt-1">{selectedDriver.employee}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Owner</p>
                  <p className="mt-1">{selectedDriver.owner}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Referred As</p>
                  <p className="mt-1">{selectedDriver.refered_as || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Designation</p>
                  <p className="mt-1">{selectedDriver.designation || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Contact Number</p>
                  <p className="mt-1">{selectedDriver.contact_no || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">WhatsApp Number</p>
                  <p className="mt-1">{selectedDriver.whatsapp_no || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Visa Under</p>
                  <p className="mt-1">{selectedDriver.visa_under}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Visa Expiry</p>
                  <p className="mt-1">{selectedDriver.visa_exp || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Nationality</p>
                  <p className="mt-1">{selectedDriver.nationality}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Emirates ID</p>
                  <p className="mt-1">{selectedDriver.eid || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Health Insurance Expiry</p>
                  <p className="mt-1">{selectedDriver.health_ins_exp || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Employment Insurance Expiry</p>
                  <p className="mt-1">{selectedDriver.emp_ins_exp || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">License Expiry</p>
                  <p className="mt-1">{selectedDriver.license_exp || 'Not set'}</p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button asChild>
                  <Link href={`/outside/drivers/${encodeURIComponent(selectedDriver.employee)}/documents`}>
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
            <DialogTitle>Delete Driver</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete driver {driverToDelete?.employee}? This action cannot be undone.
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
                setDriverToDelete(null)
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