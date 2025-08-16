'use client'
import { useState } from 'react'

export default function TestPage() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testEndpoint = async (endpoint: string, method: string, body?: any) => {
    setLoading(true)
    try {
      const options: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' }
      }
      
      if (body) {
        options.body = JSON.stringify(body)
      }

      const response = await fetch(endpoint, options)
      const data = await response.json()
      
      setResult(JSON.stringify(data, null, 2))
    } catch (error) {
      setResult(`Error: ${error}`)
    }
    setLoading(false)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Backend API Testing</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => testEndpoint('/api/test', 'GET')}
          className="bg-blue-500 text-white p-3 rounded hover:bg-blue-600"
          disabled={loading}
        >
          Test API Status
        </button>
        
        <button
          onClick={() => testEndpoint('/api/auth/signup', 'POST', {
            email: 'test@example.com',
            password: 'TestPass123!',
            name: 'Test User'
          })}
          className="bg-green-500 text-white p-3 rounded hover:bg-green-600"
          disabled={loading}
        >
          Test Signup
        </button>
        
        <button
          onClick={() => testEndpoint('/api/auth/login', 'POST', {
            email: 'test@example.com',
            password: 'TestPass123!'
          })}
          className="bg-yellow-500 text-white p-3 rounded hover:bg-yellow-600"
          disabled={loading}
        >
          Test Login
        </button>
        
        <button
          onClick={() => testEndpoint('/api/auth/me', 'GET')}
          className="bg-purple-500 text-white p-3 rounded hover:bg-purple-600"
          disabled={loading}
        >
          Test Get User
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded">
        <h2 className="text-xl font-semibold mb-4">API Response:</h2>
        <pre className="bg-black text-green-400 p-4 rounded text-sm overflow-auto max-h-96">
          {loading ? 'Loading...' : result || 'Click a button to test an endpoint'}
        </pre>
      </div>
      
      <div className="mt-8 text-sm text-gray-600">
        <p><strong>Note:</strong> Some endpoints will fail until you set up Supabase and add API keys to .env.local</p>
        <p>But this proves the backend structure is working correctly!</p>
      </div>
    </div>
  )
}
