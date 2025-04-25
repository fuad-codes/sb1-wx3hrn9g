import { NextResponse } from 'next/server'
import type { TIRRecord } from '../interfaces'

// Mock database for TIR records
const mockTIRRecords: TIRRecord[] = [
  {
    id: "TIR001",
    number: "TIR123456",
    issue_date: "2024-03-01",
    expiry_date: "2025-03-01",
    truck_number: "T-001",
    driver_name: "John Doe",
    status: "active",
    country: "UAE",
    customs_office: "Dubai Customs",
    remarks: "Regular TIR"
  },
  {
    id: "TIR002",
    number: "TIR789012",
    issue_date: "2024-02-15",
    expiry_date: "2024-02-28",
    truck_number: "T-002",
    driver_name: "Jane Smith",
    status: "expired",
    country: "SA",
    customs_office: "Riyadh Customs",
    remarks: null
  }
]

export async function GET() {
  try {
    return NextResponse.json(mockTIRRecords)
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch TIR records' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const record = await request.json()
    
    // Validate required fields
    const requiredFields = ['number', 'issue_date', 'expiry_date', 'truck_number', 'driver_name', 'status', 'country', 'customs_office']
    const missingFields = requiredFields.filter(field => !record[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { message: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Generate unique ID
    record.id = `TIR${String(mockTIRRecords.length + 1).padStart(3, '0')}`

    mockTIRRecords.push(record)

    return NextResponse.json(
      { message: 'TIR record added successfully', record },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to add TIR record' },
      { status: 500 }
    )
  }
}