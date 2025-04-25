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
import { PencilIcon, Eye, Trash2, Users } from "lucide-react"
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

interface OutsideOwner {
  name: string
  contact_person: string | null
  phone_number: string | null
  whatsapp_number: string | null
  address: string | null
  remarks: string | null
}

export function Owners() {
  const [owners, setOwners] = useState<OutsideOwner[]>([])
  const [loading, setLoading] = useState(true)
  const [filterName, setFilterName] = useState("")
  const [selectedOwner, setSelectedOwner] = useState<OutsideOwner | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [ownerToDelete, setOwnerToDelete] = useState<OutsideOwner | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    fetchOwners()
  }, [])

  const fetchOwners = async () => {
    try {
      const data = await fetchApi('/other-owners')
      setOwners(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching owners:', error)
      setOwners([])
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (owner: OutsideOwner) => {
    setOwnerToDelete(owner)
    setDeleteDialogOpen(true)
    setDeleteError(null)
  }

  const handleDelete = async () => {
    if (!ownerToDelete) return

    try {
      await fetchApi(`/other-owners/${encodeURIComponent(ownerToDelete.name)}`, {
        method: 'DELETE',
      })

      setOwners(owners.filter(o => o.name !== ownerToDelete.name))
      setDeleteDialogOpen(false)
      setOwnerToDelete(null)
      setDeleteError(null)
    } catch (error) {
      console.error('Error deleting owner:', error)
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete owner')
    }
  }

  const filteredOwners = owners.filter(owner =>
    owner.name.toLowerCase().includes(filterName.toLowerCase())
  )

  const handleOwnerClick = (owner: OutsideOwner) => {
    setSelectedOwner(owner)
    setDialogOpen(true)
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Owners</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{owners.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Owner List</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-4 mt-4">
            <Input
              placeholder="Filter by name"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className="w-full sm:max-w-xs"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : filteredOwners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">No owners found</TableCell>
                </TableRow>
              ) : (
                filteredOwners.map((owner) => (
                  <TableRow key={owner.name}>
                    <TableCell 
                      className="font-medium cursor-pointer hover:text-blue-600"
                      onClick={() => handleOwnerClick(owner)}
                    >
                      {owner.name}
                    </TableCell>
                    <TableCell>{owner.contact_person || 'N/A'}</TableCell>
                    <TableCell>{owner.phone_number || 'N/A'}</TableCell>
                    <TableCell>{owner.whatsapp_number || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOwnerClick(owner)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/outside/owners/edit/${encodeURIComponent(owner.name)}`}>
                            <PencilIcon className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteClick(owner)}
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
            <DialogTitle>Owner Details</DialogTitle>
          </DialogHeader>
          {selectedOwner && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="mt-1">{selectedOwner.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Contact Person</p>
                  <p className="mt-1">{selectedOwner.contact_person || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone Number</p>
                  <p className="mt-1">{selectedOwner.phone_number || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">WhatsApp Number</p>
                  <p className="mt-1">{selectedOwner.whatsapp_number || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <Textarea
                    value={selectedOwner.address || 'N/A'}
                    className="mt-1"
                    readOnly
                  />
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">Remarks</p>
                  <Textarea
                    value={selectedOwner.remarks || 'N/A'}
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
            <DialogTitle>Delete Owner</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete owner {ownerToDelete?.name}? This action cannot be undone.
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
                setOwnerToDelete(null)
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