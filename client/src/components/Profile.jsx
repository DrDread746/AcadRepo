import { useState, useEffect } from 'react'

export default function Profile() {
  const user = JSON.parse(localStorage.getItem('user'))
  const [downloads, setDownloads] = useState([])
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchDownloads()
  }, [])

  const fetchDownloads = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:5001/api/auth/downloads', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setDownloads(data)
    } catch (error) {
      console.error('Error fetching downloads:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Passwords do not match')
      return
    }

    try {
      const response = await fetch('http://localhost:5001/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      })

      if (response.ok) {
        alert('Password changed successfully!')
        setShowPasswordForm(false)
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        const data = await response.json()
        alert('Error: ' + data.error)
      }
    } catch (error) {
      console.error('Password change error:', error)
      alert('Failed to change password')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen px-4 py-8 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-gray-600 mb-6">
          <a href="/" className="hover:text-primary">Home</a>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-800">Profile</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            My Profile
          </h1>
          <p className="text-gray-600">Manage your account settings and view your activity.</p>
        </div>

        {/* User Info */}
        <div className="bg-surface p-6 rounded border border-gray-200 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-xl">👤</span>
            Account Information
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-gray-600 mb-2 font-medium">Name</label>
              <div className="text-gray-800 text-lg">{user?.name}</div>
            </div>
            <div>
              <label className="block text-gray-600 mb-2 font-medium">Email</label>
              <div className="text-gray-800 text-lg">{user?.email}</div>
            </div>
            <div>
              <label className="block text-gray-600 mb-2 font-medium">Role</label>
              <div className="text-gray-800 text-lg capitalize">{user?.role}</div>
            </div>
          </div>
          
          <div className="mt-6 flex gap-4">
            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-6 rounded"
            >
              Change Password
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-100 hover:bg-red-200 text-red-600 font-semibold py-2 px-6 rounded"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Password Change Form */}
        {showPasswordForm && (
          <div className="bg-surface p-6 rounded border border-gray-200 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-xl">🔐</span>
              Change Password
            </h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2 font-medium">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-6 rounded"
                >
                  Update Password
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(false)}
                  className="bg-surface border border-gray-300 hover:bg-gray-100 text-gray-800 font-semibold py-2 px-6 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Download History */}
        <div className="bg-surface p-6 rounded border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">📥</span>
            Download History
          </h2>
          
          {loading ? (
            <div className="text-gray-600 text-center py-8">Loading downloads...</div>
          ) : downloads.length === 0 ? (
            <div className="text-gray-600 text-center py-8">No downloads yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left text-gray-700 py-3 px-4 font-medium">Title</th>
                    <th className="text-left text-gray-700 py-3 px-4 font-medium">Type</th>
                    <th className="text-left text-gray-700 py-3 px-4 font-medium">Subject</th>
                    <th className="text-left text-gray-700 py-3 px-4 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {downloads.map((download, index) => (
                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="text-gray-800 py-3 px-4 font-medium">{download.title}</td>
                      <td className="text-gray-600 py-3 px-4 capitalize">{download.type}</td>
                      <td className="text-gray-600 py-3 px-4">{download.subject_name}</td>
                      <td className="text-gray-600 py-3 px-4 text-sm">
                        {new Date(download.timestamp).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
