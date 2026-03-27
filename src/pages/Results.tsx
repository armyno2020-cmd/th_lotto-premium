import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { LotteryResult } from '../types'

interface LotterySchedule {
  lottery_type: string
  name: string
  image_url?: string
}

const CATEGORY_LABELS: Record<string, string> = {
  'GOV': 'รัฐบาล',
  'LAO': 'ลาว',
  'HANOI': 'ฮานอย',
  'MALAY': 'มาเลย์',
  'STOCK': 'หุ้น',
  'SET': 'เซียม',
}

export default function Results() {
  const [results, setResults] = useState<LotteryResult[]>([])
  const [schedules, setSchedules] = useState<LotterySchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [filteredResults, setFilteredResults] = useState<LotteryResult[]>([])
  const [selectedResult, setSelectedResult] = useState<LotteryResult | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterResults()
  }, [selectedCategory, results, schedules])

  const fetchData = async () => {
    try {
      const [resultsRes, schedulesRes] = await Promise.all([
        supabase
          .from('lottery_results')
          .select('*')
          .order('draw_date', { ascending: false })
          .limit(50),
        supabase
          .from('lottery_schedules')
          .select('*')
          .eq('is_active', true)
      ])

      if (resultsRes.data) setResults(resultsRes.data)
      if (schedulesRes.data) setSchedules(schedulesRes.data)
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const getCategory = (type: string): string => {
    if (type.startsWith('TH_') || type === 'GOV') return 'GOV'
    if (type.includes('LAO')) return 'LAO'
    if (type.includes('HANOI')) return 'HANOI'
    if (type.includes('MALAY')) return 'MALAY'
    if (type.includes('STOCK') || type.includes('NIKKEI') || type.includes('CHINA') || type.includes('HANGSENG')) return 'STOCK'
    return 'GOV'
  }

  const getSchedule = (type: string): LotterySchedule | undefined => {
    return schedules.find(s => s.lottery_type === type)
  }

  const filterResults = () => {
    if (!selectedCategory) {
      setFilteredResults(results)
    } else {
      setFilteredResults(results.filter(r => {
        const cat = getCategory(r.lottery_type)
        return cat === selectedCategory
      }))
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('th-TH', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  const renderDigits = (result: string | null | undefined, size: 'sm' | 'lg' = 'sm') => {
    if (!result) return <span className="text-slate-400">---</span>
    const digits = result.replace(/\s/g, '').split('')
    const sizeClass = size === 'lg' ? 'w-12 h-12 text-xl' : 'w-8 h-8 text-base'
    return digits.map((digit, i) => (
      <div key={i} className={`${sizeClass} bg-gradient-to-br from-green-500 to-green-700 rounded-lg flex items-center justify-center text-white font-bold shadow-md`}>
        {digit}
      </div>
    ))
  }

  const isStockType = (type: string) => {
    return type.includes('STOCK') || type.includes('NIKKEI') || type.includes('CHINA') || type.includes('HANGSENG')
  }

  const isGovType = (type: string) => {
    return type === 'TH_GOV'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="px-4 pt-4 pb-20">
      <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-4">ผลรางวัล</h1>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
            !selectedCategory
              ? 'bg-green-600 text-white shadow-lg shadow-green-200'
              : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
          }`}
        >
          ทั้งหมด
        </button>
        {Object.entries(CATEGORY_LABELS).map(([cat, label]) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-green-600 text-white shadow-lg shadow-green-200'
                : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredResults.map((result) => {
          const schedule = getSchedule(result.lottery_type)
          const isStock = isStockType(result.lottery_type)
          const isGov = isGovType(result.lottery_type)
          const isPending = !result.main || result.main === 'รอผล'

          return (
            <div
              key={`${result.lottery_type}-${result.draw_date}`}
              onClick={() => setSelectedResult(result)}
              className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 cursor-pointer active:scale-[0.99] transition-transform"
            >
              <div className="flex items-center gap-3 p-4 border-b border-slate-50 dark:border-slate-700">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white text-lg font-bold">
                  {schedule?.name?.charAt(0) || result.lottery_type.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 dark:text-white">{schedule?.name || result.lottery_type}</h3>
                  <p className="text-xs text-slate-400">{formatDate(result.draw_date)}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                  isPending
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                }`}>
                  {isPending ? 'รอผล' : 'ออกแล้ว'}
                </div>
              </div>

              {isPending ? (
                <div className="p-6 text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                    <span className="text-slate-400 text-sm">กำลังรอผล...</span>
                  </div>
                </div>
              ) : isStock ? (
                <div className="p-4">
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-center">
                      <p className="text-[10px] text-slate-400 uppercase mb-1">ผลหลัก</p>
                      <div className="flex gap-1">
                        {renderDigits(result.main)}
                      </div>
                    </div>
                    {result.two_top && (
                      <div className="text-center pl-4 border-l border-slate-200 dark:border-slate-600">
                        <p className="text-[10px] text-slate-400 uppercase mb-1">2 ตัว</p>
                        <div className="flex gap-1">
                          {renderDigits(result.two_top)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : isGov ? (
                <div className="p-4">
                  <div className="text-center mb-3">
                    <p className="text-[10px] text-slate-400 uppercase mb-2">รางวัลที่ 1</p>
                    <div className="flex justify-center gap-1">
                      {renderDigits(result.main)}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg">
                      <p className="text-[10px] text-slate-400 uppercase mb-1">3 ตัวหน้า</p>
                      <div className="flex justify-center gap-1">
                        {renderDigits(result.three_front1)}
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg">
                      <p className="text-[10px] text-slate-400 uppercase mb-1">3 ตัวท้าย</p>
                      <div className="flex justify-center gap-1">
                        {renderDigits(result.three_back1)}
                      </div>
                    </div>
                    <div className="col-span-2 bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
                      <p className="text-[10px] text-green-600 dark:text-green-400 uppercase mb-1">2 ตัวล่าง</p>
                      <div className="flex justify-center gap-1">
                        {renderDigits(result.two_bottom)}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  <div className="text-center mb-3">
                    <p className="text-[10px] text-slate-400 uppercase mb-2">รางวัล</p>
                    <div className="flex justify-center gap-1">
                      {renderDigits(result.main)}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg">
                      <p className="text-[10px] text-slate-400 uppercase mb-1">3 ตัว</p>
                      <p className="font-bold text-slate-700 dark:text-slate-200">{result.three_top || '---'}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg">
                      <p className="text-[10px] text-slate-400 uppercase mb-1">2 ตัวล่าง</p>
                      <p className="font-bold text-slate-700 dark:text-slate-200">{result.two_bottom || '--'}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg">
                      <p className="text-[10px] text-slate-400 uppercase mb-1">2 ตัวบน</p>
                      <p className="font-bold text-slate-700 dark:text-slate-200">{result.two_top || '--'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {filteredResults.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <span className="material-symbols-outlined text-5xl mb-2">search_off</span>
            <p>ไม่พบผลรางวัล</p>
          </div>
        )}
      </div>

      {selectedResult && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          onClick={() => setSelectedResult(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {getSchedule(selectedResult.lottery_type)?.name || selectedResult.lottery_type}
                </h2>
                <p className="text-green-100 text-sm">{formatDate(selectedResult.draw_date)}</p>
              </div>
              <button
                onClick={() => setSelectedResult(null)}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6">
              {isStockType(selectedResult.lottery_type) ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-xs text-slate-400 uppercase mb-2">ผลหลัก</p>
                    <div className="flex justify-center gap-2 mb-4">
                      {renderDigits(selectedResult.main, 'lg')}
                    </div>
                  </div>
                  {selectedResult.two_top && (
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl text-center">
                      <p className="text-xs text-green-600 dark:text-green-400 uppercase mb-2">2 ตัว</p>
                      <div className="flex justify-center gap-2">
                        {renderDigits(selectedResult.two_top, 'lg')}
                      </div>
                    </div>
                  )}
                </div>
              ) : isGovType(selectedResult.lottery_type) ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-xs text-slate-400 uppercase mb-2">รางวัลที่ 1</p>
                    <div className="flex justify-center gap-1 mb-6">
                      {renderDigits(selectedResult.main, 'lg')}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl text-center">
                      <p className="text-[10px] text-slate-400 uppercase mb-2">3 ตัวหน้า</p>
                      <div className="flex justify-center gap-1">
                        {renderDigits(selectedResult.three_front1, 'sm')}
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl text-center">
                      <p className="text-[10px] text-slate-400 uppercase mb-2">3 ตัวท้าย</p>
                      <div className="flex justify-center gap-1">
                        {renderDigits(selectedResult.three_back1, 'sm')}
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border-2 border-green-200 dark:border-green-800 text-center">
                    <p className="text-xs text-green-600 dark:text-green-400 uppercase mb-2">2 ตัวล่าง</p>
                    <div className="flex justify-center gap-2">
                      {renderDigits(selectedResult.two_bottom, 'lg')}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-xs text-slate-400 uppercase mb-2">รางวัล</p>
                    <div className="flex justify-center gap-1 mb-4">
                      {renderDigits(selectedResult.main, 'lg')}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-center">
                      <p className="text-[10px] text-slate-400 uppercase mb-1">3 ตัว</p>
                      <p className="font-bold text-lg text-slate-700 dark:text-slate-200">{selectedResult.three_top || '---'}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-center">
                      <p className="text-[10px] text-slate-400 uppercase mb-1">2 ตัวบน</p>
                      <p className="font-bold text-lg text-slate-700 dark:text-slate-200">{selectedResult.two_top || '--'}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-center">
                      <p className="text-[10px] text-slate-400 uppercase mb-1">2 ตัวล่าง</p>
                      <p className="font-bold text-lg text-slate-700 dark:text-slate-200">{selectedResult.two_bottom || '--'}</p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => setSelectedResult(null)}
                className="w-full mt-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
