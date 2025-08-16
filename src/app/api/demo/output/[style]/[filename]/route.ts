import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { notFound } from 'next/navigation'

export async function GET(
  request: NextRequest,
  { params }: { params: { style: string; filename: string } }
) {
  try {
    const { style, filename } = params
    const filePath = join(process.cwd(), 'src', 'app', 'demo', 'output', style, filename)
    const fileBuffer = await readFile(filePath)
    
    // Determine content type based on file extension
    const contentType = filename.endsWith('.jpg') || filename.endsWith('.jpeg') 
      ? 'image/jpeg' 
      : filename.endsWith('.png') 
      ? 'image/png' 
      : 'application/octet-stream'
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
      },
    })
  } catch (error) {
    return notFound()
  }
}
