import { NextResponse } from 'next/server'

// Reference to the mock database from the main route
declare const mockMaintenance: any[]

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const maintenance = mockMaintenance.find(m => m.id === Number(params.id))
    
    if (!maintenance) {
      return NextResponse.json(
        { message: 'Maintenance record not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(maintenance)
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch maintenance record' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const updatedMaintenance = await request.json()
    const index = mockMaintenance.findIndex(m => m.id === Number(params.id))
    
    if (index === -1) {
      return NextResponse.json(
        { message: 'Maintenance record not found' },
        { status: 404 }
      )
    }

    // Validate required fields
    const requiredFields = ['date', 'driver_name', 'truck_number', 'vehicle_under', 'maintenance_detail', 'status']
    const missingFields = requiredFields.filter(field => !updatedMaintenance[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { message: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Ensure numeric fields are properly converted
    updatedMaintenance.credit_card = Number(updatedMaintenance.credit_card || 0)
    updatedMaintenance.bank = Number(updatedMaintenance.bank || 0)
    updatedMaintenance.cash = Number(updatedMaintenance.cash || 0)
    updatedMaintenance.vat = Number(updatedMaintenance.vat || 0)
    updatedMaintenance.total = Number(updatedMaintenance.total || 0)

    // Validate at least one payment amount is provided
    if (updatedMaintenance.credit_card + updatedMaintenance.bank + updatedMaintenance.cash <= 0) {
      return NextResponse.json(
        { message: 'At least one payment amount must be greater than 0' },
        { status: 400 }
      )
    }

    mockMaintenance[index] = {
      ...updatedMaintenance,
      id: Number(params.id) // Ensure ID remains unchanged
    }

    return NextResponse.json({
      success: true,
      message: 'Maintenance record updated successfully',
      maintenance: mockMaintenance[index]
    })
  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to update maintenance record',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const index = mockMaintenance.findIndex(m => m.id === Number(params.id))
    
    if (index === -1) {
      return NextResponse.json(
        { message: 'Maintenance record not found' },
        { status: 404 }
      )
    }

    mockMaintenance.splice(index, 1)
    return NextResponse.json({ message: 'Maintenance record deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to delete maintenance record' },
      { status: 500 }
    )
  }
}