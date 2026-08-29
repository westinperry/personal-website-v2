import { aboutContent } from '$lib/server/repositories/public'; export async function load(){return {about:await aboutContent()};}
