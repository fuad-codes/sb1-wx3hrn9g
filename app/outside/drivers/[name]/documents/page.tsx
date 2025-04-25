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
import { FileText, Trash2, Upload, Eye } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

interface Document {
  id: string
  type: 'emirates_id' | 'passport' | 'visa' | 'labour_card' | 'contract' | 'health_insurance' | 'employment_insurance' | 'license'
  fileName: string
  filePath: string
  uploadDate: string
  employeeName: string
}

const documentTypes = [
  { value: 'emirates_id', label: 'Emirates ID' },
  { value: 'passport', label: 'Passport' },
  { value: 'visa', label: 'Visa' },
  { value: 'labour_card', label: 'Labour Card' },
  { value: 'contract', label: 'Contract' },
  { value: 'health_insurance', label: 'Health Insurance' },
  { value: 'employment_insurance', label: 'Employment Insurance' },
  { value: 'license', label: 'License' }
]

export default function DriverDocumentsPage({ params }: { params: { name: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState<string>("")
  const [uploading, setUploading] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null)

  const employeeName = decodeURIComponent(params.name)

  useEffect(() => {
    fetchDocuments()
  }, [employeeName])

  const fetchDocuments = async () => {
    try {
      const data = await fetchApi(`/other-employees/${employeeName}/documents`)
      setDocuments(Array.isArray(data) ? data : [])
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
      // Check if a document of this type already exists
      const existingDoc = documents.find(doc => doc.type === documentType)
      if (existingDoc) {
        // Delete the old file
        await fetchApi(`/other-employees/${employeeName}/documents?id=${existingDoc.id}`, {
          method: 'DELETE',
        })
      }

      // Create FormData for file upload
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('type', documentType)

      const response = await fetch(`/api/other-employees/${employeeName}/documents/upload`, {
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

      // Reset form and refresh documents
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
      await fetchApi(`/other-employees/${employeeName}/documents?id=${documentToDelete.id}`, {
        method: 'DELETE',
      })

      toast({
        title: "Success",
        description: "Document deleted successfully",
      })

      setDocuments(documents.filter(doc => doc.id !== documentToDelete.id))
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
      const response = await fetch(`/api/other-employees/${employeeName}/documents/view?id=${document.id}`)
      if (!response.ok) throw new Error('Failed to fetch document')
      
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      
      // Open document in new tab
      window.open(url, '_blank')
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error viewing document:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to view document",
      })
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Driver Documents - {employeeName}</CardTitle>
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
                    <Card key={doc.id}>
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