import { Link } from 'react-router-dom'

export default function Welcome() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="max-w-5xl w-full text-center">
        <div className="mb-12">
          <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-4xl font-bold">A</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Welcome to AcadRepo
          </h1>
          <p className="text-xl text-gray-600">Your Academic Resource Repository</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-surface p-6 rounded border border-gray-200">
            <div className="w-12 h-12 bg-primary rounded flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📚</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Study Materials</h3>
            <p className="text-gray-600">Access PYQs, notes, and books from verified sources</p>
          </div>
          <div className="bg-surface p-6 rounded border border-gray-200">
            <div className="w-12 h-12 bg-primary rounded flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Easy Search</h3>
            <p className="text-gray-600">Find resources quickly with smart filters</p>
          </div>
          <div className="bg-surface p-6 rounded border border-gray-200">
            <div className="w-12 h-12 bg-primary rounded flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👥</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Community</h3>
            <p className="text-gray-600">Share resources and collaborate with peers</p>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Link 
            to="/register" 
            className="bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-8 rounded"
          >
            Get Started
          </Link>
          <Link 
            to="/login" 
            className="bg-surface border border-gray-200 hover:bg-gray-100 text-gray-800 font-semibold py-3 px-8 rounded"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}
