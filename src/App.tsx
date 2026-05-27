import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LorePage from './pages/LorePage'
import RuneSelectionPage from './pages/RuneSelectionPage'
import ArrangementPage from './pages/ArrangementPage'
import InterpretationPage from './pages/InterpretationPage'
import SharePage from './pages/SharePage'
import { useBackgroundMusic } from './hooks/useBackgroundMusic'
import { MusicToggle } from './components/MusicToggle'
import { useEffect } from 'react'

function AppLayout() {
  const { playing, initialized, toggle, init } = useBackgroundMusic()

  // Initialize audio on first user interaction
  useEffect(() => {
    const handleInteraction = () => {
      if (!initialized) init()
    }
    document.addEventListener('click', handleInteraction, { once: true })
    document.addEventListener('touchstart', handleInteraction, { once: true })
    return () => {
      document.removeEventListener('click', handleInteraction)
      document.removeEventListener('touchstart', handleInteraction)
    }
  }, [initialized, init])

  return (
    <>
      <MusicToggle playing={playing} onClick={toggle} />
      <Routes>
        <Route path="/" element={<LorePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/select" element={<RuneSelectionPage />} />
        <Route path="/arrange" element={<ArrangementPage />} />
        <Route path="/interpret" element={<InterpretationPage />} />
        <Route path="/share" element={<SharePage />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}
