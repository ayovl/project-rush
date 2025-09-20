'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function TermsOfService() {
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
          <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
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
            
            {/* <section>
              <div className="bg-white/5 border border-white/20 rounded-lg p-6 mb-8">
                <p className="text-white/90 font-medium">
                  These Terms of Service constitute a legal agreement between Muhammd Arsalan, sole proprietor doing business as Seem (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), and you (&quot;the user&quot;).
                </p>
              </div>
            </section> */}
            
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using Seem (&quot;the Service&quot;), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
              <p>
                Seem is an AI-powered image generation platform that allows users to create realistic images of themselves in various outfits, styles, and settings using artificial intelligence technology.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. User Accounts and Registration</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>You must provide accurate and complete registration information</li>
                <li>You are responsible for maintaining the security of your account</li>
                <li>You must notify us immediately of any unauthorized use of your account</li>
                <li>One person or legal entity may not maintain more than one account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Acceptable Use Policy</h2>
              <p className="mb-4">You agree not to use the Service to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Generate content that is illegal, harmful, threatening, abusive, or defamatory</li>
                <li>Create deepfakes or misleading content intended to deceive others</li>
                <li>Generate images of minors or content involving minors</li>
                <li>Create non-consensual intimate images of any person</li>
                <li>Infringe upon intellectual property rights of others</li>
                <li>Upload images that you do not have rights to use</li>
                <li>Attempt to reverse engineer or circumvent our technology</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Content and Intellectual Property</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Your Content</h3>
                  <p>You retain ownership of the images you upload. By using our Service, you grant us a limited license to process these images for the purpose of providing our AI generation services.</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Generated Content</h3>
                  <p>You own the AI-generated images created using our Service, subject to these Terms. However, you acknowledge that similar images might be generated for other users using similar inputs.</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Our Technology</h3>
                  <p>The underlying AI models, algorithms, and technology remain our exclusive intellectual property.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Privacy and Data Protection</h2>
              <p>
                Your privacy is important to us. Our collection and use of your personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Payment and Subscription Terms</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Subscription fees are billed in advance on a recurring basis</li>
                <li>All fees are non-refundable except as required by law or as specified in our Refund Policy</li>
                <li>We reserve the right to change our pricing with 30 days notice</li>
                <li>You can cancel your subscription at any time through your account settings</li>
                <li>Credits do not expire during your active subscription period</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Service Availability</h2>
              <p>
                While we strive to maintain high service availability, we do not guarantee uninterrupted access to our Service. We may temporarily suspend access for maintenance, updates, or other operational reasons.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Limitation of Liability</h2>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, SEEM SHALL NOT BE LIABLE for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. Termination</h2>
              <p>
                We may terminate or suspend your account and access to the Service immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">11. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. We will notify users of significant changes via email or through the Service. Continued use of the Service after such modifications constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">12. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with applicable law, without regard to conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">13. Contact Information</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us at:
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
                className="text-[#00D1FF] hover:text-white hover:scale-105 transition-all duration-300 font-medium"
              >
                Terms of Service
              </a>
              <a 
                href="/privacy" 
                className="text-white/70 hover:text-[#00D1FF] hover:scale-105 transition-all duration-300 font-medium"
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