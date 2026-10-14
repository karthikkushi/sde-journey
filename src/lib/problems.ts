import data from '../../content/data/problems.json'
import { PATTERN_IDS } from './noteIndex'

// One LeetCode problem. Titles, difficulty and premium flag come from LeetCode itself
// (see scripts/verify-problems.mjs), so the links are always real.
export type Problem = {
  slug: string
  tag: string // pattern id (see the Patterns page) or a topic like "stack"
  title: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  premium: boolean
}

export const PROBLEMS = data as Problem[]

const bySlug = new Map(PROBLEMS.map((p) => [p.slug, p]))
export const problemBySlug = (slug: string) => bySlug.get(slug)

export const leetcodeUrl = (slug: string) => `https://leetcode.com/problems/${slug}/`

// Some problem tags are topics without a pattern page. Their chip opens the note that teaches them.
export const TOPIC_NOTES: Record<string, string> = {
  basics: 'c-arrays-strings',
  string: 'c-arrays-strings',
  stack: 'c-stacks',
  'linked-list': 'c-linked-lists',
  matrix: 'c-matrices',
  math: 'd-math',
  recursion: 'a18-recursion',
  'segment-tree': 'c-segment-fenwick',
  design: 'c-lru-design',
  sql: 'e-select-where',
}

/** Where a problem's tag chip links: its pattern page, or the note for that topic. */
export const tagLink = (tag: string) =>
  PATTERN_IDS.has(tag) ? `/patterns/${tag}` : TOPIC_NOTES[tag] ? `/notes/${TOPIC_NOTES[tag]}` : undefined
