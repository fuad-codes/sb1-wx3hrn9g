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
import { Download, PencilIcon, Plus, Eye, Trash2, Users } from "lucide-react"
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

interface Client {
  name: string
  address: string | null
  tel_no: number | null
  po_box: number | null
  trn_no: number | null
  contact_person: string | null
  person_number: number | null
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [filterName, setFilterName] = useState("")
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const data = await fetchApi('/clients')
      setClients(data)
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (client: Client) => {
    setClientToDelete(client)
    setDeleteDialogOpen(true)
    setDeleteError(null)
  }

  const handleDelete = async () => {
    if (!clientToDelete) return

    try {
      await fetchApi(`/clients/${encodeURIComponent(clientToDelete.name)}`, {
        method: 'DELETE',
      })

      setClients(clients.filter(c => c.name !== clientToDelete.name))
      setDeleteDialogOpen(false)
      setClientToDelete(null)
      setDeleteError(null)
    } catch (error) {
      console.error('Error deleting client:', error)
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete client')
    }
  }

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(filterName.toLowerCase())
  )

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredClients)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clients")
    XLSX.writeFile(workbook, "clients.xlsx")
  }

  const downloadMasterExcel = () => {
    const masterData = clients.map(client => ({
      "Name": client.name,
      "Address": client.address || "",
      "Telephone": client.tel_no || "",
      "PO Box": client.po_box || "",
      "TRN Number": client.trn_no || "",
      "Contact Person": client.contact_person || "",
      "Person Number": client.person_number || ""
    }))

    const worksheet = XLSX.utils.json_to_sheet(masterData)
    
    const columnWidths = [
      { wch: 40 }, // Name
      { wch: 40 }, // Address
      { wch: 15 }, // Telephone
      { wch: 15 }, // PO Box
      { wch: 15 }, // TRN Number
      { wch: 30 }, // contact person
      { wch: 40 }, // person number
    ]
    worksheet['!cols'] = columnWidths

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Client Details")
    XLSX.writeFile(workbook, "client_master_data.xlsx")
  }

  const handleClientClick = (client: Client) => {
    setSelectedClient(client)
    setDialogOpen(true)
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <h2 className="text-3xl font-bold tracking-tight">Clients Management</h2>
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
            <Link href="/clients/add">
              <Plus className="mr-2 h-4 w-4" />
              Add Client
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client List</CardTitle>
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
                <TableHead>Telephone</TableHead>
                <TableHead>PO Box</TableHead>
                <TableHead>TRN Number</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : filteredClients.map((client) => (
                <TableRow key={client.name}>
                  <TableCell 
                    className="font-medium cursor-pointer hover:text-blue-600"
                    onClick={() => handleClientClick(client)}
                  >
                    {client.name}
                  </TableCell>
                  <TableCell>{client.contact_person || 'N/A'}</TableCell>
                  <TableCell>{client.tel_no || 'N/A'}</TableCell>
                  <TableCell>{client.po_box || 'N/A'}</TableCell>
                  <TableCell>{client.trn_no || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleClientClick(client)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/clients/edit/${encodeURIComponent(client.name)}`}>
                          <PencilIcon className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteClick(client)}
                        className="text-red-500 hover:text-red-700"
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Client Details</DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="mt-1">{selectedClient.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Telephone</p>
                  <p className="mt-1">{selectedClient.tel_no || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">PO Box</p>
                  <p className="mt-1">{selectedClient.po_box || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">TRN Number</p>
                  <p className="mt-1">{selectedClient.trn_no || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Contact Person</p>
                  <p className="mt-1">{selectedClient.contact_person || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Person Number</p>
                  <p className="mt-1">{selectedClient.person_number || 'N/A'}</p>
                </div>
                {/* <div>
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p className="mt-1">{selectedClient.address || 'N/A'}</p>
                </div> */}
                <div>
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p className="mt-1 whitespace-pre-wrap break-words">{selectedClient.address  || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Client</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete client {clientToDelete?.name}? This action cannot be undone.
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
                setClientToDelete(null)
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