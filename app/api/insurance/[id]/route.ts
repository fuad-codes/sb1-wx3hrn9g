import { NextResponse } from 'next/server'

declare const mockInsuranceRecords: any[]

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const record = mockInsuranceRecords.find(r => r.id === params.id)
    
    if (!record) {
      return NextResponse.json(
        { message: 'Insurance record not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(record)
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch insurance record' },
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
    const index = mockInsuranceRecords.findIndex(r => r.id === params.id)
    
    if (index === -1) {
      return NextResponse.json(
        { message: 'Insurance record not found' },
        { status: 404 }
      )
    }

    mockInsuranceRecords[index] = updatedRecord
    return NextResponse.json(updatedRecord)
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to update insurance record' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const index = mockInsuranceRecords.findIndex(r => r.id === params.id)
    
    if (index === -1) {
      return NextResponse.json(
        { message: 'Insurance record not found' },
        { status: 404 }
      )
    }

    mockInsuranceRecords.splice(index, 1)
    return NextResponse.json({ message: 'Insurance record deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to delete insurance record' },
      { status: 500 }
    )
  }
}