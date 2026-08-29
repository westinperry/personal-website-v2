import { nowContent, publicLogs, publicPhotos, siteSettings } from '$lib/server/repositories/public';
export async function load() { const [now,photos,logs,settings]=await Promise.all([nowContent(),publicPhotos(3),publicLogs(5),siteSettings()]); return {now,photos,logs,settings}; }
