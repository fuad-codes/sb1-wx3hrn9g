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

export default function AddSalaryPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [employees, setEmployees] = useState<{employee: string, refered_as: string, salary: number}[]>([])
  const [formData, setFormData] = useState({
    employee_name: "",
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear(),
    base_salary: 0,
    overtime_hours: 0,
    overtime_rate: 0,
    overtime_amount: 0,
    bonus: 0,
    deductions: 0,
    deduction_reason: "",
    net_salary: 0,
    payment_method: "bank",
    payment_status: "pending",
    payment_date: "",
    reference_no: "",
    remarks: ""
  })

  useEffect(() => {
    fetchEmployees()
  }, [])

  useEffect(() => {
    // Calculate overtime amount and net salary whenever relevant fields change
    const overtimeAmount = formData.overtime_hours * formData.overtime_rate
    const netSalary = formData.base_salary + overtimeAmount + formData.bonus - formData.deductions
    
    setFormData(prev => ({
      ...prev,
      overtime_amount: overtimeAmount,
      net_salary: netSalary
    }))
  }, [formData.base_salary, formData.overtime_hours, formData.overtime_rate, formData.bonus, formData.deductions])

  const fetchEmployees = async () => {
    try {
      const data = await fetchApi('/drivers')
      setEmployees(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching employees:', error)
      setEmployees([])
    }
  }

  const handleEmployeeChange = (value: string) => {
    const selectedEmployee = employees.find(emp => emp.employee === value)
    if (selectedEmployee) {
      setFormData({
        ...formData,
        employee_name: value,
        base_salary: selectedEmployee.salary
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // In a real implementation, we would send the data to the API
      // For now, we'll just simulate a delay and show a success message
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Success",
        description: "Salary record added successfully",
      })

      router.push('/accounts')
    } catch (error) {
      console.error('Error adding salary record:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to add salary record',
      })
    } finally {
      setLoading(false)
    }
  }

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const years = [2023, 2024, 2025]

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Add Salary Record</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="employee_name">
                Employee <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.employee_name}
                onValueChange={handleEmployeeChange}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(employee => (
                    <SelectItem key={employee.employee} value={employee.employee}>
                      {employee.refered_as || employee.employee}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="month">
                  Month <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.month}
                  onValueChange={(value) => setFormData({ ...formData, month: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map(month => (
                      <SelectItem key={month} value={month}>{month}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">
                  Year <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.year.toString()}
                  onValueChange={(value) => setFormData({ ...formData, year: parseInt(value) })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="base_salary">
                Base Salary <span className="text-red-500">*</span>
              </Label>
              <Input
                id="base_salary"
                type="number"
                step="0.01"
                min="0"
                value={formData.base_salary}
                onChange={(e) => setFormData({ ...formData, base_salary: parseFloat(e.target.value) })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="overtime_hours">Overtime Hours</Label>
                <Input
                  id="overtime_hours"
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.overtime_hours}
                  onChange={(e) => setFormData({ ...formData, overtime_hours: parseFloat(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="overtime_rate">Overtime Rate (per hour)</Label>
                <Input
                  id="overtime_rate"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.overtime_rate}
                  onChange={(e) => setFormData({ ...formData, overtime_rate: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="overtime_amount">Overtime Amount</Label>
              <Input
                id="overtime_amount"
                type="number"
                step="0.01"
                value={formData.overtime_amount}
                readOnly
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bonus">Bonus</Label>
              <Input
                id="bonus"
                type="number"
                step="0.01"
                min="0"
                value={formData.bonus}
                onChange={(e) => setFormData({ ...formData, bonus: parseFloat(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deductions">Deductions</Label>
              <Input
                id="deductions"
                type="number"
                step="0.01"
                min="0"
                value={formData.deductions}
                onChange={(e) => setFormData({ ...formData, deductions: parseFloat(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deduction_reason">Deduction Reason</Label>
              <Input
                id="deduction_reason"
                value={formData.deduction_reason}
                onChange={(e) => setFormData({ ...formData, deduction_reason: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="net_salary">
                Net Salary <span className="text-red-500">*</span>
              </Label>
              <Input
                id="net_salary"
                type="number"
                step="0.01"
                value={formData.net_salary}
                readOnly
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_method">
                Payment Method <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.payment_method}
                onValueChange={(value) => setFormData({ ...formData, payment_method: value as 'cash' | 'bank' | 'cheque' })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_status">
                Payment Status <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.payment_status}
                onValueChange={(value) => setFormData({ ...formData, payment_status: value as 'pending' | 'paid' })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.payment_status === 'paid' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="payment_date">Payment Date</Label>
                  <Input
                    id="payment_date"
                    type="date"
                    value={formData.payment_date}
                    onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reference_no">Reference Number</Label>
                  <Input
                    id="reference_no"
                    value={formData.reference_no}
                    onChange={(e) => setFormData({ ...formData, reference_no: e.target.value })}
                  />
                </div>
              </>
            )}

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
                {loading ? "Adding..." : "Add Salary Record"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push('/accounts')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}