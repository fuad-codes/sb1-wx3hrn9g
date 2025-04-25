import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(
  request: Request,
  { params }: { params: { name: string } }
) {
  try {
    if (!params.name) {
      return NextResponse.json(
        { message: 'Employee name is required' },
        { status: 400 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string

    if (!file) {
      return NextResponse.json(
        { message: 'File is required' },
        { status: 400 }
      )
    }

    if (!type) {
      return NextResponse.json(
        { message: 'Document type is required' },
        { status: 400 }
      )
    }

    // Validate file size (10MB limit)
    const MAX_FILE_SIZE = 100 * 1024 * 1024 // 10MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: 'File size exceeds 10MB limit' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: 'Invalid file type. Allowed types: PDF, JPEG, PNG' },
        { status: 400 }
      )
    }

    try {
      // Create base documents directory if it doesn't exist
      const documentsDir = join(process.cwd(), 'documents')
      if (!existsSync(documentsDir)) {
        await mkdir(documentsDir)
      }

      // Create employee directory if it doesn't exist
      const employeeDir = join(documentsDir, params.name)
      if (!existsSync(employeeDir)) {
        await mkdir(employeeDir)
      }

      // Create document type directory if it doesn't exist
      const typeDir = join(employeeDir, type)
      if (!existsSync(typeDir)) {
        await mkdir(typeDir)
      }

      // Get file extension and generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${type}-${Date.now()}.${fileExt}`
      const filePath = join(typeDir, fileName)

      // Convert file to buffer and save
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filePath, buffer)

      // Create document record
      const document = {
        id: `${type}-${Date.now()}`,
        type,
        fileName,
        filePath,
        uploadDate: new Date().toISOString().split('T')[0],
        employeeName: params.name
      }

      return NextResponse.json(
        { message: 'Document uploaded successfully', document },
        { status: 201 }
      )
    } catch (error) {
      console.error('File system error:', error)
      return NextResponse.json(
        { message: 'Failed to save file to disk', error: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error uploading document:', error)
    return NextResponse.json(
      { 
        message: 'Failed to process document upload',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}