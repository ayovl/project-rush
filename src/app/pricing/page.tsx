'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  SparklesIcon,
  CheckIcon,
  StarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import AuthModal from '@/components/AuthModal'
import { useAuth } from '@/hooks/useAuth'
import { PADDLE_PRODUCTS } from '@/lib/paddle'
import { usePaddle } from '@/hooks/usePaddle'

const pricingPlans = [
  {
    id: 'basic',
    name: 'BASIC',
    price: '$4',
    period: '/month',
    badge: '',
    description: 'Founding Member Price',
    features: [
      '25 generations/month',
      'All style templates', 
      'HD quality exports',
      'Email support'
    ],
    popular: false,
    paddleProduct: PADDLE_PRODUCTS.basic
  },
  {
    id: 'pro',
    name: 'PRO', 
    price: '$9',
    period: '/month',
    badge: 'Most Popular',
    description: 'Founding Member Price',
    features: [
      '60 generations/month',
      'Priority processing',
      'Advanced style options',
      'Custom aspect ratios'
    ],
    popular: true,
    paddleProduct: PADDLE_PRODUCTS.pro
  },
  {
    id: 'ultimate',
    name: 'ULTIMATE',
    price: '$29', 
    period: '/month',
    badge: '',
    description: 'Founding Member Price',
    features: [
      '200 generations/month',
      'API access',
      'Custom model training',
      'Priority support'
    ],
    popular: false,
    paddleProduct: PADDLE_PRODUCTS.ultimate
  }
]

export default function PricingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [pendingPaymentPlan, setPendingPaymentPlan] = useState<string | null>(null)
  const { user } = useAuth()
  const { paddle, loading: paddleLoading } = usePaddle()
  const processingPlan = useRef<string | null>(null)

  const handlePreOrder = (planId: string) => {
    if (isProcessing) return;
    
    setSelectedPlan(planId);
    
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    if (paddle) {
      proceedToPayment(planId);
    } else if (!paddleLoading) {
      // If paddle is not loading but also not available, show error
      alert('Payment system is still initializing. Please try again in a moment.');
    }
    // If paddle is loading, the proceedToPayment will be called once it's ready
  }

  const handleAuthSuccess = async () => {
    console.log('Pricing: handleAuthSuccess called, current user:', user)
    // If user is not yet available, set pending payment and wait for user state
    if (!user) {
      console.warn('Pricing: Auth success called but no user found, will wait for user state')
      setPendingPaymentPlan(selectedPlan)
      setShowAuthModal(false)
      return
    }
    console.log('Pricing: User authenticated successfully:', user.email)
    setShowAuthModal(false)
    if (process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN && selectedPlan) {
      proceedToPayment(selectedPlan)
    }
  }

  const proceedToPayment = useCallback(async (planId: string) => {
    if (isProcessing) return;
    if (isProcessing || processingPlan.current === planId) return;
    
    try {
      setIsProcessing(true);
      processingPlan.current = planId;
      
      // Check if Paddle is ready
      if (!paddle) {
        if (paddleLoading) {
          // If Paddle is still loading, we'll wait for it
          const waitForPaddle = setInterval(() => {
            if (paddle) {
              clearInterval(waitForPaddle);
              proceedToPayment(planId);
            } else if (!paddleLoading) {
              clearInterval(waitForPaddle);
              throw new Error('Payment system failed to initialize');
            }
          }, 100);
          return;
        }
        throw new Error('Payment system not available');
      }

      const plan = pricingPlans.find(p => p.id === planId);
      if (!plan) {
        throw new Error('Plan not found');
      }

      const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0];
      const response = await fetch('/api/paddle/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: plan.paddleProduct.priceId,
          email: user?.email,
          name: userName,
          customData: JSON.stringify({
            user_id: user?.id,
            email: user?.email,
            planId: planId,
            planName: plan.name,
            source: 'pricing-page'
          })
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { checkoutId } = await response.json();
      
      const checkoutSettings = {
        settings: {
          displayMode: 'overlay',
          theme: 'dark',
          locale: 'en',
          successUrl: `${window.location.origin}/success?plan=${planId}`,
        },
        items: [{ priceId: plan.paddleProduct.priceId, quantity: 1 }],
        customer: {
          email: user?.email
        },
        customData: {
          user_id: user?.id,
          email: user?.email,
          planId: planId,
          source: 'pricing-page'
        }
      };
      
      // Use type assertion with a more specific type
      type PaddleCheckout = {
        Checkout: {
          open: (options: typeof checkoutSettings) => void;
        };
      };
      await (paddle as unknown as PaddleCheckout).Checkout.open(checkoutSettings);
      
    } catch (error) {
      console.error('Payment error:', error);
      alert(error instanceof Error ? error.message : 'Sorry, there was an error processing your payment. Please try again.');
    } finally {
      setIsProcessing(false);
      processingPlan.current = null;
    }
  }, [user, paddle, paddleLoading])

  // Watch for user becoming available after signup, then trigger payment if needed
  useEffect(() => {
    if (user && pendingPaymentPlan && !isProcessing) {
      proceedToPayment(pendingPaymentPlan);
      setPendingPaymentPlan(null);
    }
  }, [user, pendingPaymentPlan, proceedToPayment, isProcessing])
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0F13] via-[#0F1417] to-[#0D1116] text-[#E6EEF3]">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#00D1FF]/20 to-[#0099CC]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-[#00B8E6]/15 to-[#00D1FF]/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-6 relative z-10"
      >
        <motion.div 
          className="flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-[#00D1FF] to-[#0099CC] rounded-lg flex items-center justify-center">
            <SparklesIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-white/90">Seem</span>
        </motion.div>

        <motion.button
          onClick={() => window.location.href = '/demo'}
          className="text-white/60 hover:text-white transition-colors"
          whileHover={{ scale: 1.05 }}
        >
          ← Back to Demo
        </motion.button>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 md:px-16 lg:px-24 py-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div 
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#00D1FF]/20 to-[#00B8E6]/20 backdrop-blur-xl border border-[#00D1FF]/30 rounded-full px-4 py-2 mb-6"
          >
            <SparklesIcon className="w-4 h-4 text-[#00D1FF]" />
            <span className="text-[#00D1FF] font-medium text-sm">Pre-order now, launching soon</span>
          </motion.div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            🔥 Founding Member Pricing - Lock in Forever!
          </h1>
          
          <p className="text-lg text-white/60 mb-6">
            ⏰ Limited to 500 Early Adopters Only
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-3 gap-8 mb-16"
        >
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className={`
                relative p-8 rounded-3xl backdrop-blur-xl border shadow-2xl transition-all duration-300 hover:scale-105
                ${plan.popular 
                  ? 'bg-gradient-to-br from-[#00D1FF]/20 to-[#00B8E6]/20 border-[#00D1FF]/50 shadow-[0_0_30px_rgba(0,209,255,0.3)]' 
                  : 'bg-white/5 border-white/20 hover:border-white/40'
                }
              `}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-[#00B8E6] to-[#0099CC] text-white px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-1 shadow-lg">
                    <StarIcon className="w-4 h-4" />
                    <span>{plan.badge}</span>
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center space-x-1 mb-2">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  <span className="text-white/60">{plan.period}</span>
                </div>
                <p className="text-sm text-[#00D1FF]">({plan.description})</p>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center space-x-3">
                    <CheckIcon className="w-4 h-4 text-[#00D1FF] flex-shrink-0" />
                    <span className="text-white/80 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <motion.button
                key={plan.id}
                onClick={() => handlePreOrder(plan.id)}
                disabled={isProcessing || paddleLoading}
                className={`w-full py-3 px-5 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                  plan.popular 
                    ? 'bg-gradient-to-r from-[#00D1FF] to-[#00B8E6] text-white shadow-lg shadow-[#00D1FF]/20 hover:shadow-xl hover:shadow-[#00D1FF]/30 transform hover:-translate-y-0.5' 
                    : 'bg-white/5 border border-white/10 hover:bg-white/10 text-white/90 hover:text-white hover:border-white/20'
                } ${(isProcessing && processingPlan.current === plan.id) || paddleLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                whileHover={{ scale: isProcessing || paddleLoading ? 1 : 1.02 }}
                whileTap={{ scale: isProcessing || paddleLoading ? 1 : 0.98 }}
              >
                {(isProcessing && processingPlan.current === plan.id) || paddleLoading ? (
                  <>
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : plan.popular ? (
                  'Get Started'
                ) : (
                  'Choose Plan'
                )}
              </motion.button>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust Indicators Removed as per request */}

        {/* Auth Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
          defaultMode="signup"
        />
      </main>
    </div>
  )
}
