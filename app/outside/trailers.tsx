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
import { PencilIcon, Eye, Trash2, ArrowUpDown } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import type { OutsideTrailer } from "../api/interfaces"
import { fetchApi } from "@/lib/utils"

export function Trailers() {
  const [trailers, setTrailers] = useState<OutsideTrailer[]>([])
  const [loading, setLoading] = useState(true)
  const [filterTrailer, setFilterTrailer] = useState("")
  const [filterCompany, setFilterCompany] = useState("all")
  const [filterOwner, setFilterOwner] = useState("all")
  const [sortByMulkiya, setSortByMulkiya] = useState(false)
  const [companies, setCompanies] = useState<string[]>([])
  const [owners, setOwners] = useState<string[]>([])
  const [selectedTrailer, setSelectedTrailer] = useState<OutsideTrailer | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [trailerToDelete, setTrailerToDelete] = useState<OutsideTrailer | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    fetchTrailers()
    fetchCompanies()
    fetchOwners()
  }, [])

  const fetchTrailers = async () => {
    try {
      const data = await fetchApi('/other-trailers')
      setTrailers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching trailers:', error)
      setTrailers([])
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

  const handleDeleteClick = (trailer: OutsideTrailer) => {
    setTrailerToDelete(trailer)
    setDeleteDialogOpen(true)
    setDeleteError(null)
  }

  const handleDelete = async () => {
    if (!trailerToDelete) return

    try {
      await fetchApi(`/other-trailers/${encodeURIComponent(trailerToDelete.trailer_no)}`, {
        method: 'DELETE',
      })

      setTrailers(trailers.filter(t => t.trailer_no !== trailerToDelete.trailer_no))
      setDeleteDialogOpen(false)
      setTrailerToDelete(null)
      setDeleteError(null)
    } catch (error) {
      console.error('Error deleting trailer:', error)
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete trailer')
    }
  }

  const filteredTrailers = trailers
    .filter(trailer => {
      const trailerMatch = trailer.trailer_no.toLowerCase().includes(filterTrailer.toLowerCase())
      const companyMatch = filterCompany === "all" || trailer.company_under === filterCompany
      const ownerMatch = filterOwner === "all" || trailer.owner === filterOwner
      return trailerMatch && companyMatch && ownerMatch
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

  const handleTrailerClick = (trailer: OutsideTrailer) => {
    setSelectedTrailer(trailer)
    setDialogOpen(true)
  }

  const totalTrailers = trailers.length
  const trailersWithInsurance = trailers.filter(t => t.oman_ins_exp).length
  const trailersWithoutInsurance = totalTrailers - trailersWithInsurance

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trailers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTrailers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Insurance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trailersWithInsurance}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Without Insurance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trailersWithoutInsurance}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trailer List</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-4 mt-4">
            <Input
              placeholder="Filter by trailer number"
              value={filterTrailer}
              onChange={(e) => setFilterTrailer(e.target.value)}
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
                <TableHead>Trailer Number</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Company</TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => setSortByMulkiya(!sortByMulkiya)}
                >
                  Mulkiya Expiry
                  <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                </TableHead>
                <TableHead>Insurance Expiry</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : filteredTrailers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">No trailers found</TableCell>
                </TableRow>
              ) : (
                filteredTrailers.map((trailer) => (
                  <TableRow key={trailer.trailer_no}>
                    <TableCell 
                      className="font-medium cursor-pointer hover:text-blue-600"
                      onClick={() => handleTrailerClick(trailer)}
                    >
                      {trailer.trailer_no}
                    </TableCell>
                    <TableCell>{trailer.owner}</TableCell>
                    <TableCell>{trailer.company_under}</TableCell>
                    <TableCell>{trailer.mulkiya_exp || 'Not set'}</TableCell>
                    <TableCell>{trailer.oman_ins_exp || 'Not set'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleTrailerClick(trailer)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/outside/trailers/edit/${encodeURIComponent(trailer.trailer_no)}`}>
                            <PencilIcon className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteClick(trailer)}
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
            <DialogTitle>Trailer Details</DialogTitle>
          </DialogHeader>
          {selectedTrailer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Trailer Number</p>
                  <p className="mt-1">{selectedTrailer.trailer_no}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Owner</p>
                  <p className="mt-1">{selectedTrailer.owner}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Company Under</p>
                  <p className="mt-1">{selectedTrailer.company_under}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Mulkiya Expiry</p>
                  <p className="mt-1">{selectedTrailer.mulkiya_exp || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Insurance Expiry</p>
                  <p className="mt-1">{selectedTrailer.oman_ins_exp || 'Not set'}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Trailer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete trailer {trailerToDelete?.trailer_no}? This action cannot be undone.
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
                setTrailerToDelete(null)
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