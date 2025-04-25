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
import type { OutsideEmployee } from "@/app/api/interfaces"

export default function EditDriverPage({ params }: { params: { name: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [driver, setDriver] = useState<OutsideEmployee | null>(null)
  const [companies, setCompanies] = useState<string[]>([])
  const [owners, setOwners] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInitialData()
  }, [params.name])

  const fetchInitialData = async () => {
    try {
      const [driverData, companiesData, ownersData] = await Promise.all([
        fetchApi(`/other-employees/${decodeURIComponent(params.name)}`),
        fetchApi('/company-under'),
        fetchApi('/other-owners')
      ])

      setDriver(driverData)
      setCompanies(Array.isArray(companiesData) ? companiesData : [])
      setOwners(ownersData.map((owner: any) => owner.name))
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
      if (!driver) return

      const formattedData = {
        ...driver,
        contact_no: driver.contact_no ? Number(driver.contact_no) : null,
        whatsapp_no: driver.whatsapp_no ? Number(driver.whatsapp_no) : null,
        eid: driver.eid ? Number(driver.eid) : null,
        refered_as: driver.refered_as || null,
        designation: driver.designation || null,
        visa_exp: driver.visa_exp || null,
        health_ins_exp: driver.health_ins_exp || null,
        emp_ins_exp: driver.emp_ins_exp || null,
        license_exp: driver.license_exp || null
      }

      const decodedName = decodeURIComponent(params.name)
      await fetchApi(`/other-employees/${decodedName}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      })

      toast({
        title: "Success",
        description: "Driver updated successfully",
      })
      
      router.push('/outside')
    } catch (error) {
      console.error('Error updating driver:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to update driver',
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
  if (!driver) return <div className="p-8">Driver not found</div>

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Edit Driver</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="employee">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="employee"
                value={driver.employee}
                onChange={(e) => setDriver({ ...driver, employee: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner">
                Owner <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={driver.owner}
                onValueChange={(value) => setDriver({ ...driver, owner: value })}
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
              <Label htmlFor="refered_as">Referred As</Label>
              <Input
                id="refered_as"
                value={driver.refered_as || ""}
                onChange={(e) => setDriver({ ...driver, refered_as: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="designation">Designation</Label>
              <Input
                id="designation"
                value={driver.designation || ""}
                onChange={(e) => setDriver({ ...driver, designation: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_no">Contact Number</Label>
              <Input
                id="contact_no"
                type="number"
                value={driver.contact_no || ""}
                onChange={(e) => setDriver({ ...driver, contact_no: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp_no">WhatsApp Number</Label>
              <Input
                id="whatsapp_no"
                type="number"
                value={driver.whatsapp_no || ""}
                onChange={(e) => setDriver({ ...driver, whatsapp_no: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="visa_under">
                Visa Under <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={driver.visa_under}
                onValueChange={(value) => setDriver({ ...driver, visa_under: value })}
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
              <Label htmlFor="visa_exp">Visa Expiry Date</Label>
              <Input
                id="visa_exp"
                type="date"
                value={driver.visa_exp || ""}
                onChange={(e) => setDriver({ ...driver, visa_exp: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nationality">
                Nationality <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nationality"
                value={driver.nationality}
                onChange={(e) => setDriver({ ...driver, nationality: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eid">Emirates ID</Label>
              <Input
                id="eid"
                type="number"
                value={driver.eid || ""}
                onChange={(e) => setDriver({ ...driver, eid: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="health_ins_exp">Health Insurance Expiry Date</Label>
              <Input
                id="health_ins_exp"
                type="date"
                value={driver.health_ins_exp || ""}
                onChange={(e) => setDriver({ ...driver, health_ins_exp: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emp_ins_exp">Employment Insurance Expiry Date</Label>
              <Input
                id="emp_ins_exp"
                type="date"
                value={driver.emp_ins_exp || ""}
                onChange={(e) => setDriver({ ...driver, emp_ins_exp: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="license_exp">License Expiry Date</Label>
              <Input
                id="license_exp"
                type="date"
                value={driver.license_exp || ""}
                onChange={(e) => setDriver({ ...driver, license_exp: e.target.value })}
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