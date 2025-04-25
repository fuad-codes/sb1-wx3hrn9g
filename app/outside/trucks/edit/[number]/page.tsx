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
import type { OutsideTruck } from "@/app/api/interfaces"

interface Driver {
  employee: string
  refered_as: string
}

export default function EditTruckPage({ params }: { params: { number: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [truck, setTruck] = useState<OutsideTruck | null>(null)
  const [companies, setCompanies] = useState<string[]>([])
  const [owners, setOwners] = useState<string[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInitialData()
  }, [params.number])

  const fetchInitialData = async () => {
    try {
      const [truckData, companiesData, ownersData, driversData] = await Promise.all([
        fetchApi(`/other-trucks/${decodeURIComponent(params.number)}`),
        fetchApi('/company-under'),
        fetchApi('/other-owners'),
        fetchApi('/other-employees')
      ])

      setTruck(truckData)
      setCompanies(Array.isArray(companiesData) ? companiesData : [])
      setOwners(ownersData.map((owner: any) => owner.name))
      setDrivers(Array.isArray(driversData) ? driversData : [])
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
        year: truck.year ? Number(truck.year) : null,
        trailer_no: truck.trailer_no ? Number(truck.trailer_no) : null,
        mulkiya_exp: truck.mulkiya_exp || null,
        ins_exp: truck.ins_exp || null
      }

      const decodedNumber = decodeURIComponent(params.number)
      await fetchApi(`/other-trucks/${decodedNumber}`, {
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
      
      router.push('/outside')
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
              <Label htmlFor="owner">
                Owner <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={truck.owner}
                onValueChange={(value) => setTruck({ ...truck, owner: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select owner" />
                </SelectTrigger>
                <SelectContent>
                  {owners.map(owner => (
                    <SelectItem key={owner} value={owner}>{owner}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                value={truck.year || ""}
                onChange={(e) => setTruck({ ...truck, year: parseInt(e.target.value) })}
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
                required
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
              <Label htmlFor="trailer_no">Trailer Number</Label>
              <Input
                id="trailer_no"
                type="number"
                value={truck.trailer_no || ""}
                onChange={(e) => setTruck({ ...truck, trailer_no: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">
                Country <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={truck.country}
                onValueChange={(value) => setTruck({ ...truck, country: value })}
                required
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

            <div className="flex gap-4">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push('/outside')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}