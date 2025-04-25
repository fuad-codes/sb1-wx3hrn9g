import { NextResponse } from 'next/server'
import type { FineRecord } from '../interfaces'

// Mock database
const mockFineRecords: FineRecord[] = [
  {
    id: "F001",
    date: "2024-03-20",
    driver_name: "John Doe",
    truck_number: "T-001",
    vehicle_under: "SAQR",
    amount: 200,
    details: "Speed violation",
    status: "pending",
    country: "oman",
    fine_type: "Traffic",
    due_date: "2024-04-20",
    penalty_amount: 50
  }
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const country = searchParams.get('country')

    if (country) {
      return NextResponse.json(
        mockFineRecords.filter(record => record.country === country)
      )
    }

    return NextResponse.json(mockFineRecords)
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch fine records' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const record = await request.json()
    
    const requiredFields = ['date', 'driver_name', 'truck_number', 'country', 'fine_type', 'amount']
    const missingFields = requiredFields.filter(field => !record[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { message: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    record.id = `F${String(mockFineRecords.length + 1).padStart(3, '0')}`
    mockFineRecords.push(record)

    return NextResponse.json(
      { message: 'Fine record added successfully', record },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to add fine record' },
      { status: 500 }
    )
  }
}