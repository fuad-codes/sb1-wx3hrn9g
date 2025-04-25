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

export default function AddEmployeePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [companies, setCompanies] = useState<string[]>([])
  const [drivers, setDrivers] = useState<string[]>([])
  const [formData, setFormData] = useState({
    employee: "",
    refered_as: "",
    designation: "",
    salary: 0,
    conatct_no: "",
    whatsapp_no: "",
    nationality: "",
    visa_outstanding: 0,
    advance_avl: 0,
    visa_under: "",
    visa_exp: "",
    eid: "",
    health_ins_exp: "",
    emp_ins_exp: "",
    license_exp: ""
  })

  useEffect(() => {
    fetchCompanies()
    fetchDrivers()
  }, [])

  const fetchCompanies = async () => {
    try {
      const data = await fetchApi('/company-under')
      setCompanies(Array.isArray(data) ? data : [])
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, visa_under: data[0] }))
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
      setCompanies([])
    }
  }

  const fetchDrivers = async () => {
    try {
      const data = await fetchApi('/drivers')
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
        salary: Number(formData.salary),
        visa_outstanding: Number(formData.visa_outstanding),
        advance_avl: Number(formData.advance_avl),
        eid: formData.eid ? Number(formData.eid) : null,
        contact_no: formData.contact_no ? Number(formData.contact_no) : null,
        whatsapp_no: formData.whatsapp_no ? Number(formData.whatsapp_no) : null,
        visa_exp: formData.visa_exp || null,
        health_ins_exp: formData.health_ins_exp || null,
        emp_ins_exp: formData.emp_ins_exp || null,
        license_exp: formData.license_exp || null
      }

      await fetchApi('/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      })

      toast({
        title: "Success",
        description: "Employee added successfully",
      })

      router.push('/employees')
    } catch (error) {
      console.error('Error adding employee:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to add employee',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Add New Employee</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.employee}
                onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="refered_as">
                Referred As <span className="text-red-500">*</span>
              </Label>
              <Input
                id="refered_as"
                value={formData.refered_as}
                onChange={(e) => setFormData({ ...formData, refered_as: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="designation">
                Designation <span className="text-red-500">*</span>
              </Label>
              <Input
                id="designation"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_no">
                Contact Number
              </Label>
              <Input
                id="contact_no"
                type="number"
                value={formData.contact_no}
                onChange={(e) => setFormData({ ...formData, contact_no: parseInt(e.target.value) })}
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp_no">
                Whatsapp Number
              </Label>
              <Input
                id="whatsapp_no"
                type="number"
                value={formData.whatsapp_no}
                onChange={(e) => setFormData({ ...formData, whatsapp_no: parseInt(e.target.value) })}
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary">
                Salary <span className="text-red-500">*</span>
              </Label>
              <Input
                id="salary"
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: parseInt(e.target.value) })}
                required
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nationality">Nationality</Label>
              <Input
                id="nationality"
                value={formData.nationality}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="visa_outstanding">Visa Outstanding</Label>
              <Input
                id="visa_outstanding"
                type="number"
                value={formData.visa_outstanding}
                onChange={(e) => setFormData({ ...formData, visa_outstanding: parseInt(e.target.value) })}
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="advance_avl">Advance Available</Label>
              <Input
                id="advance_avl"
                type="number"
                value={formData.advance_avl}
                onChange={(e) => setFormData({ ...formData, advance_avl: parseInt(e.target.value) })}
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="visa_under">Visa Under</Label>
              <Select 
                value={formData.visa_under}
                onValueChange={(value) => setFormData({ ...formData, visa_under: value })}
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
                value={formData.visa_exp}
                onChange={(e) => setFormData({ ...formData, visa_exp: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eid">Emirates ID</Label>
              <Input
                id="eid"
                value={formData.eid}
                onChange={(e) => setFormData({ ...formData, eid: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="health_ins_exp">Health Insurance Expiry Date</Label>
              <Input
                id="health_ins_exp"
                type="date"
                value={formData.health_ins_exp}
                onChange={(e) => setFormData({ ...formData, health_ins_exp: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emp_ins_exp">Employment Insurance Expiry Date</Label>
              <Input
                id="emp_ins_exp"
                type="date"
                value={formData.emp_ins_exp}
                onChange={(e) => setFormData({ ...formData, emp_ins_exp: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="license_exp">License Expiry Date</Label>
              <Input
                id="license_exp"
                type="date"
                value={formData.license_exp}
                onChange={(e) => setFormData({ ...formData, license_exp: e.target.value })}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add Employee"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push('/employees')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}