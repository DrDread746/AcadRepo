import { useState, useEffect } from 'react'
import { useToast } from '../context/ToastContext'
import { useConfirm } from '../context/ConfirmContext'
import Skeleton from './Skeleton'

export default function Admin() {
  const { success, error } = useToast()
  const { confirm } = useConfirm()
  const user = JSON.parse(localStorage.getItem('user'))
  const [users, setUsers] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [reports, setReports] = useState([])
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
    fetchReports()
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

  const fetchReports = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/reports', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setReports(data)
    } catch (error) {
      console.error('Error fetching reports:', error)
    }
  }

  const handleResolveReport = async (reportId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/reports/${reportId}/resolve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        fetchReports()
      }
    } catch (error) {
      console.error('Resolve report error:', error)
    }
  }

  const handleDismissReport = async (reportId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/reports/${reportId}/dismiss`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        fetchReports()
      }
    } catch (error) {
      console.error('Dismiss report error:', error)
    }
  }

  const handleDeleteUser = async (userId) => {
    const confirmed = await confirm('Delete User', 'Are you sure you want to delete this user?')
    if (!confirmed) return

    try {
      const response = await fetch(`http://localhost:5001/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        success('User deleted successfully!')
        fetchUsers()
      } else {
        error('Failed to delete user')
      }
    } catch (error) {
      console.error('Delete user error:', error)
      error('Failed to delete user')
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
        success('Role updated successfully!')
        fetchUsers()
      } else {
        error('Failed to update role')
      }
    } catch (error) {
      console.error('Update role error:', error)
      error('Failed to update role')
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
        success('Announcement created successfully!')
        setShowAnnouncementForm(false)
        setAnnouncementForm({ title: '', content: '' })
        fetchAnnouncements()
      } else {
        const data = await response.json()
        error('Error: ' + data.error)
      }
    } catch (error) {
      console.error('Create announcement error:', error)
      error('Failed to create announcement')
    }
  }

  return (
    <div className="min-h-screen px-4 py-8 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-muted mb-6">
          <a href="/" className="hover:text-primary">Home</a>
          <span className="mx-2 text-border">/</span>
          <span className="text-text">Admin Dashboard</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-muted">Manage users, roles, and system announcements.</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-surface p-6 rounded border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-primary rounded flex items-center justify-center">
                <span className="text-xl">👥</span>
              </div>
              <div className="text-3xl font-bold text-text">
                {users.length}
              </div>
            </div>
            <div className="text-muted font-medium">Total Users</div>
          </div>
          <div className="bg-surface p-6 rounded border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-primary rounded flex items-center justify-center">
                <span className="text-xl">🎓</span>
              </div>
              <div className="text-3xl font-bold text-text">
                {users.filter(u => u.role === 'student').length}
              </div>
            </div>
            <div className="text-muted font-medium">Students</div>
          </div>
          <div className="bg-surface p-6 rounded border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-primary rounded flex items-center justify-center">
                <span className="text-xl">👨‍🏫</span>
              </div>
              <div className="text-3xl font-bold text-text">
                {users.filter(u => u.role === 'faculty').length}
              </div>
            </div>
            <div className="text-muted font-medium">Faculty</div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-surface p-6 rounded border border-border">
            <h3 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
              <span className="text-xl">🔥</span>
              Most Downloaded
            </h3>
            <div className="space-y-3">
              {analytics.mostDownloaded.slice(0, 5).map((resource, index) => (
                <div key={resource.id} className="flex items-center gap-3 p-3 rounded bg-background border border-border">
                  <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                    <span className="text-white font-bold text-xs">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-text font-medium truncate text-sm">{resource.title}</div>
                    <div className="text-muted text-xs">{resource.downloads_count} downloads</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-surface p-6 rounded border border-border">
            <h3 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
              <span className="text-xl">📤</span>
              Recently Uploaded
            </h3>
            <div className="space-y-3">
              {analytics.recentUploads.slice(0, 5).map((resource) => (
                <div key={resource.id} className="flex items-center gap-3 p-3 rounded bg-background border border-border">
                  <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                    <span className="text-white text-xs">📄</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-text font-medium truncate text-sm">{resource.title}</div>
                    <div className="text-muted text-xs">
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
          className="bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-6 rounded-lg mb-8"
        >
          Create Announcement
        </button>

        {/* Announcement Form */}
        {showAnnouncementForm && (
          <div className="bg-surface p-6 rounded border border-border mb-8">
            <h2 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
              <span className="text-xl">📢</span>
              Create Announcement
            </h2>
            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="block text-muted mb-2 font-medium">Title</label>
                <input
                  type="text"
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm({...announcementForm, title: e.target.value})}
                  className="w-full px-4 py-2 bg-background border border-border rounded text-text focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-muted mb-2 font-medium">Content</label>
                <textarea
                  value={announcementForm.content}
                  onChange={(e) => setAnnouncementForm({...announcementForm, content: e.target.value})}
                  className="w-full px-4 py-2 bg-background border border-border rounded text-text focus:outline-none focus:border-primary h-24"
                  required
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-6 rounded-lg"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowAnnouncementForm(false)}
                  className="bg-surface border border-border hover:bg-background text-text font-semibold py-2 px-6 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Reports Management */}
        <div className="bg-surface p-6 rounded border border-border mb-8">
          <h2 className="text-2xl font-bold text-text mb-4 flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            Reports Management
          </h2>
          
          {reports.length === 0 ? (
            <div className="text-muted text-center py-8">No reports yet</div>
          ) : (
            <div className="space-y-3">
              {reports.map(report => (
                <div key={report.id} className="bg-background p-4 rounded border border-border">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-text mb-1">{report.resource_title}</h3>
                      <p className="text-muted text-sm mb-2">
                        <span className="font-medium">Subject:</span> {report.subject_name} | 
                        <span className="font-medium"> Issue:</span> {report.issue_type.replace('_', ' ')}
                      </p>
                      {report.description && (
                        <p className="text-muted text-sm mb-2">{report.description}</p>
                      )}
                      <p className="text-border text-xs">
                        Reported by {report.reported_by_name} on {new Date(report.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="ml-4">
                      {report.status === 'pending' && (
                        <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded">
                          Pending
                        </span>
                      )}
                      {report.status === 'resolved' && (
                        <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded">
                          Resolved
                        </span>
                      )}
                      {report.status === 'dismissed' && (
                        <span className="bg-border text-muted text-xs px-2 py-1 rounded">
                          Dismissed
                        </span>
                      )}
                    </div>
                  </div>
                  {report.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleResolveReport(report.id)}
                        className="bg-green-500/20 hover:bg-green-500/30 text-green-400 py-2 px-4 rounded text-sm font-medium"
                      >
                        Resolve
                      </button>
                      <button
                        onClick={() => handleDismissReport(report.id)}
                        className="bg-border hover:bg-surface text-muted py-2 px-4 rounded text-sm font-medium"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Management */}
        <div className="bg-surface p-6 rounded border border-border mb-8">
          <h2 className="text-2xl font-bold text-text mb-4 flex items-center gap-2">
            <span className="text-2xl">👥</span>
            User Management
          </h2>
          
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-background p-4 rounded border border-border flex items-center justify-between">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-muted py-3 px-4 font-medium">Name</th>
                    <th className="text-left text-muted py-3 px-4 font-medium">Email</th>
                    <th className="text-left text-muted py-3 px-4 font-medium">Role</th>
                    <th className="text-left text-muted py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(userItem => (
                    <tr key={userItem.id} className="border-b border-border hover:bg-background">
                      <td className="text-text py-3 px-4 font-medium">{userItem.name}</td>
                      <td className="text-muted py-3 px-4">{userItem.email}</td>
                      <td className="py-3 px-4">
                        <span className="bg-border text-muted px-3 py-1 rounded text-sm capitalize">
                          {userItem.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-3">
                          <select
                            value={userItem.role}
                            onChange={(e) => handleUpdateRole(userItem.id, e.target.value)}
                            className="px-3 py-2 bg-background border border-border rounded text-text text-sm focus:outline-none focus:border-primary"
                          >
                            <option value="student">Student</option>
                            <option value="faculty">Faculty</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button
                            onClick={() => handleDeleteUser(userItem.id)}
                            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 px-4 rounded text-sm font-medium"
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
        <div className="bg-surface p-6 rounded border border-border">
          <h2 className="text-2xl font-bold text-text mb-4 flex items-center gap-2">
            <span className="text-2xl">📢</span>
            Recent Announcements
          </h2>
          {announcements.length === 0 ? (
            <div className="text-muted text-center py-8">No announcements yet</div>
          ) : (
            <div className="space-y-3">
              {announcements.map(announcement => (
                <div key={announcement.id} className="bg-background p-4 rounded border border-border">
                  <h3 className="text-base font-semibold text-text mb-2">{announcement.title}</h3>
                  <p className="text-muted mb-2 text-sm">{announcement.content}</p>
                  <p className="text-border text-xs">Posted by {announcement.created_by_name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
