'use client'

import { useEffect, useState, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { PlanService } from '@/services/planService'
import { useRouter } from 'next/navigation'
import {
  SparklesIcon,
  CreditCardIcon,
  CalendarDaysIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

function AccountContent() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [credits, setCredits] = useState<number | null>(null)
  const [plan, setPlan] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/demo')
      return
    }

    const fetchUserData = async () => {
      if (user) {
        const result = await PlanService.getUserCredits()
        if (result.success) {
          setCredits(result.credits || 0)
          setPlan(result.plan === 'none' ? 'No active plan' : result.plan || 'No active plan')
        } else {
          setPlan('No active plan')
          setCredits(0)
        }
      }
    }

    fetchUserData()
  }, [user, loading, router])

  if (loading || !user || credits === null) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading account details...
      </div>
    )
  }

  const planName = plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : 'None';

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
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#00D1FF] to-[#0099CC] rounded-lg flex items-center justify-center">
            <SparklesIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-white/90">DePIX</span>
        </div>
        <motion.button
          onClick={() => router.push('/demo')}
          className="text-white/60 hover:text-white transition-colors"
          whileHover={{ scale: 1.05 }}
        >
          ← Back to Demo
        </motion.button>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            My Plan & Credits
          </h1>
          <p className="text-xl text-white/60 mb-12">
            Here are your account details for your pre-order.
          </p>
        </motion.div>

        {/* Plan & Credits Info */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 gap-8"
        >
          <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
            <div className="flex items-center space-x-3 mb-4">
              <CreditCardIcon className="w-8 h-8 text-[#00D1FF]" />
              <h2 className="text-2xl font-bold text-white">Your Plan</h2>
            </div>
            <p className="text-5xl font-bold text-white mb-2">{planName}</p>
            <p className="text-white/60">This is a pre-order founding member plan. Your special rate is locked in forever!</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
            <div className="flex items-center space-x-3 mb-4">
              <SparklesIcon className="w-8 h-8 text-[#00D1FF]" />
              <h2 className="text-2xl font-bold text-white">Your Credits</h2>
            </div>
            <p className="text-5xl font-bold text-white mb-2">{credits}</p>
            <p className="text-white/60">1 credit = 1 image generation. Your credits will become available upon launch.</p>
          </div>
        </motion.div>

        {/* Launch Info */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-gradient-to-r from-[#00D1FF]/10 to-[#00B8E6]/10 backdrop-blur-xl border border-[#00D1FF]/30 rounded-2xl p-8"
        >
          <div className="flex items-center space-x-4">
            <CalendarDaysIcon className="w-10 h-10 text-[#00D1FF]" />
            <div>
              <h3 className="text-xl font-semibold text-white">Estimated Launch Date</h3>
              <p className="text-2xl font-bold text-white mt-1">Q4 2025</p>
              <p className="text-white/60 text-sm mt-1">We're working hard to get DePIX ready for you. We'll send you an email as soon as we go live!</p>
            </div>
          </div>
        </motion.div>

        {/* Note */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex items-center space-x-3 bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-4"
        >
          <InformationCircleIcon className="w-6 h-6 text-white/60 flex-shrink-0" />
          <p className="text-white/60 text-sm">
            This page will serve as your account dashboard upon launch. For any questions, please contact <a href="mailto:support@depix.ai" className="text-[#00D1FF] hover:underline">support@depix.ai</a>.
          </p>
        </motion.div>
      </main>
    </div>
  )
}

export default function AccountPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#0B0F13] via-[#0F1417] to-[#0D1116] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <AccountContent />
    </Suspense>
  )
}
