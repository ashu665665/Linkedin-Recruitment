import React, { useState } from 'react'
import { SearchForm } from '../components/Search/SearchForm'
import { SearchResults } from '../components/Search/SearchResults'
import { SearchHistory } from '../components/History/SearchHistory'
import { useAuth } from '../contexts/AuthContext'
import { generateJobTags } from '../services/groq'
import { searchLinkedInProfiles } from '../services/googleSearch'
import { scrapeLinkedInJob, extractJobIdFromUrl } from '../services/linkedinScraper'
import { saveSearch, saveLinkedInProfiles } from '../services/database'
import { SearchWithProfiles } from '../types/database'
import { History, Search as SearchIcon } from 'lucide-react'

export const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const [currentView, setCurrentView] = useState<'search' | 'history'>('search')
  const [loading, setLoading] = useState(false)
  const [currentSearch, setCurrentSearch] = useState<SearchWithProfiles | null>(null)
  const [error, setError] = useState('')

  const handleSearch = async (input: string) => {
    if (!user) return

    setLoading(true)
    setError('')
    setCurrentSearch(null)

    try {
      let jobDescription = input
      let inputType: 'job_description' | 'linkedin_url' = 'job_description'
      let linkedinJobId: string | null = null

      // Check if input is a LinkedIn URL
      if (input.includes('linkedin.com/jobs/view/')) {
        inputType = 'linkedin_url'
        linkedinJobId = extractJobIdFromUrl(input)
        
        // Scrape job description from LinkedIn
        const jobData = await scrapeLinkedInJob(linkedinJobId)
        if (jobData) {
          jobDescription = jobData.description
        }
        
      }

      // Generate tags using Groq AI
      const tags = await generateJobTags(jobDescription)

      // Search for LinkedIn profiles
      const profileUrls = await searchLinkedInProfiles(tags)


      // Save search to database
      const searchData = {
        user_id: user.id,
        input_text: input,
        input_type: inputType,
        job_description: jobDescription,
        generated_tags: tags,
        linkedin_job_id: linkedinJobId,
        search_query: `site:linkedin.com/in ${tags.map(tag => `"${tag}"`).join(' ')}`,
        total_profiles_found: profileUrls.length
      }

      const savedSearch = await saveSearch(searchData)
      if (savedSearch && profileUrls.length > 0) {
        await saveLinkedInProfiles(savedSearch.id, profileUrls)
      }

      // Fetch the complete search with profiles
      const { getSearchById } = await import('../services/database')
      const completeSearch = await getSearchById(savedSearch!.id)
      setCurrentSearch(completeSearch as SearchWithProfiles)

    } catch (err: any) {
      console.error('Search error:', err)
      setError(err.message || 'An error occurred during search')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectSearch = (search: SearchWithProfiles) => {
    setCurrentSearch(search)
    setCurrentView('search')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="flex space-x-1 mb-8">
          <button
            onClick={() => setCurrentView('search')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentView === 'search'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              <SearchIcon className="h-4 w-4" />
              <span>Search</span>
            </div>
          </button>
          <button
            onClick={() => setCurrentView('history')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentView === 'history'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              <History className="h-4 w-4" />
              <span>History</span>
            </div>
          </button>
        </div>

        {/* Content */}
        {currentView === 'search' ? (
          <div className="space-y-8">
            <SearchForm onSearch={handleSearch} loading={loading} />
            
            {error && (
              <div className="max-w-4xl mx-auto">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="text-red-800 dark:text-red-200 font-medium">
                    Search Error
                  </div>
                  <div className="text-red-600 dark:text-red-400 text-sm mt-1">
                    {error}
                  </div>
                </div>
              </div>
            )}

            {currentSearch && (
              <SearchResults search={currentSearch} />
            )}
          </div>
        ) : (
          <SearchHistory onSelectSearch={handleSelectSearch} />
        )}
      </div>
    </div>
  )
}