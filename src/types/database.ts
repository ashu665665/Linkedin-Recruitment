export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      searches: {
        Row: {
          id: string
          user_id: string
          input_text: string
          input_type: 'job_description' | 'linkedin_url'
          job_description: string | null
          generated_tags: string[]
          linkedin_job_id: string | null
          search_query: string | null
          total_profiles_found: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          input_text: string
          input_type: 'job_description' | 'linkedin_url'
          job_description?: string | null
          generated_tags?: string[]
          linkedin_job_id?: string | null
          search_query?: string | null
          total_profiles_found?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          input_text?: string
          input_type?: 'job_description' | 'linkedin_url'
          job_description?: string | null
          generated_tags?: string[]
          linkedin_job_id?: string | null
          search_query?: string | null
          total_profiles_found?: number
          created_at?: string
        }
      }
      linkedin_profiles: {
        Row: {
          id: string
          profile_url: string
          profile_name: string | null
          search_id: string
          position_in_results: number | null
          created_at: string
        }
        Insert: {
          id?: string
          profile_url: string
          profile_name?: string | null
          search_id: string
          position_in_results?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          profile_url?: string
          profile_name?: string | null
          search_id?: string
          position_in_results?: number | null
          created_at?: string
        }
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Search = Database['public']['Tables']['searches']['Row']
export type LinkedInProfile = Database['public']['Tables']['linkedin_profiles']['Row']

export interface SearchWithProfiles extends Search {
  linkedin_profiles: LinkedInProfile[]
}