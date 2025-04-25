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
import { Download, PencilIcon, Plus, Trash2, ArrowUpDown, FileText } from "lucide-react"
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

interface Trailer {
  trailer_no: string
  company_under: string
  mulkiya_exp: string | null
  oman_ins_exp: string | null
  asset_value: number | null
}

export default function TrailersPage() {
  const [trailers, setTrailers] = useState<Trailer[]>([])
  const [companies, setCompanies] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [filterTrailerNo, setFilterTrailerNo] = useState("")
  const [filterCompany, setFilterCompany] = useState("all")
  const [sortByMulkiya, setSortByMulkiya] = useState(false)
  const [sortByOmanIns, setSortByOmanIns] = useState(false)
  const [selectedTrailer, setSelectedTrailer] = useState<Trailer | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [trailerToDelete, setTrailerToDelete] = useState<Trailer | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const formatDateForInput = (dateString: string | null) => {
  if (!dateString) return ""

  try {
    // Always treat as DD-MM-YYYY since that's your standard
    const [day, month, year] = dateString.split('-').map(Number)
    const date = new Date(Date.UTC(year, month - 1, day))

    if (isNaN(date.getTime())) return ""
    return date.toISOString().split('T')[0]
  } catch {
    return ""
  }
}

    const formatDateForServer = (dateString: string | null) => {
    if (!dateString) return null
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return null

      // Create date at UTC midnight
      const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
      return utcDate.toISOString().split('T')[0]
    } catch {
      return null
    }
  }
  useEffect(() => {
    fetchTrailers()
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

  const fetchTrailers = async () => {
    try {
      const data = await fetchApi('/trailers')
      setTrailers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching trailers:', error)
      setTrailers([])
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (trailer: Trailer) => {
    setTrailerToDelete(trailer)
    setDeleteDialogOpen(true)
    setDeleteError(null)
  }

  const handleDelete = async () => {
    if (!trailerToDelete) return

    try {
      await fetchApi(`/trailers/${encodeURIComponent(trailerToDelete.trailer_no)}`, {
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

  function parseDDMMYYYY(dateStr: string | null): Date | null {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split("-");
    return new Date(+year, +month - 1, +day); // Month is 0-indexed
  }

  const filteredTrailers = trailers
    .filter(trailer => {
      const trailerNoMatch = trailer.trailer_no.toLowerCase().includes(filterTrailerNo.toLowerCase())
      const companyMatch = filterCompany === "all" || trailer.company_under === filterCompany
      return trailerNoMatch && companyMatch
    })
    .sort((a, b) => {
      if (sortByMulkiya) {
        const aDate = parseDDMMYYYY(a.mulkiya_exp);
        const bDate = parseDDMMYYYY(b.mulkiya_exp);
        if (!aDate && !bDate) return 0;
        if (!aDate) return 1;
        if (!bDate) return -1;
        return aDate.getTime() - bDate.getTime();
      }
      if (sortByOmanIns) {
        const aDate = parseDDMMYYYY(a.oman_ins_exp);
        const bDate = parseDDMMYYYY(b.oman_ins_exp);
        if (!aDate && !bDate) return 0;
        if (!aDate) return 1;
        if (!bDate) return -1;
        return aDate.getTime() - bDate.getTime();
      }
      return 0
    })

  const totalTrailers = trailers.length
  const totalAssetValue = trailers.reduce((sum, trailer) => sum + (trailer.asset_value || 0), 0)
  const myshaCount = trailers.filter(t => t.company_under === "MYSHA").length
  const saqrCount = trailers.filter(t => t.company_under === "SAQR").length

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredTrailers)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Trailers")
    XLSX.writeFile(workbook, "trailers.xlsx")
  }

  const downloadMasterExcel = () => {
    const masterData = trailers.map(trailer => ({
      "Trailer Number": trailer.trailer_no,
      "Company Under": trailer.company_under,
      "Mulkiya Expiry": trailer.mulkiya_exp || "",
      "Insurance Expiry": trailer.oman_ins_exp || "",
      "Asset Value": trailer.asset_value || ""
    }))

    const worksheet = XLSX.utils.json_to_sheet(masterData)
    
    const columnWidths = [
      { wch: 35 },
      { wch: 35 },
      { wch: 35 },
      { wch: 35 },
      { wch: 30 }
    ]
    worksheet['!cols'] = columnWidths

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Trailer Details")
    XLSX.writeFile(workbook, "trailer_master_data.xlsx")
  }

  return (
    <div className="flex flex-col h-screen overflow-x-auto">
      <div className="p-8 space-y-8 flex-1 overflow-y-auto min-w-[1400px]">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <h2 className="text-3xl font-bold tracking-tight">Trailers Management</h2>
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
              <Link href="/trailers/add">
                <Plus className="mr-2 h-4 w-4" />
                Add Trailer
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
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
              <CardTitle className="text-sm font-medium">Total Asset Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">د.إ {totalAssetValue.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">MYSHA Trailers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myshaCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">SAQR Trailers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{saqrCount}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Trailers Fleet</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-4 mt-4">
              <Input
                placeholder="Filter by trailer number"
                value={filterTrailerNo}
                onChange={(e) => setFilterTrailerNo(e.target.value)}
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
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trailer Number</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => {
                        setSortByMulkiya(!sortByMulkiya)
                        setSortByOmanIns(false)
                      }}
                    >
                      Mulkiya Expiry
                      <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => {
                        setSortByMulkiya(false)
                        setSortByOmanIns(!sortByOmanIns)
                      }}
                    >
                      Insurance Expiry
                      <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                    </TableHead>
                    <TableHead>Asset Value</TableHead>
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
                        <TableCell className="font-medium">{trailer.trailer_no}</TableCell>
                        <TableCell>{trailer.company_under}</TableCell>
                        <TableCell>{trailer.mulkiya_exp || 'Not set'}</TableCell>
                        <TableCell>{trailer.oman_ins_exp || 'Not set'}</TableCell>
                        <TableCell>د.إ {trailer.asset_value?.toFixed(2) || 'N/A'}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/trailers/edit/${encodeURIComponent(trailer.trailer_no)}`}>
                                <PencilIcon className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/trailers/${encodeURIComponent(trailer.trailer_no)}/documents`}>
                                <FileText className="h-4 w-4" />
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
            </div>
          </CardContent>
        </Card>

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
    </div>
  )
}