"use client"

import { useEffect, useRef, useState } from "react"

interface WebSocketMessage {
    type: "chunk" | "complete" | "error" | "connected"
    content?: string
    message?: string
    timestamp?: number
}

const useWebSocket = (onMessageReceived: (message: WebSocketMessage) => void) => {
    const websocket = useRef<WebSocket | null>(null)
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const reconnectAttempts = useRef(0)
    const [isConnected, setIsConnected] = useState(false)
    const maxReconnectAttempts = 5

    const connect = () => {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token")
        if (!token) {
            console.error("Authentication token not found. Please login again.")
            return
        }

        try {
            const wsUrl = `ws://localhost:6969/ws/ai-chat?token=${token}`
            const ws = new WebSocket(wsUrl)

            ws.onopen = () => {
                console.log("WebSocket connected successfully")
                setIsConnected(true)
                reconnectAttempts.current = 0
                clearReconnectTimeout()

                onMessageReceived({
                    type: "connected",
                    timestamp: Date.now(),
                })
            }

            ws.onmessage = (event) => {
                try {
                    const wsMessage: WebSocketMessage = JSON.parse(event.data)
                    onMessageReceived(wsMessage)
                } catch (err) {
                    console.error("Error parsing WebSocket message:", err, "Raw data:", event.data)
                }
            }

            ws.onclose = (event) => {
                console.log("WebSocket connection closed:", event.code, event.reason)
                setIsConnected(false)
                handleReconnect(event.code)
            }

            ws.onerror = (error) => {
                console.error("WebSocket error:", error)
                setIsConnected(false)
            }

            websocket.current = ws
        } catch (err) {
            console.error("Error creating WebSocket connection:", err)
            setIsConnected(false)
        }
    }

    const clearReconnectTimeout = () => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
            reconnectTimeoutRef.current = null
        }
    }

    const handleReconnect = (code: number) => {
        if (code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000)
            console.log(
                `Attempting to reconnect in ${delay}ms... (attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`,
            )

            reconnectTimeoutRef.current = setTimeout(() => {
                reconnectAttempts.current++
                connect()
            }, delay)
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
            console.error("Connection lost. Please refresh the page to reconnect.")
        }
    }

    const sendMessage = (prompt: object) => {
        if (websocket.current && websocket.current.readyState === WebSocket.OPEN) {
            try {
                const message = {
                    prompt: JSON.stringify(prompt),
                    templateId: "default",
                }
                websocket.current.send(JSON.stringify(message))
                return true
            } catch (err) {
                console.error("Error sending message:", err)
                return false
            }
        } else {
            console.warn("WebSocket is not connected")
            return false
        }
    }

    useEffect(() => {
        connect()

        return () => {
            clearReconnectTimeout()
            if (websocket.current) {
                websocket.current.close(1000, "User disconnected")
                websocket.current = null
            }
        }
    }, [])

    return { sendMessage, isConnected }
}

export default useWebSocket
