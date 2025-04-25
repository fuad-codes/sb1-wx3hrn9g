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

interface Driver {
  employee: string
  refered_as: string
}

interface Truck {
  truck_number: string
}

export default function AddTIRPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [trucks, setTrucks] = useState<Truck[]>([])
  const [formData, setFormData] = useState({
    number: "",
    issue_date: new Date().toISOString().split('T')[0],
    expiry_date: "",
    truck_number: "",
    driver_name: "",
    status: "active",
    country: "UAE",
    customs_office: "",
    remarks: ""
  })

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      const [driversData, trucksData] = await Promise.all([
        fetchApi('/drivers'),
        fetchApi('/trucks')
      ])

      setDrivers(Array.isArray(driversData) ? driversData : [])
      setTrucks(Array.isArray(trucksData) ? trucksData : [])
    } catch (error) {
      console.error('Error fetching initial data:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load required data. Please refresh the page.",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Calculate expiry date if not provided (typically 1 year from issue date)
      let expiryDate = formData.expiry_date
      if (!expiryDate) {
        const issueDate = new Date(formData.issue_date)
        issueDate.setFullYear(issueDate.getFullYear() + 1)
        expiryDate = issueDate.toISOString().split('T')[0]
      }

      const formattedData = {
        ...formData,
        expiry_date: expiryDate,
        remarks: formData.remarks || null
      }

      await fetchApi('/tir', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      })

      toast({
        title: "Success",
        description: "TIR record added successfully",
      })

      router.push('/inventory')
    } catch (error) {
      console.error('Error adding TIR record:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to add TIR record',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Add New TIR</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="number">
                TIR Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="number"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
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
                value={formData.issue_date}
                onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiry_date">
                Expiry Date
              </Label>
              <Input
                id="expiry_date"
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">If not provided, will default to 1 year from issue date</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="truck_number">
                Truck Number <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.truck_number}
                onValueChange={(value) => setFormData({ ...formData, truck_number: value })}
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
                value={formData.driver_name}
                onValueChange={(value) => setFormData({ ...formData, driver_name: value })}
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
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as 'active' | 'expired' | 'pending' })}
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
                value={formData.country}
                onValueChange={(value) => setFormData({ ...formData, country: value })}
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
                value={formData.customs_office}
                onChange={(e) => setFormData({ ...formData, customs_office: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add TIR"}
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