// The project ladder: small and safe first, real and deployed later.
// Each step is a checkbox (saved as "proj:<id>:<index>").
export type Project = {
  id: string
  tier: number
  tierName: string
  name: string
  phase: string
  what: string
  proves: string[]
  steps: string[]
  deployStep?: number // index of the "it is live" step (for the "first deployed project" badge)
  doneWhen: string[]
  stretch: string[]
  resume: string
}

export const PROJECTS: Project[] = [
  // ---------------------------------------------------------------- Tier 1: Beginner (Phase 1)
  {
    id: 'guess', tier: 1, tierName: 'Beginner', name: 'Number guessing game', phase: 'Phase 1 (weeks 2–3)',
    what: 'The computer picks a number from 1 to 100. You guess. It says "higher" or "lower" until you get it.',
    proves: ['Loops and if/else', 'Reading input safely', 'Using a module (random)'],
    steps: [
      'Pick a random number with random.randint',
      'Loop: ask for a guess, convert it with int()',
      'Say "higher", "lower" or "correct"',
      'Handle bad input (letters) with try/except',
      'Count the guesses and show them at the end',
      'Ask "play again?"',
    ],
    doneWhen: ['It never crashes, whatever you type', 'You wrote every line yourself'],
    stretch: ['Difficulty levels (1–10, 1–100, 1–1000)', 'Save the best score to a file'],
    resume: 'Not for the resume. This one is for you.',
  },
  {
    id: 'todo', tier: 1, tierName: 'Beginner', name: 'To-do list in the terminal', phase: 'Phase 1 (weeks 3–4)',
    what: 'Add, list, finish and delete tasks from a simple text menu.',
    proves: ['Lists and dicts', 'Functions', 'A simple menu loop'],
    steps: [
      'Show a menu: 1 add, 2 list, 3 done, 4 delete, 5 quit',
      'Store tasks as a list of dicts: {"title": ..., "done": False}',
      'Write one function per menu option',
      'Number the tasks when listing them',
      'Handle a wrong task number without crashing',
    ],
    doneWhen: ['Every menu option works', 'Each function is short and named clearly'],
    stretch: ['Save and load tasks from a JSON file', 'Due dates and "show overdue"'],
    resume: 'Not for the resume.',
  },
  {
    id: 'expenses', tier: 1, tierName: 'Beginner', name: 'Expense tracker (saves to a file)', phase: 'Phase 1 (weeks 5–6)',
    what: 'Log daily spending (chai, auto, groceries). See totals per day and per category.',
    proves: ['Files (CSV)', 'Dicts for grouping', 'Splitting code into modules'],
    steps: [
      'Add an expense: date, category, amount, note',
      'Save each expense as a line in expenses.csv',
      'Load all expenses when the program starts',
      'Show the total for today and for this month',
      'Show the total per category (a dict)',
      'Split the code: storage.py and main.py',
      'Push it to GitHub with a short README',
    ],
    doneWhen: ['Data survives closing the program', 'The README says how to run it', 'It is on GitHub'],
    stretch: ['A monthly budget warning', 'Export a summary to a new CSV'],
    resume: 'Optional: "Built a CLI expense tracker in Python with CSV storage and category reports."',
  },
  {
    id: 'wordcount', tier: 1, tierName: 'Beginner', name: 'Word counter for a text file', phase: 'Phase 1 (week 6)',
    what: 'Read any .txt file and print word count, line count and the 10 most common words.',
    proves: ['Reading files line by line', 'Counter', 'Cleaning text (lower, strip punctuation)'],
    steps: [
      'Read the file name from the command line (sys.argv)',
      'Read it line by line',
      'Clean each word: lower case, remove punctuation',
      'Count words with Counter',
      'Print totals and the top 10',
    ],
    doneWhen: ['Works on a big file (a whole book from Project Gutenberg)', 'Clear error if the file is missing'],
    stretch: ['Ignore common words (the, a, is)', 'Compare two files: words only in one of them'],
    resume: 'Not for the resume.',
  },

  // ---------------------------------------------------------------- Tier 2: Core (Phase 2)
  {
    id: 'myds', tier: 2, tierName: 'Core', name: 'My own data structures, with tests', phase: 'Phase 2 (weeks 7–19)',
    what: 'Write your own dynamic array, stack, queue, linked list and hash map classes, each with unit tests.',
    proves: ['You know how the structures work inside', 'Classes', 'Writing tests with pytest'],
    steps: [
      'Set up a repo with a venv and pytest',
      'DynamicArray: append with doubling, get, set, pop',
      'Stack and Queue (queue with two stacks)',
      'LinkedList: push_front, push_back, reverse, find',
      'HashMap: put, get, remove, with resizing',
      'Write tests for each one (including empty and one-item cases)',
      'Add a README table with the Big O of every method',
    ],
    doneWhen: ['All tests pass', 'You can explain every line without notes'],
    stretch: ['MinHeap with push and pop', 'Run tests on GitHub Actions on every push'],
    resume: 'Optional: "Implemented core data structures from scratch in Python with 40+ unit tests."',
  },
  {
    id: 'lctracker', tier: 2, tierName: 'Core', name: 'LeetCode progress tracker (CLI)', phase: 'Phase 2 (weeks 20–26)',
    what: 'A command-line tool: log a solved problem (pattern, minutes, wrong?), see stats, and get "redo" reminders.',
    proves: ['Designing a small program end to end', 'SQLite or JSON storage', 'argparse'],
    steps: [
      'Commands: add, list, stats, redo',
      'Store problems in SQLite (one table)',
      'stats: count by pattern and by difficulty',
      'redo: problems marked wrong more than 3 days ago',
      'Tests for the stats and redo logic',
      'README with example commands',
    ],
    doneWhen: ['You use it yourself for 2 weeks', 'Tests pass in CI'],
    stretch: ['Export a weekly report', 'A tiny web page that shows the stats'],
    resume: '"Built a CLI tool (Python, SQLite) to track 150+ solved problems with spaced-repetition reminders."',
  },

  // ---------------------------------------------------------------- Tier 3: Backend (Phase 3)
  {
    id: 'kirana', tier: 3, tierName: 'Backend', name: 'Kirana shop billing API', phase: 'Phase 3 (weeks 28–34)',
    what: 'A REST API for a small shop: products, stock, bills, daily sales report. FastAPI + PostgreSQL.',
    proves: ['REST API design', 'SQL and an ORM', 'Auth (JWT)', 'Tests, Docker and CI'],
    steps: [
      'Design the tables: products, bills, bill_items, users',
      'FastAPI app with CRUD for products',
      'Create a bill: check stock, reduce stock in one transaction',
      'Daily sales report endpoint (GROUP BY)',
      'Login with JWT; only the owner can change prices',
      'Unit and integration tests (pytest)',
      'Dockerfile and docker-compose (API + Postgres)',
      'GitHub Actions: run tests on every push',
      'Deploy to a free tier and share the live docs URL',
    ],
    deployStep: 8,
    doneWhen: ['Live URL with working /docs', 'Tests run in CI', 'README with an architecture diagram'],
    stretch: ['Low-stock alerts', 'Rate limiting', 'Caching the report'],
    resume: '"Built a billing REST API (FastAPI, PostgreSQL, Docker) with JWT auth, transactional stock updates and 85% test coverage; deployed with CI/CD."',
  },

  // ---------------------------------------------------------------- Tier 4: System (Phase 3)
  {
    id: 'shortener', tier: 4, tierName: 'System', name: 'URL shortener with caching and rate limiting', phase: 'Phase 3 (weeks 35–38)',
    what: 'Short links that redirect fast. Redis cache for hot links, rate limit per user, click counts.',
    proves: ['System design ideas in real code', 'Caching', 'Rate limiting', 'Measuring latency'],
    steps: [
      'POST /shorten returns a short code (base62)',
      'GET /{code} redirects (301 or 302: know why)',
      'Store links in Postgres with an index on code',
      'Cache hot links in Redis; measure the speed-up',
      'Rate limit: N requests per minute per IP',
      'Count clicks without slowing the redirect (background job)',
      'Load test with a simple tool and write down p50 and p95 latency',
      'Deploy and share the URL',
    ],
    deployStep: 7,
    doneWhen: ['Live and working', 'README explains the design and shows the numbers'],
    stretch: ['Custom aliases', 'Expiring links', 'A tiny stats page'],
    resume: '"Built a URL shortener (FastAPI, Postgres, Redis) with caching that cut p95 redirect latency from X ms to Y ms, and per-IP rate limiting."',
  },

  // ---------------------------------------------------------------- Tier 5: Serious project (Phase 4)
  {
    id: 'serious', tier: 5, tierName: 'Serious project', name: 'One real backend product (your startup test)', phase: 'Phase 4 (weeks 35–52)',
    what: 'A real product that solves a real problem for real users. Ideally AI-powered. Deployed, measured, improved.',
    proves: ['You can ship', 'Product thinking', 'Talking to users', 'Owning a system in production'],
    steps: [
      'Write 3 problem ideas, one page each',
      'Talk to 10 people who have the problem. Write notes',
      'Pick one. Write a one-page spec: user, core feature, success metric',
      'Design: data model, API, architecture diagram',
      'Repo, FastAPI skeleton, Postgres, Docker, CI',
      'Core feature 1 with tests',
      'Core feature 2 and auth',
      'AI feature with an eval set of 20 examples',
      'Deploy v0.1 and share with 3 people',
      'Logging, error tracking and metrics (users, latency, error rate)',
      'Get 10 real users. Collect feedback',
      'Ship one improvement from feedback',
      'Write a case study',
    ],
    deployStep: 8,
    doneWhen: ['Real users (not only friends being nice)', 'A dashboard with real numbers', 'A clear README and case study'],
    stretch: ['Charge a small amount (only if your job contract allows it)', 'Open-source a useful part'],
    resume: '"Built and launched [product] (FastAPI, Postgres, LLM API) used by N people weekly; p95 latency X ms, error rate Y%."',
  },

  // ---------------------------------------------------------------- Tier 6: AI engineering
  {
    id: 'rag', tier: 6, tierName: 'AI engineering', name: 'RAG app with evaluation and cost tracking', phase: 'Phase 4–5 (alongside)',
    what: 'Ask questions over real documents (for example, your notes or public government scheme PDFs). Measure answer quality and cost.',
    proves: ['Embeddings and vector search', 'RAG step by step', 'Evaluation, not just demos', 'Cost and latency awareness'],
    steps: [
      'Collect 20–50 real documents',
      'Split into chunks and embed them',
      'Store vectors (start simple: a NumPy array or pgvector)',
      'Retrieve the top chunks for a question',
      'Call an LLM with the chunks and ask it to cite them',
      'Build an eval set: 30 questions with expected answers',
      'Score retrieval and answers; track cost and latency per question',
      'Try one improvement (chunk size, reranking) and compare the scores',
      'Deploy a small API and write up the results',
    ],
    deployStep: 8,
    doneWhen: ['An eval table: before and after your improvement', 'Cost per 100 questions is known'],
    stretch: ['Guardrails: refuse when no source supports the answer', 'A tool-calling agent that uses the RAG as one tool'],
    resume: '"Built a RAG service over N documents; improved answer accuracy on a 30-question eval set from X% to Y% while keeping cost under ₹Z per 100 queries."',
  },
]

export const EARNING_RULES = [
  'First, read your current job contract and company policy. Look for "moonlighting", "outside work", "conflict of interest" and "intellectual property (IP)" clauses.',
  'If the contract says outside paid work needs permission, ask in writing and wait for a written yes. If it is not allowed, do not do it.',
  'Never use your employer’s laptop, time, code, data or clients for side work.',
  'Start small only when allowed: a simple billing sheet, a booking form or a stock tracker for a local shop.',
  'Price simply and honestly. Write down what you will deliver before you start.',
  'Never lie on a resume. A small honest project beats a big fake one, and fake claims get caught in interviews.',
  'Your main goal this year is skills and a strong job. Earning is a bonus, never at the cost of sleep or study.',
]
