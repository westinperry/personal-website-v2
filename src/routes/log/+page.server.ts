import { publicLogs } from '$lib/server/repositories/public'; export async function load(){return {entries:await publicLogs()};}
