import React, { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'

interface SearchFormProps {
  onSearch: (input: string) => Promise<void>
  loading: boolean
}

export const SearchForm: React.FC<SearchFormProps> = ({ onSearch, loading }) => {
  const [input, setInput] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !loading) {
      await onSearch(input.trim())
    }
  }

  const isLinkedInUrl = (text: string) => {
    return text.includes('linkedin.com/jobs/view/')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-0">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
          Find Your Perfect Candidates
        </h2>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 px-4 sm:px-0">
          Paste a LinkedIn job URL or describe the role you're hiring for
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste LinkedIn job URL (e.g., https://linkedin.com/jobs/view/123456) or describe the job requirements..."
            className="w-full px-3 sm:px-4 py-3 pr-3 sm:pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-24 sm:h-32 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base"
            disabled={loading}
          />
          <div className="absolute bottom-3 right-3 hidden sm:block">
            {isLinkedInUrl(input) && (
              <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span>LinkedIn Job URL detected</span>
              </div>
            )}
          </div>
        </div>

        {/* Mobile LinkedIn URL indicator */}
        {isLinkedInUrl(input) && (
          <div className="flex items-center justify-center space-x-2 text-sm text-blue-600 dark:text-blue-400 sm:hidden">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            <span>LinkedIn Job URL detected</span>
          </div>
        )}

        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 sm:px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Searching for candidates...</span>
            </>
          ) : (
            <>
              <Search className="h-5 w-5" />
              <span>Find Candidates</span>
            </>
          )}
        </button>
      </form>

      {loading && (
        <div className="mt-6 sm:mt-8 text-center px-4">
          <div className="inline-flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 text-blue-600 dark:text-blue-400">
            <svg className="h-8 w-8 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            <div className="text-center">
              <p className="font-medium text-sm sm:text-base">Analyzing job requirements...</p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">This may take a few moments</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}