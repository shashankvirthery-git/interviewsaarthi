'use client'
import { useState, useRef, useCallback } from 'react'

export function useVoice(onTranscript: (text: string) => void) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(true)
  const recognitionRef = useRef<any>(null)

  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setIsSupported(false)
      alert("Voice input not supported. Please use Chrome browser.")
      return
    }

    // Stop if already listening
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.continuous = false

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    
    recognition.onerror = (event: any) => {
      console.error("Speech error:", event.error)
      setIsListening(false)
      if (event.error === 'not-allowed') {
        alert("Microphone access denied. Click the 🔒 lock icon in your browser address bar and allow microphone access.")
      } else if (event.error === 'network') {
        alert("Network error with speech recognition. Try again.")
      } else if (event.error === 'no-speech') {
        alert("No speech detected. Please try again.")
      }
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      onTranscript(transcript)
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [onTranscript])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  return { isListening, isSupported, startListening, stopListening }
}