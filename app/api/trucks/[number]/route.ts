import { NextResponse } from 'next/server'

// Reference to the mock database from the main route
declare const mockTrucks: any[]

export async function GET(
  request: Request,
  { params }: { params: { number: string } }
) {
  try {
    const truck = mockTrucks.find(t => t.truck_number === params.number)
    
    if (!truck) {
      return NextResponse.json(
        { message: 'Truck not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(truck)
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch truck' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { number: string } }
) {
  try {
    const updatedTruck = await request.json()
    const index = mockTrucks.findIndex(t => t.truck_number === params.number)
    
    if (index === -1) {
      return NextResponse.json(
        { message: 'Truck not found' },
        { status: 404 }
      )
    }

    mockTrucks[index] = updatedTruck
    return NextResponse.json(updatedTruck)
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to update truck' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { number: string } }
) {
  try {
    const index = mockTrucks.findIndex(t => t.truck_number === params.number)
    
    if (index === -1) {
      return NextResponse.json(
        { message: 'Truck not found' },
        { status: 404 }
      )
    }

    mockTrucks.splice(index, 1)
    return NextResponse.json({ message: 'Truck deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to delete truck' },
      { status: 500 }
    )
  }
}