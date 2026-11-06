// Long-form homepage copy. DRAFT: written from AA's public descriptions of general service
// and Area 30's own site. Have the Area 30 Website Committee review before publishing.
import { site } from './site';

export const serviceSteps = [
  {
    title: 'The group',
    text: 'Every Alcoholics Anonymous group is self-supporting and runs its own affairs. Members elect a General Service Representative (GSR) to speak for the group beyond the meeting room.',
  },
  {
    title: 'The district',
    text: 'GSRs from nearby groups meet as a district. They elect a District Committee Member (DCM), who links the districts to the area.',
  },
  {
    title: 'The area',
    text: 'GSRs, DCMs, committee chairs and officers meet at area assemblies. Area 30 serves Eastern Massachusetts, and the area elects a Delegate to represent it.',
  },
  {
    title: 'The General Service Conference',
    text: 'Delegates from areas across the United States and Canada meet once a year with trustees and staff of the General Service Office and the Grapevine to consider the needs of Alcoholics Anonymous as a whole.',
  },
] as const;

export interface Faq {
  q: string;
  a: string;
  link?: { text: string; href: string };
}

export const faqs: Faq[] = [
  {
    q: 'What is Area 30?',
    a: 'Area 30 is the Alcoholics Anonymous General Service Committee of Eastern Massachusetts. It is not a meeting. It connects AA groups in the eastern half of the state to each other and to the General Service Office, and it elects the Delegate who speaks for the area at the General Service Conference. Massachusetts has two areas: Eastern Mass. (Area 30) and Western Mass. (Area 31).',
  },
  {
    q: 'How do I find an Alcoholics Anonymous meeting in Eastern Massachusetts?',
    a: 'Use the meeting finder on aa.org or the Meeting Guide app, which list meetings by location, day and time. In the Boston area, Boston Central Service also keeps a meeting list.',
    link: { text: 'Find a meeting on aa.org', href: site.links.findMeeting },
  },
  {
    q: 'Does it cost anything to attend or join AA?',
    a: 'No. There are no dues or fees for AA membership. Groups pay their own expenses through voluntary contributions from members, in keeping with the Seventh Tradition.',
  },
  {
    q: 'Who can attend an AA meeting?',
    a: 'The only requirement for AA membership is a desire to stop drinking. Closed meetings are for people who think they may have a drinking problem. Open meetings welcome anyone, including family, friends and students who want to learn about AA.',
  },
  {
    q: 'Is AA connected to a religion or any other organization?',
    a: 'No. AA is not allied with any sect, denomination, political group, organization or institution. It does not endorse or oppose any cause.',
  },
  {
    q: 'How do I register my group with Area 30?',
    a: `Complete the group registration form and email it to ${site.registrarEmail}. Being listed on the Meeting Guide app or with Boston Central Service does not register your group with Area 30 or the General Service Office.`,
    link: { text: 'Group registration form', href: site.links.registerForm },
  },
  {
    q: 'Why should my group be registered?',
    a: 'Only registered groups can contribute to Area 30 or the General Service Office, and each contribution must include the group ID number. Those contributions help carry the AA message to people in treatment, in correctional facilities and in remote communities, and to the professionals and public who meet alcoholics first.',
  },
  {
    q: 'What is a GSR, and how do I become one?',
    a: 'A General Service Representative is the person a group elects to be its link to the rest of AA. GSRs attend district meetings and area assemblies, bring information back to their group, and carry the group’s voice forward. To serve, raise it at your group’s business meeting and ask about the next election.',
  },
  {
    q: 'How can I contribute to Area 30?',
    a: 'AA members, groups and districts can all contribute under the Seventh Tradition. Contribution details are on the Contributions page.',
    link: { text: 'Contributions', href: `${site.url}/contributions` },
  },
  {
    q: 'When does the Area 30 committee meet?',
    a: `The committee meets ${site.meeting.when} at the ${site.meeting.where}. Area events, including assemblies, are listed on the calendar.`,
    link: { text: 'Area 30 calendar', href: `${site.url}/cal` },
  },
];
