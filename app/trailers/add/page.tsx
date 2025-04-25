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

export default function AddTrailerPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [companies, setCompanies] = useState<string[]>([])
  const [formData, setFormData] = useState({
    trailer_no: "",
    company_under: "",
    mulkiya_exp: "",
    oman_ins_exp: "",
    asset_value: ""
  })

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const data = await fetchApi('/company-under')
      setCompanies(Array.isArray(data) ? data : [])
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, company_under: data[0] }))
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
      setCompanies([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formattedData = {
        ...formData,
        asset_value: formData.asset_value ? Number(formData.asset_value) : null,
        mulkiya_exp: formData.mulkiya_exp || null,
        oman_ins_exp: formData.oman_ins_exp || null
      }

      await fetchApi('/trailers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      })

      toast({
        title: "Success",
        description: "Trailer added successfully",
      })

      router.push('/trailers')
    } catch (error) {
      console.error('Error adding trailer:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to add trailer',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Add New Trailer</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="trailer_no">
                Trailer Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="trailer_no"
                value={formData.trailer_no}
                onChange={(e) => setFormData({ ...formData, trailer_no: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_under">
                Company Under <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.company_under}
                onValueChange={(value) => setFormData({ ...formData, company_under: value })}
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
              <Label htmlFor="mulkiya_exp">Mulkiya Expiry Date</Label>
              <Input
                id="mulkiya_exp"
                type="date"
                value={formData.mulkiya_exp}
                onChange={(e) => setFormData({ ...formData, mulkiya_exp: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="oman_ins_exp">Insurance Expiry Date</Label>
              <Input
                id="oman_ins_exp"
                type="date"
                value={formData.oman_ins_exp}
                onChange={(e) => setFormData({ ...formData, oman_ins_exp: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="asset_value">Asset Value</Label>
              <Input
                id="asset_value"
                type="number"
                step="0.01"
                min="0"
                value={formData.asset_value}
                onChange={(e) => setFormData({ ...formData, asset_value: e.target.value })}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add Trailer"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push('/trailers')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}