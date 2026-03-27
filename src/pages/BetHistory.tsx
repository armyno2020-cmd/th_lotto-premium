import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { Bet, LotteryConfig } from '../types'
import toast from 'react-hot-toast'

const BET_TYPE_LABELS: Record<string, string> = {
  '4top': '4 ตัวตรง',
  '3top': '3 ตัวบน',
  '3tod': '3 ตัวโต๊ด',
  '2top': '2 ตัวบน',
  '2under': '2 ตัวล่าง',
  'run_top': 'วิ่งบน',
  'run_under': 'วิ่งล่าง',
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-amber-100', text: 'text-amber-700' },
  won: { bg: 'bg-green-100', text: 'text-green-700' },
  lost: { bg: 'bg-red-100', text: 'text-red-700' },
  cancelled: { bg: 'bg-slate-100', text: 'text-slate-600' },
  refunded: { bg: 'bg-blue-100', text: 'text-blue-700' },
}

export default function BetHistory() {
  const { user } = useAuth()
  const [bets, setBets] = useState<Bet[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'won' | 'lost'>('all')

  useEffect(() => {
    if (user) {
      fetchBets()
    }
  }, [user])

  const fetchBets = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('bets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error
      setBets(data || [])
    } catch (error: any) {
      toast.error(error.message || 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  const cancelBet = async (betId: number) => {
    if (!user) return

    try {
      const bet = bets.find(b => b.id === betId)
      if (!bet) return

      if (bet.status !== 'pending') {
        toast.error('ไม่สามารถยกเลิกโพยนี้ได้')
        return
      }

      const { error } = await supabase
        .from('bets')
        .update({ status: 'cancelled' })
        .eq('id', betId)

      if (error) throw error

      await supabase.rpc('add_balance', {
        user_uuid: user.id,
        amount: bet.amount,
        transaction_type: 'refund',
        reference_id: betId.toString(),
        note_text: 'ยกเลิกโพย'
      })

      toast.success('ยกเลิกโพยสำเร็จ')
      fetchBets()
    } catch (error: any) {
      toast.error(error.message || 'เกิดข้อผิดพลาด')
    }
  }

  const filteredBets = bets.filter(bet => {
    if (filter === 'all') return true
    return bet.status === filter
  })

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getTotalStats = () => {
    const won = bets.filter(b => b.status === 'won')
    const wonAmount = won.reduce((sum, b) => sum + b.win_amount, 0)
    const totalBet = bets.reduce((sum, b) => sum + b.amount, 0)
    return { wonCount: won.length, wonAmount, totalBet }
  }

  const stats = getTotalStats()

  return (
    <div className="px-4 pt-4">
      <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-4">ประวัติการแทง</h1>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 text-center shadow-card">
          <p className="text-xs text-slate-400 mb-1">ทั้งหมด</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{bets.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 text-center shadow-card">
          <p className="text-xs text-slate-400 mb-1">ถูกรางวัล</p>
          <p className="text-xl font-bold text-green-500">{stats.wonCount}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 text-center shadow-card">
          <p className="text-xs text-slate-400 mb-1">รางวัลรวม</p>
          <p className="text-xl font-bold text-primary">฿{stats.wonAmount.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {[
          { key: 'all', label: 'ทั้งหมด' },
          { key: 'pending', label: 'รอผล' },
          { key: 'won', label: 'ถูกรางวัล' },
          { key: 'lost', label: 'ไม่ถูก' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as any)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${
              filter === f.key
                ? 'bg-primary text-white'
                : 'bg-white dark:bg-slate-800 text-slate-500'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredBets.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <span className="material-symbols-outlined text-5xl mb-2">receipt_long</span>
          <p>ยังไม่มีการแทง</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBets.map((bet) => {
            const statusStyle = STATUS_COLORS[bet.status] || STATUS_COLORS.pending
            return (
              <div key={bet.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-card">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{bet.lottery_name || bet.lottery_code}</p>
                    <p className="text-xs text-slate-400">{formatDate(bet.created_at)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${statusStyle.bg} ${statusStyle.text}`}>
                    {bet.status === 'pending' ? 'รอผล' :
                     bet.status === 'won' ? 'ถูกรางวัล' :
                     bet.status === 'lost' ? 'ไม่ถูก' :
                     bet.status === 'cancelled' ? 'ยกเลิก' : bet.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-3">
                  <div className="flex-1">
                    <p className="text-xs text-slate-400">เลขที่แทง</p>
                    <p className="font-bold text-2xl text-primary">{bet.number}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-400">ประเภท</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-300">
                      {BET_TYPE_LABELS[bet.bet_type] || bet.bet_type}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">จ่าย</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-300">x{bet.payout_rate}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-3">
                  <div>
                    <p className="text-xs text-slate-400">ยอดแทง</p>
                    <p className="font-bold text-slate-900 dark:text-white">฿{bet.amount.toLocaleString()}</p>
                  </div>
                  {bet.status === 'won' && (
                    <div className="text-right">
                      <p className="text-xs text-green-500">ได้รับ</p>
                      <p className="font-black text-xl text-green-500">+฿{bet.win_amount.toLocaleString()}</p>
                    </div>
                  )}
                  {bet.status === 'pending' && (
                    <button
                      onClick={() => cancelBet(bet.id)}
                      className="px-4 py-2 bg-red-50 text-red-500 rounded-lg text-sm font-bold"
                    >
                      ยกเลิก
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
