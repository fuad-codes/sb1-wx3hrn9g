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

interface MaintenanceRecord {
  id: number
  date: string
  driver_name: string
  truck_number: string
  vehicle_under: string
  maintenance_detail: string
  credit_card: number
  bank: number
  cash: number
  vat: number
  total: number
  status: 'PAID' | 'UNPAID'
  supplier: string | null
}

export default function EditMaintenancePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [maintenance, setMaintenance] = useState<MaintenanceRecord | null>(null)
  const [suppliers, setSuppliers] = useState<string[]>([])
  const [includeVat, setIncludeVat] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInitialData()
  }, [params.id])

  useEffect(() => {
    if (maintenance) {
      const subtotal = maintenance.credit_card + maintenance.bank + maintenance.cash
      const vat = includeVat ? subtotal * 0.05 : 0
      const total = subtotal + vat

      setMaintenance(prev => ({
        ...prev!,
        vat,
        total
      }))
    }
  }, [maintenance?.credit_card, maintenance?.bank, maintenance?.cash, includeVat])

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
      setError(null)
      const maintenancePromise = fetchApi(`/maintenance/${params.id}`);
      const suppliersPromise = fetchApi('/suppliers/names/code');

      const [maintenanceData, suppliersData] = await Promise.all([
        maintenancePromise.catch(error => {
          console.error('Error fetching maintenance data:', error);
          throw new Error(`Failed to fetch maintenance record: ${error.message}`);
        }),
        suppliersPromise.catch(error => {
          console.error('Error fetching suppliers:', error);
          return []; // Continue with empty suppliers list if this fails
        })
      ]);

      if (!maintenanceData) {
        throw new Error('Maintenance record not found');
      }

      // Format date for input field
      const formattedMaintenance = {
        ...maintenanceData,
        date: formatDateForInput(maintenanceData.date)
      }

      setMaintenance(formattedMaintenance)
      setSuppliers(Array.isArray(suppliersData) ? suppliersData : [])
      setIncludeVat(maintenanceData.vat > 0)
      setError(null)
    } catch (error) {
      console.error('Error in fetchInitialData:', error)
      setError(error instanceof Error ? error.message : 'Failed to load maintenance record')
      setMaintenance(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      if (!maintenance) {
        throw new Error('No maintenance record to update');
      }

      const formattedData = {
        ...maintenance,
        date: formatDateForServer(maintenance.date),
        credit_card: Number(maintenance.credit_card),
        bank: Number(maintenance.bank),
        cash: Number(maintenance.cash),
        vat: Number(maintenance.vat),
        total: Number(maintenance.total)
      }

      await fetchApi(`/maintenance/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      })

      toast({
        title: "Success",
        description: "Maintenance record updated successfully",
      })
      
      router.push('/maintenance')
    } catch (error) {
      console.error('Error updating maintenance record:', error)
      setError(error instanceof Error ? error.message : 'Failed to update maintenance record')
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to update maintenance record',
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
  if (!maintenance) return <div className="p-8">Maintenance record not found</div>

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Edit Maintenance Record</CardTitle>
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
                value={maintenance.date}
                onChange={(e) => setMaintenance({ ...maintenance, date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="driver_name">
                Driver Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="driver_name"
                value={maintenance.driver_name}
                onChange={(e) => setMaintenance({ ...maintenance, driver_name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="truck_number">
                Truck Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="truck_number"
                value={maintenance.truck_number}
                onChange={(e) => setMaintenance({ ...maintenance, truck_number: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicle_under">
                Vehicle Under <span className="text-red-500">*</span>
              </Label>
              <Input
                id="vehicle_under"
                value={maintenance.vehicle_under}
                onChange={(e) => setMaintenance({ ...maintenance, vehicle_under: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Select 
                value={maintenance.supplier || ""}
                onValueChange={(value) => setMaintenance({ ...maintenance, supplier: value || null })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {suppliers.map(supplier => (
                    <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem>
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
                value={maintenance.maintenance_detail}
                onChange={(e) => setMaintenance({ ...maintenance, maintenance_detail: e.target.value })}
                required
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="credit_card">Credit Card Amount</Label>
              <Input
                id="credit_card"
                type="number"
                step="0.01"
                min="0"
                value={maintenance.credit_card}
                onChange={(e) => setMaintenance({ ...maintenance, credit_card: Math.max(0, parseFloat(e.target.value) || 0) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bank">Bank Amount</Label>
              <Input
                id="bank"
                type="number"
                step="0.01"
                min="0"
                value={maintenance.bank}
                onChange={(e) => setMaintenance({ ...maintenance, bank: Math.max(0, parseFloat(e.target.value) || 0) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cash">Cash Amount</Label>
              <Input
                id="cash"
                type="number"
                step="0.01"
                min="0"
                value={maintenance.cash}
                onChange={(e) => setMaintenance({ ...maintenance, cash: Math.max(0, parseFloat(e.target.value) || 0) })}
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
                value={maintenance.vat.toFixed(2)}
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label>Total Amount</Label>
              <Input
                value={maintenance.total.toFixed(2)}
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">
                Status <span className="text-red-500">*</span>
              </Label>
              <Select
                value={maintenance.status}
                onValueChange={(value) => setMaintenance({ ...maintenance, status: value as 'PAID' | 'UNPAID' })}
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
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
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