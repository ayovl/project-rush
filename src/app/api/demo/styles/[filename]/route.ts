import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { notFound } from 'next/navigation'

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename
    const filePath = join(process.cwd(), 'src', 'app', 'demo', 'styles', filename)
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
