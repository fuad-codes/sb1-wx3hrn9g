import { NextResponse } from 'next/server'

// Reference to the mock database from the main route
declare const mockSuppliers: any[]

export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  try {
    const supplier = mockSuppliers.find(s => s.name === params.name)
    
    if (!supplier) {
      return NextResponse.json(
        { message: 'Supplier not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(supplier)
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch supplier' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { name: string } }
) {
  try {
    const updatedSupplier = await request.json()
    const index = mockSuppliers.findIndex(s => s.name === params.name)
    
    if (index === -1) {
      return NextResponse.json(
        { message: 'Supplier not found' },
        { status: 404 }
      )
    }

    mockSuppliers[index] = updatedSupplier
    return NextResponse.json(updatedSupplier)
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to update supplier' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { name: string } }
) {
  try {
    const index = mockSuppliers.findIndex(s => s.name === params.name)
    
    if (index === -1) {
      return NextResponse.json(
        { message: 'Supplier not found' },
        { status: 404 }
      )
    }

    mockSuppliers.splice(index, 1)
    return NextResponse.json({ message: 'Supplier deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to delete supplier' },
      { status: 500 }
    )
  }
}