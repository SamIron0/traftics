import React, { useState, useRef, useCallback } from 'react'
import * as Slider from '@radix-ui/react-slider'
import { Redo2, MousePointer, ArrowUp, Play, Pause, RotateCcw, RotateCw, FastForward, Terminal, X, RefreshCcw, MousePointerClick, FileText, CornerUpLeft, Maximize } from 'lucide-react'
import { useCustomSlider, Event  } from '@/hooks/useSessionSlider'
import { Button } from '@/components/ui/button'
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface CustomSliderProps {
  totalDuration: number
  events: Event[]
  errors: Array<{ id: number; timestamp: number }>
  onValueChange?: (value: number) => void
  onConsoleToggle: () => void
}

export function CustomSlider({ totalDuration, events, errors, onValueChange, onConsoleToggle }: CustomSliderProps) {
  const {
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
  } = useCustomSlider(totalDuration, events)

  const [isChecked, setIsChecked] = useState(true)
  const [hoveredTime, setHoveredTime] = useState<number | null>(null)
  const [activeEventTooltip, setActiveEventTooltip] = useState<string | null>(null)
  const [activeErrorTooltip, setActiveErrorTooltip] = useState<number | null>(null);

  // Add error jump handler
  React.useEffect(() => {
    const handleJumpToTime = (e: CustomEvent<number>) => {
      handleValueChange([e.detail])
    }
    
    window.addEventListener('jumpToTime', handleJumpToTime as EventListener)
    return () => window.removeEventListener('jumpToTime', handleJumpToTime as EventListener)
  }, [handleValueChange])

  const getEventIcon = (type: Event['type']) => {
    switch (type) {
      case 'scroll':
        return <ArrowUp className="w-3 h-3 text-white" />
      case 'rageClick':
        return <MousePointerClick className="w-3 h-3 text-white" />
      case 'refresh':
        return <RefreshCcw className="w-3 h-3 text-white" />
      case 'uturn':
        return <CornerUpLeft className="w-3 h-3 text-white" />
      case 'windowResize':
        return <Maximize className="w-3 h-3 text-white" />
      case 'selection':
      case 'click':
        return null
      default:
        return null
    }
  }

  const getEventColor = (type: Event['type']) => {
    switch (type) {
      case 'click':
        return 'bg-white'
      case 'scroll':
        return 'bg-green-500'
      case 'rageClick':
        return 'bg-yellow-500'
      case 'refresh':
        return 'bg-purple-500'
      case 'selection':
        return 'bg-gray-700'
      case 'uturn':
        return 'bg-indigo-500'
      case 'windowResize':
        return 'bg-orange-500'
      default:
        return 'bg-gray-500'
    }
  }

  const inactivityStart = 8000
  const inactivityEnd = 11000

  const inactivityStartPercent = (inactivityStart / totalDuration) * 100
  const inactivityEndPercent = (inactivityEnd / totalDuration) * 100
  const progressPercent = (value / totalDuration) * 100

  const handleTrackHover = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const position = (e.clientX - rect.left) / rect.width
    setHoveredTime(position * totalDuration)
  }, [totalDuration])

  const handleTrackLeave = useCallback(() => {
    setHoveredTime(null)
  }, [])

  return (
    <TooltipProvider delayDuration={0}>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg pt-3">
        <div className="mx-auto px-4 py-2">
          <div className="relative w-full">
            <Slider.Root
              className="relative flex items-center select-none touch-none w-full h-[8px]"
              value={[value]}
              max={totalDuration}
              step={1}
              onValueChange={(newValue) => {
                handleValueChange(newValue)
                onValueChange?.(newValue[0])
              }}
            >
              <Slider.Track 
                className="relative grow cursor-pointer"
                onClick={handleTrackClick}
                onMouseMove={handleTrackHover}
                onMouseLeave={handleTrackLeave}
              >
                {/* Background segments */}
                <div className="absolute top-1/2 -translate-y-1/2 bg-slate-200 rounded-l-full h-[8px]"
                     style={{ left: '0%', width: `${inactivityStartPercent}%` }} />
                <div className="absolute top-1/2 -translate-y-1/2 bg-slate-200 h-[3px]"
                     style={{ left: `${inactivityStartPercent}%`, width: `${inactivityEndPercent - inactivityStartPercent}%` }} />
                <div className="absolute top-1/2 -translate-y-1/2 bg-slate-200 rounded-r-full h-[8px]"
                     style={{ left: `${inactivityEndPercent}%`, width: `${100 - inactivityEndPercent}%` }} />

                {/* Progress segments */}
                {progressPercent <= inactivityStartPercent && (
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 bg-blue-500 rounded-l-full h-[8px]"
                    style={{ left: '0%', width: `${progressPercent}%` }} 
                  />
                )}
                
                {progressPercent > inactivityStartPercent && progressPercent <= inactivityEndPercent && (
                  <>
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 bg-blue-500 rounded-l-full h-[8px]"
                      style={{ left: '0%', width: `${inactivityStartPercent}%` }} 
                    />
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 bg-blue-500 h-[3px]"
                      style={{ 
                        left: `${inactivityStartPercent}%`, 
                        width: `${progressPercent - inactivityStartPercent}%` 
                      }} 
                    />
                  </>
                )}
                
                {progressPercent > inactivityEndPercent && (
                  <>
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 bg-blue-500 rounded-l-full h-[8px]"
                      style={{ left: '0%', width: `${inactivityStartPercent}%` }} 
                    />
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 bg-blue-500 h-[3px]"
                      style={{ 
                        left: `${inactivityStartPercent}%`, 
                        width: `${inactivityEndPercent - inactivityStartPercent}%` 
                      }} 
                    />
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 bg-blue-500 h-[8px]"
                      style={{ 
                        left: `${inactivityEndPercent}%`, 
                        width: `${progressPercent - inactivityEndPercent}%` 
                      }} 
                    />
                  </>
                )}

                {/* Error markers */}
                {errors.map((error) => (
                  <Tooltip key={`error-${error.id}`}>
                    <TooltipTrigger asChild>
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-1 h-4 bg-red-500"
                        style={{ 
                          left: `${(error.timestamp / totalDuration) * 100}%`,
                          marginLeft: '-2px'
                        }}
                        onMouseEnter={() => setActiveErrorTooltip(error.id)}
                        onMouseLeave={() => setActiveErrorTooltip(null)}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Error</p>
                    </TooltipContent>
                  </Tooltip>
                ))}

                {/* Event markers */}
                {events.map((event) => {
                  if (event.type === 'input') {
                    const startPercent = (event.startTime! / totalDuration) * 100
                    const endPercent = (event.endTime! / totalDuration) * 100
                    return (
                      <Tooltip key={event.id}>
                        <TooltipTrigger asChild>
                          <div
                            className="absolute top-1/2 -translate-y-1/2 bg-purple-500 h-[3px] hover:h-[5px] transition-all duration-200"
                            style={{ left: `${startPercent}%`, width: `${endPercent - startPercent}%` }}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Input: {formatTime(event.startTime!)} - {formatTime(event.endTime!)}</p>
                        </TooltipContent>
                      </Tooltip>
                    )
                  }
                  return (
                    <Tooltip key={event.id}>
                      <TooltipTrigger asChild>
                        <button
                          className={`absolute top-1/2 -translate-y-1/2 shadow-md hover:scale-150 transition-transform focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center
                            ${event.type === 'selection' || event.type === 'click' ? 'w-1 h-1 rounded-full' : 'w-4 h-4 rounded-sm'} ${getEventColor(event.type)}`}
                          style={{ 
                            left: `${getEventPosition(event)}%`,
                          }}
                          onClick={() => handleEventClick(event)}
                          onMouseEnter={() => setActiveEventTooltip(event.id)}
                          onMouseLeave={() => setActiveEventTooltip(null)}
                          aria-label={`${event.type} event at ${formatTime(event.timestamp)}`}
                        >
                          {getEventIcon(event.type)}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{event.type}</p>
                      </TooltipContent>
                    </Tooltip>
                  )
                })}

                {/* Track tooltip */}
                {hoveredTime !== null && activeEventTooltip === null && activeErrorTooltip === null && (
                  <div
                    className="absolute top-[-30px] px-2 py-1 bg-gray-800 text-white text-xs rounded pointer-events-none"
                    style={{
                      left: `${(hoveredTime / totalDuration) * 100}%`,
                      transform: 'translateX(-50%)',
                    }}
                  >
                    {formatTime(hoveredTime)}
                  </div>
                )}
              </Slider.Track>
              <Slider.Thumb
                className="block cursor-pointer w-4 h-4 bg-blue-500 shadow-lg rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 z-10"
                aria-label="Slider thumb"
              />
            </Slider.Root>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={togglePlayback}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isPlaying ? 'Pause' : 'Play'}</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={skipBackward}
                    aria-label="Skip backward"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Skip backward</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={skipForward}
                    aria-label="Skip forward"
                  >
                    <RotateCw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Skip forward</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleSpeed}
                    className="text-xs font-medium"
                  >
                    {playbackSpeed}x
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle playback speed</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Switch
                    className={`relative transition-colors duration-200 
                      ${isChecked ? 'bg-indigo-600' : 'bg-slate-300'}`}
                    aria-label="Toggle skip inactivity"
                    checked={isChecked}
                    onCheckedChange={(checked) => setIsChecked(checked)}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isChecked ? 'All inactivity skipped' : 'Skip all inactivity'}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {formatTime(value)} / {formatTime(totalDuration)}
              </span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onConsoleToggle}
                    aria-label="Toggle console"
                    className="flex items-center gap-1"
                  >
                    <Terminal className="h-4 w-4" />
                    <span className="text-xs font-medium">Console</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Show console</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

