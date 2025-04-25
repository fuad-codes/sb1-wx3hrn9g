"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { fetchApi } from "@/lib/utils"

interface OutsideOwner {
  name: string
  contact_person: string | null
  phone_number: string | null
  whatsapp_number: string | null
  address: string | null
  remarks: string | null
}

export default function EditOwnerPage({ params }: { params: { name: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [owner, setOwner] = useState<OutsideOwner | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchOwner()
  }, [params.name])

  const fetchOwner = async () => {
    try {
      const decodedName = decodeURIComponent(params.name)
      const data = await fetchApi(`/other-owners/${decodedName}`)
      setOwner(data)
      setError(null)
    } catch (error) {
      console.error('Error fetching owner:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch owner')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      if (!owner) return

      const decodedName = decodeURIComponent(params.name)
      await fetchApi(`/other-owners/${decodedName}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(owner),
      })

      toast({
        title: "Success",
        description: "Owner updated successfully",
      })
      
      router.push('/outside')
    } catch (error) {
      console.error('Error updating owner:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to update owner',
      })
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
  if (!owner) return <div className="p-8">Owner not found</div>

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Edit Owner</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={owner.name}
                onChange={(e) => setOwner({ ...owner, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_person">Contact Person</Label>
              <Input
                id="contact_person"
                value={owner.contact_person || ""}
                onChange={(e) => setOwner({ ...owner, contact_person: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                value={owner.phone_number || ""}
                onChange={(e) => setOwner({ ...owner, phone_number: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
              <Input
                id="whatsapp_number"
                value={owner.whatsapp_number || ""}
                onChange={(e) => setOwner({ ...owner, whatsapp_number: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={owner.address || ""}
                onChange={(e) => setOwner({ ...owner, address: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                value={owner.remarks || ""}
                onChange={(e) => setOwner({ ...owner, remarks: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push('/outside')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}