import { NextRequest, NextResponse } from 'next/server';
import { 
  paddleServer, 
  validatePaddleServerConfig,
  createPaddleCustomer,
  getPaddleCustomerByEmail 
} from '@/lib/paddle-server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    validatePaddleServerConfig();
    
    const { priceId, email, name, customData } = await request.json();

    if (!priceId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: priceId and email' },
        { status: 400 }
      );
    }

    // Get or create Paddle customer
    let customer = await getPaddleCustomerByEmail(email);
    
    if (!customer) {
      customer = await createPaddleCustomer(email, name);
    }

    // Create transaction with checkout URL
    const transaction = await paddleServer.transactions.create({
      items: [
        {
          priceId,
          quantity: 1
        }
      ],
      customerId: customer.id,
      customData: {
        ...customData,
        source: 'project-rush-preorder'
      },
      // Checkout URLs will be handled by client-side Paddle.js
    });

    // Update user profile with Paddle customer ID if authenticated
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase
          .from('profiles')
          .update({ 
            paddle_customer_id: customer.id,
            email: email // Ensure email is synced
          })
          .eq('id', user.id);
      }
    } catch (profileError) {
      // Don't fail checkout if profile update fails
      console.error('Error updating user profile:', profileError);
    }

    return NextResponse.json({
      success: true,
      customerId: customer.id,
      transactionId: transaction.id,
      checkout: transaction.checkout
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve customer information
export async function GET(request: NextRequest) {
  try {
    validatePaddleServerConfig();
    
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    const customer = await getPaddleCustomerByEmail(email);
    
    if (!customer) {
      return NextResponse.json(
        { customer: null },
        { status: 200 }
      );
    }

    return NextResponse.json({
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        createdAt: customer.createdAt
      }
    });

  } catch (error) {
    console.error('Error retrieving customer:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve customer' },
      { status: 500 }
    );
  }
}
