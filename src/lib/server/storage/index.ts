import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { resolve, basename, extname } from 'node:path';
import { randomUUID } from 'node:crypto';

const allowed = new Map([['image/jpeg',['.jpg','.jpeg']],['image/png',['.png']],['image/webp',['.webp']]]);
export class UploadError extends Error {}
function root(){ return resolve(process.env.UPLOAD_DIR??'./data/uploads'); }
function safePath(key:string){ if(!/^[a-f0-9-]+\.(jpg|jpeg|png|webp)$/i.test(key)||basename(key)!==key) throw new UploadError('Invalid media key.'); return resolve(root(),key); }
function validMagic(bytes:Uint8Array,type:string){if(type==='image/jpeg')return bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff;if(type==='image/png')return bytes.slice(0,8).every((v,i)=>v===[137,80,78,71,13,10,26,10][i]);if(type==='image/webp')return String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP';return false;}
export const localStorage = {
  async save(file:File){
    if(!file.size)throw new UploadError('Choose a non-empty image.'); const max=Number(process.env.MAX_UPLOAD_MB??20)*1024*1024;if(file.size>max)throw new UploadError(`Images must be ${process.env.MAX_UPLOAD_MB??20} MB or smaller.`);
    const extensions=allowed.get(file.type); const extension=extname(file.name).toLowerCase();if(!extensions||!extensions.includes(extension))throw new UploadError('Use a JPEG, PNG, or WebP image.');
    const bytes=new Uint8Array(await file.arrayBuffer());if(!validMagic(bytes,file.type))throw new UploadError('The file contents do not match the image type.');
    const key=`${randomUUID()}${extension}`;await mkdir(root(),{recursive:true});await writeFile(safePath(key),bytes,{flag:'wx'});return {key,url:this.getURL(key)};
  },
  async delete(key:string){try{await unlink(safePath(key));}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;}},
  async read(key:string){return readFile(safePath(key));},
  getURL(key:string){return `/media/${encodeURIComponent(key)}`;}
};
export type StorageAdapter=typeof localStorage;
