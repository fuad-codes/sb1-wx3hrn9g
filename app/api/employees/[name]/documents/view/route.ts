import { NextResponse } from 'next/server'

interface Document {
  id: string
  type: string
  fileName: string
  url: string
  uploadDate: string
  employeeName: string
}

// Mock database for employee documents
const mockDocuments: Document[] = [
  {
    id: "DOC001",
    type: "emirates_id",
    fileName: "emirates-id-front.pdf",
    url: "https://example.com/documents/emirates-id-front.pdf",
    uploadDate: "2024-03-20",
    employeeName: "John Doe"
  }
]

export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  try {
    if (!params.name) {
      return NextResponse.json(
        { message: 'Employee name is required' },
        { status: 400 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    
    if (!type) {
      return NextResponse.json(
        { message: 'Document type is required' },
        { status: 400 }
      )
    }

    // Decode the employee name from URL parameters
    const decodedName = decodeURIComponent(params.name)

    // Find the document
    const document = mockDocuments.find(doc => 
      doc.employeeName.toLowerCase() === decodedName.toLowerCase() && 
      doc.type === type
    )

    if (!document) {
      return NextResponse.json(
        { message: 'Document not found' },
        { status: 404 }
      )
    }

    // Fetch the document from the URL
    try {
      const fileResponse = await fetch(document.url)
      
      if (!fileResponse.ok) {
        throw new Error('Failed to fetch document file')
      }

      const contentType = fileResponse.headers.get('content-type')
      const blob = await fileResponse.blob()

      // Return the file with appropriate headers
      return new NextResponse(blob, {
        headers: {
          'Content-Type': contentType || 'application/octet-stream',
          'Content-Disposition': `inline; filename="${document.fileName}"`,
        },
      })
    } catch (error) {
      console.error('Error fetching document file:', error)
      return NextResponse.json(
        { message: 'Failed to fetch document file' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in GET /api/employees/[name]/documents/view:', error)
    return NextResponse.json(
      { 
        message: 'Failed to retrieve document',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}