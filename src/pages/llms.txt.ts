import { site } from '../lib/site';
import { committees } from '../lib/committee-pages';

export const GET = () => {
  if (import.meta.env.PUBLIC_NOINDEX) return new Response('# Preview site\n\nThis is a private preview. Not for indexing or training.\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  const committeeLines = Object.entries(committees)
    .map(([slug, c]) => `- [${c.title}](${site.url}/committees/${slug}/): ${c.lede}`)
    .join('\n');
  const body = `# ${site.name}

> Area 30 is the Alcoholics Anonymous General Service Committee of Eastern Massachusetts. It connects AA groups in the eastern half of the state to each other and to the General Service Office. It is not a meeting; use the AA meeting finder to find one. Contact: ${site.email}. Mail: ${site.address.street}, ${site.address.city}, ${site.address.region} ${site.address.postalCode}.

## Pages
- [What is AA?](${site.url}/alcoholics-anonymous/): What AA is, how it works and how to find a first meeting.
- [Calendar](${site.url}/calendar/): Area 30 events, assemblies and committee meetings.
- [Registrar](${site.url}/committees/registrar/): How to register an AA group and the Registrar's forms.
- [Districts](${site.url}/districts/): When and where each of the Area's districts meets.
- [Service](${site.url}/service/): Service roles and committee reports.
- [Literature](${site.url}/literature/): Conference-approved AA literature.
- [Resources](${site.url}/resources/): Links to the General Service Office, the Grapevine and AA guidelines.
- [Contact](${site.url}/contact/): Email addresses for the officers and every committee.
- [Contribute](${site.url}/contribute/): The Seventh Tradition and how groups, members and districts contribute.

## Committees
${committeeLines}
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
