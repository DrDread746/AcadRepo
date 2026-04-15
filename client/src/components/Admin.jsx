import { useState, useEffect } from 'react'

export default function Admin() {
  const user = JSON.parse(localStorage.getItem('user'))
  const [users, setUsers] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [analytics, setAnalytics] = useState({ mostDownloaded: [], recentUploads: [] })
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false)
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: ''
  })
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchUsers()
    fetchAnnouncements()
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/resources/analytics')
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:5001/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/admin/announcements')
      const data = await response.json()
      setAnnouncements(data)
    } catch (error) {
      console.error('Error fetching announcements:', error)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const response = await fetch(`http://localhost:5001/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        alert('User deleted successfully!')
        fetchUsers()
      } else {
        alert('Failed to delete user')
      }
    } catch (error) {
      console.error('Delete user error:', error)
      alert('Failed to delete user')
    }
  }

  const handleUpdateRole = async (userId, newRole) => {
    try {
      const response = await fetch(`http://localhost:5001/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      })

      if (response.ok) {
        alert('Role updated successfully!')
        fetchUsers()
      } else {
        alert('Failed to update role')
      }
    } catch (error) {
      console.error('Update role error:', error)
      alert('Failed to update role')
    }
  }

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:5001/api/admin/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(announcementForm)
      })

      if (response.ok) {
        alert('Announcement created successfully!')
        setShowAnnouncementForm(false)
        setAnnouncementForm({ title: '', content: '' })
        fetchAnnouncements()
      } else {
        const data = await response.json()
        alert('Error: ' + data.error)
      }
    } catch (error) {
      console.error('Create announcement error:', error)
      alert('Failed to create announcement')
    }
  }

  return (
    <div className="min-h-screen px-4 py-8 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-gray-600 mb-6">
          <a href="/" className="hover:text-primary">Home</a>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-800">Admin Dashboard</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">Manage users, roles, and system announcements.</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-surface p-6 rounded border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-primary rounded flex items-center justify-center">
                <span className="text-xl">👥</span>
              </div>
              <div className="text-3xl font-bold text-gray-800">
                {users.length}
              </div>
            </div>
            <div className="text-gray-600 font-medium">Total Users</div>
          </div>
          <div className="bg-surface p-6 rounded border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-primary rounded flex items-center justify-center">
                <span className="text-xl">🎓</span>
              </div>
              <div className="text-3xl font-bold text-gray-800">
                {users.filter(u => u.role === 'student').length}
              </div>
            </div>
            <div className="text-gray-600 font-medium">Students</div>
          </div>
          <div className="bg-surface p-6 rounded border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-primary rounded flex items-center justify-center">
                <span className="text-xl">👨‍🏫</span>
              </div>
              <div className="text-3xl font-bold text-gray-800">
                {users.filter(u => u.role === 'faculty').length}
              </div>
            </div>
            <div className="text-gray-600 font-medium">Faculty</div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-surface p-6 rounded border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-xl">🔥</span>
              Most Downloaded
            </h3>
            <div className="space-y-3">
              {analytics.mostDownloaded.slice(0, 5).map((resource, index) => (
                <div key={resource.id} className="flex items-center gap-3 p-3 rounded bg-white border border-gray-200">
                  <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                    <span className="text-white font-bold text-xs">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-gray-800 font-medium truncate text-sm">{resource.title}</div>
                    <div className="text-gray-600 text-xs">{resource.downloads_count} downloads</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-surface p-6 rounded border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-xl">📤</span>
              Recently Uploaded
            </h3>
            <div className="space-y-3">
              {analytics.recentUploads.slice(0, 5).map((resource) => (
                <div key={resource.id} className="flex items-center gap-3 p-3 rounded bg-white border border-gray-200">
                  <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                    <span className="text-white text-xs">📄</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-gray-800 font-medium truncate text-sm">{resource.title}</div>
                    <div className="text-gray-600 text-xs">
                      {new Date(resource.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setShowAnnouncementForm(!showAnnouncementForm)}
          className="bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-6 rounded mb-8"
        >
          Create Announcement
        </button>

        {/* Announcement Form */}
        {showAnnouncementForm && (
          <div className="bg-surface p-6 rounded border border-gray-200 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-xl">📢</span>
              Create Announcement
            </h2>
            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Title</label>
                <input
                  type="text"
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm({...announcementForm, title: e.target.value})}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Content</label>
                <textarea
                  value={announcementForm.content}
                  onChange={(e) => setAnnouncementForm({...announcementForm, content: e.target.value})}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:border-primary h-24"
                  required
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-6 rounded"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowAnnouncementForm(false)}
                  className="bg-surface border border-gray-300 hover:bg-gray-100 text-gray-800 font-semibold py-2 px-6 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* User Management */}
        <div className="bg-surface p-6 rounded border border-gray-200 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">👥</span>
            User Management
          </h2>
          
          {loading ? (
            <div className="text-gray-600 text-center py-8">Loading users...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left text-gray-700 py-3 px-4 font-medium">Name</th>
                    <th className="text-left text-gray-700 py-3 px-4 font-medium">Email</th>
                    <th className="text-left text-gray-700 py-3 px-4 font-medium">Role</th>
                    <th className="text-left text-gray-700 py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(userItem => (
                    <tr key={userItem.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="text-gray-800 py-3 px-4 font-medium">{userItem.name}</td>
                      <td className="text-gray-600 py-3 px-4">{userItem.email}</td>
                      <td className="py-3 px-4">
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm capitalize">
                          {userItem.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-3">
                          <select
                            value={userItem.role}
                            onChange={(e) => handleUpdateRole(userItem.id, e.target.value)}
                            className="px-3 py-2 bg-white border border-gray-300 rounded text-gray-800 text-sm focus:outline-none focus:border-primary"
                          >
                            <option value="student">Student</option>
                            <option value="faculty">Faculty</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button
                            onClick={() => handleDeleteUser(userItem.id)}
                            className="bg-red-100 hover:bg-red-200 text-red-600 py-2 px-4 rounded text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Announcements List */}
        <div className="bg-surface p-6 rounded border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">📢</span>
            Recent Announcements
          </h2>
          {announcements.length === 0 ? (
            <div className="text-gray-600 text-center py-8">No announcements yet</div>
          ) : (
            <div className="space-y-3">
              {announcements.map(announcement => (
                <div key={announcement.id} className="bg-white p-4 rounded border border-gray-200">
                  <h3 className="text-base font-semibold text-gray-800 mb-2">{announcement.title}</h3>
                  <p className="text-gray-600 mb-2 text-sm">{announcement.content}</p>
                  <p className="text-gray-500 text-xs">Posted by {announcement.created_by_name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
