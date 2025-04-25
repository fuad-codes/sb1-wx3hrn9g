"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { fetchApi } from "@/lib/utils"

interface Driver {
  employee: string
  refered_as: string
}

interface Trip {
  trip_id: number
  driver: string
  truck_number: string
}

export default function AddFinePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [trips, setTrips] = useState<Trip[]>([])
  const [formData, setFormData] = useState({
    trip_id: null as number | null,
    reason: "",
    truck_number: "",
    driver_name: "",
    driver_fault: false,
    fine_date: new Date().toISOString().split('T')[0],
    amount: 0,
    payment_status: "pending"
  })

  useEffect(() => {
    fetchDrivers()
    fetchTrips()
  }, [])

  const fetchDrivers = async () => {
    try {
      const data = await fetchApi('/drivers')
      setDrivers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching drivers:', error)
      setDrivers([])
    }
  }

  const fetchTrips = async () => {
    try {
      const data = await fetchApi('/trips')
      setTrips(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching trips:', error)
      setTrips([])
    }
  }

  const handleTripChange = (tripId: string) => {
    const selectedTrip = trips.find(t => t.trip_id === parseInt(tripId))
    if (selectedTrip) {
      setFormData({
        ...formData,
        trip_id: selectedTrip.trip_id,
        driver_name: selectedTrip.driver,
        truck_number: selectedTrip.truck_number
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await fetchApi('/fines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      toast({
        title: "Success",
        description: "Fine record added successfully",
      })

      router.push('/fines')
    } catch (error) {
      console.error('Error adding fine:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to add fine',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Add New Fine</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="trip_id">Related Trip</Label>
              <Select
                value={formData.trip_id?.toString() || ""}
                onValueChange={handleTripChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select trip (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {trips.map(trip => (
                    <SelectItem key={trip.trip_id} value={trip.trip_id.toString()}>
                      Trip #{trip.trip_id} - {trip.driver}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fine_date">
                Fine Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fine_date"
                type="date"
                value={formData.fine_date}
                onChange={(e) => setFormData({ ...formData, fine_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="driver">Driver</Label>
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
              <Label htmlFor="truck_number">Truck Number</Label>
              <Input
                id="truck_number"
                value={formData.truck_number}
                onChange={(e) => setFormData({ ...formData, truck_number: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">
                Amount <span className="text-red-500">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="driver_fault"
                checked={formData.driver_fault}
                onCheckedChange={(checked) => setFormData({ ...formData, driver_fault: checked as boolean })}
              />
              <Label htmlFor="driver_fault">Driver's Fault</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_status">
                Payment Status <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.payment_status}
                onValueChange={(value) => setFormData({ ...formData, payment_status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add Fine"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push('/fines')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}