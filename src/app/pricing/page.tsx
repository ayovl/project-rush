'use client'

import { motion } from 'framer-motion'
import { 
  SparklesIcon,
  CheckIcon,
  StarIcon
} from '@heroicons/react/24/outline'

const pricingPlans = [
  {
    id: 'basic',
    name: 'BASIC',
    price: '$4',
    period: '/month',
    badge: 'Most Popular',
    description: 'Founding Member Price',
    features: [
      '25 generations/month',
      'All style templates', 
      'HD quality exports',
      'Email support'
    ],
    popular: true
  },
  {
    id: 'pro',
    name: 'PRO', 
    price: '$9',
    period: '/month',
    badge: '',
    description: 'Founding Member Price',
    features: [
      '60 generations/month',
      'Priority processing',
      'Advanced style options',
      'Custom aspect ratios'
    ],
    popular: false
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
    popular: false
  }
]

export default function PricingPage() {
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
          <span className="text-xl font-semibold text-white/90">DePIX</span>
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
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.div 
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#00D1FF]/20 to-[#00B8E6]/20 backdrop-blur-xl border border-[#00D1FF]/30 rounded-full px-6 py-3 mb-6"
          >
            <SparklesIcon className="w-5 h-5 text-[#00D1FF]" />
            <span className="text-[#00D1FF] font-medium">Launching very soon – Reserve your spot!</span>
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            🔥 Founding Member Pricing - Lock in Forever!
          </h1>
          
          <p className="text-xl text-white/60 mb-6">
            ⏰ Limited to 500 Early Adopters Only
          </p>
          
          <div className="flex items-center justify-center space-x-4 text-lg">
            <span className="text-white/80">👥 347/500 spots remaining</span>
            <span className="text-white/60">•</span>
            <span className="text-[#00D1FF]">💡 Pre-order now, access when we launch (very soon)</span>
          </div>
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
                  <div className="bg-gradient-to-r from-[#00D1FF] to-[#00B8E6] text-white px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-1">
                    <StarIcon className="w-4 h-4" />
                    <span>{plan.badge}</span>
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center space-x-1 mb-2">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-white/60">{plan.period}</span>
                </div>
                <p className="text-[#00D1FF] font-medium">({plan.description})</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center space-x-3">
                    <CheckIcon className="w-5 h-5 text-[#00D1FF] flex-shrink-0" />
                    <span className="text-white/80">{feature}</span>
                  </li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  w-full py-4 rounded-xl font-semibold transition-all duration-300
                  ${plan.popular
                    ? 'bg-gradient-to-r from-[#00D1FF] to-[#00B8E6] text-white shadow-lg hover:shadow-[0_0_25px_rgba(0,209,255,0.4)]'
                    : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                  }
                `}
              >
                Pre-order - Lock in this price
              </motion.button>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-4 gap-6 text-center"
        >
          {[
            '✅ 30-day money-back guarantee',
            '✅ Cancel anytime', 
            '✅ Secure payment via Paddle',
            '✅ Launching very soon'
          ].map((item, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-4">
              <span className="text-white/80 text-sm">{item}</span>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  )
}
