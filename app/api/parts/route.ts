import { NextResponse } from 'next/server'
import type { PartRecord } from '../interfaces'

// Mock database for parts
const mockParts: PartRecord[] = [
  {
    id: "P001",
    name: "Air Filter",
    part_number: "AF-12345",
    category: "engine",
    quantity: 15,
    unit_price: 45.99,
    supplier: "ABC Parts",
    location: "Warehouse A",
    minimum_stock: 5,
    last_purchase_date: "2024-03-15",
    status: "in_stock"
  },
  {
    id: "P002",
    name: "Brake Pad Set",
    part_number: "BP-67890",
    category: "brake",
    quantity: 3,
    unit_price: 89.99,
    supplier: "XYZ Auto Parts",
    location: "Warehouse B",
    minimum_stock: 5,
    last_purchase_date: "2024-03-10",
    status: "low_stock"
  },
  {
    id: "P003",
    name: "Transmission Fluid",
    part_number: "TF-54321",
    category: "transmission",
    quantity: 0,
    unit_price: 29.99,
    supplier: "ABC Parts",
    location: "Warehouse A",
    minimum_stock: 10,
    last_purchase_date: "2024-02-28",
    status: "out_of_stock"
  }
]

export async function GET() {
  try {
    return NextResponse.json(mockParts)
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch parts' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const part = await request.json()
    
    // Validate required fields
    const requiredFields = ['name', 'part_number', 'category', 'quantity', 'unit_price', 'supplier', 'location', 'minimum_stock']
    const missingFields = requiredFields.filter(field => !part[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { message: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Generate unique ID
    part.id = `P${String(mockParts.length + 1).padStart(3, '0')}`
    
    // Set status based on quantity and minimum stock
    part.status = part.quantity === 0 ? 'out_of_stock' : 
                  part.quantity <= part.minimum_stock ? 'low_stock' : 'in_stock'

    mockParts.push(part)

    return NextResponse.json(
      { message: 'Part added successfully', part },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to add part' },
      { status: 500 }
    )
  }
}