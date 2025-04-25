"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { FileText, Trash2, Upload, Eye, Download, ZoomIn, ZoomOut } from "lucide-react"
import { fetchApi } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

interface Document {
  type: 'mulkiya' | 'insurance' | 'other' | 'oman' | 'kuwait' | 'saudi' | 'qatar' | 'bahrin' | 'jordan'
  url: string
  uploadDate: string
  truck_number: string
}

const documentTypes = [
  { value: 'mulkiya', label: 'Mulkiya' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'other', label: 'Other' },
  { value: 'oman', label: 'Oman' },
  { value: 'kuwait', label: 'Kuwait' },
  { value: 'saudi', label: 'Saudi' },
  { value: 'qatar', label: 'Qatar' },
  { value: 'bahrin', label: 'Bahrin' },
  { value: 'jordan', label: 'Jordan' }
]

export default function OutsideTruckDocumentsPage({ params }: { params: { number: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState<string>("")
  const [documentUrl, setDocumentUrl] = useState<string | null>(null)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [uploading, setUploading] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null)
  const [zoom, setZoom] = useState(100)
  const [contentType, setContentType] = useState<string | null>(null)

  const truckNumber = decodeURIComponent(params.number)

  useEffect(() => {
    fetchDocuments()
  }, [truckNumber])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const data = await fetchApi(`/other-trucks/${truckNumber}/documents`)
      setDocuments(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !documentType) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a file and document type",
      })
      return
    }

    setUploading(true)

    try {
      // Check if a document of this type already exists
      const existingDoc = documents.find(doc => doc.type === documentType)
      if (existingDoc) {
        await fetchApi(`/other-trucks/${truckNumber}/documents/${documentType}`, {
          method: 'DELETE',
        })
      }

      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('type', documentType)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/other-trucks/${truckNumber}/documents/${documentType}/upload`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload document')
      }

      toast({
        title: "Success",
        description: existingDoc 
          ? "Document updated successfully" 
          : "Document uploaded successfully",
      })

      setSelectedFile(null)
      setDocumentType("")
      fetchDocuments()
    } catch (error) {
      console.error('Error uploading document:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload document",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!documentToDelete) return

    try {
      await fetchApi(`/other-trucks/${truckNumber}/documents/${documentToDelete.type}`, {
        method: 'DELETE',
      })

      toast({
        title: "Success",
        description: "Document deleted successfully",
      })

      setDocuments(documents.filter(doc => doc.type !== documentToDelete.type))
      setDeleteDialogOpen(false)
      setDocumentToDelete(null)
    } catch (error) {
      console.error('Error deleting document:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete document",
      })
    }
  }

  const handleView = async (document: Document) => {
    try {
      setSelectedDocument(document)
      setViewDialogOpen(true)
      setZoom(100) // Reset zoom when opening new document
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/other-trucks/${truckNumber}/documents/${document.type}`)
      if (!response.ok) throw new Error('Failed to fetch document')

      const contentType = response.headers.get('Content-Type')
      setContentType(contentType)
      
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setDocumentUrl(url)
    } catch (error) {
      console.error('Error viewing document:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: `File missing at server/invalid path`,
      })
      setViewDialogOpen(false)
    }
  }

  const handleDownload = () => {
    if (documentUrl && selectedDocument) {
      const a = document.createElement('a')
      a.href = documentUrl
      a.download = selectedDocument.url
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 25))
  }

  useEffect(() => {
    // Cleanup URLs when dialog closes
    return () => {
      if (documentUrl) {
        URL.revokeObjectURL(documentUrl)
      }
    }
  }, [documentUrl])
  
  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-lg">Loading documents...</div>
      </div>
    )
  }

  const renderDocument = () => {
    if (!documentUrl || !contentType) return null

    if (contentType.includes('pdf')) {
      return (
        <iframe
          src={documentUrl}
          className="w-full h-[70vh]"
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
        />
      )
    } else if (contentType.includes('image')) {
      return (
        <img
          src={documentUrl}
          alt="Document preview"
          className="max-w-full h-auto"
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
        />
      )
    }

    return <div className="text-center p-4">Unsupported document type</div>
  }
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Outside Truck Documents - {truckNumber}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* Upload Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Upload New Document</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="file">Select File</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Document Type</Label>
                  <Select value={documentType} onValueChange={setDocumentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      {documentTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button 
                onClick={handleUpload} 
                disabled={!selectedFile || !documentType || uploading}
              >
                <Upload className="mr-2 h-4 w-4" />
                {uploading ? "Uploading..." : "Upload Document"}
              </Button>
            </div>

            {/* Documents List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Uploaded Documents</h3>
              {documents.length === 0 ? (
                <p className="text-muted-foreground">No documents uploaded yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documents.map((doc) => (
                    <Card key={doc.type}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-5 w-5" />
                            <div>
                              <p className="font-medium">
                                {documentTypes.find(t => t.value === doc.type)?.label}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Uploaded: {doc.uploadDate}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleView(doc)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => {
                                setDocumentToDelete(doc)
                                setDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Viewer Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onOpenChange={(open) => {
          setViewDialogOpen(open)
          if (!open) {
            setSelectedDocument(null)
            if (documentUrl) {
              URL.revokeObjectURL(documentUrl)
              setDocumentUrl(null)
            }
            setContentType(null)
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>
                {selectedDocument && documentTypes.find(t => t.value === selectedDocument.type)?.label}
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handleZoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="min-w-[4rem] text-center">{zoom}%</span>
                <Button variant="outline" size="icon" onClick={handleZoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0 relative overflow-auto">
            <div className="flex justify-center">
              {renderDocument()}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setDocumentToDelete(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}