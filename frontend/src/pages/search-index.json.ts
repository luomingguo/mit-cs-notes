import { getCollection } from 'astro:content';
import { buildSearchIndex } from '@/lib/notes';

export const prerender = true;

export async function GET() {
  const index = buildSearchIndex(await getCollection('notes'));
  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
