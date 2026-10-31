// Synthetic sample data for the C+ prototype, shaped like main's real models
// (UserProfile, session_profiles avatar fields, conversations with paused/ended + exported_at,
// v2 Wardrobe entries). Fictional learner. Coaches are main's two LiveAvatar presenters.
window.DATA = {
  today: '2026-10-31',
  account: { email: 'lena.hoffmann@example.com', plan: 'Membership', renews: '2026-11-16', initials: 'LH' },
  coaches: [
    { id: 'jane', avatarId: '073b60a9-89a8-45aa-8902-c358f64d2852', name: 'Jane', accent: 'British English', gender: 'female', img: 'assets/jane.jpg' },
    { id: 'wayne', avatarId: 'dd73ea75-1218-4ef3-92ce-606d5f7fbc0a', name: 'Wayne', accent: 'American English', gender: 'male', img: 'assets/wayne.jpg' },
  ],
  domains: [
    { id: 'sales', en: 'Sales', de: 'Vertrieb' }, { id: 'manufacturing', en: 'Manufacturing', de: 'Produktion' },
    { id: 'procurement', en: 'Procurement', de: 'Einkauf' }, { id: 'supply_chain', en: 'Supply chain', de: 'Lieferkette' },
    { id: 'quality', en: 'Quality', de: 'Qualität' }, { id: 'leadership', en: 'Leadership', de: 'Führung' },
  ],
  // Admin-defined optional profile questions (main: /api/dashboard/profile/questions).
  questions: [
    { id: 'q1', label: 'Where are your customers located?', example: 'Germany, the Nordics and the US' },
    { id: 'q2', label: 'Which situations do you want to practise?', example: 'Price negotiations, supplier calls' },
  ],
  // A returning learner's saved profile (main: user_profiles/{uid}). english_level is main's 0–100 test score.
  profile: { name: 'Lena', role: 'Key account manager', industry: 'Industrial pumps', domain: 'sales', english_level: '68', answers: { q1: 'DACH region and the Nordics' } },
  maxSelected: 5, maxPaused: 5,
  sessions: [
    { id: 's1', date: '2026-09-24', title: 'Introducing yourself at a trade fair', domain: 'sales', coach: 'jane', minutes: 14, messages: 19, status: 'ended', exported: true },
    { id: 's2', date: '2026-10-01', title: 'Negotiating payment terms', domain: 'procurement', coach: 'wayne', minutes: 19, messages: 24, status: 'ended', exported: false },
    { id: 's3', date: '2026-10-06', title: 'Weekly production meeting', domain: 'manufacturing', coach: 'wayne', minutes: 12, messages: 15, status: 'ended', exported: true },
    { id: 's4', date: '2026-10-09', title: 'Quality complaint about a batch of seals', domain: 'quality', coach: 'wayne', minutes: 9, messages: 11, status: 'paused', exported: false },
    { id: 's5', date: '2026-10-16', title: 'Quarterly review with a key account', domain: 'sales', coach: 'jane', minutes: 21, messages: 27, status: 'ended', exported: true },
    { id: 's6', date: '2026-10-21', title: 'Practice: phrases from your Wardrobe', domain: 'sales', coach: 'jane', minutes: 11, messages: 14, status: 'ended', exported: false, practice: true },
    { id: 's7', date: '2026-10-23', title: 'Supplier delay: agreeing a new delivery date', domain: 'supply_chain', coach: 'wayne', minutes: 17, messages: 22, status: 'ended', exported: false },
    { id: 's8', date: '2026-10-28', title: 'Pricing objection from a long-standing distributor', domain: 'sales', coach: 'jane', minutes: 18, messages: 23, status: 'ended', exported: true },
    { id: 's9', date: '2026-10-30', title: 'Practice: phrases from your Wardrobe', domain: 'sales', coach: 'jane', minutes: 10, messages: 13, status: 'ended', exported: false, practice: true },
  ],
  // v2 Wardrobe entries. type: power_phrase | upgrade | correction. status: new | keep_practising | mastered.
  entries: [
    { id: 'e1', session: 's1', type: 'power_phrase', phrase: 'What brings you to the stand today?', de: 'Was führt Sie heute an unseren Stand?', why: 'An open question that starts a trade-fair conversation without a sales pitch.', status: 'mastered', tags: ['business_vocabulary'] },
    { id: 'e2', session: 's1', type: 'upgrade', original: 'We are producing pumps since 1985.', phrase: "We've been making pumps since 1985.", de: 'Wir stellen seit 1985 Pumpen her.', why: 'Present perfect continuous for something that started in the past and still goes on.', status: 'mastered', tags: ['verb'] },
    { id: 'e3', session: 's2', type: 'correction', original: 'I am working here since five years.', phrase: "I've been working here for five years.", de: 'Ich arbeite hier seit fünf Jahren.', why: '"For" with a length of time, "since" with a starting point.', status: 'keep_practising', tags: ['verb'], practiced: ['s6'], used: ['s6'], repeats: ['s5', 's7'] },
    { id: 'e4', session: 's2', type: 'upgrade', original: 'Can you pay faster?', phrase: 'Could we agree on 30-day payment terms?', de: 'Können wir uns auf ein Zahlungsziel von 30 Tagen einigen?', why: 'Names the exact term you want and frames it as a joint decision.', status: 'new', tags: ['business_vocabulary'] },
    { id: 'e5', session: 's3', type: 'power_phrase', phrase: "Let's park that and come back to it after the break.", de: 'Lassen Sie uns das zurückstellen und nach der Pause darauf zurückkommen.', why: 'Keeps a meeting on track without dismissing the point.', status: 'mastered', tags: [] },
    { id: 'e6', session: 's5', type: 'power_phrase', phrase: 'Let me walk you through the numbers.', de: 'Lassen Sie mich Ihnen die Zahlen erläutern.', why: 'Signals structure before you present figures.', status: 'mastered', tags: [], repeats: ['s8'] },
    { id: 'e7', session: 's5', type: 'upgrade', original: 'The sales went up very much.', phrase: 'Sales rose sharply in the third quarter.', de: 'Der Umsatz ist im dritten Quartal stark gestiegen.', why: '"Rose sharply" is the standard way to describe a steep increase; add the period.', status: 'keep_practising', tags: ['verb', 'business_vocabulary'], practiced: ['s6', 's9'], used: ['s6'], selected: true },
    { id: 'e8', session: 's5', type: 'correction', original: 'We have reached the target last month.', phrase: 'We reached the target last month.', de: 'Wir haben letzten Monat das Ziel erreicht.', why: 'A finished time ("last month") takes the simple past.', status: 'keep_practising', tags: ['verb'], practiced: ['s9'], used: ['s9'] },
    { id: 'e9', session: 's6', type: 'power_phrase', phrase: "That's a fair point, and here's how I see it.", de: 'Das ist ein berechtigter Einwand, und so sehe ich das.', why: 'Acknowledges the other side before you disagree.', status: 'new', tags: [] },
    { id: 'e10', session: 's7', type: 'upgrade', original: 'The delivery will come later.', phrase: 'The shipment has been pushed back to the 14th.', de: 'Die Lieferung wurde auf den 14. verschoben.', why: '"Pushed back" plus the new date is precise and neutral.', status: 'keep_practising', tags: ['verb'], practiced: ['s9'], used: [] },
    { id: 'e11', session: 's7', type: 'correction', original: 'Can you send me the informations?', phrase: 'Could you send me the information?', de: 'Könnten Sie mir die Informationen schicken?', why: '"Information" has no plural in English.', status: 'new', tags: [] },
    { id: 'e12', session: 's7', type: 'upgrade', original: 'I will call you back.', phrase: "I'll get back to you by the end of the day.", de: 'Ich melde mich bis heute Abend bei Ihnen.', why: 'Commits to a time, which builds trust in a delay conversation.', status: 'new', tags: [], selected: true },
    { id: 'e13', session: 's8', type: 'upgrade', original: 'We can make the price cheaper.', phrase: 'We can sharpen the price for a longer commitment.', de: 'Bei einer längeren Laufzeit können wir beim Preis entgegenkommen.', why: 'Links the concession to something you get in return.', status: 'new', tags: ['business_vocabulary'] },
    { id: 'e14', session: 's8', type: 'power_phrase', phrase: "I hear you. Let's look at what's driving the cost.", de: 'Ich verstehe Sie. Schauen wir uns an, was die Kosten treibt.', why: 'Moves a price objection from emotion to facts.', status: 'new', tags: [] },
    { id: 'e15', session: 's8', type: 'correction', original: 'We must discuss about the contract.', phrase: 'We need to discuss the contract terms.', de: 'Wir müssen die Vertragsbedingungen besprechen.', why: '"Discuss" takes a direct object, with no "about".', status: 'new', tags: ['verb'] },
    { id: 'e16', session: 's8', type: 'power_phrase', phrase: 'What would it take to keep your business for another two years?', de: 'Was müsste passieren, damit Sie weitere zwei Jahre bei uns bleiben?', why: 'Invites the customer to name their conditions.', status: 'new', tags: [] },
  ],
  scripts: {
    s10: {
      id: 's10', title: 'Contract renewal: the customer asks for 10% off', domain: 'sales', coach: 'jane', minutes: 12, messages: 7,
      script: [
        { who: 'coach', text: "Good morning, Lena. Before we talk about the renewal, I'll be honest: we've had an offer that's ten percent cheaper." },
        { who: 'me', text: 'Good morning. I understand. We must discuss about the price, but also about the service you get.',
          note: { kind: 'correction', original: 'We must discuss about the price', better: 'We need to discuss the price', why: '"Discuss" takes a direct object.' } },
        { who: 'coach', text: 'The service is fine, but my director only looks at the bottom line. What can you do?' },
        { who: 'me', text: 'If you would sign for two years, we could lower the price.',
          note: { kind: 'correction', original: 'If you would sign', better: 'If you signed', why: 'No "would" in the if-clause.' } },
        { who: 'coach', text: 'Two years is a long commitment. What happens if our volumes drop?' },
        { who: 'me', text: 'Then we review the volumes together every quarter, so there are no surprises.',
          note: { kind: 'strong', better: 'so there are no surprises', why: 'Clear and reassuring.' } },
        { who: 'coach', text: "That's reasonable. Send me a proposal and I'll take it to my director." },
      ],
      capture: {
        add: [
          { id: 'e17', session: 's10', type: 'correction', original: 'If you would sign for two years, we could lower the price.', phrase: 'If you signed for two years, we could lower the price.', de: 'Wenn Sie für zwei Jahre unterschreiben würden, könnten wir den Preis senken.', why: 'No "would" in the if-clause of a second conditional.', status: 'new', tags: ['verb'] },
          { id: 'e18', session: 's10', type: 'power_phrase', phrase: 'We review the volumes together every quarter, so there are no surprises.', de: 'Wir prüfen die Mengen jedes Quartal gemeinsam, damit es keine Überraschungen gibt.', why: 'Turns a risk into a shared routine.', status: 'new', tags: [] },
        ],
        repeat: ['e15'],
      },
    },
    s4: {
      id: 's4', title: 'Quality complaint about a batch of seals', domain: 'quality', coach: 'wayne', minutes: 6, messages: 3, resumed: true,
      script: [
        { who: 'coach', text: 'Welcome back, Lena. To recap: 400 seals from batch 2291 failed our pressure test.' },
        { who: 'me', text: 'Yes. We checked the batch and we traced the problem to the curing time.' },
        { who: 'coach', text: 'So what happens to the seals we have already installed?' },
      ],
      capture: { add: [], repeat: [] },
    },
  },
};

// Interface labels in both languages, used by the DE/EN switch (body copy in the prototype stays English).
window.STRINGS = {
  en: {
    home: 'Home', wardrobe: 'Wardrobe', wardrobeFull: 'Language Wardrobe', progress: 'Progress', profile: 'Profile',
    start: 'Start a session', continue: 'Continue', newSession: 'New session', begin: 'Begin session',
    end: 'End', endSession: 'End session', endDownload: 'End & download report', keepTalking: 'Keep talking', pause: 'Continue later',
    listening: 'Listening', thinking: 'Thinking', speaking: 'Speaking', micOff: 'Microphone off',
    transcript: 'Transcript', notes: 'Coaching notes', mute: 'Mute', unmute: 'Unmute', sound: 'Sound', type: 'Type',
    next: 'Next', back: 'Back', skip: 'Skip for now', save: 'Save', finish: 'Finish setup',
    active: 'Active', library: 'Library', newest: 'Newest', bySession: 'By session', all: 'All',
    addPractice: 'Add to practice', inPractice: 'In practice', mastered: 'Mastered', moveBack: 'Practise again', practise: 'Practise these',
    history: 'Session history', overview: 'Overview', download: 'Download report', delete: 'Delete', rename: 'Rename',
    coaching: 'Coaching profile', account: 'Account', plan: 'Plan & billing', help: 'Help & support', signOut: 'Sign out',
    focus: 'Training focus', coach: 'Coach', level: 'English level', aboutYou: 'About you', more: 'A little more',
  },
  de: {
    home: 'Start', wardrobe: 'Wardrobe', wardrobeFull: 'Language Wardrobe', progress: 'Fortschritt', profile: 'Profil',
    start: 'Sitzung starten', continue: 'Fortsetzen', newSession: 'Neue Sitzung', begin: 'Sitzung beginnen',
    end: 'Beenden', endSession: 'Sitzung beenden', endDownload: 'Beenden & Bericht herunterladen', keepTalking: 'Weitersprechen', pause: 'Später fortsetzen',
    listening: 'Hört zu', thinking: 'Denkt nach', speaking: 'Spricht', micOff: 'Mikrofon aus',
    transcript: 'Transkript', notes: 'Coaching-Hinweise', mute: 'Stumm', unmute: 'Mikro an', sound: 'Ton', type: 'Tippen',
    next: 'Weiter', back: 'Zurück', skip: 'Später ausfüllen', save: 'Speichern', finish: 'Einrichtung abschließen',
    active: 'Aktiv', library: 'Bibliothek', newest: 'Neueste', bySession: 'Nach Sitzung', all: 'Alle',
    addPractice: 'Zum Üben auswählen', inPractice: 'Wird geübt', mastered: 'Sitzt', moveBack: 'Wieder üben', practise: 'Diese üben',
    history: 'Sitzungsverlauf', overview: 'Überblick', download: 'Bericht herunterladen', delete: 'Löschen', rename: 'Umbenennen',
    coaching: 'Coaching-Profil', account: 'Konto', plan: 'Tarif & Abrechnung', help: 'Hilfe & Support', signOut: 'Abmelden',
    focus: 'Trainingsschwerpunkt', coach: 'Coach', level: 'Englischniveau', aboutYou: 'Über Sie', more: 'Noch ein paar Details',
  },
};

(() => {
  const D = window.DATA, n = id => D.entries.filter(e => e.session === id).length;
  console.assert([['s1', 2], ['s2', 2], ['s3', 1], ['s4', 0], ['s5', 3], ['s6', 1], ['s7', 3], ['s8', 4], ['s9', 0]].every(([s, c]) => n(s) === c), 'phrase counts per session');
  console.assert(D.entries.filter(e => e.selected).length <= D.maxSelected, 'selection within max');
  console.assert(D.sessions.every(s => D.coaches.some(c => c.id === s.coach)), 'only current coaches');
  console.assert(Object.keys(STRINGS.en).every(k => k in STRINGS.de), 'DE covers every EN label');
})();
