import { NextResponse } from 'next/server'

declare const mockFineRecords: any[]

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const record = mockFineRecords.find(r => r.id === params.id)
    
    if (!record) {
      return NextResponse.json(
        { message: 'Fine record not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(record)
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch fine record' },
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
    const index = mockFineRecords.findIndex(r => r.id === params.id)
    
    if (index === -1) {
      return NextResponse.json(
        { message: 'Fine record not found' },
        { status: 404 }
      )
    }

    mockFineRecords[index] = updatedRecord
    return NextResponse.json(updatedRecord)
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to update fine record' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const index = mockFineRecords.findIndex(r => r.id === params.id)
    
    if (index === -1) {
      return NextResponse.json(
        { message: 'Fine record not found' },
        { status: 404 }
      )
    }

    mockFineRecords.splice(index, 1)
    return NextResponse.json({ message: 'Fine record deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to delete fine record' },
      { status: 500 }
    )
  }
}