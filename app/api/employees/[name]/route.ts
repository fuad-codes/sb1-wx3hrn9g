import { NextResponse } from 'next/server'

// Reference to the mock database from the main route
declare const mockEmployees: any[]

export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  try {
    const employee = mockEmployees.find(emp => emp.employee === params.name)
    
    if (!employee) {
      return NextResponse.json(
        { message: 'Employee not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(employee)
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch employee' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { name: string } }
) {
  try {
    const updatedEmployee = await request.json()
    const index = mockEmployees.findIndex(emp => emp.employee === params.name)
    
    if (index === -1) {
      return NextResponse.json(
        { message: 'Employee not found' },
        { status: 404 }
      )
    }

    mockEmployees[index] = updatedEmployee
    return NextResponse.json(updatedEmployee)
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to update employee' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { name: string } }
) {
  try {
    const index = mockEmployees.findIndex(emp => emp.employee === params.name)
    
    if (index === -1) {
      return NextResponse.json(
        { message: 'Employee not found' },
        { status: 404 }
      )
    }

    mockEmployees.splice(index, 1)
    return NextResponse.json({ message: 'Employee deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to delete employee' },
      { status: 500 }
    )
  }
}