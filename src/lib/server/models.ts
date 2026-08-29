export type Visibility = 'public' | 'private';
export interface Photo {
  id: number; storage_key: string; original_filename?: string; mime_type: string; width: number | null;
  height: number | null; display_date: Date | string | null; caption: string | null; note: string | null;
  place: string | null; album_id: number | null; album_name?: string | null; alt_text: string | null;
  visibility?: Visibility; sort_order?: number | null; created_at?: Date | string;
}
export interface LogEntry { id: number; event_date: Date | string; title: string; description: string | null; related_url: string | null; photo_id: number | null; visibility?: Visibility; photo_key?: string | null }
export interface NowContent { working_on: string; learning: string; lately: string; updated_at: Date | string }
export interface Settings { hero_photo_id: number | null; hero_key: string | null; hero_alt: string | null; hero_headline: string; hero_copy: string; footer_text: string; footer_contact: string | null; photo_hero_id: number | null; photo_hero_key: string | null; photo_hero_alt: string | null }
