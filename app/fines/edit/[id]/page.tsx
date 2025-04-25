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

interface Fine {
  id: number
  trip_id: number | null
  reason: string | null
  truck_number: string | null
  driver_name: string | null
  driver_fault: boolean | null
  fine_date: string | null
  amount: number
  payment_status: string
}

export default function EditFinePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fine, setFine] = useState<Fine | null>(null)
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [trips, setTrips] = useState<Trip[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInitialData()
  }, [params.id])

  const fetchInitialData = async () => {
    try {
      const [fineData, driversData, tripsData] = await Promise.all([
        fetchApi(`/fines/${params.id}`),
        fetchApi('/drivers'),
        fetchApi('/trips')
      ])

      setFine(fineData)
      setDrivers(Array.isArray(driversData) ? driversData : [])
      setTrips(Array.isArray(tripsData) ? tripsData : [])
      setError(null)
    } catch (error) {
      console.error('Error fetching data:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleTripChange = (tripId: string) => {
    if (!fine) return
    
    if (tripId === "") {
      setFine({
        ...fine,
        trip_id: null
      })
      return
    }

    const selectedTrip = trips.find(t => t.trip_id === parseInt(tripId))
    if (selectedTrip) {
      setFine({
        ...fine,
        trip_id: selectedTrip.trip_id,
        driver_name: selectedTrip.driver,
        truck_number: selectedTrip.truck_number
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      if (!fine) return

      await fetchApi(`/fines/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fine),
      })

      toast({
        title: "Success",
        description: "Fine updated successfully",
      })
      
      router.push('/fines')
    } catch (error) {
      console.error('Error updating fine:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to update fine',
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
  if (!fine) return <div className="p-8">Fine not found</div>

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          
          <CardTitle>Edit Fine</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="trip_id">Related Trip</Label>
              <Select
                value={fine.trip_id?.toString() || ""}
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
                value={fine.fine_date || ""}
                onChange={(e) => setFine({ ...fine, fine_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="driver">Driver</Label>
              <Select
                value={fine.driver_name || ""}
                onValueChange={(value) => setFine({ ...fine, driver_name: value })}
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
                value={fine.truck_number || ""}
                onChange={(e) => setFine({ ...fine, truck_number: e.target.value })}
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
                value={fine.amount}
                onChange={(e) => setFine({ ...fine, amount: parseFloat(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                value={fine.reason || ""}
                onChange={(e) => setFine({ ...fine, reason: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="driver_fault"
                checked={fine.driver_fault || false}
                onCheckedChange={(checked) => setFine({ ...fine, driver_fault: checked as boolean })}
              />
              <Label htmlFor="driver_fault">Driver's Fault</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_status">
                Payment Status <span className="text-red-500">*</span>
              </Label>
              <Select
                value={fine.payment_status}
                onValueChange={(value) => setFine({ ...fine, payment_status: value })}
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
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
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