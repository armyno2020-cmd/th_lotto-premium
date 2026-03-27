import { createClient } from '@supabase/supabase-js'

const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL || 'YOUR_GOOGLE_APPS_SCRIPT_URL'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

async function callGoogleScript<T = any>(
  action: string,
  params: Record<string, any> = {}
): Promise<ApiResponse<T>> {
  try {
    const url = new URL(GOOGLE_SCRIPT_URL)
    url.searchParams.append('action', action)
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value))
      }
    })

    const response = await fetch(url.toString())
    const data = await response.json()
    return data
  } catch (error: any) {
    console.error('Google Script API Error:', error)
    return { success: false, error: error.message }
  }
}

// Auth API
export const authApi = {
  login: (username: string, password: string) =>
    callGoogleScript('login', { username, password }),
  
  register: (data: {
    phone: string
    pin: string
    name: string
    bankName: string
    accountName: string
    accountNumber: string
    referralCode?: string
  }) => callGoogleScript('register', data),
  
  adminLogin: (username: string, password: string) =>
    callGoogleScript('adminLogin', { username, password }),
}

// User API
export const userApi = {
  getInfo: (userId: string) =>
    callGoogleScript('getUserInfo', { userId }),
  
  saveProfile: (data: {
    userId: string
    pin?: string
    bankName?: string
    accountNumber?: string
  }) => callGoogleScript('saveUser', data),
}

// Home Page Data
export const homeApi = {
  getPageData: () => callGoogleScript('getHomePageData'),
  
  getUITexts: () => callGoogleScript('getUITexts'),
}

// Lottery API
export const lotteryApi = {
  getTypes: (all: boolean = false) =>
    callGoogleScript('getLotteryTypes', { all: all ? '1' : '' }),
  
  getLatestResults: (lotteryType?: string) =>
    callGoogleScript('getLatestResults', { lotteryType: lotteryType || 'ALL' }),
  
  getBanks: () => callGoogleScript('getBanks'),
  
  getSystemBankDetails: () => callGoogleScript('getSystemBankDetails'),
}

// Betting API
export const betApi = {
  placeBet: (userId: string, lotteryType: string, bets: Array<{
    number: string
    amount: number
    format: string
  }>) => callGoogleScript('placeBet', {
    userId,
    lotteryType,
    bets: JSON.stringify(bets)
  }),
  
  cancelBet: (userId: string, betId: string) =>
    callGoogleScript('cancelBet', { userId, betId }),
  
  getHistory: (userId: string) =>
    callGoogleScript('getUserBetHistory', { userId }),
}

// Wallet API
export const walletApi = {
  getPageData: (userId: string) =>
    callGoogleScript('getWalletPageData', { userId }),
  
  submitDeposit: (data: {
    userId: string
    amount: string
    slipUrl?: string
    transferTime?: string
    promoDetails?: string
  }) => callGoogleScript('submitDepositRequest', data),
  
  updateTransactionDetails: (transactionId: string, data: {
    slipUrl?: string
    transferTime?: string
  }) => callGoogleScript('updateTransactionDetails', {
    transactionId,
    ...data
  }),
  
  getReferralSummary: (userId: string) =>
    callGoogleScript('getUserReferralSummary', { userId }),
  
  transferAffiliate: (userId: string) =>
    callGoogleScript('transferAffiliate', { userId }),
  
  getWithdrawalsToday: (userId: string) =>
    callGoogleScript('getUserWithdrawalsToday', { userId }),
}

// Transaction API
export const transactionApi = {
  create: (data: {
    userId: string
    type: 'deposit' | 'withdraw'
    amount: string
    slipUrl?: string
    transferTime?: string
    promoDetails?: string
  }) => callGoogleScript('createTransaction', data),
}

// System API (Admin)
export const systemApi = {
  getSettings: () => callGoogleScript('getSystemSettings'),
  
  updateSettings: (settings: Record<string, any>, adminToken: string) =>
    callGoogleScript('updateSystemSettings', {
      settings: JSON.stringify(settings),
      adminToken
    }),
  
  syncResults: () => callGoogleScript('syncExternalResults'),
  
  runScraper: () => callGoogleScript('runScraperEngine'),
}

// Admin API (requires adminToken)
export const adminApi = {
  getStats: (adminToken: string) =>
    callGoogleScript('getAdminStats', { adminToken }),
  
  getExtendedDashboardData: (adminToken: string) =>
    callGoogleScript('getExtendedDashboardData', { adminToken }),
  
  getDashboardChartData: (adminToken: string) =>
    callGoogleScript('getDashboardChartData', { adminToken }),
  
  getAdvancedStats: (adminToken: string) =>
    callGoogleScript('getAdvancedStats', { adminToken }),
  
  getProfessionalStats: (adminToken: string) =>
    callGoogleScript('getProfessionalStats', { adminToken }),
  
  getTableData: (adminToken: string, sheetName: string) =>
    callGoogleScript('getAdminTableData', { adminToken, sheetName }),
  
  saveRecord: (adminToken: string, sheetName: string, data: any) =>
    callGoogleScript('saveAdminRecord', {
      adminToken,
      sheetName,
      data: JSON.stringify(data)
    }),
  
  deleteRecord: (adminToken: string, sheetName: string, id: string) =>
    callGoogleScript('deleteAdminRecord', { adminToken, sheetName, id }),
  
  processTransaction: (adminToken: string, id: string, status: string, adminName: string) =>
    callGoogleScript('processTransaction', { adminToken, id, status, adminName }),
  
  getAllTransactions: (adminToken: string) =>
    callGoogleScript('getAllTransactions', { adminToken }),
  
  saveWebSettings: (adminToken: string, data: Record<string, any>) =>
    callGoogleScript('saveWebSettings', {
      adminToken,
      data: JSON.stringify(data)
    }),
  
  // Lottery CRUD
  getAllLotteries: (adminToken: string) =>
    callGoogleScript('adminGetAllLotteries', { adminToken }),
  
  createLottery: (adminToken: string, data: any) =>
    callGoogleScript('adminCreateLottery', {
      adminToken,
      data: JSON.stringify(data)
    }),
  
  updateLottery: (adminToken: string, data: any) =>
    callGoogleScript('adminUpdateLottery', {
      adminToken,
      data: JSON.stringify(data)
    }),
  
  deleteLottery: (adminToken: string, code: string) =>
    callGoogleScript('adminDeleteLottery', { adminToken, code }),
  
  toggleLotteryStatus: (adminToken: string, code: string, status: boolean) =>
    callGoogleScript('adminToggleLotteryStatus', {
      adminToken,
      code,
      status: status ? 'true' : 'false'
    }),
  
  // Wheel System
  getWheelPrizes: () => callGoogleScript('getWheelPrizes'),
  
  spinWheel: (userId: string) =>
    callGoogleScript('spinWheel', { userId }),
  
  adminGetWheelPrizes: (adminToken: string) =>
    callGoogleScript('adminGetWheelPrizes', { adminToken }),
  
  adminSaveWheelPrize: (adminToken: string, data: any) =>
    callGoogleScript('adminSaveWheelPrize', {
      adminToken,
      data: JSON.stringify(data)
    }),
  
  adminDeleteWheelPrize: (adminToken: string, id: string) =>
    callGoogleScript('adminDeleteWheelPrize', { adminToken, id }),
}
