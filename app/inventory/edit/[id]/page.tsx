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

interface Inventory {
  id: number
  name: string
  supplier: string
  supplier_contact: number
  remarks: string | null
  quantity: number
}

export default function EditInventoryPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [item, setItem] = useState<Inventory | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchItem()
  }, [params.id])

  const fetchItem = async () => {
    try {
      const data = await fetchApi(`/inventory/${params.id}`)
      setItem(data)
      setError(null)
    } catch (error) {
      console.error('Error fetching inventory item:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch inventory item')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      if (!item) return

      const formattedData = {
        ...item,
        supplier_contact: Number(item.supplier_contact),
        quantity: Number(item.quantity),
        remarks: item.remarks || null
      }

      await fetchApi(`/inventory/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      })

      toast({
        title: "Success",
        description: "Inventory item updated successfully",
      })
      
      router.push('/inventory')
    } catch (error) {
      console.error('Error updating inventory item:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to update inventory item',
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
  if (!item) return <div className="p-8">Item not found</div>

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Edit TIR Item</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={item.name}
                onChange={(e) => setItem({ ...item, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">
                Supplier <span className="text-red-500">*</span>
              </Label>
              <Input
                id="supplier"
                value={item.supplier}
                onChange={(e) => setItem({ ...item, supplier: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier_contact">
                Supplier Contact <span className="text-red-500">*</span>
              </Label>
              <Input
                id="supplier_contact"
                type="number"
                value={item.supplier_contact}
                onChange={(e) => setItem({ ...item, supplier_contact: Number(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">
                Quantity <span className="text-red-500">*</span>
              </Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={item.quantity}
                onChange={(e) => setItem({ ...item, quantity: parseInt(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                value={item.remarks || ""}
                onChange={(e) => setItem({ ...item, remarks: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push('/inventory')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}