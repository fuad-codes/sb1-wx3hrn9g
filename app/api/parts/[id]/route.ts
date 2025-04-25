import { NextResponse } from 'next/server'

// Reference to the mock database from the main route
declare const mockParts: any[]

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const part = mockParts.find(p => p.id === params.id)
    
    if (!part) {
      return NextResponse.json(
        { message: 'Part not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(part)
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch part' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const updatedPart = await request.json()
    const index = mockParts.findIndex(p => p.id === params.id)
    
    if (index === -1) {
      return NextResponse.json(
        { message: 'Part not found' },
        { status: 404 }
      )
    }

    mockParts[index] = updatedPart
    return NextResponse.json(updatedPart)
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to update part' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const index = mockParts.findIndex(p => p.id === params.id)
    
    if (index === -1) {
      return NextResponse.json(
        { message: 'Part not found' },
        { status: 404 }
      )
    }

    mockParts.splice(index, 1)
    return NextResponse.json({ message: 'Part deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to delete part' },
      { status: 500 }
    )
  }
}