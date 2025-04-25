import { NextResponse } from 'next/server'

// Reference to the mock database from the main route
declare const mockTIRRecords: any[]

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const record = mockTIRRecords.find(r => r.id === params.id)
    
    if (!record) {
      return NextResponse.json(
        { message: 'TIR record not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(record)
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch TIR record' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const updatedRecord = await request.json()
    const index = mockTIRRecords.findIndex(r => r.id === params.id)
    
    if (index === -1) {
      return NextResponse.json(
        { message: 'TIR record not found' },
        { status: 404 }
      )
    }

    mockTIRRecords[index] = updatedRecord
    return NextResponse.json(updatedRecord)
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to update TIR record' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const index = mockTIRRecords.findIndex(r => r.id === params.id)
    
    if (index === -1) {
      return NextResponse.json(
        { message: 'TIR record not found' },
        { status: 404 }
      )
    }

    mockTIRRecords.splice(index, 1)
    return NextResponse.json({ message: 'TIR record deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to delete TIR record' },
      { status: 500 }
    )
  }
}