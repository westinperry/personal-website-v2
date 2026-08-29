import { nowContent } from '$lib/server/repositories/public'; export async function load(){return {now:await nowContent()};}
