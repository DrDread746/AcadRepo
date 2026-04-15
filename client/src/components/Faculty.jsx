import { useState, useEffect } from 'react'

export default function Faculty() {
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
      const response = await fetch('http://localhost:5001/api/resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(uploadForm)
      })

      if (response.ok) {
        alert('Resource uploaded successfully!')
        setShowUploadForm(false)
        setUploadForm({ title: '', type: 'PYQ', subject_id: '', file_url: '', verified: false })
        fetchResources()
        fetchStats()
      } else {
        const data = await response.json()
        alert('Error: ' + data.error)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed')
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
        alert('Resource verified successfully!')
        fetchResources()
      } else {
        alert('Verification failed')
      }
    } catch (error) {
      console.error('Verify error:', error)
      alert('Verification failed')
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
          <div className="bg-surface p-6 rounded border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-primary rounded flex items-center justify-center">
                <span className="text-xl">📚</span>
              </div>
              <div className="text-3xl font-bold text-gray-800">
                {stats.totalResources}
              </div>
            </div>
            <div className="text-gray-600 font-medium">Total Resources</div>
          </div>
          <div className="bg-surface p-6 rounded border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-primary rounded flex items-center justify-center">
                <span className="text-xl">📥</span>
              </div>
              <div className="text-3xl font-bold text-gray-800">
                {stats.totalDownloads}
              </div>
            </div>
            <div className="text-gray-600 font-medium">Total Downloads</div>
          </div>
          <div className="bg-surface p-6 rounded border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-primary rounded flex items-center justify-center">
                <span className="text-xl">🆕</span>
              </div>
              <div className="text-3xl font-bold text-gray-800">
                {stats.recentUploads}
              </div>
            </div>
            <div className="text-gray-600 font-medium">Recent Uploads (7 days)</div>
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
          <div className="bg-surface p-6 rounded border border-gray-200 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
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
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Type</label>
                  <select
                    value={uploadForm.type}
                    onChange={(e) => setUploadForm({...uploadForm, type: e.target.value})}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:border-primary"
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
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:border-primary"
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
                <label className="block text-gray-700 mb-2 font-medium">File URL</label>
                <input
                  type="url"
                  value={uploadForm.file_url}
                  onChange={(e) => setUploadForm({...uploadForm, file_url: e.target.value})}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:border-primary"
                  placeholder="https://example.com/file.pdf"
                  required
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
                  className="bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-6 rounded"
                >
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  className="bg-surface border border-gray-300 hover:bg-gray-100 text-gray-800 font-semibold py-2 px-6 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

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

        {/* Resources List */}
        <div className="bg-surface p-6 rounded border border-gray-200 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">📖</span>
            Manage Resources
          </h2>
          
          {loading ? (
            <div className="text-gray-600 text-center py-8">Loading resources...</div>
          ) : (
            <div className="space-y-3">
              {resources.map(resource => (
                <div key={resource.id} className="bg-white p-4 rounded border border-gray-200 flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-gray-800">{resource.title}</h3>
                    <p className="text-gray-600 text-sm">{resource.subject_name} - {resource.type}</p>
                    <div className="flex items-center gap-3 mt-2">
                      {resource.verified && (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                          ✓ Verified
                        </span>
                      )}
                      <span className="text-gray-500 text-sm">{resource.downloads_count} downloads</span>
                    </div>
                  </div>
                  {!resource.verified && (
                    <button
                      onClick={() => handleVerify(resource.id)}
                      className="bg-green-100 hover:bg-green-200 text-green-700 py-2 px-4 rounded font-medium"
                    >
                      Verify
                    </button>
                  )}
                </div>
              ))}
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
