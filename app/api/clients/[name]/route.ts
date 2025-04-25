import { NextResponse } from 'next/server'

// Reference to the mock database from the main route
declare const mockClients: any[]

export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  try {
    const client = mockClients.find(c => c.name === params.name)
    
    if (!client) {
      return NextResponse.json(
        { message: 'Client not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(client)
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch client' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { name: string } }
) {
  try {
    const updatedClient = await request.json()
    const index = mockClients.findIndex(c => c.name === params.name)
    
    if (index === -1) {
      return NextResponse.json(
        { message: 'Client not found' },
        { status: 404 }
      )
    }

    mockClients[index] = updatedClient
    return NextResponse.json(updatedClient)
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to update client' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { name: string } }
) {
  try {
    const index = mockClients.findIndex(c => c.name === params.name)
    
    if (index === -1) {
      return NextResponse.json(
        { message: 'Client not found' },
        { status: 404 }
      )
    }

    mockClients.splice(index, 1)
    return NextResponse.json({ message: 'Client deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to delete client' },
      { status: 500 }
    )
  }
}