import { NextResponse } from 'next/server'

interface Document {
  id: string
  type: 'emirates_id' | 'passport' | 'visa' | 'labour_card' | 'contract'
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

    // Decode the employee name from URL parameters
    const decodedName = decodeURIComponent(params.name)
    
    // Filter documents for the specific employee
    const documents = mockDocuments.filter(doc => 
      doc.employeeName.toLowerCase() === decodedName.toLowerCase()
    )
    
    // Return empty array if no documents found instead of throwing error
    return NextResponse.json(documents)
  } catch (error) {
    console.error('Error in GET /api/employees/[name]/documents:', error)
    return NextResponse.json(
      { 
        message: 'Failed to fetch employee documents',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(
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

    const document = await request.json()
    
    if (!document || !document.type || !document.fileName || !document.url) {
      return NextResponse.json(
        { message: 'Invalid document data. Required fields: type, fileName, url' },
        { status: 400 }
      )
    }
    
    // Decode the employee name from URL parameters
    const decodedName = decodeURIComponent(params.name)
    
    // Generate unique ID
    document.id = `DOC${String(mockDocuments.length + 1).padStart(3, '0')}`
    document.employeeName = decodedName
    document.uploadDate = new Date().toISOString().split('T')[0]

    mockDocuments.push(document)

    return NextResponse.json(
      { message: 'Document added successfully', document },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in POST /api/employees/[name]/documents:', error)
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
    const docId = searchParams.get('id')
    
    if (!docId) {
      return NextResponse.json(
        { message: 'Document ID is required' },
        { status: 400 }
      )
    }

    // Decode the employee name from URL parameters
    const decodedName = decodeURIComponent(params.name)

    const index = mockDocuments.findIndex(doc => 
      doc.employeeName.toLowerCase() === decodedName.toLowerCase() && 
      doc.id === docId
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
    console.error('Error in DELETE /api/employees/[name]/documents:', error)
    return NextResponse.json(
      { 
        message: 'Failed to delete document',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}