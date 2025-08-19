import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    console.log('Testing Supabase connection...')
    
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    console.log('Environment check:', {
      url: supabaseUrl ? 'Present' : 'Missing',
      anonKey: supabaseAnonKey ? 'Present' : 'Missing',
      serviceKey: serviceRoleKey ? 'Present' : 'Missing'
    })

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        error: 'Missing Supabase environment variables',
        details: {
          url: !!supabaseUrl,
          anonKey: !!supabaseAnonKey,
          serviceKey: !!serviceRoleKey
        }
      }, { status: 500 })
    }

    const supabase = await createClient()
    
    // Test database connection
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)

    console.log('Database test result:', { testData, testError })

    return NextResponse.json({
      status: 'success',
      message: 'Supabase connection working',
      environment: {
        url: supabaseUrl?.substring(0, 30) + '...',
        hasAnonKey: !!supabaseAnonKey,
        hasServiceKey: !!serviceRoleKey
      },
      databaseTest: testError ? 'Failed' : 'Success'
    })

  } catch (error) {
    console.error('Supabase test error:', error)
    return NextResponse.json({
      error: 'Supabase test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
