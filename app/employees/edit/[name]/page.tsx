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

interface Employee {
  employee: string
  refered_as: string | null
  designation: string | null
  contact_no: number | null
  whatsapp_no: number | null
  salary: number
  visa_outstanding: number
  advance_avl: number
  visa_under: string
  visa_exp: string | null
  nationality: string
  eid: string | null
  health_ins_exp: string | null
  emp_ins_exp: string | null
  licence_exp: string | null
}

export default function EditEmployeePage({ params }: { params: { name: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [companies, setCompanies] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEmployee()
    fetchCompanies()
  }, [params.name])

  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return ""
    try {
      // Try parsing as ISO date first
      let date = new Date(dateString)
      if (isNaN(date.getTime())) {
        // If that fails, try parsing as DD-MM-YYYY
        const [day, month, year] = dateString.split('-').map(Number)
        date = new Date(year, month - 1, day)
      }
      if (isNaN(date.getTime())) return "" // Invalid date

      // Create date at UTC midnight
      const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
      return utcDate.toISOString().split('T')[0]
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

  const fetchCompanies = async () => {
    try {
      const data = await fetchApi('/company-under')
      setCompanies(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching companies:', error)
      setCompanies([])
    }
  }

  const fetchEmployee = async () => {
    try {
      const decodedName = decodeURIComponent(params.name)
      const data = await fetchApi(`/employees/${decodedName}`)
      
      const formattedData = {
        ...data,
        visa_exp: formatDateForInput(data.visa_exp),
        health_ins_exp: formatDateForInput(data.health_ins_exp),
        emp_ins_exp: formatDateForInput(data.emp_ins_exp),
        license_exp: formatDateForInput(data.license_exp)
      }
      
      setEmployee(formattedData)
      setError(null)
    } catch (error) {
      console.error('Error fetching employee:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch employee')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      if (!employee) return

      const formattedData = {
        ...employee,
        salary: Number(employee.salary),
        contact_no: Number(employee.salary) || null,
        whatsapp_no: Number(employee.salary) || null,
        visa_outstanding: Number(employee.visa_outstanding),
        advance_avl: Number(employee.advance_avl),
        eid: employee.eid || null,
        visa_exp: formatDateForServer(employee.visa_exp),
        health_ins_exp: formatDateForServer(employee.health_ins_exp),
        emp_ins_exp: formatDateForServer(employee.emp_ins_exp),
        license_exp: formatDateForServer(employee.license_exp)
      }

      const decodedName = decodeURIComponent(params.name)
      await fetchApi(`/employees/${decodedName}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      })

      toast({
        title: "Success",
        description: "Employee updated successfully",
      })
      
      router.push('/employees')
    } catch (error) {
      console.error('Error updating employee:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to update employee',
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
  if (!employee) return <div className="p-8">Employee not found</div>

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Edit Employee</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={employee.employee}
                onChange={(e) => setEmployee({ ...employee, employee: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="refered_as">
                Referred As <span className="text-red-500">*</span>
              </Label>
              <Input
                id="refered_as"
                value={employee.refered_as || ""}
                onChange={(e) => setEmployee({ ...employee, refered_as: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eid">Emirates ID</Label>
              <Input
                id="eid"
                value={employee.eid || ""}
                onChange={(e) => setEmployee({ ...employee, eid: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="designation">
                Designation <span className="text-red-500">*</span>
              </Label>
              <Input
                id="designation"
                value={employee.designation || ""}
                onChange={(e) => setEmployee({ ...employee, designation: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary">
                Salary <span className="text-red-500">*</span>
              </Label>
              <Input
                id="salary"
                type="number"
                value={employee.salary}
                onChange={(e) => setEmployee({ ...employee, salary: parseInt(e.target.value) })}
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
                value={employee.contact_no}
                onChange={(e) => setEmployee({ ...employee, contact_no: parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp_no">
                Whatsapp Number
              </Label>
              <Input
                id="whatsapp_no"
                type="number"
                value={employee.whatsapp_no}
                onChange={(e) => setEmployee({ ...employee, whatsapp_no: parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nationality">Nationality</Label>
              <Input
                id="nationality"
                value={employee.nationality}
                onChange={(e) => setEmployee({ ...employee, nationality: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="visa_outstanding">Visa Outstanding</Label>
              <Input
                id="visa_outstanding"
                type="number"
                value={employee.visa_outstanding}
                onChange={(e) => setEmployee({ ...employee, visa_outstanding: parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="advance_avl">Advance Available</Label>
              <Input
                id="advance_avl"
                type="number"
                value={employee.advance_avl}
                onChange={(e) => setEmployee({ ...employee, advance_avl: parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="visa_under">Visa Under</Label>
              <Select 
                value={employee.visa_under}
                onValueChange={(value) => setEmployee({ ...employee, visa_under: value })}
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
                value={employee.visa_exp || ""}
                onChange={(e) => setEmployee({ ...employee, visa_exp: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="health_ins_exp">Health Insurance Expiry Date</Label>
              <Input
                id="health_ins_exp"
                type="date"
                value={employee.health_ins_exp || ""}
                onChange={(e) => setEmployee({ ...employee, health_ins_exp: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emp_ins_exp">Employment Insurance Expiry Date</Label>
              <Input
                id="emp_ins_exp"
                type="date"
                value={employee.emp_ins_exp || ""}
                onChange={(e) => setEmployee({ ...employee, emp_ins_exp: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="license_exp">License Expiry Date</Label>
              <Input
                id="license_exp"
                type="date"
                value={employee.license_exp || ""}
                onChange={(e) => setEmployee({ ...employee, license_exp: e.target.value })}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
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