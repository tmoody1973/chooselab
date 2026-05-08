export interface Scenario {
  id: string;
  scenarioId: string;
  avatarId: string;
  characterName: string;
  title: string;
  setupLine: string;
  imageSrc: string;
  accentColor: string;
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'workplace-empathy',
    scenarioId: 'workplace_empathy_001',
    avatarId: 'e6c8e3f2-ae0b-4aeb-98c8-ea217a2d3827',
    characterName: 'Alex',
    title: 'Workplace empathy',
    setupLine: "You're in the break room. Alex shares they're tired. Practice listening without jumping to fixes.",
    imageSrc: '/avatars/alex.png',
    accentColor: '#7c8aae',
  },
  {
    id: 'school-self-advocacy',
    scenarioId: 'school_self_advocacy_001',
    avatarId: 'd17acfff-2aae-44db-bbb8-8d75118383d2',
    characterName: 'Dr. Patel',
    title: 'School self-advocacy',
    setupLine: "Office hours. Dr. Patel has 10 minutes. Practice making a clear, specific ask.",
    imageSrc: '/avatars/patel.png',
    accentColor: '#a07b6e',
  },
  {
    id: 'interview-prep',
    scenarioId: 'interview_prep_001',
    avatarId: '576d0934-f203-41b1-b33e-0f47d82eeec5',
    characterName: 'Jordan Kim',
    title: 'Interview prep',
    setupLine: "Behavioral interview. Jordan asks one question. Practice a structured, concrete answer.",
    imageSrc: '/avatars/jordan.png',
    accentColor: '#5e7a8a',
  },
];

export function getScenarioById(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}

export function getScenarioByAvatarId(avatarId: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.avatarId === avatarId);
}
