'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0F13] via-[#0F1417] to-[#0D1116] text-[#E6EEF3]">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#00D1FF]/20 to-[#0099CC]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-[#00B8E6]/15 to-[#00D1FF]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Refund Policy</h1>
          <p className="text-white/60">Last updated: {new Date().toLocaleDateString()}</p>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="prose prose-invert max-w-none"
        >
          <div className="space-y-8 text-white/80 leading-relaxed">
            
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. No Refunds Policy</h2>
              <p>
                At Seem, all sales are final. We do not offer refunds, returns, or exchanges for any digital services or subscriptions once payment has been processed.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Subscription Refunds</h2>
              
              <div className="space-y-4">
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <h3 className="text-xl font-semibold text-white mb-2">All Sales Final</h3>
                  <p className="mb-2">
                    All purchases are final and non-refundable. By completing your purchase, you acknowledge and accept this no refunds policy.
                  </p>
                  <p className="text-sm text-white/60">
                    This applies to all subscription plans and one-time purchases. Please review our service carefully before purchasing.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Recurring Subscriptions</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Monthly and annual subscriptions are billed in advance</li>
                    <li>Refunds for recurring periods are generally not provided except in exceptional circumstances</li>
                    <li>You can cancel your subscription at any time to prevent future charges</li>
                    <li>Upon cancellation, you retain access to paid features until the end of your current billing period</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. No Refunds Policy Details</h2>
              
              <div className="space-y-4">
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <h3 className="text-xl font-semibold text-white mb-2">Strict No Refunds Policy</h3>
                  <p className="mb-2">
                    All purchases of Seem services, subscriptions, and credits are final and non-refundable. This applies to:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Monthly and annual subscription plans</li>
                    <li>One-time credit purchases</li>
                    <li>Upgrade fees and plan changes</li>
                    <li>All digital services and generated content</li>
                  </ul>
                </div>

                <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                  <h3 className="text-xl font-semibold text-white mb-2">Why No Refunds?</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Digital services are delivered immediately upon purchase</li>
                    <li>AI generation credits are consumed upon use and cannot be returned</li>
                    <li>Our service provides immediate value through AI-generated content</li>
                    <li>This policy allows us to maintain competitive pricing</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Credit and Usage Policy</h2>
              
              <div className="space-y-4">
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Unused Credits:</strong> Credits do not expire during your active subscription but are forfeited upon cancellation with no refund</li>
                  <li><strong>Used Credits:</strong> Once credits are used to generate content, they cannot be refunded under any circumstances</li>
                  <li><strong>Credit Transfers:</strong> Credits cannot be transferred between accounts or converted to cash</li>
                  <li><strong>Subscription Benefits:</strong> All benefits are tied to active subscription and are lost upon cancellation without refund</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Billing Issues and Support</h2>
              
              <div className="space-y-4">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <h3 className="text-xl font-semibold text-white mb-2">Billing Errors Only:</h3>
                  <p className="mb-2">
                    While we do not provide refunds, we will investigate and correct legitimate billing errors such as:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Duplicate charges for the same service</li>
                    <li>Unauthorized charges</li>
                    <li>Incorrect billing amounts due to system errors</li>
                    <li>Charges after successful cancellation</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Contact Support:</h3>
                  <p>For billing errors only, contact us with:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Your account email address</li>
                    <li>Transaction ID or payment confirmation</li>
                    <li>Date of the billing error</li>
                    <li>Clear description of the error</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Subscription Management</h2>
              
              <div className="space-y-4">
                <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                  <h3 className="text-xl font-semibold text-white mb-2">Cancellation Process:</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>How to Cancel:</strong> You can cancel your subscription anytime through your account settings</li>
                    <li><strong>Access After Cancellation:</strong> You retain access until the end of your current billing period</li>
                    <li><strong>No Partial Refunds:</strong> Cancellation does not result in refunds for the current billing period</li>
                    <li><strong>Credit Forfeiture:</strong> Any unused credits are forfeited upon cancellation</li>
                    <li><strong>Reactivation:</strong> You can reactivate your subscription at any time</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Chargebacks and Disputes</h2>
              
              <div className="space-y-4">
                <p className="mb-4">
                  Before filing a chargeback or dispute with your bank or credit card company, please contact us directly. We&apos;re committed to resolving issues quickly and fairly.
                </p>
                
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                  <p className="text-orange-200 font-medium">
                    <strong>Important:</strong> Chargebacks without prior contact may result in immediate account suspension and loss of access to the service and any remaining credits.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Service Issues</h2>
              
              <div className="space-y-4">
                <p>
                  While we maintain a strict no-refunds policy, we are committed to providing excellent service. For service issues, we may provide:
                </p>
                
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Service Credits:</strong> Additional credits for extended service outages</li>
                  <li><strong>Technical Support:</strong> Dedicated assistance for technical issues</li>
                  <li><strong>Account Resolution:</strong> Direct support for account-specific problems</li>
                  <li><strong>Feature Access:</strong> Temporary access extensions during major service disruptions</li>
                </ul>

                <p>
                  <strong>Important:</strong> Service credits and support are provided at our discretion and do not constitute refunds. All solutions remain within our no-refunds policy framework.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Cancellation vs. Refund</h2>
              
              <div className="space-y-4">
                <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                  <h3 className="text-xl font-semibold text-white mb-2">Cancellation:</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Stops future billing immediately</li>
                    <li>Maintains access until end of current billing period</li>
                    <li>Can be done instantly through account settings</li>
                    <li>No refund for current period</li>
                  </ul>
                </div>

                <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                  <h3 className="text-xl font-semibold text-white mb-2">Refund:</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Returns money for current or recent billing period</li>
                    <li>Requires review and approval process</li>
                    <li>May result in immediate loss of access</li>
                    <li>Subject to eligibility criteria</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. Contact Information</h2>
              <p>
                For refund requests or questions about this policy, please contact us:
              </p>
              <div className="bg-white/5 border border-white/20 rounded-lg p-4 mt-4">
                <p className="font-medium">Email: support@seemai.app</p>
                <p>Subject Line: &quot;Refund Request - [Your Account Email]&quot;</p>
                <p>Response Time: Within 24-48 hours</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">11. Policy Changes</h2>
              <p>
                We reserve the right to modify this Refund Policy at any time. Changes will be posted on this page with an updated &quot;Last modified&quot; date. Continued use of our service after changes constitutes acceptance of the updated policy.
              </p>
            </section>

          </div>
        </motion.div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-[#00D1FF] hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Seem</span>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}