// The search index for the "Explore events" window. One static file, fetched only when the window is opened.
// Repeating events share one description, so descriptions are stored once in a table and events point to them.
import { getAllEvents } from '../../lib/all-events';

export async function GET() {
  const table: string[] = [];
  const seen = new Map<string, number>();
  const events = (await getAllEvents()).map(({ slug, description, categories, ...e }) => {
    const slim: Record<string, unknown> = { ...e };
    if (description) {
      let i = seen.get(description);
      if (i === undefined) seen.set(description, (i = table.push(description) - 1));
      slim.di = i;
    }
    if (categories.length) slim.categories = categories;
    for (const k of Object.keys(slim)) if (slim[k] === undefined || slim[k] === '' || slim[k] === false) delete slim[k];
    return slim;
  });
  return new Response(JSON.stringify({ descriptions: table, events }), { headers: { 'Content-Type': 'application/json' } });
}
