import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext'
import { Navbar } from './components/Navbar'
import { Home } from './pages/Home'
import { ComplaintForm } from './pages/ComplaintForm';
import './App.css'

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen flex flex-col transition-colors duration-300 bg-[var(--color-brand-beige)] dark:bg-gray-900">
          <Navbar />
          <main className='flex-grow pt-16'> {/* pt-16 to offset fixed navbar */}
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/denuncia" element={<ComplaintForm />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
