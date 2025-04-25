"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { fetchApi } from "@/lib/utils"

interface Driver {
  employee: string
  refered_as: string
}

interface Trailer {
  trailer_no: string
}

interface Truck {
  truck_number: string
  driver: string | null
  trailer_no: string | null
  year: number
  vehicle_under: string
  country: string
  mulkiya_exp: string | null
  ins_exp: string | null
  truck_value: number | null
}

export default function EditTruckPage({ params }: { params: { number: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [truck, setTruck] = useState<Truck | null>(null)
  const [companies, setCompanies] = useState<string[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [trailers, setTrailers] = useState<Trailer[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInitialData()
  }, [params.number])

const formatDateForInput = (dateString: string | null) => {
  if (!dateString) return ""

  try {
    // Always treat as DD-MM-YYYY since that's your standard
    const [day, month, year] = dateString.split('-').map(Number)
    const date = new Date(Date.UTC(year, month - 1, day))

    if (isNaN(date.getTime())) return ""
    return date.toISOString().split('T')[0]
  } catch {
    return ""
  }
}
  const formatDateForServer = (dateString: string | null) => {
    if (!dateString) return null
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return null

      // Create date at UTC midnight
      const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
      return utcDate.toISOString().split('T')[0]
    } catch {
      return null
    }
  }

  const fetchInitialData = async () => {
    try {
      const [truckData, companiesData, driversData, trailersData] = await Promise.all([
        fetchApi(`/trucks/${decodeURIComponent(params.number)}`),
        fetchApi('/company-under'),
        fetchApi('/drivers'),
        fetchApi('/trailers')
      ])

      // Format dates for input fields
      const formattedTruck = {
        ...truckData,
        mulkiya_exp: formatDateForInput(truckData.mulkiya_exp),
        ins_exp: formatDateForInput(truckData.ins_exp)
      }

      setTruck(formattedTruck)
      setCompanies(Array.isArray(companiesData) ? companiesData : [])
      setDrivers(Array.isArray(driversData) ? driversData : [])
      setTrailers(Array.isArray(trailersData) ? trailersData : [])
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
      if (!truck) return

      const formattedData = {
        ...truck,
        year: Number(truck.year),
        mulkiya_exp: formatDateForServer(truck.mulkiya_exp),
        ins_exp: formatDateForServer(truck.ins_exp),
        truck_value: truck.truck_value || null,
        trailer_no: truck.trailer_no || null,
        driver: truck.driver || null
      }

      const decodedNumber = decodeURIComponent(params.number)
      await fetchApi(`/trucks/${decodedNumber}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      })

      toast({
        title: "Success",
        description: "Truck updated successfully",
      })
      
      router.push('/trucks')
    } catch (error) {
      console.error('Error updating truck:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to update truck',
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
  if (!truck) return <div className="p-8">Truck not found</div>

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Edit Truck</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="truck_number">
                Truck Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="truck_number"
                value={truck.truck_number}
                onChange={(e) => setTruck({ ...truck, truck_number: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="driver">Driver</Label>
              <Select 
                value={truck.driver || "unassigned"}
                onValueChange={(value) => setTruck({ ...truck, driver: value === "unassigned" ? null : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select driver">
                    {truck.driver ? 
                      drivers.find(d => d.employee === truck.driver)?.refered_as || truck.driver 
                      : "Unassigned"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {drivers.map(driver => (
                    <SelectItem key={driver.employee} value={driver.employee}>
                      {driver.refered_as}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">
                Year <span className="text-red-500">*</span>
              </Label>
              <Input
                id="year"
                type="number"
                value={truck.year}
                onChange={(e) => setTruck({ ...truck, year: parseInt(e.target.value) })}
                required
                min="1900"
                max={new Date().getFullYear() + 1}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicle_under">
                Vehicle Under <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={truck.vehicle_under}
                onValueChange={(value) => setTruck({ ...truck, vehicle_under: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map(company => (
                    <SelectItem key={company} value={company}>{company}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">
                Country <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={truck.country}
                onValueChange={(value) => setTruck({ ...truck, country: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SAUDI">Saudi</SelectItem>
                  <SelectItem value="OMAN">Oman</SelectItem>
                  <SelectItem value="LOCAL">Local</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="trailer_no">Trailer Number</Label>
              <Select 
                value={truck.trailer_no || "unassigned"}
                onValueChange={(value) => setTruck({ ...truck, trailer_no: value === "unassigned" ? null : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Trailer">
                    {truck.trailer_no || "Unassigned"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {trailers.map(trailer => (
                    <SelectItem key={trailer.trailer_no} value={trailer.trailer_no}>
                      {trailer.trailer_no}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mulkiya_exp">Mulkiya Expiry Date</Label>
              <Input
                id="mulkiya_exp"
                type="date"
                value={truck.mulkiya_exp || ""}
                onChange={(e) => setTruck({ ...truck, mulkiya_exp: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ins_exp">Insurance Expiry Date</Label>
              <Input
                id="ins_exp"
                type="date"
                value={truck.ins_exp || ""}
                onChange={(e) => setTruck({ ...truck, ins_exp: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="truck_value">Truck Value</Label>
              <Input
                id="truck_value"
                type="number"
                value={truck.truck_value || ""}
                onChange={(e) => setTruck({ ...truck, truck_value: Number(e.target.value) })}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push('/trucks')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}