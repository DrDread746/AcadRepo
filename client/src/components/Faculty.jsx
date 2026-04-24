import { useState, useEffect } from 'react'
import { useToast } from '../context/ToastContext'
import Skeleton from './Skeleton'

export default function Faculty() {
  const { success, error } = useToast()
  const user = JSON.parse(localStorage.getItem('user'))
  const [stats, setStats] = useState({ totalResources: 0, totalDownloads: 0, recentUploads: 0 })
  const [resources, setResources] = useState([])
  const [subjects, setSubjects] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [analytics, setAnalytics] = useState({ mostDownloaded: [], recentUploads: [] })
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    title: '',
    type: 'PYQ',
    subject_id: '',
    file: null,
    file_url: '',
    verified: false
  })
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: ''
  })
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchStats()
    fetchResources()
    fetchSubjects()
    fetchAnnouncements()
    fetchAnalytics()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/resources/stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/resources/analytics')
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }

  const fetchResources = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:5001/api/resources')
      const data = await response.json()
      setResources(data)
    } catch (error) {
      console.error('Error fetching resources:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubjects = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/resources/subjects')
      const data = await response.json()
      setSubjects(data)
    } catch (error) {
      console.error('Error fetching subjects:', error)
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

  const handleUpload = async (e) => {
    e.preventDefault()
    try {
      const formData = new FormData()
      formData.append('title', uploadForm.title)
      formData.append('type', uploadForm.type)
      formData.append('subject_id', uploadForm.subject_id)
      formData.append('verified', uploadForm.verified)
      
      if (uploadForm.file) {
        formData.append('file', uploadForm.file)
      } else if (uploadForm.file_url) {
        formData.append('file_url', uploadForm.file_url)
      }

      const response = await fetch('http://localhost:5001/api/resources', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
        success('Resource uploaded successfully!')
        setShowUploadForm(false)
        setUploadForm({ title: '', type: 'PYQ', subject_id: '', file: null, file_url: '', verified: false })
        fetchResources()
        fetchStats()
      } else {
        const data = await response.json()
        error('Error: ' + data.error)
      }
    } catch (error) {
      console.error('Upload error:', error)
      error('Upload failed')
    }
  }

  const handleVerify = async (resourceId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/resources/${resourceId}/verify`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        success('Resource verified successfully!')
        fetchResources()
      } else {
        error('Verification failed')
      }
    } catch (error) {
      console.error('Verify error:', error)
      error('Verification failed')
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
        <nav className="text-gray-600 mb-6">
          <a href="/" className="hover:text-primary">Home</a>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-800">Faculty Dashboard</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">Manage resources and announcements for students.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-xl">📚</span>
              </div>
              <div className="text-4xl font-bold text-gray-900">
                {stats.totalResources}
              </div>
            </div>
            <div className="text-gray-600 font-medium">Total Resources</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-xl">📥</span>
              </div>
              <div className="text-4xl font-bold text-gray-900">
                {stats.totalDownloads}
              </div>
            </div>
            <div className="text-gray-600 font-medium">Total Downloads</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-xl">🆕</span>
              </div>
              <div className="text-4xl font-bold text-gray-900">
                {stats.recentUploads}
              </div>
            </div>
            <div className="text-gray-600 font-medium">Recent Uploads (7 days)</div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-xl">🔥</span>
              Most Downloaded
            </h3>
            <div className="space-y-3">
              {analytics.mostDownloaded.slice(0, 5).map((resource, index) => (
                <div key={resource.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-gray-900 font-medium truncate text-sm">{resource.title}</div>
                    <div className="text-gray-600 text-xs">{resource.downloads_count} downloads</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-xl">📤</span>
              Recently Uploaded
            </h3>
            <div className="space-y-3">
              {analytics.recentUploads.slice(0, 5).map((resource) => (
                <div key={resource.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs">📄</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-gray-900 font-medium truncate text-sm">{resource.title}</div>
                    <div className="text-gray-600 text-xs">
                      {new Date(resource.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-6 rounded"
          >
            Upload Resource
          </button>
          <button
            onClick={() => setShowAnnouncementForm(!showAnnouncementForm)}
            className="bg-surface border border-gray-300 hover:bg-gray-100 text-gray-800 font-semibold py-2 px-6 rounded"
          >
            Create Announcement
          </button>
        </div>

        {/* Upload Form */}
        {showUploadForm && (
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-xl">📤</span>
              Upload New Resource
            </h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Title</label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-primary transition-colors"
                  required
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Type</label>
                  <select
                    value={uploadForm.type}
                    onChange={(e) => setUploadForm({...uploadForm, type: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="PYQ">PYQ</option>
                    <option value="notes">Notes</option>
                    <option value="book">Book</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Subject</label>
                  <select
                    value={uploadForm.subject_id}
                    onChange={(e) => setUploadForm({...uploadForm, subject_id: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-primary transition-colors"
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>{subject.name} ({subject.code})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Upload PDF File</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setUploadForm({...uploadForm, file: e.target.files[0], file_url: ''})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="text-center text-gray-500 text-sm">or</div>
              <div>
                <label className="block text-gray-700 mb-2 font-medium">File URL (optional)</label>
                <input
                  type="url"
                  value={uploadForm.file_url}
                  onChange={(e) => setUploadForm({...uploadForm, file_url: e.target.value, file: null})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-primary transition-colors"
                  placeholder="https://example.com/file.pdf"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="verified"
                  checked={uploadForm.verified}
                  onChange={(e) => setUploadForm({...uploadForm, verified: e.target.checked})}
                  className="mr-2 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="verified" className="text-gray-700 font-medium">Mark as verified</label>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                >
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 px-6 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Announcement Form */}
        {showAnnouncementForm && (
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
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
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-primary transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Content</label>
                <textarea
                  value={announcementForm.content}
                  onChange={(e) => setAnnouncementForm({...announcementForm, content: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-primary h-24 transition-colors"
                  required
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowAnnouncementForm(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 px-6 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Resource List */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">📖</span>
            Manage Resources
          </h2>
          
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                  <Skeleton className="h-5 w-3/4 mb-3" />
                  <div className="space-y-2 mb-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 flex-1" />
                    <Skeleton className="h-8 flex-1" />
                    <Skeleton className="h-8 w-10" />
                  </div>
                </div>
              ))}
            </div>
          ) : resources.length === 0 ? (
            <div className="text-gray-600 text-center py-8">No resources found</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map(resource => (
                <div key={resource.id} className="bg-gray-50 p-5 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-base font-semibold text-gray-900 line-clamp-2 flex-1">{resource.title}</h3>
                    {resource.verified && (
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded ml-2">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600 text-sm">
                      <span className="w-20 text-gray-500">Subject:</span>
                      <span className="text-gray-900 font-medium">{resource.subject_name}</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <span className="w-20 text-gray-500">Type:</span>
                      <span className="text-gray-900 font-medium capitalize">{resource.type}</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <span className="w-20 text-gray-500">Downloads:</span>
                      <span className="text-gray-900 font-medium">{resource.downloads_count}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePreview(resource)}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => handleVerify(resource.id)}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        resource.verified
                          ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'
                          : 'bg-green-100 hover:bg-green-200 text-green-700'
                      }`}
                    >
                      {resource.verified ? 'Unverify' : 'Verify'}
                    </button>
                    <button
                      onClick={() => handleDelete(resource.id)}
                      className="bg-red-100 hover:bg-red-200 text-red-600 py-2 px-3 rounded-lg text-sm transition-colors"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Announcements List */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">📢</span>
            Announcements
          </h2>
          <div className="space-y-4">
            {announcements.length === 0 ? (
              <div className="text-gray-600 text-center py-8">No announcements</div>
            ) : (
              announcements.map(announcement => (
                <div key={announcement.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{announcement.title}</h3>
                  <p className="text-gray-600 mb-2">{announcement.content}</p>
                  <div className="text-gray-500 text-sm">
                    Posted by {announcement.created_by_name} • {new Date(announcement.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
