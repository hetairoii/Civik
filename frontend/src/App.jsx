import { ThemeProvider } from './context/ThemeContext'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { CardsContainer } from './components/CardsContainer'
import './App.css'

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col transition-colors duration-300 bg-[var(--color-brand-beige)] dark:bg-gray-900">
        <Navbar />
        <main className='flex-grow pt-16'> {/* pt-16 to offset fixed navbar */}
            <Hero />
            <CardsContainer />
        </main>
      </div>
    </ThemeProvider>
  )
}

export default App
