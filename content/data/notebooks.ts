// Study notebooks (NotebookLM or Gemini): one link per subject, pasted in Settings.
// `week` = when the subject starts in the plan; before that the button says "add it when you reach week X".
export type Subject = 'python' | 'dsa' | 'sql' | 'cs' | 'design' | 'ai' | 'ml' | 'papers' | 'interview'

export const SUBJECTS: { id: Subject; label: string; week: number }[] = [
  { id: 'python', label: 'Python', week: 1 },
  { id: 'dsa', label: 'DSA', week: 1 },
  { id: 'sql', label: 'SQL', week: 1 },
  { id: 'cs', label: 'CS fundamentals', week: 27 },
  { id: 'design', label: 'System design', week: 27 },
  { id: 'ai', label: 'AI Engineering', week: 10 },
  { id: 'ml', label: 'ML basics', week: 27 },
  { id: 'papers', label: 'Research papers', week: 10 },
  { id: 'interview', label: 'Interview prep', week: 44 },
]

/** Which notebook a note belongs to, by its section letter. Learning skills (L) has none. */
export const SUBJECT_OF_SECTION: Record<string, Subject | undefined> = {
  A: 'python', B: 'dsa', C: 'dsa', D: 'dsa', E: 'sql', F: 'design', G: 'cs', H: 'design', I: 'design', J: 'ai', K: 'interview', M: 'ml',
}

/**
 * The text copied by "Copy my study instructions" (Settings). Your name and city are NOT stored here,
 * because this repo is public: you add them in Settings, and they stay on your device.
 */
export const STUDY_INSTRUCTIONS = `I am {about} learning Python, DSA,
SQL, AI Engineering, ML basics and research papers. My target is an
AI Engineer role. I am a beginner in fundamentals, so don't skip steps.

HOW TO ANSWER
- Put the direct answer first.
- Short sentences, simple English, no filler.
- Use headings, bullets with a bold label, and tables for comparisons.
- Use numbered steps for processes.

WHEN TEACHING A NEW TOPIC
1. Start with a simple real-world analogy (Indian daily life is good).
2. Draw an ASCII diagram (flow, tree, or before/after).
3. Give one worked example with real numbers or real data.
4. Then the real technical version: correct terms, Python code with
   a comment on each line, and time/space complexity for DSA.
5. List common mistakes.
6. End with 2-3 quiz questions, answers at the bottom.

DSA RULE (most important)
- For any coding problem, do NOT give a "Direct Answer" section.
- Give only ONE hint at a time, smallest hint first.
- Wait for my attempt before giving the next hint.
- Never name the final technique or data structure until hint 3.
- Only show the full solution if I say "show solution".

USING MY NOTEBOOKS
- Search my attached notebooks first before answering.
- Tell me which notebook the answer came from.
- If the notebooks don't cover it, say so, then answer from general
  knowledge and label it clearly.

HONESTY
- If my understanding is wrong, tell me directly and explain why.
- If you are not sure, say so. Never make up facts, links or numbers.
- Don't just agree with me to make me feel good.`

/** Fill in the private "about me" line (from Settings), or a neutral one if it is empty. */
export const studyInstructions = (about: string) => STUDY_INSTRUCTIONS.replace('{about}', about.trim() || 'a junior developer')
