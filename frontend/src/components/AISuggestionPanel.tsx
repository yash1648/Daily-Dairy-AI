"use client"

import type React from "react"
import { useTypingEffect } from "@/hooks/useTypingEffect"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2, CheckCircle2, AlertTriangle, RefreshCw, ChevronDown, ChevronUp, Zap } from "lucide-react"

interface AISuggestion {
    id: string
    content: string
    timestamp: number
    status: "streaming" | "complete" | "error"
    trigger: "auto" | "manual"
}

interface AISuggestionPanelProps {
    suggestion: AISuggestion | null
    isExpanded: boolean
    onToggleExpanded: () => void
    onRefresh: () => void
    isProcessing: boolean
    isConnected: boolean
}

export const AISuggestionPanel: React.FC<AISuggestionPanelProps> = ({
                                                                        suggestion,
                                                                        isExpanded,
                                                                        onToggleExpanded,
                                                                        onRefresh,
                                                                        isProcessing,
                                                                        isConnected,
                                                                    }) => {
    const { displayedText, isTyping } = useTypingEffect(suggestion?.content || "", { speed: 25, startDelay: 100 })

    if (!suggestion) return null

    const getStatusIcon = () => {
        switch (suggestion.status) {
            case "streaming":
                return <Loader2 size={16} className="animate-spin text-emerald-500" />
            case "complete":
                return <CheckCircle2 size={16} className="text-emerald-500" />
            case "error":
                return <AlertTriangle size={16} className="text-red-500" />
            default:
                return <Sparkles size={16} className="text-purple-500" />
        }
    }

    const getStatusText = () => {
        switch (suggestion.status) {
            case "streaming":
                return "AI is writing..."
            case "complete":
                return "Suggestion ready"
            case "error":
                return "Error occurred"
            default:
                return "Processing..."
        }
    }

    return (
        <div className="border border-purple-200 dark:border-purple-800 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 shadow-sm">
            {/* Header */}
            <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-purple-100/50 dark:hover:bg-purple-900/20 transition-colors rounded-t-lg"
                onClick={onToggleExpanded}
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-purple-200 dark:border-purple-700">
                        <Sparkles size={18} className="text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            {getStatusIcon()}
                            <span className="font-semibold text-slate-800 dark:text-slate-200">AI Suggestion</span>
                            {suggestion.status === "streaming" && (
                                <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-full">
                  Live
                </span>
                            )}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{getStatusText()}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {isConnected && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation()
                                onRefresh()
                            }}
                            disabled={isProcessing}
                            className="text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30"
                        >
                            <RefreshCw size={14} className={isProcessing ? "animate-spin" : ""} />
                        </Button>
                    )}
                    <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-400">
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </Button>
                </div>
            </div>

            {/* Content */}
            {isExpanded && (
                <div className="px-4 pb-4">
                    <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-purple-100 dark:border-purple-800 shadow-sm">
                        <div className="flex items-center justify-between mb-3 text-xs text-slate-500 dark:text-slate-400">
              <span>
                {new Date(suggestion.timestamp).toLocaleTimeString()} •
                  {suggestion.trigger === "auto" ? " Auto-generated" : " Manual request"}
              </span>
                            {!isConnected && (
                                <span className="text-red-500 flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  Offline
                </span>
                            )}
                        </div>

                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            {suggestion.status === "error" ? (
                                <div className="text-red-600 dark:text-red-400 flex items-center gap-2">
                                    <AlertTriangle size={16} />
                                    <span>Failed to generate suggestion. Please try again.</span>
                                </div>
                            ) : !displayedText && suggestion.status === "streaming" ? (
                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                    <Loader2 size={16} className="animate-spin" />
                                    <span>AI is thinking...</span>
                                </div>
                            ) : (
                                <div className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                    {displayedText}
                                    {(isTyping || suggestion.status === "streaming") && (
                                        <span className="inline-block w-0.5 h-5 bg-purple-500 ml-1 animate-pulse"></span>
                                    )}
                                </div>
                            )}
                        </div>

                        {suggestion.status === "complete" && (
                            <div className="mt-4 pt-3 border-t border-purple-100 dark:border-purple-800">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onRefresh}
                                    disabled={isProcessing || !isConnected}
                                    className="text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 bg-transparent"
                                >
                                    <Zap size={14} />
                                    Generate New Suggestion
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
