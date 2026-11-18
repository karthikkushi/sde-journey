// =====================================================================
// THE AI ENGINEER TRACK, layered on top of the DSA roadmap.
//
// From week 10, Tuesday and Thursday evenings are AI sessions (they replace the light
// evening DSA task on those two days only). Weeks 1–9 do not change.
// src/lib/plan.ts reads this file. To change a topic or its weeks, edit it here.
// =====================================================================
import type { Learn } from './roadmap'

export const AI_START_WEEK = 10

const N = (text: string, note: string): Learn => ({ text, note })
const T = (text: string, to: string): Learn => ({ text, to })
const D = (text: string): Learn => ({ text })

/**
 * The 13 topics in order. Each week of a topic gets 2 sessions, taken in order from `steps`
 * (and repeating if the topic lasts longer than its steps). Weeks follow the phase split:
 * light in phase 2 (weeks 10–26), heavier in phase 3, building in phases 4 and 5.
 */
export const AI_TOPICS: { from: number; to: number; title: string; steps: Learn[] }[] = [
  { from: 10, to: 11, title: 'LLM basics and tokens', steps: [
    N('What an LLM is', 'j-llm-basics'), N('Tokens and the context window', 'j-tokens'),
    D('Count tokens for 3 of your own messages with a tokenizer page; note the cost'), D('Explain an LLM and tokens aloud in 2 minutes'),
  ] },
  { from: 12, to: 13, title: 'Calling an LLM API from Python', steps: [
    N('Call an LLM API from Python', 'j-llm-api'), D('First API call: a script that asks one question and prints the answer (key in an environment variable)'),
    N('Structured output: get JSON back', 'j-structured-output'), D('Make your script return JSON and parse it in Python'),
  ] },
  { from: 14, to: 15, title: 'Prompting', steps: [
    N('Prompt design basics', 'j-prompts'), D('Rewrite one prompt 3 ways; compare the answers'),
    D('Few-shot prompt: classify 10 kirana items into categories'), D('Write down the prompt that worked best, and why'),
  ] },
  { from: 16, to: 17, title: 'Embeddings', steps: [
    N('Embeddings in simple words', 'j-embeddings'), D('Embed 10 sentences and find the 2 most similar'),
    D('Explain cosine similarity with a small example on paper'), D('Embed 20 of your own note titles; search them by meaning'),
  ] },
  { from: 18, to: 19, title: 'Vector databases', steps: [
    N('Vector search', 'j-vector-search'), D('Store 50 chunks in a vector store (Chroma or pgvector) and query it'),
    D('Compare top-3 results for keyword search vs vector search'), D('Explain what an index (HNSW) trades away for speed'),
  ] },
  { from: 20, to: 26, title: 'Your first RAG app', steps: [
    N('RAG step by step', 'j-rag'), N('RAG retrieval: chunking and re-ranking', 'j-rag-retrieval'),
    T('AI project step 2: RAG over your own notes (start)', '/projects/ai-rag'), D('RAG app: load and chunk your notes'),
    D('RAG app: embed and store the chunks'), D('RAG app: retrieve top chunks and answer with sources'),
    N('Hallucination and grounding', 'j-hallucination'), D('RAG app: answer "I don\'t know" when no chunk supports it'),
    D('RAG app: try 10 real questions; note the bad answers'), D('RAG app: fix the worst bad answer (chunk size or prompt)'),
    D('RAG app: write a README with a diagram'), D('Draw the RAG flow from memory'),
    D('Explain your RAG app aloud in 3 minutes'), D('Revise: tokens, embeddings, vector search, RAG'),
  ] },
  { from: 27, to: 30, title: 'RAG evaluation', steps: [
    N('Evaluating LLM outputs', 'j-evals'), D('Write 20 questions with good answers for your RAG app'),
    D('Score retrieval: did the right chunk come back?'), D('Score answers: correct, grounded, or wrong'),
    T('AI project step 4: add evals to the RAG app', '/projects/ai-evals'), D('Change one thing (chunk size); re-run the eval; compare'),
    D('Put the eval in a script you can run with one command'), D('Write down your eval score in the README'),
  ] },
  { from: 31, to: 33, title: 'Tool calling', steps: [
    N('Agents and tool calling basics', 'j-agents'), D('One tool: let the model call a Python function (weather or calculator)'),
    D('Validate the tool arguments before running the tool'), D('Two tools: let the model pick the right one'),
    D('Log every tool call with its arguments and result'), D('Explain tool calling aloud with a diagram'),
  ] },
  { from: 34, to: 36, title: 'Agents', steps: [
    T('AI project step 3: an agent with 2–3 tools', '/projects/ai-agent'), D('Agent loop: think, call a tool, read the result, repeat'),
    D('Add a step limit and a stop condition'), D('Add a third tool; test 10 tasks'),
    N('Guardrails and prompt injection', 'j-guardrails'), D('Agent: refuse a risky action without confirmation'),
  ] },
  { from: 37, to: 38, title: 'MCP', steps: [
    N('The Model Context Protocol', 'j-mcp'), D('Expose 2 read-only tools of your project as an MCP server'),
    D('Call your MCP server from an MCP-aware assistant'), D('Add input checks and logging to the MCP tools'),
  ] },
  { from: 39, to: 42, title: 'Evals in depth', steps: [
    D('Evals: LLM-as-judge with a clear rubric; check it against your own grades'), D('Evals: run your eval set in CI on every push'),
    N('Guardrails, revisited', 'j-guardrails'), D('Evals: a safety set (prompt injection, off-topic, personal data)'),
    D('Evals: track score, cost and latency per version in a table'), D('Explain how you know your AI feature got better'),
    D('Evals: add 10 hard questions from real failures'), D('Revise: RAG, evals, tool calling, agents'),
  ] },
  { from: 43, to: 47, title: 'Deployment, cost and latency', steps: [
    N('Deploying an AI-backed API (FastAPI)', 'j-deploy-ai'), N('Cost and latency of LLM calls', 'j-cost-latency'),
    N('LLM calls in production', 'j-llm-production'), D('Deploy your RAG app behind FastAPI with a timeout and retries'),
    D('Stream the answer; measure time to the first token'), D('Log tokens and cost per request; chart cost per day'),
    D('Cache repeated questions; measure the saving'), D('Load-test 20 users; note p95 latency'),
    T('AI project step 5: the final AI product (plan it)', '/projects/ai-product'), D('Final AI product: first deploy with 3 real users'),
  ] },
  { from: 48, to: 52, title: 'AI system design basics', steps: [
    N('AI system design basics', 'j-ai-system-design'), N('System design: an LLM assistant at scale', 'i-llm-assistant'),
    D('Design a RAG system for 1 lakh users aloud in 30 minutes'), D('Final AI product: an eval score and a cost per user'),
    D('Design an agent for customer support aloud in 30 minutes'), D('Final AI product: write the case study (problem, design, numbers)'),
    D('Mock AI system design with a friend'), D('Final AI product: fix the top 3 user complaints'),
    D('Explain your AI product in 5 minutes'), D('Revise all AI notes; list your 5 weakest topics'),
  ] },
]

/** The topic and the two sessions (Tuesday, Thursday) for a plan week, or undefined before week 10 / after the track. */
export function aiWeek(week: number) {
  const topic = AI_TOPICS.find((t) => week >= t.from && week <= t.to)
  if (!topic) return undefined
  const i = (week - topic.from) * 2
  const at = (k: number) => topic.steps[k % topic.steps.length]
  return { topic: topic.title, sessions: [at(i), at(i + 1)] as [Learn, Learn] }
}

/** Phase time splits (percent of study time). Phases 3–5 overlap, as in the roadmap. */
export const AI_PHASES = [
  { n: 1, name: 'Foundations', from: 1, to: 9, split: 'DSA 100%' },
  { n: 2, name: 'Core DSA + AI start', from: 10, to: 26, split: 'DSA 70% · AI 25% · ML + papers 5%' },
  { n: 3, name: 'Hard DSA + agents', from: 27, to: 43, split: 'DSA 50% · AI 35% · ML + papers 15%' },
  { n: 4, name: 'AI project', from: 35, to: 52, split: 'DSA revision · AI product build · reproduce one small paper idea' },
  { n: 5, name: 'Interviews', from: 44, to: 65, split: 'DSA 40% · AI 40% · ML + papers 20%' },
]

export const phasesForWeek = (week: number) => AI_PHASES.filter((p) => week >= p.from && week <= p.to)

/** Paper Sundays: every other Sunday from week 10 (week 10, 12, 14, ...). */
export const isPaperWeek = (week: number) => week >= AI_START_WEEK && (week - AI_START_WEEK) % 2 === 0
