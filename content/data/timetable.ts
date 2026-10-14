// The daily timetable. Times are 24-hour "HH:MM" in India time.
export type Block = { from: string; to: string; label: string; kind: 'study' | 'body' | 'work' | 'life' | 'rest' }

export const WEEKDAY: Block[] = [
  { from: '06:30', to: '06:40', label: 'Wake up, water', kind: 'life' },
  { from: '06:40', to: '07:05', label: 'Exercise', kind: 'body' },
  { from: '07:05', to: '08:00', label: 'DSA session 1 (hardest learning)', kind: 'study' },
  { from: '08:00', to: '08:30', label: 'Cook breakfast and lunch box', kind: 'life' },
  { from: '08:30', to: '09:00', label: 'Bath', kind: 'life' },
  { from: '09:00', to: '09:15', label: 'Pack and leave', kind: 'life' },
  { from: '09:15', to: '09:45', label: 'Travel (audio lecture)', kind: 'life' },
  { from: '09:45', to: '18:30', label: 'Office (lunch: eat, 15-min walk, 10-min notebook review)', kind: 'work' },
  { from: '18:30', to: '19:00', label: 'Travel home', kind: 'life' },
  { from: '19:00', to: '19:15', label: 'Reset: water, face wash, sit, no phone', kind: 'rest' },
  { from: '19:15', to: '19:55', label: 'Cook', kind: 'life' },
  { from: '19:55', to: '20:25', label: 'Eat and clean', kind: 'life' },
  { from: '20:25', to: '21:25', label: 'DSA session 2 (Friday: SQL or CS basics)', kind: 'study' },
  { from: '21:25', to: '22:15', label: 'Business time', kind: 'study' },
  { from: '22:15', to: '22:30', label: 'Notebook and plan tomorrow', kind: 'rest' },
  { from: '22:30', to: '24:00', label: 'Sleep', kind: 'rest' },
]

export const SATURDAY: Block[] = [
  { from: '07:00', to: '07:15', label: 'Wake up, water', kind: 'life' },
  { from: '07:15', to: '07:45', label: 'Exercise', kind: 'body' },
  { from: '07:45', to: '08:30', label: 'Breakfast', kind: 'life' },
  { from: '08:30', to: '11:30', label: 'DSA long block (break in the middle)', kind: 'study' },
  { from: '11:30', to: '13:00', label: 'Cook and eat', kind: 'life' },
  { from: '13:00', to: '15:00', label: 'Rest', kind: 'rest' },
  { from: '15:00', to: '17:00', label: 'Business time', kind: 'study' },
  { from: '17:00', to: '22:30', label: 'Evening free', kind: 'rest' },
]

export const SUNDAY: Block[] = [
  { from: '08:00', to: '08:15', label: 'Wake up, water', kind: 'life' },
  { from: '08:15', to: '09:00', label: 'Exercise', kind: 'body' },
  { from: '09:00', to: '09:30', label: 'Breakfast', kind: 'life' },
  { from: '09:30', to: '11:30', label: 'DSA', kind: 'study' },
  { from: '11:30', to: '12:00', label: 'Weekly review', kind: 'study' },
  { from: '12:00', to: '14:00', label: 'Batch cook for the week', kind: 'life' },
  { from: '14:00', to: '16:00', label: 'Rest', kind: 'rest' },
  { from: '16:00', to: '17:30', label: 'Business time', kind: 'study' },
  { from: '17:30', to: '22:00', label: 'Evening free', kind: 'rest' },
  { from: '22:00', to: '24:00', label: 'Sleep', kind: 'rest' },
]

export const RULES = [
  'No study during office hours, except the 10-minute lunch notebook review.',
  'On a bad day, do the minimum: 30 minutes DSA, 10 minutes exercise, sleep on time.',
  'Cut business time first. Never cut sleep or exercise.',
  'Phone in another room during DSA sessions.',
  'Snack at 4 to 5 PM so the evening session does not die.',
]
