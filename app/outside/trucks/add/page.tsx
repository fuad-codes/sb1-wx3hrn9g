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

export default function AddTruckPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [companies, setCompanies] = useState<string[]>([])
  const [owners, setOwners] = useState<string[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [formData, setFormData] = useState({
    truck_number: "",
    owner: "",
    driver: null as string | null,
    year: new Date().getFullYear(),
    vehicle_under: "",
    trailer_no: "",
    country: "",
    mulkiya_exp: "",
    ins_exp: ""
  })

  useEffect(() => {
    fetchCompanies()
    fetchOwners()
    fetchDrivers()
  }, [])

  const fetchCompanies = async () => {
    try {
      const data = await fetchApi('/company-under')
      setCompanies(Array.isArray(data) ? data : [])
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, vehicle_under: data[0] }))
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
      setCompanies([])
    }
  }

  const fetchOwners = async () => {
    try {
      const data = await fetchApi('/other-owners')
      const ownerNames = data.map((owner: any) => owner.name)
      setOwners(ownerNames)
      if (ownerNames.length > 0) {
        setFormData(prev => ({ ...prev, owner: ownerNames[0] }))
      }
    } catch (error) {
      console.error('Error fetching owners:', error)
      setOwners([])
    }
  }

  const fetchDrivers = async () => {
    try {
      const data = await fetchApi('/other-employees')
      setDrivers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching drivers:', error)
      setDrivers([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formattedData = {
        ...formData,
        year: Number(formData.year),
        trailer_no: formData.trailer_no ? Number(formData.trailer_no) : null,
        mulkiya_exp: formData.mulkiya_exp || null,
        ins_exp: formData.ins_exp || null
      }

      await fetchApi('/other-trucks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      })

      toast({
        title: "Success",
        description: "Truck added successfully",
      })

      router.push('/outside')
    } catch (error) {
      console.error('Error adding truck:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to add truck',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Add New Truck</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="truck_number">
                Truck Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="truck_number"
                value={formData.truck_number}
                onChange={(e) => setFormData({ ...formData, truck_number: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner">
                Owner <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.owner}
                onValueChange={(value) => setFormData({ ...formData, owner: value })}
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
                value={formData.driver || "unassigned"}
                onValueChange={(value) => setFormData({ ...formData, driver: value === "unassigned" ? null : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select driver">
                    {formData.driver ? 
                      drivers.find(d => d.employee === formData.driver)?.refered_as || formData.driver 
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
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                min="1900"
                max={new Date().getFullYear() + 1}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicle_under">
                Vehicle Under <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.vehicle_under}
                onValueChange={(value) => setFormData({ ...formData, vehicle_under: value })}
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
                value={formData.trailer_no}
                onChange={(e) => setFormData({ ...formData, trailer_no: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">
                Country <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.country}
                onValueChange={(value) => setFormData({ ...formData, country: value })}
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
                value={formData.mulkiya_exp}
                onChange={(e) => setFormData({ ...formData, mulkiya_exp: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ins_exp">Insurance Expiry Date</Label>
              <Input
                id="ins_exp"
                type="date"
                value={formData.ins_exp}
                onChange={(e) => setFormData({ ...formData, ins_exp: e.target.value })}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add Truck"}
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