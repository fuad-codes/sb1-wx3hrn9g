import { NextResponse } from 'next/server'

// Mock database
let mockEmployees = [
  {
    employee: "John Doe",
    refered_as: "John",
    designation: "Driver",
    salary: 3000,
    nationality: "Indian",
    visa_outstanding: 0,
    advance_avl: 0,
    visa_under: "SAQR",
    visa_exp: "2024-12-31",
    eid: "784-1234-5678901-1",
    health_ins: "HI123456",
    health_ins_exp: "2024-12-31",
    emp_ins: "EI123456",
    emp_ins_exp: "2024-12-31"
  }
]

export async function GET() {
  try {
    return NextResponse.json(mockEmployees)
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch employees' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const employee = await request.json()
    
    // Validate required fields
    const requiredFields = ['employee', 'refered_as', 'designation', 'salary']
    const missingFields = requiredFields.filter(field => !employee[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          message: `Missing required fields: ${missingFields.join(', ')}`,
        },
        { status: 400 }
      )
    }

    // Validate salary is a positive number
    if (typeof employee.salary !== 'number' || employee.salary <= 0) {
      return NextResponse.json(
        { message: 'Salary must be a positive number' },
        { status: 400 }
      )
    }

    // Trim the employee name before checking for duplicates
    const trimmedEmployeeName = employee.employee.trim()

    // Check if employee already exists (using trimmed name comparison)
    if (mockEmployees.some(emp => emp.employee.trim() === trimmedEmployeeName)) {
      return NextResponse.json(
        { message: 'An employee with this name already exists' },
        { status: 400 }
      )
    }

    // Add default values for optional fields
    const newEmployee = {
      ...employee,
      employee: trimmedEmployeeName, // Store the trimmed name
      visa_outstanding: employee.visa_outstanding || 0,
      advance_avl: employee.advance_avl || 0,
      visa_under: employee.visa_under || "SAQR",
      nationality: employee.nationality || "",
      eid: employee.eid || null,
      health_ins: employee.health_ins || null,
      health_ins_exp: employee.health_ins_exp || null,
      emp_ins: employee.emp_ins || null,
      emp_ins_exp: employee.emp_ins_exp || null
    }

    // Add to mock database
    mockEmployees.push(newEmployee)

    return NextResponse.json(
      { message: 'Employee added successfully', employee: newEmployee },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error adding employee:', error)
    return NextResponse.json(
      { message: 'Failed to add employee. Please try again.' },
      { status: 500 }
    )
  }
}