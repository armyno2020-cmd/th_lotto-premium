import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '../lib/supabase'

interface User {
  id: string
  phone: string
  pin: string
  name: string
  role: string
  status: string
  balance: number
  referrer_id: string | null
  referral_code: string | null
  created_at: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  isAdmin: boolean
  login: (phone: string, pin: string) => Promise<{ success: boolean; error?: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

interface RegisterData {
  phone: string
  pin: string
  name: string
  bankName?: string
  accountName?: string
  accountNumber?: string
  referralCode?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (!error && data) {
      setUser(data)
      localStorage.setItem('th_lotto_user', JSON.stringify(data))
      return data
    }
    return null
  }

  const refreshUser = async () => {
    const stored = localStorage.getItem('th_lotto_user')
    if (stored) {
      const userData = JSON.parse(stored)
      await fetchUser(userData.id)
    }
  }

  useEffect(() => {
    const stored = localStorage.getItem('th_lotto_user')
    if (stored) {
      const userData = JSON.parse(stored)
      setUser(userData)
    }
    setLoading(false)
  }, [])

  const login = async (phone: string, pin: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .single()

      if (profileError || !profile) {
        return { success: false, error: 'ไม่พบผู้ใช้งานนี้' }
      }

      if (profile.pin !== pin) {
        return { success: false, error: 'รหัส PIN ไม่ถูกต้อง' }
      }

      if (profile.status !== 'active') {
        return { success: false, error: 'บัญชีถูกระงับการใช้งาน' }
      }

      setUser(profile)
      localStorage.setItem('th_lotto_user', JSON.stringify(profile))
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('phone', data.phone)
        .single()

      if (existing) {
        return { success: false, error: 'หมายเลขโทรศัพท์นี้ถูกใช้งานแล้ว' }
      }

      let referrerId: string | null = null
      if (data.referralCode) {
        const { data: referrer } = await supabase
          .from('users')
          .select('id')
          .eq('referral_code', data.referralCode)
          .single()
        referrerId = referrer?.id || null
      }

      const referralCode = 'TH' + Math.random().toString(36).substring(2, 8).toUpperCase()

      const { error: insertError } = await supabase
        .from('users')
        .insert({
          phone: data.phone,
          name: data.name,
          pin: data.pin,
          balance: 0,
          referrer_id: referrerId,
          referral_code: referralCode,
          role: 'user',
          status: 'active'
        })

      if (insertError) {
        return { success: false, error: insertError.message }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    localStorage.removeItem('th_lotto_user')
    setUser(null)
  }

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAdmin,
      login,
      register,
      logout,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
