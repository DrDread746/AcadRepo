import { useState, useEffect } from 'react'
import { useToast } from '../context/ToastContext'
import Skeleton from './Skeleton'

export default function Dashboard() {
  const { success, error } = useToast()
  const user = JSON.parse(localStorage.getItem('user'))
  const [stats, setStats] = useState({ totalResources: 0, totalDownloads: 0, recentUploads: 0 })
  const [resources, setResources] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [analytics, setAnalytics] = useState({ mostDownloaded: [], recentUploads: [] })
  const [loading, setLoading] = useState(true)
  const [previewResource, setPreviewResource] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportResource, setReportResource] = useState(null)
  const [reportForm, setReportForm] = useState({ issue_type: 'broken_link', description: '' })
  const [userReceipts, setUserReceipts] = useState([])
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchStats()
    fetchResources()
    fetchAnnouncements()
    fetchAnalytics()
    if (token) {
      fetchUserReceipts()
    }
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/resources/stats')
      const data = await response.json()
      setStats(data)
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/resources/analytics')
      const data = await response.json()
      setAnalytics(data)
    } catch (err) {
      console.error('Error fetching analytics:', err)
    }
  }

  const fetchResources = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:5001/api/resources?verified=true')
      const data = await response.json()
      setResources(data)
    } catch (err) {
      console.error('Error fetching resources:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/admin/announcements')
      const data = await response.json()
      setAnnouncements(data)
    } catch (err) {
      console.error('Error fetching announcements:', err)
    }
  }

  const fetchUserReceipts = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/receipts/my-receipts', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setUserReceipts(data)
      }
    } catch (err) {
      console.error('Error retrieving user purchase logs:', err)
    }
  }

  // Modified tracking download handler method to ensure real-time analytics aggregation increments cleanly
  const handleDownload = async (resource) => {
    try {
      const response = await fetch(`http://localhost:5001/api/resources/${resource.id}/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        // Direct download execution using structured server response payload strings
        window.open(data.downloadUrl, '_blank');
        
        // Refresh structural metrics state counters synchronously across dashboards layout
        fetchStats();
        fetchAnalytics();
        fetchResources();
      } else {
        error(data.error || 'Download tracking event failed registration parameters');
      }
    } catch (err) {
      console.error('Download interaction engine failure context error:', err);
      error('Could not fulfill file download routing safely');
    }
  }

  const downloadExistingReceiptPdf = (receiptId) => {
    window.open(`http://localhost:5001/api/receipts/${receiptId}/pdf`, '_blank')
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
        success('Report submitted successfully!')
        setShowReportModal(false)
        setReportResource(null)
        setReportForm({ issue_type: 'broken_link', description: '' })
      } else {
        const data = await response.json()
        error('Error: ' + data.error)
      }
    } catch (err) {
      console.error('Report error:', err)
      error('Report submission failed')
    }
  }

  return (
    <div className="min-h-screen px-4 py-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <nav className="text-muted mb-6">
          <a href="/" className="hover:text-primary">Home</a>
          <span className="mx-2 text-border">/</span>
          <span className="text-text">Dashboard</span>
        </nav>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-text mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-muted">Here's what's happening with your resources today.</p>
        </div>

        <div className="bg-surface p-6 rounded-xl shadow-lg border border-border mb-8">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search resources..."
                className="w-full px-4 py-3 pl-10 bg-background border border-border rounded-lg text-text focus:outline-none focus:border-primary transition-colors"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    window.location.href = '/search'
                  }
                }}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">🔍</span>
            </div>
            <a
              href="/search"
              className="bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Advanced Search
            </a>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-surface p-6 rounded-xl shadow-lg border border-border hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-xl">📚</span>
              </div>
              <div className="text-4xl font-bold text-text">
                {stats.totalResources}
              </div>
            </div>
            <div className="text-muted font-medium">Total Resources</div>
          </div>
          <div className="bg-surface p-6 rounded-xl shadow-lg border border-border hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-xl">📥</span>
              </div>
              <div className="text-4xl font-bold text-text">
                {stats.totalDownloads}
              </div>
            </div>
            <div className="text-muted font-medium">Total Downloads</div>
          </div>
          <div className="bg-surface p-6 rounded-xl shadow-lg border border-border hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-xl">🆕</span>
              </div>
              <div className="text-4xl font-bold text-text">
                {stats.recentUploads}
              </div>
            </div>
            <div className="text-muted font-medium">Recent Uploads (7 days)</div>
          </div>
        </div>

        {userReceipts.length > 0 && (
          <div className="bg-surface p-6 rounded-xl shadow-lg border border-border mb-8">
            <h2 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
              <span>🧾</span> My Active Book Purchases & PDF Receipts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userReceipts.map((rec) => (
                <div key={rec.id} className="p-4 bg-background border border-border rounded-lg flex justify-between items-center">
                  <div className="truncate pr-2">
                    <p className="text-sm font-semibold text-text truncate">{rec.book_title}</p>
                    <p className="font-mono text-xs text-primary mt-1">{rec.receipt_number}</p>
                  </div>
                  <button
                    onClick={() => downloadExistingReceiptPdf(rec.id)}
                    className="shrink-0 bg-primary/20 hover:bg-primary/30 border border-primary text-primary px-3 py-1.5 rounded text-xs font-semibold transition"
                  >
                    PDF Receipt
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-surface p-6 rounded-xl shadow-lg border border-border">
            <h3 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
              <span className="text-xl">🔥</span>
              Most Downloaded
            </h3>
            <div className="space-y-3">
              {analytics.mostDownloaded.slice(0, 5).map((resource, index) => (
                <div key={resource.id} className="flex items-center gap-3 p-3 rounded-lg bg-background hover:bg-surface transition-colors">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-text font-medium truncate text-sm">{resource.title}</div>
                    <div className="text-muted text-xs">{resource.downloads_count} downloads</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-surface p-6 rounded-xl shadow-lg border border-border">
            <h3 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
              <span className="text-xl">📤</span>
              Recently Uploaded
            </h3>
            <div className="space-y-3">
              {analytics.recentUploads.slice(0, 5).map((resource) => (
                <div key={resource.id} className="flex items-center gap-3 p-3 rounded-lg bg-background hover:bg-surface transition-colors">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
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

        <div className="bg-surface p-6 rounded-xl shadow-lg border border-border mb-8">
          <h2 className="text-2xl font-bold text-text mb-4 flex items-center gap-2">
            <span className="text-2xl">📖</span>
            Available Resources
          </h2>
          
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-background p-5 rounded-xl border border-border">
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
            <div className="text-muted text-center py-8">No resources found</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map(resource => (
                <div key={resource.id} className="bg-background p-5 rounded-xl border border-border hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-base font-semibold text-text line-clamp-2 flex-1">{resource.title}</h3>
                    {resource.verified && (
                      <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded ml-2">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-muted text-sm">
                      <span className="w-20 text-border">Subject:</span>
                      <span className="text-text font-medium">{resource.subject_name}</span>
                    </div>
                    <div className="flex items-center text-muted text-sm">
                      <span className="w-20 text-border">Type:</span>
                      <span className="text-text font-medium capitalize">{resource.type}</span>
                    </div>
                    <div className="flex items-center text-muted text-sm">
                      <span className="w-20 text-border">Downloads:</span>
                      <span className="text-text font-medium">{resource.downloads_count}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePreview(resource)}
                        className="flex-1 bg-surface hover:bg-border text-text py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => handleDownload(resource)}
                        className="flex-1 bg-primary hover:bg-primary-hover text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => handleReport(resource)}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 px-3 rounded-lg text-sm transition-colors"
                        title="Report Issue"
                      >
                        ⚠️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {announcements.length > 0 && (
          <div className="bg-surface p-6 rounded border border-border">
            <h2 className="text-2xl font-bold text-text mb-4 flex items-center gap-2">
              <span className="text-2xl">📢</span>
              Announcements
            </h2>
            <div className="space-y-3">
              {announcements.map(announcement => (
                <div key={announcement.id} className="bg-background p-4 rounded border border-border">
                  <h3 className="text-base font-semibold text-text mb-2">{announcement.title}</h3>
                  <p className="text-muted mb-2 text-sm">{announcement.content}</p>
                  <p className="text-border text-xs">Posted by {announcement.created_by_name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {showPreview && previewResource && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="text-lg font-semibold text-text truncate flex-1">{previewResource.title}</h3>
                <button
                  onClick={() => {
                    setShowPreview(false)
                    setPreviewResource(null)
                  }}
                  className="ml-4 text-muted hover:text-text text-2xl"
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