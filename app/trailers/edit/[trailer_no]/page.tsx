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

interface Trailer {
  trailer_no: string
  company_under: string
  mulkiya_exp: string | null
  oman_ins_exp: string | null
  asset_value: number | null
}

export default function EditTrailerPage({ params }: { params: { trailer_no: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [trailer, setTrailer] = useState<Trailer | null>(null)
  const [companies, setCompanies] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInitialData()
  }, [params.trailer_no])

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
      const [trailerData, companiesData] = await Promise.all([
        fetchApi(`/trailers/${decodeURIComponent(params.trailer_no)}`),
        fetchApi('/company-under')
      ])

      // Format dates for input fields
      const formattedTrailer = {
        ...trailerData,
        mulkiya_exp: formatDateForInput(trailerData.mulkiya_exp),
        oman_ins_exp: formatDateForInput(trailerData.oman_ins_exp)
      }

      setTrailer(formattedTrailer)
      setCompanies(Array.isArray(companiesData) ? companiesData : [])
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
      if (!trailer) return

      const formattedData = {
        ...trailer,
        asset_value: trailer.asset_value,
        mulkiya_exp: formatDateForServer(trailer.mulkiya_exp),
        oman_ins_exp: formatDateForServer(trailer.oman_ins_exp)
      }

      const decodedNumber = decodeURIComponent(params.trailer_no)
      await fetchApi(`/trailers/${decodedNumber}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      })

      toast({
        title: "Success",
        description: "Trailer updated successfully",
      })
      
      router.push('/trailers')
    } catch (error) {
      console.error('Error updating trailer:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to update trailer',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (<div className="p-8">Loading...</div>)
  if (error) return (
    <div className="p-8">
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    </div>
  )
  if (!trailer) return (<div className="p-8">Trailer not found</div>)

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Edit Trailer</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="trailer_no">
                Trailer Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="trailer_no"
                value={trailer.trailer_no}
                onChange={(e) => setTrailer({ ...trailer, trailer_no: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_under">
                Company Under <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={trailer.company_under}
                onValueChange={(value) => setTrailer({ ...trailer, company_under: value })}
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
                value={trailer.mulkiya_exp || ""}
                onChange={(e) => setTrailer({ ...trailer, mulkiya_exp: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="oman_ins_exp">Insurance Expiry Date</Label>
              <Input
                id="oman_ins_exp"
                type="date"
                value={trailer.oman_ins_exp || ""}
                onChange={(e) => setTrailer({ ...trailer, oman_ins_exp: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="asset_value">Asset Value</Label>
              <Input
                id="asset_value"
                type="number"
                step="0.01"
                min="0"
                value={trailer.asset_value || ""}
                onChange={(e) => setTrailer({ ...trailer, asset_value: Number(e.target.value) })}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
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