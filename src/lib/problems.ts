import data from '../../content/data/problems.json'

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
