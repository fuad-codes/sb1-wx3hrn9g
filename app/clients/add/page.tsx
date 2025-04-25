"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { fetchApi } from "@/lib/utils"

export default function AddClientPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    tel_no: "",
    po_box: "",
    trn_no: "",
    contact_person: "",
    person_number: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formattedData = {
        ...formData,
        tel_no: formData.tel_no ? Number(formData.tel_no) : null,
        po_box: formData.po_box ? Number(formData.po_box) : null,
        trn_no: formData.trn_no ? Number(formData.trn_no) : null,
        address: formData.address ? formData.address : null,
        contact_person: formData.contact_person ? formData.contact_person : null,
        person_number: formData.person_number ? Number(formData.person_number) : null
      }

      await fetchApi('/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      })

      toast({
        title: "Success",
        description: "Client added successfully",
      })

      router.push('/clients')
    } catch (error) {
      console.error('Error adding client:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to add client',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Add New Client</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            {/* <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div> */}
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address || ""}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tel_no">Telephone Number</Label>
              <Input
                id="tel_no"
                type="number"
                value={formData.tel_no}
                onChange={(e) => setFormData({ ...formData, tel_no: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="po_box">PO Box</Label>
              <Input
                id="po_box"
                type="number"
                value={formData.po_box}
                onChange={(e) => setFormData({ ...formData, po_box: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trn_no">TRN Number</Label>
              <Input
                id="trn_no"
                type="number"
                value={formData.trn_no}
                onChange={(e) => setFormData({ ...formData, trn_no: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_person">Contact Person</Label>
              <Input
                id="contact_person"
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="person_number">Person Number</Label>
              <Input
                id="person_number"
                type="number"
                value={formData.person_number}
                onChange={(e) => setFormData({ ...formData, person_number: e.target.value })}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add Client"}
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