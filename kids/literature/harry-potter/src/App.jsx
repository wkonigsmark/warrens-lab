import { useEffect, useState } from 'react'
import Home from './screens/Home.jsx'
import Quiz from './screens/Quiz.jsx'
import Certificate from './components/Certificate.jsx'
import { loadState, saveState } from './lib/game.js'
import { HOUSES } from './data/houses.js'
import { FROG_CARDS } from './data/frogCards.js'

export default function App() {
  const [game, setGame] = useState(loadState)
  const [screen, setScreen] = useState('home') // 'home' | 'quiz'
  const [bookPick, setBookPick] = useState(null) // 1 | 2 | 'mix'

  useEffect(() => { saveState(game) }, [game])

  const house = game.house ? HOUSES[game.house] : null
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--accent', house ? house.accent : '#e6c25a')
    root.style.setProperty('--accent-soft', house ? house.accentSoft : 'rgba(230,194,90,0.18)')
    root.style.setProperty('--trim', house ? house.trim : '#e6c25a')
  }, [house])

  return (
    <>
      <div className="app-screen relative min-h-dvh">
        <div className="stars" />
        <div className="stars2" />
        <div className="relative z-10">
          {screen === 'home' && (
            <Home
              game={game}
              setGame={setGame}
              onPlay={(book) => { setBookPick(book); setScreen('quiz') }}
            />
          )}
          {screen === 'quiz' && (
            <Quiz
              game={game}
              setGame={setGame}
              book={bookPick}
              onHome={() => setScreen('home')}
            />
          )}
        </div>
      </div>
      {game.cards >= FROG_CARDS.length && <Certificate game={game} />}
    </>
  )
}
