export interface Document {
  id: number
  title: string
  file_name: string
  file_type: string
  file_size: number
  category: CategoryType
  description: string
  extracted_text: string
  date_of_document: string | null
  created_at: string
  updated_at: string
}

export type CategoryType =
  | 'project'
  | 'skill'
  | 'certification'
  | 'internship'
  | 'achievement'
  | 'academics'
  | 'other'

export interface Relationship {
  id: number
  source_document_id: number
  target_document_id: number
  relationship_type: string
  description: string
  created_at: string
}

export interface SearchResult {
  document: Document
  score: number
  matched_content: string
}

export interface TimelineItem {
  year: number
  title: string
  category: string
  document_id: number
  description: string
}

export const CATEGORIES: { value: CategoryType; label: string }[] = [
  { value: 'project', label: 'Projects' },
  { value: 'skill', label: 'Skills' },
  { value: 'certification', label: 'Certifications' },
  { value: 'internship', label: 'Internships' },
  { value: 'achievement', label: 'Achievements' },
  { value: 'academics', label: 'Academics' },
  { value: 'other', label: 'Other' },
]

export const CATEGORY_COLORS: Record<CategoryType, string> = {
  project: 'bg-blue-100 text-blue-800',
  skill: 'bg-green-100 text-green-800',
  certification: 'bg-purple-100 text-purple-800',
  internship: 'bg-orange-100 text-orange-800',
  achievement: 'bg-yellow-100 text-yellow-800',
  academics: 'bg-pink-100 text-pink-800',
  other: 'bg-gray-100 text-gray-800',
}
