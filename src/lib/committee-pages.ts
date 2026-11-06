// Committee pages mirrored from aaemass.org/committees/<slug> (Corrections lived under /districts/).
// Cleaned for the new site: duplicated or copy-pasted text removed, pandemic-era copy condensed.
import { path } from './site';
import type { MonthlySchedule } from './schedule';

export interface CommitteePage {
  title: string;
  eyebrow: string;
  email: string;
  lede: string;
  description: string;
  quote?: { text: string; by: string };
  sections: { title: string; paras?: string[]; items?: string[]; links?: { text: string; href: string }[] }[];
  seoTitle?: string;
  schedule?: MonthlySchedule;
  meeting?: { intro?: string; chips?: string[]; lines: string[]; join?: { text: string; href: string }; calendar?: boolean };
  cta: string;
  more?: { text: string; href: string };
}

export const committees: Record<string, CommitteePage> = {
  archives: {
    title: 'Archives',
    schedule: { weekday: 2, week: 3, time: '19:30' },
    eyebrow: 'Conference committee',
    email: 'archives@aaemass.org',
    lede: 'Eastern Mass. has a rich history in Alcoholics Anonymous. We preserve it so we can share it with the alcoholics who come after us.',
    description: 'The Area 30 Archives Committee collects, preserves and presents the history of AA in Eastern Massachusetts. Meets the 3rd Tuesday of the month at 7:30 PM.',
    quote: { text: 'Whenever a society or civilization perishes there is always one condition present; they forgot where they came from.', by: 'Carl Sandburg' },
    sections: [
      {
        title: 'Mission',
        paras: [
          'The mission of Alcoholics Anonymous in Area 30 Archives is to permanently document the work of Area 30 and its Districts, to make the history of the organization accessible to AA members and other researchers, and to provide a context for understanding AA’s progression, principles and traditions.',
          'The Archives Committee is charged with collecting, preserving and presenting materials of historical interest to Alcoholics Anonymous. We invite you to join us as we discover and celebrate the history of AA in Eastern Massachusetts.',
        ],
      },
      {
        title: 'Responsibilities',
        items: [
          'Sorting, filing and preserving documents already collected and held in storage',
          'Gathering and cataloging additions as they arrive',
          'Reaching out to Districts and other groups in Area 30 with news of our service work, and encouraging them to preserve their own archives',
          'Recording group and individual histories before it’s too late',
          'Sharing our archives with you, so that we can “trudge the road” together',
        ],
        paras: ['Members who have lived our history are invited to share it with us so future AAs can benefit from your experience, strength and hope. We’ll gladly make mutually agreeable arrangements to meet.'],
      },
    ],
    meeting: { lines: ['Virtually at 7:30 PM on the 3rd Tuesday of the month.', 'Come and help us keep Area 30’s history alive. All AA members are welcome.'], calendar: true },
    cta: 'To get in touch with the Archives Committee, email us and we will get back to you as soon as possible.',
  },
  cpc: {
    title: 'Cooperation with the Professional Community',
    seoTitle: 'C.P.C. Committee | Area 30 Eastern Mass. AA',
    schedule: { weekday: 4, week: 2, time: '19:00' },
    eyebrow: 'Conference committee · C.P.C.',
    email: 'cpc@aaemass.org',
    lede: 'C.P.C. is AA’s official contact with members of the professional community.',
    description: 'The Area 30 C.P.C. committee brings the AA message to health care, legal, clergy and education professionals. Meets the 2nd Thursday at 7 PM.',
    sections: [
      {
        title: 'Who we work with',
        paras: [
          'Professionals include health care professionals, mental health professionals, social workers, human resources professionals, legal professionals, corrections professionals, treatment center staff, educators, members of the clergy and police officers.',
          'Local C.P.C. committees give information about Alcoholics Anonymous to members of the community whose work brings them into regular contact with people who may suffer from alcoholism. We seek simple and effective ways to work with professionals under a policy of “cooperation, but not affiliation.”',
        ],
      },
      {
        title: 'Mission',
        paras: [
          'The committee brings the AA message to professionals and to students at professional schools, helping them understand how and why AA works. AA has always valued friends in all professional fields, and these associations have been mutually beneficial and in keeping with the Traditions.',
          'Members inform professionals and future professionals about AA: what we are, where we are, what we can do and what we cannot do.',
        ],
        links: [{ text: 'C.P.C. resources on aa.org', href: 'https://www.aa.org/Cooperation-with-the-Professional-Community' }],
      },
    ],
    meeting: { lines: ['7:00 PM on the 2nd Thursday of the month, on Zoom.', 'All AA members are welcome.'], calendar: true },
    cta: 'To get in touch with the C.P.C. Committee, email us and we will get back to you as soon as possible.',
  },
  corrections: {
    title: 'Corrections',
    schedule: { weekday: 4, week: 4, time: '19:00' },
    eyebrow: 'Conference committee',
    email: 'corrections@aaemass.org',
    lede: 'Carrying the AA message behind the walls.',
    description: 'The Area 30 Corrections Committee arranges AA meetings and literature for prisons, jails and halfway houses in Eastern Mass. Meets the 4th Thursday at 7 PM.',
    sections: [
      {
        title: 'What we do',
        paras: [
          'The Corrections Committee works with institutions throughout Eastern Massachusetts to arrange meetings, and the resources to run them, at prisons, jails and halfway houses. Meetings are chaired and run by individual AAs and AA groups. The committee also buys and distributes AA literature for members living in these institutions.',
          'Individual members or groups interested in carrying the message into these facilities can email the committee.',
        ],
      },
      {
        title: 'Prerelease Contact Program',
        paras: [
          'We help people being released from prison connect with AA members in their communities. If you would like to write to an inmate, or be on a 12-step call list to serve as a contact for someone getting out, email the committee.',
        ],
      },
      {
        title: 'Literature in Prisons (LIPS)',
        paras: [
          'LIPS posters are available to any group in Eastern Mass. that wants to collect conference-approved literature. The poster covers one side of a cardboard carton, and the filled cartons are brought to Boston Central Service for redistribution to AAs in prisons where allowed. Big Books, 12 & 12s, Grapevines and pamphlets are always in demand.',
        ],
      },
    ],
    meeting: {
      intro: 'The Joint Area 30 / Boston Central Service Correctional Facilities Committee meets on the 4th Thursday of every month at 7:00 PM on Zoom. We need your help, and all AA members are welcome.',
      lines: ['If you or your group already carries the message into a correctional facility, please come and share your experience with us.'],
      calendar: true,
    },
    cta: 'We are available for outreach at district or group events. Email the committee to get involved.',
  },
  grapevine: {
    title: 'Grapevine',
    schedule: { weekday: 3, week: 1, time: '19:00' },
    eyebrow: 'Conference committee',
    email: 'grapevine@aaemass.org',
    lede: 'The AA Grapevine is the international journal of Alcoholics Anonymous, our “meeting in print.”',
    description: 'The Area 30 Grapevine Committee shares the AA Grapevine and La Viña with groups across Eastern Massachusetts. Meets the 1st Wednesday of the month at 7:00 PM.',
    quote: { text: 'Since each issue of the Grapevine cannot go through the Conference approval process, the Conference recognizes the AA Grapevine as the international journal of Alcoholics Anonymous.', by: 'Conference Advisory Action, 1986' },
    sections: [
      {
        title: 'About the Grapevine',
        paras: [
          'Written, edited, illustrated and read by AA members and others interested in the AA program, the Grapevine is a lifeline linking one alcoholic to another. Founded in 1944, it receives no group contributions and is supported entirely by magazine subscriptions and the sale of Grapevine items.',
          'Every member has an individual way of working the program, and the magazine has always been a forum for the varied and often divergent opinions of AAs around the world. Articles are not statements of AA policy, and publication does not imply endorsement by AA or the Grapevine.',
        ],
        links: [{ text: 'Learn more about the Grapevine', href: 'https://www.aa.org/aa-grapevine-la-vina' }],
      },
      {
        title: 'Our mission',
        paras: [
          'The committee’s main goal is to let people and groups in Area 30 know all we can about the monthly Grapevine. Its 64 pages, written by AA members, have become the voice of AA today. Through it, members share their experience, strength and hope, always striving to carry the message of recovery, unity and service.',
        ],
      },
      {
        title: 'What we offer',
        paras: [
          'On request, the committee visits Districts and groups in Eastern Massachusetts to share some of the history brought forward through the Grapevine. The Preamble read at the start of AA meetings was first printed there, and the book The Language of the Heart makes a wonderful gift. Reading Grapevine stories is a great way to start a discussion in a meeting.',
          'Our “Count On Us” program provides subscriptions to the Grapevine and La Viña (the Spanish edition) for treatment and correctional facilities in every District in the Area.',
        ],
        links: [{ text: 'Grapevine on YouTube', href: 'https://www.youtube.com/channel/UCI9uFLJ__aXT3-At0PlPWUQ' }],
      },
    ],
    meeting: { lines: ['7:00 PM on the 1st Wednesday of the month, on Zoom.'], join: { text: 'Join on Zoom', href: 'http://us02web.zoom.us/j/9760763116?pwd=Ny9pK2M1czVSYms2QmJrNUoxNytaUT09' }, calendar: true },
    cta: 'To contact the Grapevine Committee with questions, or to get involved, email us.',
  },
  literature: {
    title: 'Literature',
    schedule: { weekday: 1, week: 1, time: '19:00' },
    eyebrow: 'Conference committee',
    email: 'literature@aaemass.org',
    lede: 'Letting the membership know what conference-approved literature is available.',
    description: 'The Area 30 Literature Committee reviews AA literature and helps groups order it locally. Meets the 1st Monday of the month at 7:00 PM.',
    sections: [
      {
        title: 'Mission',
        paras: [
          'The committee informs groups and district and area assembly members, through displays and other suitable methods, about all available conference-approved literature, audiovisual material and other special items. It reviews both conference-approved and local service materials, and informs the fellowship within Area 30.',
          'We use our meetings to review current conference-approved and locally developed literature, to make sure the message stays consistent with the principles of the Steps and Traditions. We answer inquiries on various topics and point to possible sources of information. Our goal is to inform members of the tools available for our own recovery and for carrying the message to others.',
        ],
        links: [
          { text: 'Literature committees on aa.org', href: 'https://www.aa.org/literature-committees' },
        ],
      },
      { title: 'Order literature locally', paras: ['To order literature locally, or for more information, email the committee.'] },
    ],
    meeting: { lines: ['7:00 PM on the 1st Monday of the month, on Zoom.', 'Zoom ID 864 3440 1757, passcode AA30.'], calendar: true },
    cta: 'To ask a question, get involved or place a local order, email the Literature Committee.',
    more: { text: 'Browse AA literature', href: '/literature' },
  },
  'public-information': {
    title: 'Public Information',
    schedule: { weekday: 4, week: 1, time: '19:00' },
    eyebrow: 'Conference committee · P.I.',
    email: 'pi@aaemass.org',
    lede: 'Carrying the message of recovery to the still-suffering alcoholic by informing the public about AA.',
    description: 'The Area 30 Public Information (P.I.) Committee gives media, schools and groups accurate information about AA. Meets the 1st Thursday at 7 PM.',
    sections: [
      {
        title: 'What is P.I. work?',
        paras: [
          'Public Information in Alcoholics Anonymous means carrying the message of recovery to the still-suffering alcoholic by informing the general public about the AA program. We do it by getting in touch with the media, schools, industry and other organizations that can report on the nature and purpose of AA and what it can do for alcoholics.',
          'The first P.I. committee in AA was formed by the General Service Board in 1956.',
        ],
      },
      {
        title: 'Mission',
        paras: [
          'This standing committee carries the message of Alcoholics Anonymous to the alcoholic who still suffers through the media and public speakers. It is the central source of information made available to the public in Eastern Mass. about AA, and it makes sure that information is correct and given within the guidelines of the Twelve Traditions.',
        ],
        links: [{ text: 'P.I. committees on aa.org', href: 'https://www.aa.org/public-information-committees' }],
      },
      {
        title: 'Our focus',
        items: [
          'Giving presentations about AA to schools and organizations',
          'Providing information about AA through digital and print materials',
          'Making sure local media have accurate information, through PSAs, anonymity-protected interviews and press kits',
        ],
      },
    ],
    meeting: { lines: ['7:00 PM on the 1st Thursday of the month, on Zoom.'], join: { text: 'Join on Zoom', href: 'http://us02web.zoom.us/j/83544411126?pwd=TEJiUFoxaU55RkE3clJndUNLSEwvQT09' }, calendar: true },
    cta: 'To contact the P.I. Committee with questions, or to get involved, email us.',
  },
  'treatment-facilities': {
    title: 'Treatment Facilities',
    schedule: { weekday: 5, week: 3, time: '19:00' },
    eyebrow: 'Conference committee',
    email: 'treatment@aaemass.org',
    lede: 'Bringing AA meetings to people in hospitals and treatment programs.',
    description: 'The Area 30 Treatment Facilities Committee coordinates AA members carrying the message into treatment settings. Meets the 3rd Friday at 7 PM.',
    sections: [
      {
        title: 'Mission',
        paras: [
          'The Treatment Facilities Committee leads and coordinates the work of AA members and groups carrying the message to people in hospital and treatment-facility programs. Examples of our 12-step work include chairing a meeting at a detox center, coordinating meetings at a treatment center and working with hospital staff to organize a meeting.',
        ],
        links: [
          { text: 'Treatment committees on aa.org', href: 'https://www.aa.org/treatment-committees' },
          { text: 'Book a commitment: Treatment Calendar', href: 'https://area30treatment.org/A30TC_Treatment_Page.html' },
        ],
      },
      {
        title: 'Purpose',
        items: [
          'Volunteers reach out to treatment facilities in their district so administrators know AA can help clients, and can help those who want to stay sober move into the fellowship outside treatment',
          'With administration approval, take AA meetings into treatment settings',
          'Encourage group and individual participation. Many groups “adopt” a facility and provide in-house meetings',
          'Coordinate with temporary contact programs such as Bridge the Gap (BTG)',
          'Work with committees such as C.P.C. to provide literature, presentations and workshops to administrators',
        ],
      },
    ],
    meeting: { lines: ['7:00 PM on the 3rd Friday of the month, on Zoom.'], join: { text: 'Join on Zoom', href: 'http://zoom.us/j/91734251285?pwd=YUdnTUJ3OEo3RittdC9FVWg1VXJZdz09' }, calendar: true },
    cta: 'If you’d like to bring AA meetings into treatment facilities, or you are a facility that wants AA meetings, email the Treatment Committee.',
  },
  accessibilities: {
    title: 'Accessibilities',
    schedule: { weekday: 1, week: 3, time: '19:30' },
    eyebrow: 'Conference committee',
    email: 'accessibilities@aaemass.org',
    lede: 'Working toward a future where everyone who wants to take part in AA in Eastern Massachusetts can.',
    description: 'The Area 30 Accessibilities Committee works to remove barriers to AA meetings and services. Meets online on the 3rd Monday of the month at 7:30 PM.',
    sections: [
      {
        title: 'Purpose',
        paras: [
          'Some alcoholics face barriers to taking part in AA for cultural, geographic, mental, physical or social reasons, among others. This committee works toward a future where everyone who wants to take part in AA meetings and other AA services in Eastern Massachusetts can do so, in a welcoming and accepting environment.',
        ],
        links: [
          { text: 'area30accessibilities.org', href: 'https://area30accessibilities.org' },
          { text: 'Accessibilities checklist (PDF)', href: path('/forms/accessibilities-checklist.pdf') },
        ],
      },
      {
        title: 'Get involved',
        paras: [
          'The committee meets monthly. You are welcome to join, or simply to attend as an interested AA member.',
          'Planning a District event or another AA event in Area 30? We would be happy to come and do outreach.',
        ],
        links: [{ text: 'Committee meeting information', href: 'https://area30accessibilities.org/committee-meetings' }],
      },
      {
        title: 'Online and phone meetings',
        paras: [
          'Not every member can or wants to attend online. Some find technology a barrier and feel left out or judged. Home groups can check in with those members with love and support, schedule phone “talk times,” or have a member adopt a non-techie member to keep them up to date.',
          'The committee’s website collects shared resources from across the fellowship, including guidance on running online and telephone meetings while protecting anonymity and safety. We cannot endorse one resource over another, and we welcome suggestions you would like us to share.',
        ],
      },
    ],
    meeting: {
      lines: ['Online at 7:30 PM on the 3rd Monday of the month.', 'To get a copy of the previous minutes and the coming agenda, or the meeting log-in, email the chair.'],
      calendar: true,
    },
    cta: 'Join the committee, attend a meeting or invite us to your event: email the Accessibilities Committee.',
  },
  messenger: {
    title: 'Messenger',
    eyebrow: 'Standing committee',
    email: 'messenger@aaemass.org',
    lede: 'The Area 30 newsletter, published for each Area Assembly.',
    description: 'The Area 30 Messenger Committee publishes the Messenger newsletter for each Area Assembly. Send submissions to messenger@aaemass.org.',
    sections: [
      {
        title: 'Mission',
        paras: [
          'The Messenger Committee is responsible for the Area 30 newsletter, The Messenger, which is published for each of the Area Assemblies and distributed through the service structure and at committee meetings.',
          'Submissions are welcome. Please email them and include your confidential contact information.',
        ],
        links: [{ text: 'Literature committees on aa.org', href: 'https://www.aa.org/literature-committees' }],
      },
    ],
    cta: 'To send a submission, ask a question or get involved, email the Messenger Committee.',
  },
  'service-seminar': {
    title: 'Service Seminar',
    eyebrow: 'Standing committee',
    email: 'serviceseminar@aaemass.org',
    lede: 'Outreach and an introduction to the service structure.',
    description: 'The Area 30 Service Seminar Committee provides outreach and an introduction to the service structure in the Area 30 Handbook and the AAWS Service Manual.',
    sections: [
      {
        title: 'Mission',
        paras: ['The Service Seminar Committee provides outreach and introduction of service structure as outlined in the Area 30 Handbook and the AAWS Service Manual.'],
      },
    ],
    cta: 'Request information from the Service Seminar Committee, or ask a question.',
  },
  'state-convention': {
    title: 'Mass. State Convention',
    eyebrow: 'Standing committee',
    email: 'massstateconvention@aaemass.org',
    lede: 'Fellowship, food and fun, planned by members from across Massachusetts.',
    description: 'The Mass. State Convention Committee meets monthly to plan the annual convention: speakers, workshops, food, fellowship and fun.',
    sections: [
      {
        title: 'Mission',
        paras: ['The Convention Committee meets monthly to organize the annual Mass. State Convention, a weekend with speakers, workshops, food, fellowship and fun.'],
        links: [{ text: 'aamastateconvention.org', href: 'https://aamastateconvention.org/' }],
      },
    ],
    meeting: {
      intro: 'The Convention Planning Committee meets monthly, hybrid, in person and online. Check the calendar or the convention website for the next meeting date.',
      lines: ['In person: Royal Plaza, 181 Boston Post Road W., Marlborough', 'Online: Meeting ID 878 4199 4146, passcode hkJvj8'],
      calendar: true,
    },
    cta: 'To ask a question or get involved, email the Convention Committee.',
  },
  website: {
    title: 'Website',
    schedule: { weekday: 1, week: 1, time: '18:00' },
    eyebrow: 'Standing committee',
    email: 'website@aaemass.org',
    lede: 'The committee that maintains this website for Area 30.',
    description: 'The Area 30 Website Committee maintains the Area 30 website and meets monthly. Interested in service and technology? Get in touch.',
    sections: [
      {
        title: 'Mission',
        paras: [
          'This committee maintains the Area 30 website per assembly action and develops recommendations on its future maintenance.',
          'To request changes or edits to the website, email the committee.',
        ],
      },
      {
        title: 'Get involved',
        paras: ['Are you looking to get involved in service? Do you have technical skills, or an interest in technology and websites? Come check out the Website Committee and make yourself available.'],
      },
    ],
    meeting: { lines: ['Virtually at 6:00 PM on the 1st Monday of the month.'], calendar: true },
    cta: 'To contact the Website Committee with questions, or to get involved, email us.',
  },
};
