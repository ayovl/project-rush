import { NextRequest } from 'next/server';

// Test API route to verify Paddle server integration
export async function GET() {
  try {
    // Import here to avoid issues with client-side rendering
    const { validatePaddleServerConfig, PADDLE_SERVER_CONFIG } = await import('@/lib/paddle-server');
    
    // Check if environment variables are configured
    const config = {
      hasApiKey: !!process.env.PADDLE_API_KEY,
  hasWebhookSecret: !!process.env.PADDLE_WEBHOOK_SECRET,
      environment: PADDLE_SERVER_CONFIG.environment,
      isProduction: PADDLE_SERVER_CONFIG.isProduction
    };

    // Try to validate configuration.
    let configValid = false;
    let configError = null;
    
    try {
      validatePaddleServerConfig();
      configValid = true;
    } catch (error) {
      configError = (error as Error).message;
    }

    return Response.json({
      status: 'success',
      message: 'Paddle test endpoint working',
      config,
      configValid,
      configError,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return Response.json({
      status: 'error',
      message: 'Paddle integration test failed',
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Test webhook verification
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('paddle-signature');

    if (!signature) {
      return Response.json({
        status: 'error',
        message: 'Missing paddle-signature header'
      }, { status: 400 });
    }

    // Import webhook verification
    const { verifyPaddleWebhook } = await import('@/lib/paddle-server');

    // Pass Buffer to match new signature
    const result = await verifyPaddleWebhook(Buffer.from(body), signature);

    return Response.json({
      status: 'test_complete',
      message: 'Webhook verification function is working',
      result: result ? 'verified' : 'invalid_signature_as_expected',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return Response.json({
      status: 'error',
      message: 'Webhook test failed',
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
