"use client"

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth-store'
import api from '@/lib/api'
import { GameHeader, UserStats, BettingFooter } from '@/components/betting/shared-ui'
import { SessionHistory } from '@/components/betting/session-history'
import * as Games from '@/components/betting/games'
import { useSocket } from '@/hooks/use-socket'
import { toast } from 'sonner'

export function Betting() {
  const { gameCode: paramCode } = useParams()
  const [searchParams] = useSearchParams()
  const gameCode = paramCode || searchParams.get('code') || '5K3'
  const navigate = useNavigate()
  const { user, fetchUser } = useAuth()
  const socket = useSocket(gameCode)
  
  const [room, setRoom] = useState<any>(null)
  const [currentSession, setCurrentSession] = useState<string>('')
  const [lastSession, setLastSession] = useState<string>('')
  const [secondsLeft, setSecondsLeft] = useState<number>(0)
  const [endTime, setEndTime] = useState<number | null>(null)
  const [lastResults, setLastResults] = useState<number[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [betAmount, setBetAmount] = useState<number>(0)
  const [showHistory, setShowHistory] = useState(false)
  const [oddsConfig, setOddsConfig] = useState<any>(null)

  const isDiceGame = gameCode.toUpperCase().includes('K3')
  const isWingo = gameCode.toUpperCase().includes('WINGO')
  const gameType = isDiceGame ? 'k3' : (isWingo ? 'wingo' : '5d')

  const fetchInitialData = useCallback(async () => {
    try {
      const res = await api.get(`/game/init/${gameCode}`)
      if (res.data.status) {
        const { room, currentSession, lastResult, lastPeriod } = res.data.data
        setRoom(room)
        setOddsConfig(room.odds)
        if (currentSession) {
          setCurrentSession(currentSession.period)
          setEndTime(Number(currentSession.end_time))
          setLastSession(lastPeriod || (parseInt(currentSession.period) - 1).toString())
        }
        setLastResults(lastResult || [])
      }
    } catch (err) {
      console.error('Fetch error:', err)
    }
  }, [gameCode])

  useEffect(() => {
    fetchInitialData()
    fetchUser()
  }, [fetchInitialData, fetchUser])

  useEffect(() => {
    if (!socket) return

    socket.on('tick', (data: any) => {
      if (data.endTime !== undefined) setEndTime(Number(data.endTime))
      // Sync local timer with server if difference is significant or on first tick
      if (Math.abs(data.timeLeft - secondsLeft) > 2 || secondsLeft === 0) {
        setSecondsLeft(data.timeLeft)
      }
      
      if (data.period && data.period !== currentSession) {
        setCurrentSession(data.period)
        setSecondsLeft(data.timeLeft)
      }
    })

    socket.on('result', (data: any) => {
      setLastResults(data.result)
      if (data.period) setLastSession(data.period)
      setEndTime(null)
      fetchUser()
    })

    socket.on('balanceUpdate', (data: any) => {
      fetchUser()
    })

    return () => {
      socket.off('tick')
      socket.off('result')
      socket.off('balanceUpdate')
    }
  }, [socket, currentSession, fetchUser, secondsLeft])

  // Derive the countdown from the server end timestamp to avoid drift.
  useEffect(() => {
    const timer = setInterval(() => {
      if (endTime) {
        setSecondsLeft(Math.max(0, Math.floor((endTime - Date.now()) / 1000)))
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [endTime])

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0')
    const secs = (totalSeconds % 60).toString().padStart(2, '0')
    return `${mins}:${secs}`
  }

  const handleToggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  const handlePlaceBet = async () => {
    if (selectedTypes.length === 0) {
      toast.error('Vui lòng chọn')
      return
    }
    if (betAmount <= 0) {
      toast.error('Vui lòng nhập số tiền')
      return
    }

    try {
      const bets = selectedTypes.map(type => ({ code: type, amount: betAmount }))
      socket?.emit('placeBet', { roomId: room.id, bets })
      
      socket?.once('placeBetResponse', (res: any) => {
        if (res.status) {
          toast.success(res.message)
          setSelectedTypes([])
          setBetAmount(0)
          fetchUser()
        } else {
          toast.error(res.message)
        }
      })
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const gameProps = {
    user,
    currentSession,
    lastSession,
    timeLeft: formatTime(secondsLeft),
    lastResults,
    selectedTypes,
    onToggleType: handleToggleType,
    oddsConfig
  }

  const gameNames: Record<string, string> = {
    '5K3': '5K3',
    '10K3': '10K3',
    'LUCKY_SPACE': 'Lucky Spac',
    'GOOD_LUCK': 'Good Luck',
    'SPEED_PRO': 'Speed Pro',
    'LOTTERY_5MIN': 'Lottery 5Min',
    'LOTTERY_X10': 'Lottery X10',
    'SPEED_11X5': 'Speed 11x5',
    'WINGO_1M': 'Wingo 1M',
    'WINGO_3M': 'Wingo 3M'
  };

  const renderGame = () => {
    switch (gameType) {
      case 'k3': return <Games.K3View {...gameProps} />
      case 'wingo': 
        return <Games.BallView 
          {...gameProps} 
          ballCount={1} 
          ballMax={10} 
        />
      case '5d':
        const ballCount = gameCode === 'SPEED_11X5' ? 10 : (gameCode === 'LUCKY_SPACE' || gameCode === 'SPEED_PRO' ? 8 : 10);
        return <Games.BallView 
          {...gameProps} 
          ballCount={ballCount} 
          ballMax={gameCode === 'LUCKY_SPACE' || gameCode === 'SPEED_PRO' ? 8 : 10} 
        />
      default: return <Games.K3View {...gameProps} />
    }
  }

  return (
    <div className="flex h-full overflow-hidden flex-col bg-black pb-32">
      <div className="transition-all delay-1000 fixed whitespace-nowrap -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 font-bold text-[24px] z-20 text-green-500 bg-[#555] px-4 py-1 rounded hidden">+ 0</div>
      
      <GameHeader title={gameNames[gameCode] || gameCode} onShowHistory={() => setShowHistory(true)} />

      <UserStats user={user} />

      {renderGame()}

      <BettingFooter
        betAmount={betAmount}
        setBetAmount={setBetAmount}
        balance={user?.money || 0}
        onPlaceBet={handlePlaceBet}
        onReset={() => { setBetAmount(0); setSelectedTypes([]); }}
      />

      <SessionHistory
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        isDiceGame={isDiceGame}
        ballCount={gameCode.toUpperCase().includes('5D') ? 5 : 10}
        gameCode={gameCode}
      />
    </div>
  )
}

export default function BettingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-primary font-bold">Đang tải...</div>}>
      <Betting />
    </Suspense>
  )
}
