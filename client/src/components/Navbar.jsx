import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [announcements, setAnnouncements] = useState([])
  const location = useLocation()
  const user = JSON.parse(localStorage.getItem('user'))
  const token = localStorage.getItem('token')

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', roles: ['student', 'faculty', 'admin'] },
    { name: 'Faculty', path: '/faculty', roles: ['faculty', 'admin'] },
    { name: 'Admin', path: '/admin', roles: ['admin'] },
    { name: 'Research', path: '/research', roles: ['student', 'faculty', 'admin'] },
    { name: 'Profile', path: '/profile', roles: ['student', 'faculty', 'admin'] },
  ]

  const filteredNavItems = navItems.filter(item => 
    user && item.roles.includes(user.role)
  )

  useEffect(() => {
    if (user) {
      fetchAnnouncements()
    }
  }, [user])

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/admin/announcements')
      const data = await response.json()
      setAnnouncements(data.slice(0, 5))
    } catch (error) {
      console.error('Error fetching announcements:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/'
  }

  return (
    <>
      <nav className="bg-surface border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              {user && (
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="text-muted hover:text-text p-2 rounded-lg hover:bg-background transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
              <Link to="/" className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg font-bold">A</span>
                </div>
                <span className="text-xl font-bold text-text">AcadRepo</span>
              </Link>
            </div>
            
            {user ? (
              <div className="flex items-center gap-4">
                {/* Search Link */}
                <Link
                  to="/search"
                  className="text-muted hover:text-text p-2 rounded-lg hover:bg-background transition-colors"
                  title="Search"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </Link>
                
                {/* Notification Button with Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setNotificationOpen(!notificationOpen)}
                    className="text-muted hover:text-text p-2 rounded-lg hover:bg-background transition-colors relative"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {announcements.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {announcements.length}
                      </span>
                    )}
                  </button>
                  
                  {/* Notification Dropdown */}
                  {notificationOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-surface border border-border rounded-xl shadow-lg animate-fade-in">
                      <div className="p-4 border-b border-border">
                        <h3 className="text-lg font-bold text-text">Notifications</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {announcements.length === 0 ? (
                          <div className="p-4 text-muted text-center">No notifications</div>
                        ) : (
                          announcements.map((announcement) => (
                            <div key={announcement.id} className="p-4 border-b border-border hover:bg-background transition-colors">
                              <h4 className="text-text font-medium mb-1">{announcement.title}</h4>
                              <p className="text-muted text-sm line-clamp-2">{announcement.content}</p>
                              <p className="text-border text-xs mt-2">Posted by {announcement.created_by_name}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Desktop Navigation */}
                <div className="hidden lg:flex items-center gap-1">
                  {filteredNavItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        location.pathname === item.path
                          ? 'bg-primary text-white'
                          : 'text-muted hover:text-text hover:bg-background'
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
                
                <Link to="/profile">
                  <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center hover:bg-primary-hover transition-colors">
                    <span className="text-white font-semibold">{user.name.charAt(0).toUpperCase()}</span>
                  </div>
                </Link>
              </div>
            ) : (
              <div className="flex gap-3">
                <Link to="/login" className="text-muted hover:text-text px-5 py-2 rounded-lg hover:bg-background font-medium transition-colors">
                  Login
                </Link>
                <Link to="/register" className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-lg font-medium transition-colors">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden animate-fade-in">
          <div 
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed left-0 top-0 h-full w-72 bg-surface border-r border-border animate-slide-up">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg font-bold">A</span>
                </div>
                <span className="text-xl font-bold text-text">AcadRepo</span>
              </div>
              <nav className="space-y-2">
                <Link
                  to="/search"
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                    location.pathname === '/search'
                      ? 'bg-primary text-white'
                      : 'text-muted hover:text-text hover:bg-background'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="font-medium">Search</span>
                </Link>
                {filteredNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                      location.pathname === item.path
                        ? 'bg-primary text-white'
                        : 'text-muted hover:text-text hover:bg-background'
                    }`}
                  >
                    <span className="font-medium">{item.name}</span>
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg text-muted hover:text-text hover:bg-background font-medium transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="font-medium">Logout</span>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
