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

  return (
    <div className="min-h-screen px-4 py-8 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-gray-600 mb-6">
          <a href="/" className="hover:text-primary">Home</a>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-900">Search</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Search Resources
          </h1>
          <p className="text-gray-600">Find resources by title, subject, branch, semester, or type.</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-8">
          <div className="grid md:grid-cols-5 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-primary"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
            </div>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-primary"
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
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-primary"
            >
              <option value="">All Semesters</option>
              {semesters.map(sem => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-primary"
            >
              <option value="">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>{subject.name} ({subject.code})</option>
              ))}
            </select>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-primary"
            >
              <option value="">All Types</option>
              <option value="PYQ">PYQ</option>
              <option value="notes">Notes</option>
              <option value="book">Book</option>
            </select>
          </div>
          <button
            onClick={clearFilters}
            className="mt-4 text-sm text-gray-600 hover:text-primary underline"
          >
            Clear all filters
          </button>
        </div>

        {/* Results */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">📖</span>
            Search Results
            {resources.length > 0 && (
              <span className="text-sm font-normal text-gray-600">({resources.length} found)</span>
            )}
          </h2>
          
          {!searchTerm && !selectedBranch && !selectedSemester && !selectedSubject && !selectedType ? (
            <div className="text-gray-600 text-center py-8">
              Enter search terms or select filters to find resources
            </div>
          ) : loading ? (
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
            <div className="text-gray-600 text-center py-8">No resources found matching your criteria</div>
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
                      onClick={() => handleDownload(resource)}
                      className="flex-1 bg-primary hover:bg-primary-hover text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleReport(resource)}
                      className="bg-red-100 hover:bg-red-200 text-red-600 py-2 px-3 rounded-lg text-sm transition-colors"
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
