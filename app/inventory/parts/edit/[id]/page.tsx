"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { fetchApi } from "@/lib/utils"
import type { PartRecord } from "@/app/api/interfaces"

export default function EditPartPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [part, setPart] = useState<PartRecord | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPart()
  }, [params.id])

  const fetchPart = async () => {
    try {
      const data = await fetchApi(`/parts/${params.id}`)
      setPart(data)
      setError(null)
    } catch (error) {
      console.error('Error fetching part:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch part')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      if (!part) return

      // Calculate status based on quantity and minimum stock
      const status = part.quantity === 0 ? 'out_of_stock' : 
                     part.quantity <= part.minimum_stock ? 'low_stock' : 'in_stock'

      const formattedData = {
        ...part,
        status
      }

      await fetchApi(`/parts/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      })

      toast({
        title: "Success",
        description: "Part updated successfully",
      })
      
      router.push('/inventory')
    } catch (error) {
      console.error('Error updating part:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to update part',
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
  if (!part) return <div className="p-8">Part not found</div>

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Edit Part</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={part.name}
                onChange={(e) => setPart({ ...part, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="part_number">
                Part Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="part_number"
                value={part.part_number}
                onChange={(e) => setPart({ ...part, part_number: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={part.category}
                onValueChange={(value) => setPart({ ...part, category: value as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="engine">Engine</SelectItem>
                  <SelectItem value="transmission">Transmission</SelectItem>
                  <SelectItem value="brake">Brake</SelectItem>
                  <SelectItem value="electrical">Electrical</SelectItem>
                  <SelectItem value="suspension">Suspension</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">
                Quantity <span className="text-red-500">*</span>
              </Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={part.quantity}
                onChange={(e) => setPart({ ...part, quantity: parseInt(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit_price">
                Unit Price <span className="text-red-500">*</span>
              </Label>
              <Input
                id="unit_price"
                type="number"
                step="0.01"
                min="0"
                value={part.unit_price}
                onChange={(e) => setPart({ ...part, unit_price: parseFloat(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">
                Supplier <span className="text-red-500">*</span>
              </Label>
              <Input
                id="supplier"
                value={part.supplier}
                onChange={(e) => setPart({ ...part, supplier: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">
                Location <span className="text-red-500">*</span>
              </Label>
              <Input
                id="location"
                value={part.location}
                onChange={(e) => setPart({ ...part, location: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimum_stock">
                Minimum Stock <span className="text-red-500">*</span>
              </Label>
              <Input
                id="minimum_stock"
                type="number"
                min="0"
                value={part.minimum_stock}
                onChange={(e) => setPart({ ...part, minimum_stock: parseInt(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_purchase_date">Last Purchase Date</Label>
              <Input
                id="last_purchase_date"
                type="date"
                value={part.last_purchase_date || ""}
                onChange={(e) => setPart({ ...part, last_purchase_date: e.target.value })}
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