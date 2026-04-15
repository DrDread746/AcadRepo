import { useState, useEffect } from 'react'

export default function Research() {
  const [papers, setPapers] = useState([])
  const [searchTerm, setSearchTerm] = useState('computer science')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchPapers()
  }, [])

  const fetchPapers = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `http://localhost:5001/api/research?q=${encodeURIComponent(searchTerm)}`
      )
      const data = await response.json()
      setPapers(data)
    } catch (error) {
      console.error('Error fetching papers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchPapers()
  }

  return (
    <div className="min-h-screen px-4 py-8 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-gray-600 mb-6">
          <a href="/" className="hover:text-primary">Home</a>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-800">Research Papers</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Research Papers
          </h1>
          <p className="text-gray-600">Explore the latest academic research from arXiv.</p>
        </div>

        {/* Search */}
        <div className="bg-surface p-6 rounded border border-gray-200 mb-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search research papers..."
                className="w-full px-4 py-2 pl-10 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:border-primary"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
            </div>
            <button
              type="submit"
              className="bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-6 rounded"
            >
              Search
            </button>
          </form>
        </div>

        {/* Papers List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-gray-600 text-center py-8">Loading papers...</div>
          ) : papers.length === 0 ? (
            <div className="text-gray-600 text-center py-8">No papers found</div>
          ) : (
            papers.map((paper, index) => (
              <div key={index} className="bg-white p-6 rounded border border-gray-200">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary rounded flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">📄</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{paper.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">
                      Authors: {paper.authors.join(', ')}
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4 text-sm line-clamp-3">{paper.summary}</p>
                <div className="flex items-center justify-end">
                  <a
                    href={paper.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary hover:bg-primary-hover text-white py-2 px-4 rounded text-sm font-medium"
                  >
                    View →
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
