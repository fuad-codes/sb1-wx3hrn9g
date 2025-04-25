import { NextResponse } from 'next/server'

interface Maintenance {
  id: number
  date: string
  driver_name: string
  truck_number: string
  vehicle_under: string
  maintenance_detail: string
  credit_card: number
  bank: number
  cash: number
  vat: number
  total: number
  status: 'PAID' | 'UNPAID'
  supplier: string | null
  includeVat?: boolean
}

// Mock database for maintenance records
const mockMaintenance: Maintenance[] = [
  {
    id: 1,
    date: "2024-03-20",
    driver_name: "John Doe",
    truck_number: "T-001",
    vehicle_under: "SAQR",
    maintenance_detail: "Oil change and general service",
    credit_card: 100,
    bank: 210,
    cash: 50,
    vat: 18,
    total: 378,
    status: "PAID",
    supplier: "ABC Parts"
  }
]

export async function GET() {
  try {
    return NextResponse.json(mockMaintenance)
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch maintenance records' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const maintenance = await request.json()
    
    // Validate required fields
    const requiredFields = ['date', 'driver_name', 'truck_number', 'vehicle_under', 'maintenance_detail', 'status']
    const missingFields = requiredFields.filter(field => !maintenance[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { message: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Ensure numeric fields are properly converted
    maintenance.credit_card = Number(maintenance.credit_card || 0)
    maintenance.bank = Number(maintenance.bank || 0)
    maintenance.cash = Number(maintenance.cash || 0)
    maintenance.vat = Number(maintenance.vat || 0)
    maintenance.total = Number(maintenance.total || 0)

    // Validate at least one payment amount is provided
    if (maintenance.credit_card + maintenance.bank + maintenance.cash <= 0) {
      return NextResponse.json(
        { message: 'At least one payment amount must be greater than 0' },
        { status: 400 }
      )
    }

    // Get the latest ID and increment
    const latestId = mockMaintenance.length > 0 
      ? Math.max(...mockMaintenance.map(m => m.id))
      : 0

    // Set the new ID
    maintenance.id = latestId + 1

    // Add the record
    mockMaintenance.push(maintenance)

    return NextResponse.json(
      { 
        success: true,
        message: 'Maintenance record added successfully',
        maintenance 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error adding maintenance record:', error)
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to add maintenance record',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}