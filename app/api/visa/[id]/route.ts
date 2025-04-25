import { NextResponse } from 'next/server'

// Reference to mock database
declare const mockVisaRecords: any[]

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const record = mockVisaRecords.find(r => r.id === params.id)
    
    if (!record) {
      return NextResponse.json(
        { message: 'Visa record not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(record)
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch visa record' },
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
    const index = mockVisaRecords.findIndex(r => r.id === params.id)
    
    if (index === -1) {
      return NextResponse.json(
        { message: 'Visa record not found' },
        { status: 404 }
      )
    }

    mockVisaRecords[index] = updatedRecord
    return NextResponse.json(updatedRecord)
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to update visa record' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const index = mockVisaRecords.findIndex(r => r.id === params.id)
    
    if (index === -1) {
      return NextResponse.json(
        { message: 'Visa record not found' },
        { status: 404 }
      )
    }

    mockVisaRecords.splice(index, 1)
    return NextResponse.json({ message: 'Visa record deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to delete visa record' },
      { status: 500 }
    )
  }
}