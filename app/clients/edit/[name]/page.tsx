"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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

export default function EditClientPage({ params }: { params: { name: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [client, setClient] = useState<Client | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchClient()
  }, [params.name])

  const fetchClient = async () => {
    try {
      const data = await fetchApi(`/clients/${params.name}`)
      setClient(data)
      setError(null)
    } catch (error) {
      console.error('Error fetching client:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch client')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      if (!client) return

      await fetchApi(`/clients/${params.name}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(client),
      })
      
      router.push('/clients')
    } catch (error) {
      console.error('Error updating client:', error)
      setError(error instanceof Error ? error.message : 'Failed to update client')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8">Loading...</div>
  if (error) return (
    <div className="p-8">
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    </div>
  )
  if (!client) return <div className="p-8">Client not found</div>

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Edit Client</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={client.name}
                onChange={(e) => setClient({ ...client, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={client.address || ""}
                onChange={(e) => setClient({ ...client, address: e.target.value })}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tel_no">Telephone Number</Label>
              <Input
                id="tel_no"
                type="number"
                value={client.tel_no || ""}
                onChange={(e) => setClient({ ...client, tel_no: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="po_box">PO Box</Label>
              <Input
                id="po_box"
                type="number"
                value={client.po_box || ""}
                onChange={(e) => setClient({ ...client, po_box: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trn_no">TRN Number</Label>
              <Input
                id="trn_no"
                type="number"
                value={client.trn_no || ""}
                onChange={(e) => setClient({ ...client, trn_no: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_person">
                Contact Person
              </Label>
              <Input
                id="contact_person"
                value={client.contact_person || ""}
                onChange={(e) => setClient({ ...client, contact_person: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="person_number">Person Number</Label>
              <Input
                id="person_number"
                type="number"
                value={client.person_number || ""}
                onChange={(e) => setClient({ ...client, person_number: Number(e.target.value) })}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push('/clients')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}