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

interface Supplier {
  name: string
  tel_no: string | null
  contact_person: string | null
  phone_no: string | null
  about: string | null
}

export default function EditSupplierPage({ params }: { params: { name: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [supplier, setSupplier] = useState<Supplier | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSupplier()
  }, [params.name])

  const fetchSupplier = async () => {
    try {
      const decodedName = decodeURIComponent(params.name)
      const data = await fetchApi(`/suppliers/${decodedName}`)
      setSupplier(data)
      setError(null)
    } catch (error) {
      console.error('Error fetching supplier:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch supplier')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      if (!supplier) return

      const decodedName = decodeURIComponent(params.name)
      await fetchApi(`/suppliers/${decodedName}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(supplier),
      })

      toast({
        title: "Success",
        description: "Supplier updated successfully",
      })
      
      router.push('/suppliers')
    } catch (error) {
      console.error('Error updating supplier:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to update supplier',
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
  if (!supplier) return <div className="p-8">Supplier not found</div>

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Edit Supplier</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={supplier.name}
                onChange={(e) => setSupplier({ ...supplier, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tel_no">Telephone Number</Label>
              <Input
                id="tel_no"
                value={supplier.tel_no || ""}
                onChange={(e) => setSupplier({ ...supplier, tel_no: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_person">Contact Person</Label>
              <Input
                id="contact_person"
                value={supplier.contact_person || ""}
                onChange={(e) => setSupplier({ ...supplier, contact_person: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_no">Phone Number</Label>
              <Input
                id="phone_no"
                value={supplier.phone_no || ""}
                onChange={(e) => setSupplier({ ...supplier, phone_no: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="about">About</Label>
              <Textarea
                id="about"
                value={supplier.about || ""}
                onChange={(e) => setSupplier({ ...supplier, about: e.target.value })}
                rows={4}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push('/suppliers')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}