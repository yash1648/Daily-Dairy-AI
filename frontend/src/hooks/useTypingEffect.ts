"use client"

import { useState, useEffect } from "react"

interface UseTypingEffectOptions {
    speed?: number
    startDelay?: number
}

export const useTypingEffect = (text: string, options: UseTypingEffectOptions = {}) => {
    const { speed = 30, startDelay = 0 } = options
    const [displayedText, setDisplayedText] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const [isComplete, setIsComplete] = useState(false)

    useEffect(() => {
        if (!text) {
            setDisplayedText("")
            setIsTyping(false)
            setIsComplete(false)
            return
        }

        setIsTyping(true)
        setIsComplete(false)

        const startTyping = () => {
            let index = 0
            setDisplayedText("")

            const typeInterval = setInterval(() => {
                if (index < text.length) {
                    setDisplayedText(text.slice(0, index + 1))
                    index++
                } else {
                    clearInterval(typeInterval)
                    setIsTyping(false)
                    setIsComplete(true)
                }
            }, speed)

            return () => clearInterval(typeInterval)
        }

        const delayTimeout = setTimeout(startTyping, startDelay)
        return () => clearTimeout(delayTimeout)
    }, [text, speed, startDelay])

    return { displayedText, isTyping, isComplete }
}
