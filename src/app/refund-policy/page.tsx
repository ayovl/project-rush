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
              <h2 className="text-2xl font-semibund text-white mb-4">3. Refund Eligibility</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Eligible for Refund:</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Technical issues that prevent service usage for extended periods</li>
                    <li>Billing errors or unauthorized charges</li>
                    <li>Service not delivered as described</li>
                    <li>Duplicate charges for the same service period</li>
                    <li>Requests made within the 14-day money-back guarantee period</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Not Eligible for Refund:</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Change of mind after the 14-day guarantee period</li>
                    <li>Failure to use the service during the billing period</li>
                    <li>Violation of Terms of Service resulting in account suspension</li>
                    <li>Credits that have been used or partially used</li>
                    <li>Requests made more than 30 days after the charge</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Credit and Usage Policy</h2>
              
              <div className="space-y-4">
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Unused Credits:</strong> Credits do not expire during your active subscription but are forfeited upon cancellation</li>
                  <li><strong>Partial Usage:</strong> If you&apos;ve used some of your monthly credits, refunds may be prorated based on usage</li>
                  <li><strong>Credit Transfers:</strong> Credits cannot be transferred between accounts or converted to cash</li>
                  <li><strong>Founding Member Benefits:</strong> Special pricing and benefits are tied to continuous subscription and may be lost upon cancellation and re-subscription</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. How to Request a Refund</h2>
              
              <div className="space-y-4">
                <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                  <h3 className="text-xl font-semibold text-white mb-2">Step-by-Step Process:</h3>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Contact our support team at <span className="text-[#00D1FF]">support@seem.ai</span></li>
                    <li>Include your account email and transaction details</li>
                    <li>Provide a clear reason for the refund request</li>
                    <li>Allow up to 5 business days for review and response</li>
                    <li>If approved, refunds will be processed within 7-10 business days</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Required Information:</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Account email address</li>
                    <li>Transaction ID or payment confirmation</li>
                    <li>Date of purchase</li>
                    <li>Detailed reason for refund request</li>
                    <li>Screenshots of any technical issues (if applicable)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Refund Processing</h2>
              
              <div className="space-y-4">
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Processing Time:</strong> Approved refunds are processed within 7-10 business days</li>
                  <li><strong>Payment Method:</strong> Refunds are issued to the original payment method used for purchase</li>
                  <li><strong>Bank Processing:</strong> Additional 2-5 business days may be required for bank processing</li>
                  <li><strong>Currency:</strong> Refunds are issued in the original currency of purchase</li>
                  <li><strong>Fees:</strong> Payment processing fees may be non-refundable in some cases</li>
                </ul>
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
              <h2 className="text-2xl font-semibold text-white mb-4">8. Exceptional Circumstances</h2>
              
              <div className="space-y-4">
                <p>
                  We may consider refunds outside of this policy in exceptional circumstances, including:
                </p>
                
                <ul className="list-disc pl-6 space-y-2">
                  <li>Extended service outages affecting multiple users</li>
                  <li>Significant changes to service features that affect functionality</li>
                  <li>Documented technical issues specific to your account</li>
                  <li>Compliance with local consumer protection laws</li>
                </ul>

                <p>
                  Each case will be reviewed individually at our discretion.
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