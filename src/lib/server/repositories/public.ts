import type { RowDataPacket } from 'mysql2';
import { rows } from '$lib/server/db';
import type { LogEntry, NowContent, Photo, Settings } from '$lib/server/models';

export async function publicPhotos(limit?: number, order: 'ASC' | 'DESC' = 'DESC'): Promise<Photo[]> {
  const cap = limit ? ` LIMIT ${Math.max(1, Math.floor(limit))}` : '';
  return rows<RowDataPacket & Photo>(`SELECT p.id,p.storage_key,p.mime_type,p.width,p.height,p.display_date,p.caption,p.note,p.place,p.album_id,p.alt_text,a.name album_name FROM photos p LEFT JOIN albums a ON a.id=p.album_id WHERE p.visibility='public' ORDER BY COALESCE(p.sort_order,2147483647),COALESCE(p.display_date,p.created_at) ${order},p.id ${order}${cap}`);
}
export async function publicPhoto(id: number): Promise<Photo | null> {
  const found = await rows<RowDataPacket & Photo>(`SELECT p.id,p.storage_key,p.mime_type,p.width,p.height,p.display_date,p.caption,p.note,p.place,p.album_id,p.alt_text,a.name album_name FROM photos p LEFT JOIN albums a ON a.id=p.album_id WHERE p.id=? AND p.visibility='public'`, [id]);
  return found[0] ?? null;
}
export async function publicLogs(limit?: number): Promise<LogEntry[]> {
  const cap = limit ? ` LIMIT ${Math.max(1, Math.floor(limit))}` : '';
  return rows<RowDataPacket & LogEntry>(`SELECT l.id,l.event_date,l.title,l.description,l.related_url,l.photo_id,p.storage_key photo_key FROM log_entries l LEFT JOIN photos p ON p.id=l.photo_id AND p.visibility='public' WHERE l.visibility='public' ORDER BY l.event_date DESC,l.id DESC${cap}`);
}
export async function nowContent(): Promise<NowContent> {
  const found = await rows<RowDataPacket & NowContent>('SELECT working_on,learning,lately,updated_at FROM now_content WHERE id=1');
  return found[0];
}
export async function siteSettings(): Promise<Settings> {
  const found = await rows<RowDataPacket & Settings>(`SELECT s.hero_photo_id,h.storage_key hero_key,h.alt_text hero_alt,s.hero_headline,s.hero_copy,s.footer_text,s.footer_contact,s.photo_hero_id,ph.storage_key photo_hero_key,ph.alt_text photo_hero_alt FROM site_settings s LEFT JOIN photos h ON h.id=s.hero_photo_id AND h.visibility='public' LEFT JOIN photos ph ON ph.id=s.photo_hero_id AND ph.visibility='public' WHERE s.id=1`);
  return found[0];
}
export async function aboutContent() {
  const [content, links] = await Promise.all([
    rows<RowDataPacket & { intro:string; extended_text:string|null; portrait_photo_id:number|null; portrait_key:string|null; portrait_alt:string|null }>(`SELECT a.intro,a.extended_text,a.portrait_photo_id,p.storage_key portrait_key,p.alt_text portrait_alt FROM about_content a LEFT JOIN photos p ON p.id=a.portrait_photo_id AND p.visibility='public' WHERE a.id=1`),
    rows<RowDataPacket & { id:number; label:string; url:string }>('SELECT id,label,url FROM about_links ORDER BY sort_order,id')
  ]);
  return { ...content[0], links };
}
export async function socialLinks() {
  return rows<RowDataPacket & { id:number; label:string; url:string }>(`SELECT id,label,url FROM about_links WHERE LOWER(label) IN ('instagram','x','linkedin') ORDER BY FIELD(LOWER(label),'instagram','x','linkedin'),sort_order,id`);
}
