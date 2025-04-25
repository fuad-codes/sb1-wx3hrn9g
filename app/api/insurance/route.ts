import { NextResponse } from 'next/server'
import type { InsuranceRecord } from '../interfaces'

// Mock database
const mockInsuranceRecords: InsuranceRecord[] = [
  {
    id: "I001",
    date: "2024-03-20",
    driver_name: "John Doe",
    truck_number: "T-001",
    vehicle_under: "SAQR",
    amount: 1500,
    details: "Annual vehicle insurance",
    status: "paid",
    country: "oman",
    insurance_type: "Vehicle",
    policy_number: "POL-123456",
    expiry_date: "2025-03-20",
    coverage_amount: 50000
  }
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const country = searchParams.get('country')

    if (country) {
      return NextResponse.json(
        mockInsuranceRecords.filter(record => record.country === country)
      )
    }

    return NextResponse.json(mockInsuranceRecords)
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch insurance records' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const record = await request.json()
    
    const requiredFields = ['date', 'driver_name', 'truck_number', 'country', 'insurance_type', 'policy_number']
    const missingFields = requiredFields.filter(field => !record[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { message: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    record.id = `I${String(mockInsuranceRecords.length + 1).padStart(3, '0')}`
    mockInsuranceRecords.push(record)

    return NextResponse.json(
      { message: 'Insurance record added successfully', record },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to add insurance record' },
      { status: 500 }
    )
  }
}