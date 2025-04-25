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
import type { TIRRecord } from "@/app/api/interfaces"

interface Driver {
  employee: string
  refered_as: string
}

interface Truck {
  truck_number: string
}

export default function EditTIRPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tir, setTir] = useState<TIRRecord | null>(null)
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [trucks, setTrucks] = useState<Truck[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInitialData()
  }, [params.id])

  const fetchInitialData = async () => {
    try {
      const [tirData, driversData, trucksData] = await Promise.all([
        fetchApi(`/tir/${params.id}`),
        fetchApi('/drivers'),
        fetchApi('/trucks')
      ])

      setTir(tirData)
      setDrivers(Array.isArray(driversData) ? driversData : [])
      setTrucks(Array.isArray(trucksData) ? trucksData : [])
      setError(null)
    } catch (error) {
      console.error('Error fetching data:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      if (!tir) return

      await fetchApi(`/tir/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tir),
      })

      toast({
        title: "Success",
        description: "TIR record updated successfully",
      })
      
      router.push('/inventory')
    } catch (error) {
      console.error('Error updating TIR record:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to update TIR record',
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
  if (!tir) return <div className="p-8">TIR record not found</div>

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Edit TIR</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="number">
                TIR Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="number"
                value={tir.number}
                onChange={(e) => setTir({ ...tir, number: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="issue_date">
                Issue Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="issue_date"
                type="date"
                value={tir.issue_date}
                onChange={(e) => setTir({ ...tir, issue_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiry_date">
                Expiry Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="expiry_date"
                type="date"
                value={tir.expiry_date}
                onChange={(e) => setTir({ ...tir, expiry_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="truck_number">
                Truck Number <span className="text-red-500">*</span>
              </Label>
              <Select
                value={tir.truck_number}
                onValueChange={(value) => setTir({ ...tir, truck_number: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select truck" />
                </SelectTrigger>
                <SelectContent>
                  {trucks.map(truck => (
                    <SelectItem key={truck.truck_number} value={truck.truck_number}>
                      {truck.truck_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="driver_name">
                Driver <span className="text-red-500">*</span>
              </Label>
              <Select
                value={tir.driver_name}
                onValueChange={(value) => setTir({ ...tir, driver_name: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select driver" />
                </SelectTrigger>
                <SelectContent>
                  {drivers.map(driver => (
                    <SelectItem key={driver.employee} value={driver.employee}>
                      {driver.refered_as}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">
                Status <span className="text-red-500">*</span>
              </Label>
              <Select
                value={tir.status}
                onValueChange={(value) => setTir({ ...tir, status: value as 'active' | 'expired' | 'pending' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">
                Country <span className="text-red-500">*</span>
              </Label>
              <Select
                value={tir.country}
                onValueChange={(value) => setTir({ ...tir, country: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UAE">United Arab Emirates</SelectItem>
                  <SelectItem value="SA">Saudi Arabia</SelectItem>
                  <SelectItem value="OM">Oman</SelectItem>
                  <SelectItem value="QA">Qatar</SelectItem>
                  <SelectItem value="KW">Kuwait</SelectItem>
                  <SelectItem value="BH">Bahrain</SelectItem>
                  <SelectItem value="JO">Jordan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customs_office">
                Customs Office <span className="text-red-500">*</span>
              </Label>
              <Input
                id="customs_office"
                value={tir.customs_office}
                onChange={(e) => setTir({ ...tir, customs_office: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                value={tir.remarks || ""}
                onChange={(e) => setTir({ ...tir, remarks: e.target.value })}
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