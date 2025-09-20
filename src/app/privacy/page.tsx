'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Privacy() {
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
          <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
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
              <h2 className="text-2xl font-semibold text-white mb-4">1. Information We Collect</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Personal Information</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Email address and name when you create an account</li>
                    <li>Payment information processed through our secure payment providers</li>
                    <li>Profile information you choose to provide</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Images and Content</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Reference images you upload for AI generation</li>
                    <li>Generated images created by our AI models</li>
                    <li>Text prompts and generation parameters</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Technical Information</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Device information, browser type, and operating system</li>
                    <li>IP address and general location information</li>
                    <li>Usage patterns and feature interactions</li>
                    <li>Performance and error logs</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Service Provision</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Process your images through our AI models to generate new images</li>
                    <li>Maintain your account and subscription</li>
                    <li>Provide customer support and respond to your inquiries</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Improvement and Development</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Analyze usage patterns to improve our service</li>
                    <li>Train and enhance our AI models (using anonymized data only)</li>
                    <li>Develop new features and capabilities</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Legal and Safety</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Enforce our Terms of Service and prevent misuse</li>
                    <li>Comply with legal obligations and protect our rights</li>
                    <li>Ensure the safety and security of our platform</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. Data Storage and Security</h2>
              
              <div className="space-y-4">
                <p>
                  We implement industry-standard security measures to protect your personal information and images:
                </p>
                
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Encryption:</strong> All data is encrypted in transit and at rest using AES-256 encryption</li>
                  <li><strong>Access Control:</strong> Strict access controls ensure only authorized personnel can access your data</li>
                  <li><strong>Data Centers:</strong> We use secure, SOC 2 compliant data centers with physical security measures</li>
                  <li><strong>Regular Audits:</strong> We conduct regular security audits and vulnerability assessments</li>
                </ul>

                <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                  <p className="font-medium text-white mb-2">Image Processing Policy:</p>
                  <p>Your uploaded images are processed on secure servers and are automatically deleted from our processing systems within 30 days. Generated images remain in your account until you delete them or cancel your subscription.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Information Sharing</h2>
              
              <p className="mb-4">We do not sell, rent, or share your personal information except in the following circumstances:</p>
              
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Service Providers:</strong> Trusted third parties who help us operate our service (cloud hosting, payment processing, customer support)</li>
                <li><strong>Legal Requirements:</strong> When required by law, legal process, or to protect our rights and safety</li>
                <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets (with user notification)</li>
                <li><strong>With Your Consent:</strong> When you explicitly agree to sharing for specific purposes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Your Privacy Rights</h2>
              
              <div className="space-y-4">
                <p>Depending on your location, you may have the following rights:</p>
                
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal requirements)</li>
                  <li><strong>Portability:</strong> Request a copy of your data in a structured, machine-readable format</li>
                  <li><strong>Opt-out:</strong> Opt out of certain processing activities, including marketing communications</li>
                </ul>

                <p>To exercise these rights, contact us at support@seemai.app</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Cookies and Analytics</h2>
              
              <div className="space-y-4">
                <p>We use cookies and similar technologies to:</p>
                
                <ul className="list-disc pl-6 space-y-1">
                  <li>Maintain your login session and preferences</li>
                  <li>Analyze website usage and performance</li>
                  <li>Provide personalized experiences</li>
                  <li>Ensure security and prevent fraud</li>
                </ul>

                <p>You can control cookie settings through your browser, though some features may not work properly if cookies are disabled.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Data Retention</h2>
              
              <div className="space-y-4">
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Account Information:</strong> Retained while your account is active and for a reasonable period after cancellation</li>
                  <li><strong>Uploaded Images:</strong> Deleted from processing systems within 30 days, stored in your account until deletion</li>
                  <li><strong>Generated Images:</strong> Stored in your account until you delete them or cancel your subscription</li>
                  <li><strong>Usage Analytics:</strong> Anonymized data may be retained indefinitely for service improvement</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Children&apos;s Privacy</h2>
              <p>
                Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. International Data Transfers</h2>
              <p>
                Your information may be processed and stored in countries other than your own. We ensure appropriate safeguards are in place to protect your personal information during such transfers, including using standard contractual clauses approved by relevant data protection authorities.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements. We will notify users of significant changes via email or through our service. The &quot;Last updated&quot; date at the top indicates when the policy was last revised.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">11. Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy or our privacy practices, please contact us:
              </p>
              <div className="bg-white/5 border border-white/20 rounded-lg p-4 mt-4">
                <p className="font-medium">Email: support@seemai.app</p>
              </div>
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

      {/* Footer with Legal Links */}
      <footer className="mt-auto relative z-10 border-t border-white/10 bg-gradient-to-r from-[#0B0F13]/95 to-[#0F1417]/95 backdrop-blur-xl shadow-2xl">
        <div className="container mx-auto px-6 py-6">
          <div className="space-y-4">
            {/* Legal Links - Centered */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-8 text-sm">
              <a 
                href="/terms" 
                className="text-white/70 hover:text-[#00D1FF] hover:scale-105 transition-all duration-300 font-medium"
              >
                Terms of Service
              </a>
              <a 
                href="/privacy" 
                className="text-[#00D1FF] hover:text-white hover:scale-105 transition-all duration-300 font-medium"
              >
                Privacy Policy
              </a>
              <a 
                href="/refund-policy" 
                className="text-white/70 hover:text-[#00D1FF] hover:scale-105 transition-all duration-300 font-medium"
              >
                Refund Policy
              </a>
            </div>
            
            {/* Copyright and Contact - Centered */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm">
              <div className="text-white/60 font-medium">
                © {new Date().getFullYear()} Seem. All rights reserved.
              </div>
              <div className="text-white/60">
                Contact: support@seemai.app
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}