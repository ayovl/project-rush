'use client'

import { Suspense } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { 
  CheckCircleIcon,
  SparklesIcon,
  EnvelopeIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'

function SuccessContent() {
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan') || 'basic'
  const { user } = useAuth()

  const planDetails = {
    basic: { name: 'Basic', price: '$4/month' },
    pro: { name: 'Pro', price: '$9/month' },
    ultimate: { name: 'Ultimate', price: '$29/month' }
  }

  const selectedPlan = planDetails[plan as keyof typeof planDetails] || planDetails.basic

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
          onClick={() => window.location.href = '/'}
          className="text-white/60 hover:text-white transition-colors"
          whileHover={{ scale: 1.05 }}
        >
          ← Back to Demo
        </motion.button>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <div className="text-center">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full mb-8"
          >
            <CheckCircleIcon className="w-12 h-12 text-white" />
          </motion.div>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Your pre-order for the <span className="text-[#00D1FF] font-semibold">{selectedPlan.name} plan</span> has been confirmed!
            </h1>
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#00D1FF]/20 to-[#00B8E6]/20 backdrop-blur-xl border border-[#00D1FF]/30 rounded-full px-6 py-3">
              <SparklesIcon className="w-5 h-5 text-[#00D1FF]" />
              <span className="text-[#00D1FF] font-medium">Founding Member Rate: {selectedPlan.price} - Locked in forever!</span>
            </div>
          </motion.div>

          {/* What Happens Next */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">What happens next?</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#00D1FF]/20 to-[#00B8E6]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <EnvelopeIcon className="w-8 h-8 text-[#00D1FF]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">1. Confirmation Email</h3>
                <p className="text-white/60 text-sm">Check your inbox for a confirmation email with your order details.</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#00D1FF]/20 to-[#00B8E6]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarIcon className="w-8 h-8 text-[#00D1FF]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">2. Launch Notification</h3>
                <p className="text-white/60 text-sm">We&apos;ll email you as soon as Seem is live and ready to use.</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#00D1FF]/20 to-[#00B8E6]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SparklesIcon className="w-8 h-8 text-[#00D1FF]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">3. Start Creating</h3>
                <p className="text-white/60 text-sm">Begin generating amazing images with your founding member benefits!</p>
              </div>
            </div>
          </motion.div>

          {/* Account Info */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-[#00D1FF]/10 to-[#00B8E6]/10 backdrop-blur-xl border border-[#00D1FF]/30 rounded-2xl p-6 mb-8"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Your Account Details</h3>
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div>
                <span className="text-white/60">Plan:</span>
                <span className="text-white font-semibold ml-2">{selectedPlan.name}</span>
              </div>
              <div>
                <span className="text-white/60">Price:</span>
                <span className="text-white font-semibold ml-2">{selectedPlan.price}</span>
              </div>
              <div>
                <span className="text-white/60">Email:</span>
                <span className="text-white font-semibold ml-2">{user?.email || '...'}</span>
              </div>
              <div>
                <span className="text-white/60">Status:</span>
                <span className="text-green-400 font-semibold ml-2">Pre-order Confirmed</span>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              onClick={() => window.location.href = '/'}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-[#00D1FF] to-[#00B8E6] text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-[0_0_25px_rgba(0,209,255,0.4)] transition-all duration-300"
            >
              Explore the Demo
            </motion.button>
            
          </motion.div>

          {/* Footer Note */}
        </div>
      </main>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#0B0F13] via-[#0F1417] to-[#0D1116] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
