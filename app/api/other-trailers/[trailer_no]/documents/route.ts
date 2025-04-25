import { NextResponse } from 'next/server'

interface Document {
  type: 'mulkiya' | 'insurance' | 'other' | 'oman' | 'kuwait' | 'saudi' | 'qatar' | 'bahrin' | 'jordan'
  url: string
  uploadDate: string
  trailer_no: string
}

// Mock database for trailer documents
const mockDocuments: Document[] = [
  {
    type: "mulkiya",
    url: "https://example.com/documents/trailer-mulkiya.pdf",
    uploadDate: "2024-03-20",
    trailer_no: "TR-001"
  }
]

export async function GET(
  request: Request,
  { params }: { params: { trailer_no: string } }
) {
  try {
    if (!params.trailer_no) {
      return NextResponse.json(
        { message: 'Trailer number is required' },
        { status: 400 }
      )
    }

    // Decode the trailer number from URL parameters
    const decodedNumber = decodeURIComponent(params.trailer_no)
    
    // Filter documents for the specific trailer
    const documents = mockDocuments.filter(doc => 
      doc.trailer_no.toLowerCase() === decodedNumber.toLowerCase()
    )
    
    // Return empty array if no documents found instead of throwing error
    return NextResponse.json(documents)
  } catch (error) {
    console.error('Error in GET /api/other-trailers/[trailer_no]/documents:', error)
    return NextResponse.json(
      { 
        message: 'Failed to fetch trailer documents',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { trailer_no: string } }
) {
  try {
    if (!params.trailer_no) {
      return NextResponse.json(
        { message: 'Trailer number is required' },
        { status: 400 }
      )
    }

    const document = await request.json()
    
    if (!document || !document.type || !document.url) {
      return NextResponse.json(
        { message: 'Invalid document data. Required fields: type, url' },
        { status: 400 }
      )
    }
    
    // Decode the trailer number from URL parameters
    const decodedNumber = decodeURIComponent(params.trailer_no)
    
    document.trailer_no = decodedNumber
    document.uploadDate = new Date().toISOString().split('T')[0]

    // Check if document of this type already exists for this trailer
    const existingIndex = mockDocuments.findIndex(doc => 
      doc.trailer_no.toLowerCase() === decodedNumber.toLowerCase() && 
      doc.type === document.type
    )
    
    if (existingIndex !== -1) {
      // Replace existing document
      mockDocuments[existingIndex] = document
      return NextResponse.json(
        { message: 'Document updated successfully', document },
        { status: 200 }
      )
    } else {
      // Add new document
      mockDocuments.push(document)
      return NextResponse.json(
        { message: 'Document added successfully', document },
        { status: 201 }
      )
    }
  } catch (error) {
    console.error('Error in POST /api/other-trailers/[trailer_no]/documents:', error)
    return NextResponse.json(
      { 
        message: 'Failed to add document',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { trailer_no: string } }
) {
  try {
    if (!params.trailer_no) {
      return NextResponse.json(
        { message: 'Trailer number is required' },
        { status: 400 }
      )
    }

    const { searchParams } = new URL(request.url)
    const docType = searchParams.get('type')
    
    if (!docType) {
      return NextResponse.json(
        { message: 'Document type is required' },
        { status: 400 }
      )
    }

    // Decode the trailer number from URL parameters
    const decodedNumber = decodeURIComponent(params.trailer_no)

    const index = mockDocuments.findIndex(doc => 
      doc.trailer_no.toLowerCase() === decodedNumber.toLowerCase() && 
      doc.type === docType
    )
    
    if (index === -1) {
      return NextResponse.json(
        { message: 'Document not found' },
        { status: 404 }
      )
    }

    mockDocuments.splice(index, 1)
    return NextResponse.json({ message: 'Document deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/other-trailers/[trailer_no]/documents:', error)
    return NextResponse.json(
      { 
        message: 'Failed to delete document',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}