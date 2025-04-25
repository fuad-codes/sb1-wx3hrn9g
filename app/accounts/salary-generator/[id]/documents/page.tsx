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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { fetchApi } from "@/lib/utils"

interface Document {
  type: 'salary_slip' | 'payment_receipt' | 'bank_transfer' | 'other'
  url: string
  uploadDate: string
  salary_id: string
}

const documentTypes = [
  { value: 'salary_slip', label: 'Salary Slip' },
  { value: 'payment_receipt', label: 'Payment Receipt' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'other', label: 'Other' }
]

export default function SalaryDocumentsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [documents, setDocuments] = useState<Document[]>([
    {
      type: "salary_slip",
      url: "https://example.com/documents/salary_slip.pdf",
      uploadDate: "2024-03-31",
      salary_id: "SAL001"
    }
  ])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState<string>("")
  const [uploading, setUploading] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null)
  const [documentUrl, setDocumentUrl] = useState<string | null>(null)
  const [zoom, setZoom] = useState(100)
  const [contentType, setContentType] = useState<string | null>(null)

  const salaryId = params.id

  useEffect(() => {
    fetchDocuments()
  }, [salaryId])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      // In a real implementation, we would fetch documents from the API
      // For now, we'll just simulate a delay and use mock data
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Filter documents for this salary record
      const filteredDocuments = documents.filter(doc => doc.salary_id === salaryId)
      setDocuments(filteredDocuments)
    } catch (error) {
      console.error('Error fetching documents:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch documents",
      })
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
      // In a real implementation, we would upload the file to the server
      // For now, we'll just simulate a delay and add a mock document
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newDocument: Document = {
        type: documentType as any,
        url: URL.createObjectURL(selectedFile),
        uploadDate: new Date().toISOString().split('T')[0],
        salary_id: salaryId
      }
      
      setDocuments([...documents, newDocument])
      
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      })
      
      setSelectedFile(null)
      setDocumentType("")
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
      // In a real implementation, we would delete the document from the server
      // For now, we'll just simulate a delay and remove it from our state
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setDocuments(documents.filter(doc => doc !== documentToDelete))
      
      toast({
        title: "Success",
        description: "Document deleted successfully",
      })
      
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
      
      // In a real implementation, we would fetch the document from the server
      // For now, we'll just use the URL directly
      setDocumentUrl(document.url)
      setContentType("application/pdf") // Assuming PDF for mock data
    } catch (error) {
      console.error('Error viewing document:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to view document",
      })
      setViewDialogOpen(false)
    }
  }

  const handleDownload = () => {
    if (documentUrl && selectedDocument) {
      const a = document.createElement('a')
      a.href = documentUrl
      a.download = `${selectedDocument.type}_${selectedDocument.salary_id}.pdf`
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
          <CardTitle>Salary Documents - ID: {salaryId}</CardTitle>
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
                  {documents.map((doc, index) => (
                    <Card key={index}>
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