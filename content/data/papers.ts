// The 6 papers for the AI Engineer track, in reading order.
// Links go to each paper's official arXiv page (checked; the weekly link checker scans this file).
export type Paper = { id: string; title: string; year: number; authors: string; url: string; why: string }

export const PAPERS: Paper[] = [
  { id: 'attention', title: 'Attention Is All You Need', year: 2017, authors: 'Vaswani et al.', url: 'https://arxiv.org/abs/1706.03762',
    why: 'The transformer: the architecture behind every modern LLM.' },
  { id: 'gpt3', title: 'Language Models are Few-Shot Learners', year: 2020, authors: 'Brown et al.', url: 'https://arxiv.org/abs/2005.14165',
    why: 'GPT-3: a big enough model can learn a task from a few examples in the prompt.' },
  { id: 'rag', title: 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks', year: 2020, authors: 'Lewis et al.', url: 'https://arxiv.org/abs/2005.11401',
    why: 'RAG: look things up first, then generate. The idea behind your RAG app.' },
  { id: 'cot', title: 'Chain-of-Thought Prompting Elicits Reasoning in Large Language Models', year: 2022, authors: 'Wei et al.', url: 'https://arxiv.org/abs/2201.11903',
    why: 'Asking for step-by-step reasoning makes models better at multi-step problems.' },
  { id: 'react', title: 'ReAct: Synergizing Reasoning and Acting in Language Models', year: 2022, authors: 'Yao et al.', url: 'https://arxiv.org/abs/2210.03629',
    why: 'Think, act with a tool, observe, repeat: the loop inside most agents.' },
  { id: 'lora', title: 'LoRA: Low-Rank Adaptation of Large Language Models', year: 2021, authors: 'Hu et al.', url: 'https://arxiv.org/abs/2106.09685',
    why: 'Fine-tune a huge model cheaply by training small extra matrices.' },
]

/** The reading checklist, in order. "write" = My 5 lines, in your own words. */
export const PAPER_STEPS = [
  { id: 'abstract', text: 'Read the abstract' },
  { id: 'figures', text: 'Look at the figures and tables' },
  { id: 'conclusion', text: 'Read the conclusion' },
  { id: 'method', text: 'Read the method' },
  { id: 'write', text: 'Write 5 lines in my own words' },
]

/** The first paper that is not done yet (shown on Today on paper Sundays). */
export const nextPaper = (papers: Record<string, { status: string }>) => PAPERS.find((paper) => papers[paper.id]?.status !== 'Done')
