import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Navbar from './components/Navbar'
import Welcome from './components/Welcome'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import Faculty from './components/Faculty'
import Admin from './components/Admin'
import Research from './components/Research'
import Profile from './components/Profile'
import Search from './components/Search'
import { ToastProvider } from './context/ToastContext'
import { ConfirmProvider } from './context/ConfirmContext'

function App() {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Navbar />
            <Routes>
              <Route path="/" element={<Welcome />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/search" element={<Search />} />
              <Route path="/faculty" element={<Faculty />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/research" element={<Research />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </div>
        </Router>
      </ConfirmProvider>
    </ToastProvider>
  )
}

export default App
