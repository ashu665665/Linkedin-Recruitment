import { supabase } from '../lib/supabase'
import { Database } from '../types/database'

type Search = Database['public']['Tables']['searches']['Row']
type SearchInsert = Database['public']['Tables']['searches']['Insert']
type LinkedInProfileInsert = Database['public']['Tables']['linkedin_profiles']['Insert']

export const saveSearch = async (searchData: SearchInsert): Promise<Search | null> => {
  try {
    const { data, error } = await supabase
      .from('searches')
      .insert(searchData)
      .select()
      .single()

    if (error) {
      console.error('Error saving search:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in saveSearch:', error)
    throw error
  }
}

export const saveLinkedInProfiles = async (
  searchId: string,
  profileUrls: Array<{ url: string; name: string }>
): Promise<void> => {
  try {
    // Create LinkedIn profiles data with direct search_id reference
    const profilesData: LinkedInProfileInsert[] = profileUrls.map((result, index) => ({
      profile_url: result.url,
      profile_name: result.name,
      search_id: searchId,
      position_in_results: index + 1
    }))

    const { error: profilesError } = await supabase
      .from('linkedin_profiles')
      .insert(profilesData)

    if (profilesError) {
      console.error('Error saving LinkedIn profiles:', profilesError)
      throw profilesError
    }

    // Update search with total profiles found
    const { error: updateError } = await supabase
      .from('searches')
      .update({ total_profiles_found: profileUrls.length })
      .eq('id', searchId)

    if (updateError) {
      console.error('Error updating search profile count:', updateError)
      throw updateError
    }

  } catch (error) {
    console.error('Error in saveLinkedInProfiles:', error)
    throw error
  }
}

export const getUserSearches = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('searches')
      .select(`
        *,
        linkedin_profiles (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user searches:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in getUserSearches:', error)
    throw error
  }
}

export const getSearchById = async (searchId: string) => {
  try {
    const { data, error } = await supabase
      .from('searches')
      .select(`
        *,
        linkedin_profiles (*)
      `)
      .eq('id', searchId)
      .single()

    if (error) {
      console.error('Error fetching search by ID:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in getSearchById:', error)
    throw error
  }
}