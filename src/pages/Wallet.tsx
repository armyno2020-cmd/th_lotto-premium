import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'

interface Transaction {
  id: number
  type: string
  amount: number
  balance_before: number
  balance_after: number
  note: string | null
  status: string
  created_at: string
}

export default function Wallet() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    if (!user) return
    try {
      const { data } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)
      if (data) setTransactions(data)
    } catch (err) {
      console.error('Error fetching transactions:', err)
    } finally {
      setLoading(false)
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'win':
      case 'bonus':
        return { icon: 'add_circle', color: 'text-green-600 bg-green-50' }
      case 'withdraw':
        return { icon: 'output', color: 'text-red-400 bg-red-50' }
      case 'bet':
        return { icon: 'casino', color: 'text-orange-400 bg-orange-50' }
      default:
        return { icon: 'sync', color: 'text-slate-400 bg-slate-100' }
    }
  }

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'deposit': return 'ฝากเงิน'
      case 'withdraw': return 'ถอนเงิน'
      case 'bet': return 'แทงหวย'
      case 'win': return 'ถูกรางวัล'
      case 'bonus': return 'โบนัส'
      case 'affiliate': return 'รายได้แนะนำ'
      case 'refund': return 'คืนเงิน'
      default: return type
    }
  }

  if (!user) return null

  return (
    <div className="px-4 pt-4 pb-20">
      <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 text-white shadow-lg mb-6">
        <p className="text-green-100 text-sm mb-1">สวัสดีคุณ</p>
        <h2 className="text-xl font-bold mb-4">{user.name || user.phone}</h2>
        <div className="bg-white/10 rounded-xl px-6 py-4 text-center">
          <p className="text-green-100 text-xs font-semibold tracking-wider uppercase mb-2">ยอดเงินคงเหลือ</p>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-2xl">฿</span>
            <h1 className="text-4xl font-extrabold">{(user.balance || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Link
          to="/deposit"
          className="bg-gradient-to-r from-green-600 to-green-700 text-white h-16 rounded-2xl flex items-center justify-center gap-2 font-bold shadow-lg active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined">add_circle</span>
          ฝากเงิน
        </Link>
        <Link
          to="/withdraw"
          className="bg-white dark:bg-slate-800 border-2 border-green-600 text-green-600 h-16 rounded-2xl flex items-center justify-center gap-2 font-bold active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined">payments</span>
          ถอนเงิน
        </Link>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">ประวัติรายการ</h3>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <span className="material-symbols-outlined text-5xl mb-2">receipt_long</span>
            <p>ยังไม่มีรายการ</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map(trans => {
              const { icon, color } = getTransactionIcon(trans.type)
              return (
                <div key={trans.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
                      <span className="material-symbols-outlined">{icon}</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{getTransactionLabel(trans.type)}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(trans.created_at).toLocaleDateString('th-TH')} • {new Date(trans.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {trans.note && <p className="text-xs text-slate-500">{trans.note}</p>}
                    </div>
                  </div>
                  <p className={`font-bold text-lg ${trans.amount >= 0 ? 'text-green-600' : 'text-red-400'}`}>
                    {trans.amount >= 0 ? '+' : ''}฿{Math.abs(trans.amount).toLocaleString()}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
