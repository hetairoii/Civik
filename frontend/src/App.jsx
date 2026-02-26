import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext'
import { Navbar } from './components/Navbar'
import { Home } from './pages/Home'
import { ComplaintForm } from './pages/ComplaintForm';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AdminDashboard } from './pages/AdminDashboard';
import { Cases } from './pages/Cases';
import { CaseDetails } from './pages/CaseDetails';
import { Profile } from './pages/Profile';
import { VerifyEmail } from './pages/VerifyEmail';
import { ForgotPassword, ResetPassword } from './pages/ForgotPassword';
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
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Register />} />              
              <Route path="/admin" element={<AdminDashboard />} /> 
              <Route path="/casos" element={<Cases />} />
              <Route path="/casos/:id" element={<CaseDetails />} />
              <Route path="/perfil" element={<Profile />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
