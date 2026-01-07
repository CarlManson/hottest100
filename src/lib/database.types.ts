export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      songs: {
        Row: {
          id: string
          title: string
          artist: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          artist: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          artist?: string
          created_at?: string
        }
      }
      family_members: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      votes: {
        Row: {
          id: string
          family_member_id: string
          song_id: string
          rank: number
          created_at: string
        }
        Insert: {
          id?: string
          family_member_id: string
          song_id: string
          rank: number
          created_at?: string
        }
        Update: {
          id?: string
          family_member_id?: string
          song_id?: string
          rank?: number
          created_at?: string
        }
      }
      countdown_results: {
        Row: {
          id: string
          song_id: string
          position: number
          type: 'hottest100' | 'hottest200'
          created_at: string
        }
        Insert: {
          id?: string
          song_id: string
          position: number
          type: 'hottest100' | 'hottest200'
          created_at?: string
        }
        Update: {
          id?: string
          song_id?: string
          position?: number
          type?: 'hottest100' | 'hottest200'
          created_at?: string
        }
      }
    }
  }
}
