import { NextResponse } from 'next/server'
import type { TripRecord } from '../interfaces'

// Mock database
const mockTrips: TripRecord[] = [
  {
    trip_id: 1,
    load_date: "2024-03-20",
    return_load: 0,
    company_truck: 1,
    truck_number: "T-001",
    driver: "John Doe",
    company: "SAQR",
    company_rate: 2000,
    driver_rate: 500,
    extra_delivery: 0,
    advance: 200,
    load_from: "Dubai",
    unload_to: "Muscat",
    weight: "20 tons",
    diesel_cost: 300,
    trip_rate: 2000,
    gp_toll: 50,
    advance_expenses: 200,
    other_exp: 100,
    total_exps: 850,
    truck_revenue: 1150,
    company_revenue: 1000
  }
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const country = searchParams.get('country')

    if (country) {
      // Filter by destination country if specified
      return NextResponse.json(
        mockTrips.filter(trip => trip.unload_to.toLowerCase().includes(country.toLowerCase()))
      )
    }

    return NextResponse.json(mockTrips)
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch trips' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const trip = await request.json()
    
    // Validate required fields
    const requiredFields = [
      'load_date', 'truck_number', 'driver', 'company',
      'company_rate', 'driver_rate', 'load_from', 'unload_to'
    ]
    const missingFields = requiredFields.filter(field => !trip[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { message: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Generate trip ID
    trip.trip_id = mockTrips.length + 1

    // Calculate totals
    trip.total_exps = (
      Number(trip.diesel_cost || 0) +
      Number(trip.gp_toll || 0) +
      Number(trip.advance_expenses || 0) +
      Number(trip.other_exp || 0)
    )

    trip.truck_revenue = Number(trip.trip_rate || 0) - trip.total_exps
    trip.company_revenue = Number(trip.company_rate || 0) - trip.total_exps

    mockTrips.push(trip)

    return NextResponse.json(
      { message: 'Trip added successfully', trip },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error adding trip:', error)
    return NextResponse.json(
      { message: 'Failed to add trip' },
      { status: 500 }
    )
  }
}