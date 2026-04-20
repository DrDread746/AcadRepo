import { useState, useEffect } from 'react'

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user'))
  const [stats, setStats] = useState({ totalResources: 0, totalDownloads: 0, recentUploads: 0 })
  const [resources, setResources] = useState([])
  const [subjects, setSubjects] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [analytics, setAnalytics] = useState({ mostDownloaded: [], recentUploads: [] })
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSemester, setSelectedSemester] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [loading, setLoading] = useState(true)
  const [previewResource, setPreviewResource] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportResource, setReportResource] = useState(null)
  const [reportForm, setReportForm] = useState({ issue_type: 'broken_link', description: '' })
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchStats()
    fetchResources()
    fetchSubjects()
    fetchAnnouncements()
    fetchAnalytics()
  }, [])

  useEffect(() => {
    fetchResources()
  }, [searchTerm, selectedSemester, selectedSubject, selectedType])

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
      const params = new URLSearchParams()
      if (selectedSubject) params.append('subject_id', selectedSubject)
      if (selectedType) params.append('type', selectedType)
      params.append('verified', 'true')

      const response = await fetch(`http://localhost:5001/api/resources?${params}`)
      const data = await response.json()
      
      let filtered = data
      if (searchTerm) {
        filtered = filtered.filter(r => 
          r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.subject_name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }
      setResources(filtered)
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

  const handleDownload = (resource) => {
    const url = resource.file_path ? `http://localhost:5001${resource.file_path}` : resource.file_url
    window.open(url, '_blank')
  }

  const handlePreview = (resource) => {
    setPreviewResource(resource)
    setShowPreview(true)
  }

  const getPreviewUrl = (resource) => {
    if (resource.file_path) {
      return `http://localhost:5001${resource.file_path}`
    }
    return resource.file_url
  }

  const handleReport = (resource) => {
    setReportResource(resource)
    setReportForm({ issue_type: 'broken_link', description: '' })
    setShowReportModal(true)
  }

  const submitReport = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:5001/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          resource_id: reportResource.id,
          issue_type: reportForm.issue_type,
          description: reportForm.description
        })
      })

      if (response.ok) {
        alert('Report submitted successfully!')
        setShowReportModal(false)
        setReportResource(null)
        setReportForm({ issue_type: 'broken_link', description: '' })
      } else {
        const data = await response.json()
        alert('Error: ' + data.error)
      }
    } catch (error) {
      console.error('Report error:', error)
      alert('Report submission failed')
    }
  }

  const semesters = [...new Set(subjects.map(s => s.semester))].sort((a, b) => a - b)

  return (
    <div className="min-h-screen px-4 py-8 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-gray-600 mb-6">
          <a href="/" className="hover:text-primary">Home</a>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-800">Dashboard</span>
        </nav>

        {/* Welcome Message */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">Here's what's happening with your resources today.</p>
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

        {/* Search and Filters */}
        <div className="bg-surface p-6 rounded border border-gray-200 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:border-primary"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
            </div>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:border-primary"
            >
              <option value="">All Semesters</option>
              {semesters.map(sem => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:border-primary"
            >
              <option value="">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>{subject.name} ({subject.code})</option>
              ))}
            </select>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:border-primary"
            >
              <option value="">All Types</option>
              <option value="PYQ">PYQ</option>
              <option value="notes">Notes</option>
              <option value="book">Book</option>
            </select>
          </div>
        </div>

        {/* Resource List */}
        <div className="bg-surface p-6 rounded border border-gray-200 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">📖</span>
            Available Resources
          </h2>
          
          {loading ? (
            <div className="text-gray-600 text-center py-8">Loading resources...</div>
          ) : resources.length === 0 ? (
            <div className="text-gray-600 text-center py-8">No resources found</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.map(resource => (
                <div key={resource.id} className="bg-white p-4 rounded border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-base font-semibold text-gray-800 line-clamp-2 flex-1">{resource.title}</h3>
                    {resource.verified && (
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded ml-2">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600 text-sm">
                      <span className="w-20 text-gray-500">Subject:</span>
                      <span className="text-gray-800 font-medium">{resource.subject_name}</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <span className="w-20 text-gray-500">Type:</span>
                      <span className="text-gray-800 font-medium capitalize">{resource.type}</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <span className="w-20 text-gray-500">Downloads:</span>
                      <span className="text-gray-800 font-medium">{resource.downloads_count}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePreview(resource)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-3 rounded text-sm font-medium"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => handleDownload(resource)}
                      className="flex-1 bg-primary hover:bg-primary-hover text-white py-2 px-3 rounded text-sm font-medium"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleReport(resource)}
                      className="bg-red-100 hover:bg-red-200 text-red-600 py-2 px-3 rounded text-sm"
                      title="Report Issue"
                    >
                      ⚠️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Announcements Section */}
        {announcements.length > 0 && (
          <div className="bg-surface p-6 rounded border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📢</span>
              Announcements
            </h2>
            <div className="space-y-3">
              {announcements.map(announcement => (
                <div key={announcement.id} className="bg-white p-4 rounded border border-gray-200">
                  <h3 className="text-base font-semibold text-gray-800 mb-2">{announcement.title}</h3>
                  <p className="text-gray-600 mb-2 text-sm">{announcement.content}</p>
                  <p className="text-gray-500 text-xs">Posted by {announcement.created_by_name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PDF Preview Modal */}
        {showPreview && previewResource && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 truncate flex-1">{previewResource.title}</h3>
                <button
                  onClick={() => {
                    setShowPreview(false)
                    setPreviewResource(null)
                  }}
                  className="ml-4 text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <iframe
                  src={getPreviewUrl(previewResource)}
                  className="w-full h-full"
                  title="PDF Preview"
                />
              </div>
            </div>
          </div>
        )}

        {/* Report Modal */}
        {showReportModal && reportResource && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Report Resource</h3>
                <button
                  onClick={() => {
                    setShowReportModal(false)
                    setReportResource(null)
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <form onSubmit={submitReport} className="p-4 space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Resource</label>
                  <div className="text-gray-800 font-medium">{reportResource.title}</div>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Issue Type</label>
                  <select
                    value={reportForm.issue_type}
                    onChange={(e) => setReportForm({...reportForm, issue_type: e.target.value})}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:border-primary"
                  >
                    <option value="broken_link">Broken Link</option>
                    <option value="inaccurate">Inaccurate Content</option>
                    <option value="inappropriate">Inappropriate Content</option>
                    <option value="copyright">Copyright Issue</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Description</label>
                  <textarea
                    value={reportForm.description}
                    onChange={(e) => setReportForm({...reportForm, description: e.target.value})}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:border-primary h-24"
                    placeholder="Please provide more details about the issue..."
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded font-medium"
                  >
                    Submit Report
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowReportModal(false)
                      setReportResource(null)
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
