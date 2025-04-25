import { NextResponse } from 'next/server'

interface Client {
  name: string
  address: string | null
  tel_no: number | null
  po_box: number | null
  trn_no: number | null
}

// Mock database for clients
const mockClients: Client[] = [
  {
    name: "ABC Company",
    address: "123 Business Street",
    tel_no: 971501234567,
    po_box: 12345,
    trn_no: 123456789
  }
]

export async function GET() {
  try {
    return NextResponse.json(mockClients)
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch clients' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const client = await request.json()
    
    // Validate required fields
    if (!client.name) {
      return NextResponse.json(
        { message: 'Client name is required' },
        { status: 400 }
      )
    }

    // Check if client already exists
    if (mockClients.some(c => c.name === client.name)) {
      return NextResponse.json(
        { message: 'A client with this name already exists' },
        { status: 400 }
      )
    }

    mockClients.push(client)

    return NextResponse.json(
      { message: 'Client added successfully', client },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error adding client:', error)
    return NextResponse.json(
      { message: 'Failed to add client' },
      { status: 500 }
    )
  }
}