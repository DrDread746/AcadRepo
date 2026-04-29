import { useState, useEffect } from 'react'
import { useToast } from '../context/ToastContext'
import Skeleton from './Skeleton'

export default function Search() {
  const { success, error } = useToast()
  const [resources, setResources] = useState([])
  const [subjects, setSubjects] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBranch, setSelectedBranch] = useState('')
  const [selectedSemester, setSelectedSemester] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [loading, setLoading] = useState(false)
  const [previewResource, setPreviewResource] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportResource, setReportResource] = useState(null)
  const [reportForm, setReportForm] = useState({ issue_type: 'broken_link', description: '' })
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchSubjects()
  }, [selectedBranch])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm || selectedBranch || selectedSemester || selectedSubject || selectedType) {
        fetchResources()
      }
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm, selectedBranch, selectedSemester, selectedSubject, selectedType])

  // Reset semester when branch changes
  useEffect(() => {
    setSelectedSemester('')
    setSelectedSubject('')
  }, [selectedBranch])

  // Reset subject when semester changes
  useEffect(() => {
    setSelectedSubject('')
  }, [selectedSemester])

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
      const params = new URLSearchParams()
      if (selectedBranch) params.append('branch', selectedBranch)
      const response = await fetch(`http://localhost:5001/api/resources/subjects?${params}`)
      const data = await response.json()
      setSubjects(data)
    } catch (error) {
      console.error('Error fetching subjects:', error)
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
        success('Report submitted successfully!')
        setShowReportModal(false)
        setReportResource(null)
        setReportForm({ issue_type: 'broken_link', description: '' })
      } else {
        const data = await response.json()
        error('Error: ' + data.error)
      }
    } catch (error) {
      console.error('Report error:', error)
      error('Report submission failed')
    }
  }

  const semesters = [...new Set(subjects.map(s => s.semester))].sort((a, b) => a - b)

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedBranch('')
    setSelectedSemester('')
    setSelectedSubject('')
    setSelectedType('')
    setResources([])
  }

  // Get unique semesters from filtered subjects
  const availableSemesters = [...new Set(subjects.map(s => s.semester))].sort((a, b) => a - b)

  // Filter subjects based on selected branch and semester
  const filteredSubjects = subjects.filter(subject => {
    if (selectedBranch && subject.branch !== selectedBranch) return false
    if (selectedSemester && subject.semester !== parseInt(selectedSemester)) return false
    return true
  })

  return (
    <div className="min-h-screen px-4 py-8 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-muted mb-6">
          <a href="/" className="hover:text-primary">Home</a>
          <span className="mx-2 text-border">/</span>
          <span className="text-text">Search</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">
            Search Resources
          </h1>
          <p className="text-muted">Find resources by title, subject, branch, semester, or type.</p>
        </div>

        {/* Search Bar */}
        <div className="bg-surface p-6 rounded-xl shadow-lg border border-border mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search resources by title or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-5 py-3 pl-12 bg-background border border-border rounded-xl text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted text-lg">🔍</span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-surface p-6 rounded-xl shadow-lg border border-border mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text">Filters</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-primary hover:text-primary-hover font-medium transition-colors"
            >
              Clear all
            </button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-2">Branch</label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="">All Branches</option>
                <option value="CS">CS</option>
                <option value="IT">IT</option>
                <option value="ECE">Electronics and Telecommunications</option>
                <option value="EEE">Electronics</option>
                <option value="EE">Electrical</option>
                <option value="CE">Civil</option>
                <option value="ME">Mechanical</option>
                <option value="TE">Textile</option>
                <option value="PE">Production</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-2">Semester</label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                disabled={!selectedBranch}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">All Semesters</option>
                {availableSemesters.map(sem => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-2">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                disabled={!selectedBranch || !selectedSemester}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">All Subjects</option>
                {filteredSubjects.map(subject => (
                  <option key={subject.id} value={subject.id}>{subject.name} ({subject.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-2">Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="">All Types</option>
                <option value="PYQ">PYQ</option>
                <option value="notes">Notes</option>
                <option value="book">Book</option>
              </select>
            </div>
          </div>

          {/* Active Filters */}
          {(selectedBranch || selectedSemester || selectedSubject || selectedType) && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex flex-wrap gap-2">
                {selectedBranch && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/20 text-primary rounded-full text-sm font-medium">
                    Branch: {selectedBranch}
                    <button
                      onClick={() => setSelectedBranch('')}
                      className="hover:text-primary-hover ml-1"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {selectedSemester && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/20 text-primary rounded-full text-sm font-medium">
                    Semester: {selectedSemester}
                    <button
                      onClick={() => setSelectedSemester('')}
                      className="hover:text-primary-hover ml-1"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {selectedSubject && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/20 text-primary rounded-full text-sm font-medium">
                    Subject: {subjects.find(s => s.id === selectedSubject)?.name}
                    <button
                      onClick={() => setSelectedSubject('')}
                      className="hover:text-primary-hover ml-1"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {selectedType && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/20 text-primary rounded-full text-sm font-medium">
                    Type: {selectedType}
                    <button
                      onClick={() => setSelectedType('')}
                      className="hover:text-primary-hover ml-1"
                    >
                      ✕
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="bg-surface p-6 rounded-xl shadow-lg border border-border">
          <h2 className="text-2xl font-bold text-text mb-4 flex items-center gap-2">
            <span className="text-2xl">📖</span>
            Search Results
            {resources.length > 0 && (
              <span className="text-sm font-normal text-muted">({resources.length} found)</span>
            )}
          </h2>
          
          {!searchTerm && !selectedBranch && !selectedSemester && !selectedSubject && !selectedType ? (
            <div className="text-muted text-center py-8">
              Enter search terms or select filters to find resources
            </div>
          ) : loading ? (
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
            <div className="text-muted text-center py-8">No resources found matching your criteria</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map(resource => (
                <div key={resource.id} className="bg-background p-5 rounded-xl border border-border hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <span className="px-2 py-1 bg-primary/20 text-primary text-xs font-medium rounded">
                      {resource.type}
                    </span>
                    <span className="text-muted text-xs">
                      {new Date(resource.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-text mb-2 line-clamp-2">
                    {resource.title}
                  </h3>
                  <p className="text-muted text-sm mb-3">
                    {resource.subject_name} ({resource.subject_code})
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted text-sm">
                      <span>📥</span>
                      <span>{resource.downloads_count}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePreview(resource)}
                        className="text-primary hover:text-primary-hover text-sm font-medium"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => handleDownload(resource)}
                        className="text-primary hover:text-primary-hover text-sm font-medium"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => handleReport(resource)}
                        className="text-muted hover:text-primary text-sm"
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

        {/* PDF Preview Modal */}
        {showPreview && previewResource && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 truncate flex-1">{previewResource.title}</h3>
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
                <h3 className="text-lg font-semibold text-gray-900">Report Resource</h3>
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
                  <div className="text-gray-900 font-medium">{reportResource.title}</div>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Issue Type</label>
                  <select
                    value={reportForm.issue_type}
                    onChange={(e) => setReportForm({...reportForm, issue_type: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-primary"
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
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-primary h-24"
                    placeholder="Please provide more details about the issue..."
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium"
                  >
                    Submit Report
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowReportModal(false)
                      setReportResource(null)
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 py-2 px-4 rounded-lg font-medium"
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
