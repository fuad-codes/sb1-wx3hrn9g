import { NextResponse } from 'next/server'
import type { VisaRecord } from '../interfaces'

// Mock database
const mockVisaRecords: VisaRecord[] = [
  {
    id: "V001",
    date: "2024-03-20",
    driver_name: "John Doe",
    truck_number: "T-001",
    vehicle_under: "SAQR",
    amount: 500,
    details: "Work visa renewal",
    status: "pending",
    country: "oman",
    visa_type: "Work Permit",
    expiry_date: "2025-03-20",
    processing_fee: 100
  }
]

export async function GET(request: Request) {
  try {
    // Get country from query params
    const { searchParams } = new URL(request.url)
    const country = searchParams.get('country')

    if (country) {
      return NextResponse.json(
        mockVisaRecords.filter(record => record.country === country)
      )
    }

    return NextResponse.json(mockVisaRecords)
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch visa records' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const record = await request.json()
    
    // Validate required fields
    const requiredFields = ['date', 'driver_name', 'truck_number', 'country', 'visa_type']
    const missingFields = requiredFields.filter(field => !record[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { message: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Generate unique ID
    record.id = `V${String(mockVisaRecords.length + 1).padStart(3, '0')}`

    mockVisaRecords.push(record)

    return NextResponse.json(
      { message: 'Visa record added successfully', record },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to add visa record' },
      { status: 500 }
    )
  }
}