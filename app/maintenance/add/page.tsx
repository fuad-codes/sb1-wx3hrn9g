"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { fetchApi } from "@/lib/utils"

interface Driver {
  employee: string
  refered_as: string
}

interface Truck {
  truck_number: string
  vehicle_under: string
}

interface Supplier {
  name: string
}

export default function AddMaintenancePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [trucks, setTrucks] = useState<Truck[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [includeVat, setIncludeVat] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    driver_name: "",
    truck_number: "",
    vehicle_under: "",
    maintenance_detail: "",
    credit_card: 0,
    bank: 0,
    cash: 0,
    vat: 0,
    total: 0,
    status: "UNPAID",
    supplier: null as string | null
  })

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    // Calculate total and VAT when amounts change
    const subtotal = formData.credit_card + formData.bank + formData.cash
    const vat = includeVat ? subtotal * 0.05 : 0
    const total = subtotal + vat

    setFormData(prev => ({
      ...prev,
      vat,
      total
    }))
  }, [formData.credit_card, formData.bank, formData.cash, includeVat])

  const fetchInitialData = async () => {
    try {
      const [driversData, trucksData, suppliersData] = await Promise.all([
        fetchApi('/drivers'),
        fetchApi('/trucks'),
        fetchApi('/suppliers')
      ])

      setDrivers(Array.isArray(driversData) ? driversData : [])
      setTrucks(Array.isArray(trucksData) ? trucksData : [])
      setSuppliers(Array.isArray(suppliersData) ? suppliersData : [])
    } catch (error) {
      console.error('Error fetching initial data:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load required data. Please refresh the page.",
      })
    }
  }

  const handleTruckChange = (value: string) => {
    const selectedTruck = trucks.find(t => t.truck_number === value)
    setFormData({
      ...formData,
      truck_number: value,
      vehicle_under: selectedTruck?.vehicle_under || ""
    })
  }

  const validateForm = () => {
    if (!formData.date) return "Date is required"
    if (!formData.driver_name) return "Driver is required"
    if (!formData.truck_number) return "Truck is required"
    if (!formData.maintenance_detail) return "Maintenance details are required"
    if (formData.credit_card + formData.bank + formData.cash <= 0) return "At least one payment amount must be greater than 0"
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationError = validateForm()
    if (validationError) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: validationError,
      })
      return
    }

    setLoading(true)

    try {
      // Find the selected driver's full name
      const selectedDriver = drivers.find(d => d.employee === formData.driver_name)
      if (!selectedDriver) {
        throw new Error("Selected driver not found")
      }

      const payload = {
        ...formData,
        driver_name: selectedDriver.employee,
        includeVat,
        credit_card: Number(formData.credit_card),
        bank: Number(formData.bank),
        cash: Number(formData.cash),
        vat: Number(formData.vat),
        total: Number(formData.total)
      }

      const response = await fetchApi('/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response) {
        throw new Error("No response received from server")
      }

      if (response.error) {
        throw new Error(response.error)
      }

      // Success! Show success message and redirect
      toast({
        title: "Success",
        description: "Maintenance record added successfully",
      })

      router.push('/maintenance')
    } catch (error) {
      console.error('Error adding maintenance record:', error)
      
      // Extract the most meaningful error message
      let errorMessage = 'Failed to add maintenance record. Please check your connection and try again.'
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Add Maintenance Record</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="date">
                Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="driver">
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
              <Label htmlFor="truck">
                Truck <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.truck_number}
                onValueChange={handleTruckChange}
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
              <Label htmlFor="vehicle_under">Vehicle Under</Label>
              <Input
                id="vehicle_under"
                value={formData.vehicle_under}
                readOnly
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Select
                value={formData.supplier || "none"}
                onValueChange={(value) => setFormData({ ...formData, supplier: value === "none" ? null : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {suppliers.map(supplier => (
                    <SelectItem key={supplier.name} value={supplier.name}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maintenance_detail">
                Maintenance Details <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="maintenance_detail"
                value={formData.maintenance_detail}
                onChange={(e) => setFormData({ ...formData, maintenance_detail: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="credit_card">Credit Card Amount</Label>
              <Input
                id="credit_card"
                type="number"
                step="0.01"
                min="0"
                value={formData.credit_card}
                onChange={(e) => setFormData({ ...formData, credit_card: Math.max(0, parseFloat(e.target.value) || 0) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bank">Bank Amount</Label>
              <Input
                id="bank"
                type="number"
                step="0.01"
                min="0"
                value={formData.bank}
                onChange={(e) => setFormData({ ...formData, bank: Math.max(0, parseFloat(e.target.value) || 0) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cash">Cash Amount</Label>
              <Input
                id="cash"
                type="number"
                step="0.01"
                min="0"
                value={formData.cash}
                onChange={(e) => setFormData({ ...formData, cash: Math.max(0, parseFloat(e.target.value) || 0) })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeVat"
                checked={includeVat}
                onCheckedChange={(checked) => setIncludeVat(checked as boolean)}
              />
              <Label htmlFor="includeVat">Include VAT (5%)</Label>
            </div>

            <div className="space-y-2">
              <Label>VAT Amount</Label>
              <Input
                value={formData.vat.toFixed(2)}
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label>Total Amount</Label>
              <Input
                value={formData.total.toFixed(2)}
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">
                Status <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as 'PAID' | 'UNPAID' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PAID">PAID</SelectItem>
                  <SelectItem value="UNPAID">UNPAID</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add Record"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push('/maintenance')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}