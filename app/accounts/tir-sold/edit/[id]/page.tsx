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
import type { TIRSoldRecord } from "@/app/api/interfaces"

export default function EditTIRSoldPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [record, setRecord] = useState<TIRSoldRecord | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRecord()
  }, [params.id])

  const fetchRecord = async () => {
    try {
      const response = await fetch(`/api/accounts/tir-sold/${params.id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch TIR sale record')
      }
      const data = await response.json()
      setRecord(data)
      setError(null)
    } catch (error) {
      console.error('Error fetching TIR sale record:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch TIR sale record')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (!record) return

      const calculatedProfit = record.sell_price - record.buy_price
      
      const formattedData = {
        ...record,
        profit: calculatedProfit
      }

      const response = await fetch(`/api/accounts/tir-sold/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      })

      if (!response.ok) {
        throw new Error('Failed to update TIR sale record')
      }

      toast({
        title: "Success",
        description: "TIR sale record updated successfully",
      })

      router.push('/accounts')
    } catch (error) {
      console.error('Error updating TIR sale record:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to update TIR sale record',
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
  if (!record) return <div className="p-8">Record not found</div>

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Edit TIR Sale Record</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="tir_number">
                TIR Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="tir_number"
                value={record.tir_number}
                onChange={(e) => setRecord({ ...record, tir_number: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">
                Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="date"
                type="date"
                value={record.date}
                onChange={(e) => setRecord({ ...record, date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="buy_price">
                Buy Price <span className="text-red-500">*</span>
              </Label>
              <Input
                id="buy_price"
                type="number"
                step="0.01"
                value={record.buy_price}
                onChange={(e) => setRecord({ ...record, buy_price: Number(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sell_price">
                Sell Price <span className="text-red-500">*</span>
              </Label>
              <Input
                id="sell_price"
                type="number"
                step="0.01"
                value={record.sell_price}
                onChange={(e) => setRecord({ ...record, sell_price: Number(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="buyer">
                Buyer <span className="text-red-500">*</span>
              </Label>
              <Input
                id="buyer"
                value={record.buyer}
                onChange={(e) => setRecord({ ...record, buyer: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_method">
                Payment Method <span className="text-red-500">*</span>
              </Label>
              <Select
                value={record.payment_method}
                onValueChange={(value) => setRecord({ ...record, payment_method: value as 'cash' | 'bank' | 'cheque' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_status">
                Payment Status <span className="text-red-500">*</span>
              </Label>
              <Select
                value={record.payment_status}
                onValueChange={(value) => setRecord({ ...record, payment_status: value as 'pending' | 'completed' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference_no">Reference Number</Label>
              <Input
                id="reference_no"
                value={record.reference_no || ""}
                onChange={(e) => setRecord({ ...record, reference_no: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                value={record.remarks || ""}
                onChange={(e) => setRecord({ ...record, remarks: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push('/accounts')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}