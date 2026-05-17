import { useState, useEffect } from 'react';

export default function BookAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/receipts/analytics/books', {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          }
        });
        
        if (!response.ok) {
          const errBody = await response.json().catch(() => ({}));
          throw new Error(errBody.error || `HTTP error status returned: ${response.status}`);
        }
        
        const analyticsPayload = await response.json();
        setData(analyticsPayload);
      } catch (err) {
        console.error("Analytics fetch crash logged:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, [token]);

  // Triggers stream pipeline download flow across new tab allocation window instances
  const handleDownloadReportPdf = () => {
    if (!token) return;
    // Direct link trigger maps to your fresh backend report layout compiler stream
    window.open(`http://localhost:5001/api/receipts/analytics/download-pdf?token=${token}`, '_blank');
  };

  if (loading) return <div className="p-8 text-muted font-medium bg-background min-h-screen">Assembling inventory logs metrics matrix...</div>;
  if (error) return <div className="p-8 text-red-400 bg-background min-h-screen">Failed to construct report view: {error}</div>;
  if (!data) return null;

  const { summary, analytics } = data;

  return (
    <div className="min-h-screen px-4 py-8 bg-background text-text">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-text mb-2">SCHOLARLY BOOK DISTRIBUTION ANALYTICS</h1>
            <p className="text-muted">Comprehensive platform transactional telemetry metrics and aggregate inventory distributions statistics matrix.</p>
          </div>
          {/* Shop style receipt report compilation engine execution trigger button link wrapper */}
          <button
            onClick={handleDownloadReportPdf}
            className="self-start md:self-center bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 px-5 rounded-lg text-sm shadow flex items-center gap-2 transition-all active:scale-95"
          >
            <span>🧾</span> Download Receipt-Style PDF Report
          </button>
        </div>

        {/* Aggregate Cards Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="p-5 bg-surface border border-border rounded-xl shadow-md">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">Total Books Cataloged</span>
            <p className="text-3xl font-black mt-2 text-text">{summary.total_books}</p>
          </div>
          <div className="p-5 bg-surface border border-border rounded-xl shadow-md">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Verified Inventory Items</span>
            <p className="text-3xl font-black mt-2 text-primary">{summary.verified_books}</p>
          </div>
          <div className="p-5 bg-surface border border-border rounded-xl shadow-md">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">Receipts Transacted</span>
            <p className="text-3xl font-black mt-2 text-text">{summary.total_receipts_issued}</p>
          </div>
          <div className="p-5 bg-surface border border-border rounded-xl shadow-md">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Cumulative Gross Revenue</span>
            <p className="text-3xl font-black mt-2 text-emerald-400">${summary.total_revenue_collected.toFixed(2)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Titles Table Module */}
          <div className="p-6 bg-surface border border-border rounded-xl shadow-lg">
            <h3 className="text-lg font-bold text-text mb-4 flex items-center gap-2">🔥 Popular Textbook Titles</h3>
            <div className="space-y-4">
              {analytics.top_performing_books && analytics.top_performing_books.length === 0 ? (
                <p className="text-sm text-muted">No textbook receipt distributions issued yet.</p>
              ) : (
                analytics.top_performing_books?.map((book) => (
                  <div key={book.id} className="p-4 bg-background border border-border rounded-lg flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-semibold text-text line-clamp-1">{book.title}</h4>
                      <p className="text-xs text-muted mt-1">Course Domain: {book.subject_name}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono px-2.5 py-1 bg-primary/10 border border-primary/30 text-primary rounded-full">
                        {book.receipts_count} Orders
                      </span>
                      <p className="text-xs text-muted mt-1.5 font-medium">{book.downloads_count} Downloads</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Subject Distribution Array Tracker Module */}
          <div className="p-6 bg-surface border border-border rounded-xl shadow-lg">
            <h3 className="text-lg font-bold text-text mb-4 flex items-center gap-2">📊 Subject Distribution Mapping</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-muted">
                <thead>
                  <tr className="border-b border-border bg-background/50 text-xs uppercase text-muted font-bold">
                    <th className="py-3 px-4">Subject Track</th>
                    <th className="py-3 px-4">Code Identifier</th>
                    <th className="py-3 px-4 text-right">Volume Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {analytics.books_distribution_by_subject?.map((subject, index) => (
                    <tr key={index} className="hover:bg-background/40 transition">
                      <td className="py-3 px-4 font-semibold text-text">{subject.subject_name}</td>
                      <td className="py-3 px-4 font-mono text-xs text-primary">{subject.subject_code}</td>
                      <td className="py-3 px-4 text-right font-black text-text">{subject.book_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}