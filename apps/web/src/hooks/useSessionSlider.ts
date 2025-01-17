import { useState, useCallback, useRef } from 'react'

export interface Event {
  id: string
  timestamp: number
  type: 'click' | 'scroll' | 'rageClick' | 'refresh' | 'selection' | 'uturn' | 'windowResize' | 'input'
  startTime?: number
  endTime?: number
}

export function useCustomSlider(totalDuration: number, events: Event[]) {
  const [value, setValue] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const playbackRef = useRef<NodeJS.Timeout | null>(null)

  const handleValueChange = useCallback((newValue: number[]) => {
    setValue(newValue[0])
  }, [])

  const getEventPosition = useCallback((event: Event) => {
    return (event.timestamp / totalDuration) * 100
  }, [totalDuration])

  const handleEventClick = useCallback((event: Event) => {
    setValue(event.timestamp)
  }, [])

  const handleTrackClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const position = (e.clientX - rect.left) / rect.width
    setValue(position * totalDuration)
  }, [totalDuration])

  const formatTime = useCallback((ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }, [])

  const togglePlayback = useCallback(() => {
    setIsPlaying(prev => !prev)
  }, [])

  const skipForward = useCallback(() => {
    setValue(prev => Math.min(prev + 5000, totalDuration))
  }, [totalDuration])

  const skipBackward = useCallback(() => {
    setValue(prev => Math.max(prev - 5000, 0))
  }, [])

  const toggleSpeed = useCallback(() => {
    setPlaybackSpeed(prev => {
      if (prev === 1) return 1.5
      if (prev === 1.5) return 2
      return 1
    })
  }, [])

  return {
    value,
    isPlaying,
    playbackSpeed,
    handleValueChange,
    getEventPosition,
    handleEventClick,
    handleTrackClick,
    formatTime,
    togglePlayback,
    skipForward,
    skipBackward,
    toggleSpeed,
  }
}

