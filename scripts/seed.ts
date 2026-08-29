import { copyFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { connection } from './_env.js';

const photos = [
  ['road.png','1536','1024','2026-08-26 17:20:00','Long roads and open fields.','The road was quiet all the way out past the old barn.','Honeoye Falls, NY','Summer roads','A two-lane road curving through late-summer fields.'],
  ['workshop.png','1122','1402','2026-08-23 09:10:00','Workshop light.','Morning light found every worn edge on the bench.','Mendon, NY','Around home','Hand tools on a worn workbench beside a tall window.'],
  ['lake.png','1774','887','2026-08-18 20:15:00','Evening on the lake.','The air felt cooler than it had all week, and everything looked a little clearer.','Canandaigua Lake, NY','Summer roads','A weathered dock reaches into a still lake at blue hour.'],
  ['porch.png','1254','1254','2026-08-12 14:30:00','After the rain.','An ordinary quiet afternoon after the storm passed.','Finger Lakes, NY','Around home','A wooden chair on a rain-darkened farmhouse porch.'],
  ['road.png','1536','1024','2026-08-03 18:00:00','The long way home.',null,'Livingston County, NY','Summer roads','Open fields and a country road beneath a wide sky.'],
  ['workshop.png','1122','1402','2026-07-27 08:45:00','Tools left where they were.',null,'Mendon, NY','Around home','Old hand tools resting on a workbench.'],
  ['lake.png','1774','887','2026-07-19 20:40:00','Still water.',null,'Keuka Lake, NY','Summer roads','Dark woods reflected in calm lake water.'],
  ['porch.png','1254','1254','2026-07-11 12:20:00','A place to sit.',null,'Finger Lakes, NY','Around home','A single chair on an old covered porch.'],
  ['road.png','1536','1024','2026-06-28 16:55:00','South of town.',null,'Geneseo, NY','Summer roads','A rural road descending between fields.'],
  ['workshop.png','1122','1402','2026-06-14 10:05:00','Saturday morning.',null,'Mendon, NY','Around home','Window light across an old workshop table.']
] as const;
const keys = photos.map((_,i)=>`${String(i+1).padStart(8,'0')}-0000-4000-a000-${String(i+1).padStart(12,'0')}.png`);
await mkdir(resolve(process.env.UPLOAD_DIR??'./data/uploads'),{recursive:true});
for(let i=0;i<photos.length;i++)await copyFile(resolve('static/demo',photos[i][0]),resolve(process.env.UPLOAD_DIR??'./data/uploads',keys[i]));
const db=await connection();
try{
  await db.execute(`INSERT INTO albums(name,slug,description) VALUES ('Summer roads','summer-roads','Demo album: roads, water, and nearby places.'),('Around home','around-home','Demo album: workshops and familiar places.') ON DUPLICATE KEY UPDATE name=VALUES(name),description=VALUES(description)`);
  const [albumRows]=await db.query('SELECT id,slug FROM albums');const albums=Object.fromEntries((albumRows as {id:number;slug:string}[]).map((a)=>[a.slug,a.id]));
  for(let i=0;i<photos.length;i++){const [source,w,h,date,caption,note,place,album,alt]=photos[i];await db.execute(`INSERT INTO photos(storage_key,original_filename,mime_type,width,height,display_date,caption,note,place,album_id,alt_text,visibility) VALUES(?,?,?,?,?,?,?,?,?,?,?,'public') ON DUPLICATE KEY UPDATE width=VALUES(width),height=VALUES(height),display_date=VALUES(display_date),caption=VALUES(caption),note=VALUES(note),place=VALUES(place),album_id=VALUES(album_id),alt_text=VALUES(alt_text),visibility='public'`,[keys[i],`demo-${source}`, 'image/png',Number(w),Number(h),date,caption,note,place,albums[album.toLowerCase().replaceAll(' ','-')],alt]);}
  const [ids]=await db.query('SELECT id,storage_key FROM photos WHERE storage_key IN (?)',[keys]);const byKey=Object.fromEntries((ids as {id:number;storage_key:string}[]).map((p)=>[p.storage_key,p.id]));
  await db.execute(`UPDATE now_content SET working_on=?,learning=?,lately=? WHERE id=1`,['Rebuilding this site into a lasting personal archive.\nMaking the workshop a little more useful.','More about keeping photographs organized without taking the life out of them.','Evening drives, getting outside after work, and making time for ordinary things.']);
  await db.execute(`UPDATE about_content SET intro=?,extended_text=?,portrait_photo_id=NULL WHERE id=1`,['I’m Westin. This is a quiet record of the things I’m making, the places I’ve been, and the life happening in between.','I live in western New York and tend to notice old buildings, open roads, useful objects, and the way familiar places change with the season.']);
  await db.execute(`DELETE FROM about_links WHERE label LIKE 'Demo:%' OR LOWER(label) IN ('instagram','x','linkedin')`);await db.execute(`INSERT INTO about_links(label,url,sort_order) VALUES ('Instagram','https://www.instagram.com/',1),('X','https://x.com/home',2),('LinkedIn','https://www.linkedin.com/in/westin-perry-2a9750285/',3)`);
  await db.execute(`UPDATE site_settings SET hero_photo_id=?,photo_hero_id=?,hero_headline=?,hero_copy=?,footer_text=?,footer_contact=? WHERE id=1`,[byKey[keys[0]],byKey[keys[2]],'A place for the things I make, do, and want to remember.','This is my personal site for current projects, photos, notes, and life updates.','Thanks for stopping by.',null]);
  await db.execute(`DELETE FROM log_entries WHERE title LIKE '[Demo]%'`);
  const logs=[['2026-08-24 12:00:00','[Demo] Added three photos',null,'public'],['2026-08-19 18:00:00','[Demo] Started working on the site redesign','Turning the old site into a personal archive.','public'],['2026-08-12 10:00:00','[Demo] Rochester, NY',null,'public'],['2026-08-03 16:00:00','[Demo] Took the long way home',null,'public'],['2026-07-27 09:00:00','[Demo] Cleaned up the workshop',null,'public'],['2026-07-19 20:00:00','[Demo] Evening at the lake',null,'public'],['2026-07-11 14:00:00','[Demo] Rain all afternoon',null,'public'],['2026-06-28 11:00:00','[Demo] Drove south of town',null,'public'],['2026-06-14 08:00:00','[Demo] A slow Saturday',null,'public'],['2026-06-01 08:00:00','[Demo] Private test entry','This must never appear publicly.','private']];
  for(const row of logs)await db.execute('INSERT INTO log_entries(event_date,title,description,visibility) VALUES(?,?,?,?)',row);
  console.log('Development demo data seeded (10 photos, 10 log entries, Now, About, and settings).');
}finally{await db.end();}
