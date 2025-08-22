'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  UserCircleIcon, 
  CogIcon, 
  CreditCardIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/hooks/useAuth'
import { PlanService } from '@/services/planService'
import AuthModal from './AuthModal'

export default function ProfileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { user, signOut, loading, plan, credits } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    setIsOpen(false)
  }

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    // The onAuthStateChange listener in useAuth will handle refreshing the data
  }

  // If user is not logged in, show login button
  if (!user && !loading) {
    return (
      <>
        <motion.button
          onClick={() => setShowAuthModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-[#00D1FF] to-[#00B8E6] text-white font-medium rounded-lg hover:from-[#00B8E6] hover:to-[#0099CC] focus:outline-none focus:ring-2 focus:ring-[#00D1FF]/50 transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Sign In
        </motion.button>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
          defaultMode="login"
        />
      </>
    )
  }

  // If loading, show loading state
  if (loading) {
    return (
      <div className="flex items-center space-x-3 p-3 backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl opacity-50">
        <div className="w-8 h-8 bg-gradient-to-br from-[#00B8E6] to-[#0088B3] rounded-lg animate-pulse"></div>
        <div className="hidden sm:block text-left">
          <div className="w-20 h-4 bg-white/20 rounded animate-pulse mb-1"></div>
          <div className="w-16 h-3 bg-white/20 rounded animate-pulse"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-3 backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl hover:border-[#00D1FF]/70 transition-colors group shadow-lg"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Avatar */}
        <div className="w-8 h-8 bg-gradient-to-br from-[#00B8E6] to-[#0088B3] rounded-lg flex items-center justify-center">
          <UserCircleIcon className="w-6 h-6 text-white" />
        </div>
        
        {/* User info */}
        <div className="hidden sm:block text-left">
          <div className="text-sm font-medium text-white/90">
            {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
          </div>
          <div className="flex items-center space-x-2" title="Your credits will be available upon launch.">
            <SparklesIcon className="w-3 h-3 text-[#00D1FF]" />
            <span className="text-xs text-white/60">{credits} credits</span>
          </div>
        </div>
        
        {/* Dropdown arrow */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-white/60 group-hover:text-[#00D1FF] transition-colors"
        >
          <ChevronDownIcon className="w-4 h-4" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-20"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full right-0 mt-2 w-64 backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl shadow-2xl z-30 overflow-hidden"
            >
              {/* User Info Header */}
              <div className="p-4 border-b border-white/20">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#00B8E6] to-[#0088B3] rounded-lg flex items-center justify-center backdrop-blur-xl border border-white/20">
                    <UserCircleIcon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white/90">
                      {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                    </div>
                    <div className="text-xs text-white/60">{user?.email}</div>
                  </div>
                </div>
                
                {/* Credits Display */}
                <div className="mt-3 p-3 backdrop-blur-xl bg-white/10 rounded-lg border border-white/20" title="Your credits will be available upon launch.">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <SparklesIcon className="w-4 h-4 text-[#00D1FF]" />
                      <span className="text-sm font-medium text-white/90">Credits</span>
                    </div>
                    <span className="text-lg font-bold text-[#00D1FF]">{credits}</span>
                  </div>
                  {plan && plan !== 'none' && (
                    <div className="mt-1 text-xs text-white/60">
                      {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan • Active
                    </div>
                  )}
                  <div className="mt-2 w-full bg-white/20 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-[#00D1FF] to-[#0099CC] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((credits / 200) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <MenuItemButton
                  icon={<UserCircleIcon className="w-5 h-5" />}
                  label="My Plan"
                  onClick={() => {
                    window.location.href = '/account';
                    setIsOpen(false);
                  }}
                />
                <MenuItemButton
                  icon={<CreditCardIcon className="w-5 h-5" />}
                  label="Buy Credits"
                  onClick={() => {
                    window.location.href = '/pricing';
                    setIsOpen(false);
                  }}
                  disabled // Disabled for now as it's a pre-order
                />
                
                <MenuItemButton
                  icon={<CogIcon className="w-5 h-5" />}
                  label="Settings"
                  onClick={() => {}}
                  disabled
                />
                
                <div className="border-t border-white/20 my-2" />
                
                <MenuItemButton
                  icon={<ArrowRightOnRectangleIcon className="w-5 h-5" />}
                  label="Sign Out"
                  onClick={handleSignOut}
                  variant="danger"
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

interface MenuItemButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
}

function MenuItemButton({ icon, label, onClick, variant = 'default', disabled = false }: MenuItemButtonProps) {
  return (
    <motion.button
      onClick={disabled ? () => {} : onClick}
      className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors ${
        disabled
          ? 'text-white/30 cursor-not-allowed'
          : variant === 'danger'
          ? 'text-red-400 hover:text-red-300 hover:bg-white/10'
          : 'text-white/80 hover:text-[#00D1FF] hover:bg-white/10'
      }`}
      whileHover={disabled ? {} : { x: 4 }}
      disabled={disabled}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </motion.button>
  )
}
