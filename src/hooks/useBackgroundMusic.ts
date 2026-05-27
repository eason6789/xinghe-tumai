import { useState, useRef, useCallback, useEffect } from 'react'

const MUSIC_URL = 'https://single-az-1251416377.cos.ap-guangzhou.myqcloud.com/xinghe-tumai/bg_music.mp3'

export function useBackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [initialized, setInitialized] = useState(false)

  // Lazy init audio on first user interaction
  const init = useCallback(() => {
    if (initialized) return
    const audio = new Audio(MUSIC_URL)
    audio.loop = true
    audio.volume = 0.35
    audio.preload = 'auto'
    audioRef.current = audio
    setInitialized(true)

    audio.play().then(() => {
      setPlaying(true)
    }).catch(() => {
      // Autoplay blocked, will start on next user interaction
    })
  }, [initialized])

  const toggle = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.play().then(() => {
        setPlaying(true)
      }).catch(() => {
        setPlaying(false)
      })
    }
  }, [playing])

  // Resume on page visibility restore
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden || !audioRef.current || !playing) return
      audioRef.current.play().catch(() => {})
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [playing])

  return { playing, initialized, toggle, init }
}
