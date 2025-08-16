import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, context: any) {
  // In newer Next versions the `params` can be a promise-like value; resolve safely
  const params = await Promise.resolve(context?.params)
  const dimensions = typeof params === 'object' ? params?.dimensions ?? '' : String(params || '')
  const [width, height] = dimensions.split('x').map(Number)
  
  if (!width || !height || width > 2000 || height > 2000) {
    return NextResponse.json({ error: 'Invalid dimensions' }, { status: 400 })
  }

  // Generate a simple colored square SVG as placeholder
  const hue = Math.floor(Math.random() * 360)
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:hsl(${hue},70%,60%);stop-opacity:1" />
          <stop offset="100%" style="stop-color:hsl(${(hue + 60) % 360},70%,40%);stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" />
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" 
            fill="white" font-family="Arial, sans-serif" font-size="24" font-weight="bold">
        ${width}×${height}
      </text>
    </svg>
  `

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
