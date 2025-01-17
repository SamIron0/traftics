'use client'

import { useState } from 'react'
import { X, ChevronLeft, ArrowUp, MousePointer2, MousePointerClick, TextCursorInput, RefreshCcw, CornerUpLeft, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

interface SessionInfoProps {
  isOpen: boolean
  onToggle: () => void
}

interface ActionCount {
  icon: React.ReactNode
  label: string
  count: number
}

const actions: ActionCount[] = [
  { icon: <MousePointer2 className="w-4 h-4" />, label: 'Clicks', count: 11 },
  { icon: <TextCursorInput className="w-4 h-4" />, label: 'Text input', count: 1 },
  { icon: <MousePointerClick className="w-4 h-4" />, label: 'Rage clicks', count: 0 },
  { icon: <CornerUpLeft className="w-4 h-4" />, label: 'U-turns', count: 1 },
  { icon: <RefreshCcw className="w-4 h-4" />, label: 'Refresh', count: 0 },
  { icon: <AlertCircle className="w-4 h-4" />, label: 'Errors', count: 0 },
]

const getIconBackground = (label: string) => {
  switch (label) {
    case 'Clicks':
      return 'bg-gray-300';
    case 'Text input':
      return 'bg-green-300';
    case 'Rage clicks':
      return 'bg-yellow-300';
    case 'U-turns':
      return 'bg-indigo-300';
    case 'Refresh':
      return 'bg-purple-300';
    case 'Errors':
      return 'bg-red-300';
    default:
      return 'bg-gray-300';
  }
}

export function SessionInfo({ isOpen, onToggle }: SessionInfoProps) {
  return (
    <div 
      className={cn(
        "fixed right-0 top-0 h-full bg-white border-l border-gray-200 transition-all duration-300 z-30",
        isOpen ? "w-80" : "w-10"
      )}
    >
      {isOpen ? (
        <div className="h-full flex flex-col">
          <div className="flex-1">
            <Tabs defaultValue="info" className="w-full">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="info">Info</TabsTrigger>
                  <TabsTrigger value="actions">Actions</TabsTrigger>
                </TabsList>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2"
                  onClick={onToggle}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <TabsContent value="actions" className="-mx-4 px-4">
                <div className="grid grid-cols-2 gap-4 p-4">
                  {actions.map((action) => (
                    <div
                      key={action.label}
                      className="flex flex-col p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex flex-row justify-between">
                        <div className={`mb-2 p-2 rounded-md ${getIconBackground(action.label)}`}>
                          <div className={'text-black'}>
                            {action.icon}
                          </div>
                        </div>
                        <div className="text-lg font-semibold">{action.count}</div>
                      </div>
                      <div className="text-xs text-gray-500">{action.label}</div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="info" className="-mx-4 px-4">
                <div className="p-4 space-y-4 text-sm ">
                  <div>
                    <div className="text-sm text-gray-500">Session ID</div>
                    <div className="font-mono">367ab90a</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Location</div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🇳🇬</span>
                      Nigeria
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Time</div>
                    <div>a day ago - Jan 15, 11:15</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Device</div>
                    <div>Phone (390 × 663)</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Browser</div>
                    <div>Mobile Safari 18.1.1</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">OS</div>
                    <div>iOS 18.1.1</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Referrer</div>
                    <div className="text-gray-400 italic">Unknown referrer</div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className="w-full h-10 rounded-none"
          onClick={onToggle}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

