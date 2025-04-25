import { NextResponse } from 'next/server'

// Mock database for companies
const mockCompanies = ["SAQR", "MYSHA"]

export async function GET() {
  try {
    return NextResponse.json(mockCompanies)
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch companies' },
      { status: 500 }
    )
  }
}