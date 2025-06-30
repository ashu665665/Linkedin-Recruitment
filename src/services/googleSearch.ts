interface GoogleSearchResult {
  title: string
  link: string
  snippet: string
}

interface GoogleSearchResponse {
  items?: GoogleSearchResult[]
}

interface LinkedInProfileResult {
  url: string
  name: string
}

export const searchLinkedInProfiles = async (tags: string[]): Promise<LinkedInProfileResult[]> => {
  const apiKey = import.meta.env.VITE_GOOGLE_SEARCH_API_KEY
  const searchEngineId = import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID

  if (!apiKey || !searchEngineId) {
    throw new Error('Google Search API credentials are missing')
  }

  try {
    // Create search query with tags
    const tagQuery = tags.map(tag => `${tag}`).join(' ')
    const query = `site:linkedin.com/in ${tagQuery}`

    const url = `https://customsearch.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${query}&num=10`
    
    const response = await fetch(url, {
      method: "GET"
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Google Search API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`)
    }

    const data: GoogleSearchResponse = await response.json()
    
    if (!data.items || data.items.length === 0) {
      return []
    }

    // Extract LinkedIn profile URLs
    const profileUrls = data.items
      .filter(item => item.link.includes('linkedin.com/in/'))
      .slice(0, 10)
      .map(item => ({
        url: item.link,
        name: extractNameFromTitle(item.title, item.link)
      }))

    return profileUrls
  } catch (error) {
    console.error('Error searching LinkedIn profiles:', error)
    throw new Error('Failed to search LinkedIn profiles. Please check your Google Search API credentials.')
  }
}

const extractNameFromTitle = (title: string, link: string): string => {
  try {
    // LinkedIn titles typically follow patterns like:
    // "John Doe - Software Engineer at Company | LinkedIn"
    // "Jane Smith | LinkedIn"
    // "Bob Johnson - CEO - Company Name | LinkedIn"
    
    // Remove " | LinkedIn" suffix if present
    let cleanTitle = title.replace(/\s*\|\s*LinkedIn\s*$/i, '').replace('...', '');
    
    // // Extract name (everything before the first " - " or use the whole string)
    // const dashIndex = cleanTitle.indexOf(' - ')
    // if (dashIndex > 0) {
    //   cleanTitle = cleanTitle.substring(0, dashIndex)
    // }
    
    // // Clean up any remaining artifacts
    // cleanTitle = cleanTitle.trim()
    
    // // If the title is too long or seems malformed, try to extract just the name part
    // if (cleanTitle.length > 50) {
    //   const words = cleanTitle.split(' ')
    //   // Take first 2-3 words as likely to be the person's name
    //   cleanTitle = words.slice(0, 3).join(' ')
    // }
    
    return cleanTitle || extractNameFromUrl(link) || 'Linkedin Profile'
  } catch (error) {
    console.error('Error extracting name from title:', error)
    return 'LinkedIn Profile'
  }
}

const extractNameFromUrl = (url: string): string | null => {
  try {
    const match = url.match(/linkedin\.com\/in\/([^/?]+)/)
    if (match && match[1]) {
      return match[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
    return null
  } catch (error) {
    return null
  }
}