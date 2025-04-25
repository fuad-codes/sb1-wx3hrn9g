import { NextResponse } from 'next/server'

declare const mockTrips: any[]

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const trip = mockTrips.find(t => t.trip_id === Number(params.id))
    
    if (!trip) {
      return NextResponse.json(
        { message: 'Trip not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(trip)
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch trip' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const updatedTrip = await request.json()
    const index = mockTrips.findIndex(t => t.trip_id === Number(params.id))
    
    if (index === -1) {
      return NextResponse.json(
        { message: 'Trip not found' },
        { status: 404 }
      )
    }

    // Recalculate totals
    updatedTrip.total_exps = (
      Number(updatedTrip.diesel_cost || 0) +
      Number(updatedTrip.gp_toll || 0) +
      Number(updatedTrip.advance_expenses || 0) +
      Number(updatedTrip.other_exp || 0)
    )

    updatedTrip.truck_revenue = Number(updatedTrip.trip_rate || 0) - updatedTrip.total_exps
    updatedTrip.company_revenue = Number(updatedTrip.company_rate || 0) - updatedTrip.total_exps

    mockTrips[index] = updatedTrip
    return NextResponse.json(updatedTrip)
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to update trip' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const index = mockTrips.findIndex(t => t.trip_id === Number(params.id))
    
    if (index === -1) {
      return NextResponse.json(
        { message: 'Trip not found' },
        { status: 404 }
      )
    }

    mockTrips.splice(index, 1)
    return NextResponse.json({ message: 'Trip deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to delete trip' },
      { status: 500 }
    )
  }
}