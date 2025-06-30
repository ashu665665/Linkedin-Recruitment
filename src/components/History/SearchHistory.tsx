import React, { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getUserSearches } from '../../services/database'
import { SearchWithProfiles } from '../../types/database'
import { Calendar, Users, Tag, ExternalLink, Search } from 'lucide-react'

interface SearchHistoryProps {
  onSelectSearch?: (search: SearchWithProfiles) => void
}

export const SearchHistory: React.FC<SearchHistoryProps> = ({ onSelectSearch }) => {
  const { user } = useAuth()
  const [searches, setSearches] = useState<SearchWithProfiles[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      loadSearchHistory()
    }
  }, [user])

  const loadSearchHistory = async () => {
    try {
      setLoading(true)
      const data = await getUserSearches(user!.id)
      setSearches(data as SearchWithProfiles[])
    } catch (err: any) {
      setError(err.message || 'Failed to load search history')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const truncateText = (text: string, maxLength: number = 100) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
        <button
          onClick={loadSearchHistory}
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Try again
        </button>
      </div>
    )
  }

  if (searches.length === 0) {
    return (
      <div className="text-center py-12">
        <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No search history yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Start by searching for candidates to see your history here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Search History
      </h2>

      <div className="grid gap-4">
        {searches.map((search) => (
          <div
            key={search.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onSelectSearch?.(search)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {search.input_type === 'linkedin_url' ? 'LinkedIn Job' : 'Job Description'}
                  </span>
                  <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(search.created_at)}</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {truncateText(search.input_text)}
                </p>
              </div>
              
              <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                <Users className="h-4 w-4" />
                <span>{search.total_profiles_found}</span>
              </div>
            </div>

            {/* Generated Tags */}
            {search.generated_tags && search.generated_tags.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Tag className="h-4 w-4 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Tags:
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {search.generated_tags.slice(0, 5).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                    >
                      {tag}
                    </span>
                  ))}
                  {search.generated_tags.length > 5 && (
                    <span className="text-xs text-gray-400">
                      +{search.generated_tags.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Sample Profiles */}
            {search.linkedin_profiles && search.linkedin_profiles.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Sample profiles:
                </div>
                <div className="space-y-2">
                  {search.linkedin_profiles.slice(0, 3).map((profile) => (
                    <div key={profile.id} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {profile.profile_name || 'LinkedIn Profile'}
                      </span>
                      <a
                        href={profile.profile_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  ))}
                  {search.linkedin_profiles.length > 3 && (
                    <div className="text-xs text-gray-400">
                      +{search.linkedin_profiles.length - 3} more profiles
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}