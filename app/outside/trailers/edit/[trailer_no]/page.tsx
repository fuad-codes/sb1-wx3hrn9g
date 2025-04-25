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
import type { OutsideTrailer } from "@/app/api/interfaces"

export default function EditTrailerPage({ params }: { params: { trailer_no: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [trailer, setTrailer] = useState<OutsideTrailer | null>(null)
  const [companies, setCompanies] = useState<string[]>([])
  const [owners, setOwners] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInitialData()
  }, [params.trailer_no])

  const fetchInitialData = async () => {
    try {
      const [trailerData, companiesData, ownersData] = await Promise.all([
        fetchApi(`/other-trailers/${decodeURIComponent(params.trailer_no)}`),
        fetchApi('/company-under'),
        fetchApi('/other-owners')
      ])

      setTrailer(trailerData)
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
      if (!trailer) return

      const formattedData = {
        ...trailer,
        mulkiya_exp: trailer.mulkiya_exp || null,
        oman_ins_exp: trailer.oman_ins_exp || null
      }

      const decodedNumber = decodeURIComponent(params.trailer_no)
      await fetchApi(`/other-trailers/${decodedNumber}`, {
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
      
      router.push('/outside')
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

  if (loading) return <div className="p-8">Loading...</div>
  if (error) return (
    <div className="p-8">
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    </div>
  )
  if (!trailer) return <div className="p-8">Trailer not found</div>

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
              <Label htmlFor="owner">
                Owner <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={trailer.owner}
                onValueChange={(value) => setTrailer({ ...trailer, owner: value })}
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
              <Label htmlFor="oman_ins_exp">Oman Insurance Expiry Date</Label>
              <Input
                id="oman_ins_exp"
                type="date"
                value={trailer.oman_ins_exp || ""}
                onChange={(e) => setTrailer({ ...trailer, oman_ins_exp: e.target.value })}
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