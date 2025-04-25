import { NextResponse } from 'next/server'

// Reference to the mock database from the main route
declare const mockSuppliers: any[]

export async function GET() {
  try {
    const supplierNames = mockSuppliers.map(supplier => supplier.name)
    return NextResponse.json(supplierNames)
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch supplier names' },
      { status: 500 }
    )
  }
}