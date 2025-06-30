import React from 'react'
import { ExternalLink, Tag, Calendar, Users } from 'lucide-react'
import { SearchWithProfiles } from '../../types/database'

interface SearchResultsProps {
  search: SearchWithProfiles
  onLoadMore?: () => void
  canLoadMore?: boolean
}

export const SearchResults: React.FC<SearchResultsProps> = ({ 
  search, 
  onLoadMore, 
  canLoadMore = false 
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Search Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Search Results
            </h3>
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(search.created_at)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{search.total_profiles_found} profiles found</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              {search.input_type === 'linkedin_url' ? 'LinkedIn Job' : 'Job Description'}
            </span>
          </div>
        </div>

        {/* Generated Tags */}
        {search.generated_tags && search.generated_tags.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <Tag className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Generated Tags:
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {search.generated_tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Original Input */}
        <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Original Input:
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded p-3">
            {search.input_text}
          </p>
        </div>
      </div>

      {/* LinkedIn Profiles */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            LinkedIn Profiles ({search.linkedin_profiles?.length || 0})
          </h3>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {search.linkedin_profiles && search.linkedin_profiles.length > 0 ? (
            search.linkedin_profiles
              .sort((a, b) => (a.position_in_results || 0) - (b.position_in_results || 0))
              .map((profile) => (
                <div key={profile.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium">
                          {profile.position_in_results}
                        </span>
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                          {profile.profile_name || 'LinkedIn Profile'}
                        </h4>
                      </div>
                      
                      <div className="text-xs text-gray-400">
                        Found: {formatDate(profile.created_at)}
                      </div>
                    </div>
                    
                    <a
                      href={profile.profile_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>View Profile</span>
                    </a>
                  </div>
                </div>
              ))
          ) : (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No LinkedIn profiles found for this search.
            </div>
          )}
        </div>

        {canLoadMore && onLoadMore && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onLoadMore}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              Load Next 10 Profiles
            </button>
          </div>
        )}
      </div>
    </div>
  )
}