'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/hooks/useAuth'

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultMode?: 'login' | 'signup';
  onSwitchToSignup?: () => void;
  onGoogleSignIn?: () => void; // Optional custom Google Sign-In handler
}

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  defaultMode = 'login',
  onSwitchToSignup,
  onGoogleSignIn
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isEmailFormVisible, setIsEmailFormVisible] = useState(true)

  const { signIn, signUp, signInWithGoogle, signInWithApple, signInWithMicrosoft } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    console.log('AuthModal: Submitting form', { mode, email })

    let result
    if (mode === 'signup') {
      result = await signUp(email, password, name)
    } else {
      result = await signIn(email, password)
    }

    console.log('AuthModal: Auth result', result)

    if (result.error) {
      console.error('AuthModal: Setting error', result.error)
      
      // Check if this is an email confirmation message (not really an error)
      if (result.error.includes('check your email') || result.error.includes('confirmation link')) {
        setError(result.error)
        setLoading(false)
        // Don't close modal for email confirmation - user might want to try signing in instead
      } else {
        setError(result.error)
        setLoading(false)
      }
    } else {
      console.log('AuthModal: Auth successful, calling onSuccess')
      onSuccess()
      onClose()
      resetForm()
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    // If a custom handler is provided (e.g., from the pricing page), use it.
    if (onGoogleSignIn) {
      onGoogleSignIn();
      return;
    }

    // Default behavior for standard sign-in/sign-up
    setLoading(true)
    setError('')

    const result = await signInWithGoogle()
    
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      // Google sign-in will redirect, so we don't need to call onSuccess here
      onClose()
      resetForm()
    }
  }

  const handleAppleSignIn = async () => {
    setLoading(true)
    setError('')
    const result = await signInWithApple()
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      onClose()
      resetForm()
    }
  }

  const handleMicrosoftSignIn = async () => {
    setLoading(true)
    setError('')
    const result = await signInWithMicrosoft()
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      onClose()
      resetForm()
    }
  }

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setName('')
    setError('')
    setLoading(false)
  }

  const handleClose = () => {
    onClose()
    resetForm()
  }

  if (typeof document === 'undefined') {
    return null
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl max-h-[90vh] sm:max-h-none overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="text-xl font-semibold text-white">
                  {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <button
                  onClick={handleClose}
                  className="p-2 text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <div className="p-6">
                {error && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-3">
                  {/* Google Sign-In Button */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full px-4 py-2 bg-white hover:bg-gray-50 text-gray-900 font-medium rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00D1FF]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gradient-to-br from-gray-900 to-gray-800 text-white/60">
                      or
                    </span>
                  </div>
                </div>

                <AnimatePresence>
                {isEmailFormVisible && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <form onSubmit={handleSubmit}>
                      <div className="space-y-4 pt-4">
                        {mode === 'signup' && (
                          <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                              Full Name
                            </label>
                            <input
                              type="text"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              required
                              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#00D1FF]/50 focus:border-[#00D1FF]/50"
                              placeholder="Enter your full name"
                            />
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#00D1FF]/50 focus:border-[#00D1FF]/50"
                            placeholder="Enter your email"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                              minLength={6}
                              className="w-full px-3 py-2 pr-10 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#00D1FF]/50 focus:border-[#00D1FF]/50"
                              placeholder="Enter your password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                            >
                              {showPassword ? (
                                <EyeSlashIcon className="w-4 h-4" />
                              ) : (
                                <EyeIcon className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-6 px-4 py-2 bg-gradient-to-r from-[#00D1FF] to-[#00B8E6] text-white font-semibold rounded-lg hover:from-[#00B8E6] hover:to-[#0099CC] focus:outline-none focus:ring-2 focus:ring-[#00D1FF]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {loading ? 'Please wait...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
                      </button>
                    </form>
                  </motion.div>
                )}
                </AnimatePresence>

                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      if (mode === 'login') {
                        if (onSwitchToSignup) {
                          onSwitchToSignup();
                        } else {
                          setMode('signup');
                        }
                      } else {
                        setMode('login');
                      }
                    }}
                    className="text-sm text-white/60 hover:text-[#00D1FF] transition-colors"
                  >
                    {mode === 'login' 
                      ? "Don't have an account? Sign up" 
                      : "Already have an account? Sign in"
                    }
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
