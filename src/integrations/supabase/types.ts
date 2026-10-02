export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {

      l1_assignment_submissions: {
        Row: {
          assignment_id: string
          feedback: string | null
          id: string
          reviewed_at: string | null
          reviewer_id: string | null
          score: number | null
          status: string
          student_id: string
          submission_text: string | null
          submission_url: string | null
          submitted_at: string
          updated_at: string
        }
        Insert: {
          assignment_id: string
          feedback?: string | null
          id?: string
          reviewed_at?: string | null
          reviewer_id?: string | null
          score?: number | null
          status?: string
          student_id: string
          submission_text?: string | null
          submission_url?: string | null
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          assignment_id?: string
          feedback?: string | null
          id?: string
          reviewed_at?: string | null
          reviewer_id?: string | null
          score?: number | null
          status?: string
          student_id?: string
          submission_text?: string | null
          submission_url?: string | null
          submitted_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "l1_assignment_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "l1_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "l1_assignment_submissions_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "l1_assignment_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      l1_assignments: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          instructions: string | null
          is_active: boolean
          is_required: boolean
          module_id: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          instructions?: string | null
          is_active?: boolean
          is_required?: boolean
          module_id: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          instructions?: string | null
          is_active?: boolean
          is_required?: boolean
          module_id?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "l1_assignments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "l1_assignments_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "l1_course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      l1_course_lessons: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          is_active: boolean
          lesson_type: string
          module_id: string
          resource_url: string | null
          sort_order: number
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean
          lesson_type?: string
          module_id: string
          resource_url?: string | null
          sort_order?: number
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean
          lesson_type?: string
          module_id?: string
          resource_url?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "l1_course_lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "l1_course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      l1_course_modules: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "l1_course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "l1_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      l1_courses: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "l1_courses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_lesson_progress: {
        Row: {
          completed_at: string | null
          lesson_id: string
          started_at: string | null
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          lesson_id: string
          started_at?: string | null
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          lesson_id?: string
          started_at?: string | null
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "l1_course_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_lesson_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      career_assessments: {
        Row: {
          assessment_type: string
          created_at: string
          gaps: Json
          id: string
          recommendations: Json
          score: number | null
          strengths: Json
          student_id: string
        }
        Insert: {
          assessment_type: string
          created_at?: string
          gaps?: Json
          id?: string
          recommendations?: Json
          score?: number | null
          strengths?: Json
          student_id: string
        }
        Update: {
          assessment_type?: string
          created_at?: string
          gaps?: Json
          id?: string
          recommendations?: Json
          score?: number | null
          strengths?: Json
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "career_assessments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string | null
          canonical_url: string | null
          category: string | null
          content: string
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          noindex: boolean
          og_image_url: string | null
          published_at: string | null
          search_vector: string | null
          seo_description: string | null
          seo_keywords: string[]
          seo_title: string | null
          slug: string
          status: string
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          canonical_url?: string | null
          category?: string | null
          content?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          noindex?: boolean
          og_image_url?: string | null
          published_at?: string | null
          search_vector?: string | null
          seo_description?: string | null
          seo_keywords?: string[]
          seo_title?: string | null
          slug: string
          status?: string
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          canonical_url?: string | null
          category?: string | null
          content?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          noindex?: boolean
          og_image_url?: string | null
          published_at?: string | null
          search_vector?: string | null
          seo_description?: string | null
          seo_keywords?: string[]
          seo_title?: string | null
          slug?: string
          status?: string
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      foundation_resources: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          is_required: boolean
          minimum_membership: Database["public"]["Enums"]["membership_level"]
          resource_type: string
          resource_url: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_required?: boolean
          minimum_membership?: Database["public"]["Enums"]["membership_level"]
          resource_type?: string
          resource_url: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_required?: boolean
          minimum_membership?: Database["public"]["Enums"]["membership_level"]
          resource_type?: string
          resource_url?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "foundation_resources_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_resource_progress: {
        Row: {
          completed_at: string | null
          resource_id: string
          started_at: string | null
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          resource_id: string
          started_at?: string | null
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          resource_id?: string
          started_at?: string | null
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_resource_progress_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "foundation_resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_resource_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      l1_assessment_answers: {
        Row: {
          attempt_id: string
          created_at: string
          id: string
          question_id: string
          selected_option: string | null
        }
        Insert: {
          attempt_id: string
          created_at?: string
          id?: string
          question_id: string
          selected_option?: string | null
        }
        Update: {
          attempt_id?: string
          created_at?: string
          id?: string
          question_id?: string
          selected_option?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "l1_assessment_answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "l1_assessment_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "l1_assessment_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "l1_assessment_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      l1_assessment_attempts: {
        Row: {
          created_at: string
          id: string
          passed: boolean | null
          score: number | null
          started_at: string
          status: string
          student_id: string
          submitted_at: string | null
          total_questions: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          passed?: boolean | null
          score?: number | null
          started_at?: string
          status?: string
          student_id: string
          submitted_at?: string | null
          total_questions?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          passed?: boolean | null
          score?: number | null
          started_at?: string
          status?: string
          student_id?: string
          submitted_at?: string | null
          total_questions?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "l1_assessment_attempts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      l1_assessment_questions: {
        Row: {
          category: string
          correct_option: string
          created_at: string
          created_by: string | null
          explanation: string | null
          id: string
          is_active: boolean
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question_text: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          category: string
          correct_option: string
          created_at?: string
          created_by?: string | null
          explanation?: string | null
          id?: string
          is_active?: boolean
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question_text: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          category?: string
          correct_option?: string
          created_at?: string
          created_by?: string | null
          explanation?: string | null
          id?: string
          is_active?: boolean
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          question_text?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "l1_assessment_questions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      career_skill_gaps: {
        Row: {
          assessment_id: string | null
          created_at: string
          domain: string
          evidence: string | null
          id: string
          last_assessed_at: string
          recommendation: string | null
          score: number | null
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          assessment_id?: string | null
          created_at?: string
          domain: string
          evidence?: string | null
          id?: string
          last_assessed_at?: string
          recommendation?: string | null
          score?: number | null
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          assessment_id?: string | null
          created_at?: string
          domain?: string
          evidence?: string | null
          id?: string
          last_assessed_at?: string
          recommendation?: string | null
          score?: number | null
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "career_skill_gaps_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "career_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "career_skill_gaps_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      career_profiles: {
        Row: {
          career_goal: string | null
          created_at: string
          current_company: string | null
          current_job_role: string | null
          experience_years: number | null
          id: string
          notice_period_days: number | null
          preferred_locations: string[]
          primary_skills: string[]
          resume_url: string | null
          student_id: string
          target_compensation: number | null
          target_role: string | null
          updated_at: string
        }
        Insert: {
          career_goal?: string | null
          created_at?: string
          current_company?: string | null
          current_job_role?: string | null
          experience_years?: number | null
          id?: string
          notice_period_days?: number | null
          preferred_locations?: string[]
          primary_skills?: string[]
          resume_url?: string | null
          student_id: string
          target_compensation?: number | null
          target_role?: string | null
          updated_at?: string
        }
        Update: {
          career_goal?: string | null
          created_at?: string
          current_company?: string | null
          current_job_role?: string | null
          experience_years?: number | null
          id?: string
          notice_period_days?: number | null
          preferred_locations?: string[]
          primary_skills?: string[]
          resume_url?: string | null
          student_id?: string
          target_compensation?: number | null
          target_role?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "career_profiles_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      career_roadmaps: {
        Row: {
          created_at: string
          description: string | null
          id: string
          start_date: string | null
          status: string
          student_id: string
          target_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          start_date?: string | null
          status?: string
          student_id: string
          target_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          start_date?: string | null
          status?: string
          student_id?: string
          target_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "career_roadmaps_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_answers: {
        Row: {
          admin_feedback: string | null
          answer: string | null
          created_at: string
          id: string
          interview_question_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          score: number | null
          student_id: string
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          admin_feedback?: string | null
          answer?: string | null
          created_at?: string
          id?: string
          interview_question_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          score?: number | null
          student_id: string
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          admin_feedback?: string | null
          answer?: string | null
          created_at?: string
          id?: string
          interview_question_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          score?: number | null
          student_id?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_answers_interview_question_id_fkey"
            columns: ["interview_question_id"]
            isOneToOne: true
            referencedRelation: "interview_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_answers_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_answers_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_questions: {
        Row: {
          category: string | null
          created_at: string
          difficulty: string | null
          id: string
          interview_id: string
          question_bank_id: string | null
          question_order: number
          question_text: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          difficulty?: string | null
          id?: string
          interview_id: string
          question_bank_id?: string | null
          question_order?: number
          question_text: string
        }
        Update: {
          category?: string | null
          created_at?: string
          difficulty?: string | null
          id?: string
          interview_id?: string
          question_bank_id?: string | null
          question_order?: number
          question_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_questions_interview_id_fkey"
            columns: ["interview_id"]
            isOneToOne: false
            referencedRelation: "interviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_questions_question_bank_id_fkey"
            columns: ["question_bank_id"]
            isOneToOne: false
            referencedRelation: "question_bank"
            referencedColumns: ["id"]
          },
        ]
      }
      interviews: {
        Row: {
          admin_notes: string | null
          company_name: string
          created_at: string
          id: string
          interview_date: string | null
          interview_round: string | null
          interview_type: string | null
          job_application_id: string | null
          job_title: string | null
          status: Database["public"]["Enums"]["interview_status"]
          student_id: string
          student_notes: string | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          company_name: string
          created_at?: string
          id?: string
          interview_date?: string | null
          interview_round?: string | null
          interview_type?: string | null
          job_application_id?: string | null
          job_title?: string | null
          status?: Database["public"]["Enums"]["interview_status"]
          student_id: string
          student_notes?: string | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          company_name?: string
          created_at?: string
          id?: string
          interview_date?: string | null
          interview_round?: string | null
          interview_type?: string | null
          job_application_id?: string | null
          job_title?: string | null
          status?: Database["public"]["Enums"]["interview_status"]
          student_id?: string
          student_notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interviews_job_application_id_fkey"
            columns: ["job_application_id"]
            isOneToOne: false
            referencedRelation: "job_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interviews_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applications: {
        Row: {
          applied_at: string | null
          created_at: string
          id: string
          job_id: string
          notes: string | null
          status: Database["public"]["Enums"]["application_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          applied_at?: string | null
          created_at?: string
          id?: string
          job_id: string
          notes?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          applied_at?: string | null
          created_at?: string
          id?: string
          job_id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          company_name: string
          created_at: string
          employment_type: string | null
          id: string
          job_title: string
          job_url: string | null
          location: string | null
          source: string | null
          updated_at: string
        }
        Insert: {
          company_name: string
          created_at?: string
          employment_type?: string | null
          id?: string
          job_title: string
          job_url?: string | null
          location?: string | null
          source?: string | null
          updated_at?: string
        }
        Update: {
          company_name?: string
          created_at?: string
          employment_type?: string | null
          id?: string
          job_title?: string
          job_url?: string | null
          location?: string | null
          source?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      masterclass_registrations: {
        Row: {
          created_at: string
          email: string
          experience_range: string
          full_name: string
          id: string
          phone: string
          roadblock: string
          session_label: string
        }
        Insert: {
          created_at?: string
          email: string
          experience_range: string
          full_name: string
          id?: string
          phone: string
          roadblock: string
          session_label?: string
        }
        Update: {
          created_at?: string
          email?: string
          experience_range?: string
          full_name?: string
          id?: string
          phone?: string
          roadblock?: string
          session_label?: string
        }
        Relationships: []
      }
      payment_events: {
        Row: { created_at:string; error_message:string|null; event_type:string; id:string; payment_id:string|null; payload:Json; processed_at:string|null; provider:string; provider_event_id:string; status:string }
        Insert: { created_at?:string; error_message?:string|null; event_type:string; id?:string; payment_id?:string|null; payload?:Json; processed_at?:string|null; provider:string; provider_event_id:string; status?:string }
        Update: { created_at?:string; error_message?:string|null; event_type?:string; id?:string; payment_id?:string|null; payload?:Json; processed_at?:string|null; provider?:string; provider_event_id?:string; status?:string }
        Relationships: [{ foreignKeyName:"payment_events_payment_id_fkey"; columns:["payment_id"]; isOneToOne:false; referencedRelation:"payments"; referencedColumns:["id"] }]
      }
      payment_products: {
        Row: { created_at:string; currency:string; description:string|null; id:string; is_active:boolean; membership_level:Database["public"]["Enums"]["membership_level"]|null; name:string; price:number; updated_at:string }
        Insert: { created_at?:string; currency?:string; description?:string|null; id?:string; is_active?:boolean; membership_level?:Database["public"]["Enums"]["membership_level"]|null; name:string; price:number; updated_at?:string }
        Update: { created_at?:string; currency?:string; description?:string|null; id?:string; is_active?:boolean; membership_level?:Database["public"]["Enums"]["membership_level"]|null; name?:string; price?:number; updated_at?:string }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          external_transaction_id: string | null
          id: string
          paid_at: string | null
          product_name: string
          product_id: string | null
          metadata: Json
          provider: string | null
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          external_transaction_id?: string | null
          id?: string
          paid_at?: string | null
          product_name: string
          product_id?: string | null
          metadata?: Json
          provider?: string | null
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          external_transaction_id?: string | null
          id?: string
          paid_at?: string | null
          product_name?: string
          product_id?: string | null
          metadata?: Json
          provider?: string | null
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      question_bank: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          difficulty: string | null
          evaluation_points: Json
          expected_answer: string | null
          id: string
          is_active: boolean
          question: string
          technology: string | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string | null
          difficulty?: string | null
          evaluation_points?: Json
          expected_answer?: string | null
          id?: string
          is_active?: boolean
          question: string
          technology?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          difficulty?: string | null
          evaluation_points?: Json
          expected_answer?: string | null
          id?: string
          is_active?: boolean
          question?: string
          technology?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_bank_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      roadmap_items: {
        Row: {
          category: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          roadmap_id: string
          sort_order: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          roadmap_id: string
          sort_order?: number
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          roadmap_id?: string
          sort_order?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "roadmap_items_roadmap_id_fkey"
            columns: ["roadmap_id"]
            isOneToOne: false
            referencedRelation: "career_roadmaps"
            referencedColumns: ["id"]
          },
        ]
      }
      student_memberships: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          is_active: boolean
          level: Database["public"]["Enums"]["membership_level"]
          note: string | null
          student_id: string
          updated_at: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          is_active?: boolean
          level?: Database["public"]["Enums"]["membership_level"]
          note?: string | null
          student_id: string
          updated_at?: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          is_active?: boolean
          level?: Database["public"]["Enums"]["membership_level"]
          note?: string | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_memberships_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_memberships_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_l1_assessment_questions: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          question_text: string
          category: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          explanation: string | null
          sort_order: number
          is_active: boolean
        }[]
      }

      record_payment_event: {
        Args: { p_event_type: string; p_payload: Json; p_payment_id?: string | null; p_provider: string; p_provider_event_id: string }
        Returns: string
      }
      search_blog_posts: {
        Args: {
          p_limit?: number
          p_query?: string
        }
        Returns: {
          canonical_url: string | null
          category: string | null
          cover_image_url: string | null
          excerpt: string | null
          id: string
          noindex: boolean
          og_image_url: string | null
          published_at: string | null
          relevance: number
          seo_description: string | null
          seo_title: string | null
          slug: string
          tags: string[]
          title: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      get_my_career_os: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      update_my_roadmap_item_status: {
        Args: {
          p_item_id: string
          p_status: string
        }
        Returns: boolean
      }
      submit_l1_assessment: {
        Args: {
          p_attempt_id: string
        }
        Returns: Database["public"]["Tables"]["l1_assessment_attempts"]["Row"]
      }
      get_l1_assessment_category_results: {
        Args: {
          p_attempt_id: string
        }
        Returns: {
          category: string
          total_questions: number
          correct_answers: number
          score: number
        }[]
      }
    }
    Enums: {
      membership_level: "free" | "l0" | "l1" | "l2" | "l3" | "l4"
      app_role: "student" | "admin"
      application_status:
        | "saved"
        | "applied"
        | "screening"
        | "interview"
        | "offer"
        | "rejected"
        | "withdrawn"
      interview_status:
        | "planned"
        | "in_progress"
        | "submitted"
        | "reviewed"
        | "completed"
        | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      membership_level: ["free", "l0", "l1", "l2", "l3", "l4"],
      app_role: ["student", "admin"],
      application_status: [
        "saved",
        "applied",
        "screening",
        "interview",
        "offer",
        "rejected",
        "withdrawn",
      ],
      interview_status: [
        "planned",
        "in_progress",
        "submitted",
        "reviewed",
        "completed",
        "cancelled",
      ],
    },
  },
} as const
