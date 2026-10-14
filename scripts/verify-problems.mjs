// Checks every problem slug in content/data/problems.json against LeetCode,
// and fills in the real title, difficulty and premium flag.
// Run it after adding problems:  npm run problems
// It fails (exit code 1) if a slug does not exist, so we never ship a made-up link.
import { readFileSync, writeFileSync } from 'node:fs'

const FILE = new URL('../content/data/problems.json', import.meta.url)
const problems = JSON.parse(readFileSync(FILE, 'utf8'))

const QUERY = 'query q($s: String!) { question(titleSlug: $s) { title difficulty isPaidOnly } }'

async function lookup(slug) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Referer: 'https://leetcode.com', 'User-Agent': 'Mozilla/5.0' },
      body: JSON.stringify({ query: QUERY, variables: { s: slug } }),
    })
    if (res.ok) return (await res.json()).data?.question ?? null
    await new Promise((r) => setTimeout(r, 2000 * attempt)) // rate limited: wait and retry
  }
  throw new Error(`LeetCode did not answer for ${slug}`)
}

const bad = []
// 4 requests at a time, so we are polite to LeetCode.
for (let i = 0; i < problems.length; i += 4) {
  await Promise.all(
    problems.slice(i, i + 4).map(async (p) => {
      const q = await lookup(p.slug)
      if (!q) return bad.push(p.slug)
      p.title = q.title
      p.difficulty = q.difficulty
      p.premium = q.isPaidOnly
    }),
  )
}

if (bad.length) {
  console.error('These slugs do not exist on LeetCode:', bad)
  process.exit(1)
}
writeFileSync(FILE, JSON.stringify(problems, null, 1) + '\n')
console.log(`OK: ${problems.length} problems verified.`)
