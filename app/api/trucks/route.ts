import { NextResponse } from 'next/server'

interface Truck {
  truck_number: string
  driver: string | null
  chassis_num: string | null
  year: number
  vehicle_under: string
  country: string
  mulkiya_exp: string | null
  tc_number: string | null
  ins_name: string | null
  ins_exp: string | null
  policy_num: string | null
}

// Mock database for trucks
const mockTrucks: Truck[] = [
  {
    truck_number: "T-001",
    driver: "John Doe",
    chassis_num: "CH123456",
    year: 2022,
    vehicle_under: "SAQR",
    country: "SAUDI",
    mulkiya_exp: "2024-12-31",
    tc_number: "TC123",
    ins_name: "Insurance Co",
    ins_exp: "2024-12-31",
    policy_num: "POL123"
  }
]

export async function GET() {
  try {
    return NextResponse.json(mockTrucks)
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch trucks' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const truck = await request.json()
    
    // Validate required fields
    const requiredFields = ['truck_number', 'year', 'vehicle_under', 'country']
    const missingFields = requiredFields.filter(field => !truck[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          message: `Missing required fields: ${missingFields.join(', ')}`,
        },
        { status: 400 }
      )
    }

    // Check if truck already exists
    if (mockTrucks.some(t => t.truck_number === truck.truck_number)) {
      return NextResponse.json(
        { message: 'A truck with this number already exists' },
        { status: 400 }
      )
    }

    mockTrucks.push(truck)

    return NextResponse.json(
      { message: 'Truck added successfully', truck },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error adding truck:', error)
    return NextResponse.json(
      { message: 'Failed to add truck' },
      { status: 500 }
    )
  }
}