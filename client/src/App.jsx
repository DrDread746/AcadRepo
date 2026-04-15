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

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Navbar />
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/faculty" element={<Faculty />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/research" element={<Research />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
