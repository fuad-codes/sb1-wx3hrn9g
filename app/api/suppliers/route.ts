import { NextResponse } from 'next/server'

interface Supplier {
  name: string
  tel_no: string | null
  contact_person: string | null
  phone_no: string | null
  about: string | null
}

// Mock database for suppliers
const mockSuppliers: Supplier[] = [
  {
    name: "ABC Parts",
    tel_no: "971501234567",
    contact_person: "John Smith",
    phone_no: "971502345678",
    about: "Leading auto parts supplier"
  }
]

export async function GET() {
  try {
    return NextResponse.json(mockSuppliers)
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch suppliers' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supplier = await request.json()
    
    // Validate required fields
    if (!supplier.name) {
      return NextResponse.json(
        { message: 'Supplier name is required' },
        { status: 400 }
      )
    }

    // Check if supplier already exists
    if (mockSuppliers.some(s => s.name === supplier.name)) {
      return NextResponse.json(
        { message: 'A supplier with this name already exists' },
        { status: 400 }
      )
    }

    mockSuppliers.push(supplier)

    return NextResponse.json(
      { message: 'Supplier added successfully', supplier },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error adding supplier:', error)
    return NextResponse.json(
      { message: 'Failed to add supplier' },
      { status: 500 }
    )
  }
}