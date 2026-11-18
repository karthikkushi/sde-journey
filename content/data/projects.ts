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
    resume: 'Not for the resume. It is a learning project.',
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
    resume: 'Not for the resume. It is a learning project.',
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
    resume: 'Not for the resume. It is a learning project.',
  },

  // ---------------------------------------------------------------- Tier 3: Flagship 1 (Phase 3)
  // Banks, payment apps and shops (10 of the 18 realistic targets) all need this: never oversell, never charge twice.
  {
    id: 'kirana', tier: 3, tierName: 'Flagship 1', name: 'Kirana checkout and ledger API', phase: 'Phase 3 (weeks 28–38)',
    what: 'Start with the kirana billing API (products, stock, bills). Then add payments with a double-entry ledger, and a checkout that holds stock while the customer pays. The hard part: never oversell stock and never charge twice, even with many requests at once.',
    proves: ['REST API design (FastAPI + PostgreSQL)', 'Transactions, locks and idempotency', 'Correctness under concurrency, proven by tests', 'Load testing with real numbers', 'Docker, CI and deployment'],
    steps: [
      'Kirana CRUD: products, stock, bills, users. FastAPI + Postgres, JWT login (about 2 weeks)',
      'Tests (pytest), Dockerfile, docker-compose and GitHub Actions CI',
      'Ledger: accounts and journal entries whose lines always add up to zero. Money in integer paise (BIGINT), never floats',
      'POST /payments with an Idempotency-Key header: a retry gets the first response; the same key with a different body gets 422',
      'Payment states: created → authorized → captured or failed. A refund is a new journal entry, never an update',
      'Safe debits: SELECT … FOR UPDATE (or a version column) and a CHECK that no balance goes negative',
      'CI test: 200 transfers at the same time. The books still balance and no account goes negative',
      'Checkout: hold stock with a timeout when payment starts. Confirm on capture, release on failure or expiry',
      'Three reservation strategies behind one interface: conditional UPDATE, one row per unit with SKIP LOCKED, Redis Lua',
      'k6: the same idempotency key 10 times gives one charge; a flash sale gives zero oversells for every strategy',
      'Deploy it and share the live /docs URL',
      'README: problem, diagram, numbers (with the hardware stated) and 3–5 decision records',
    ],
    deployStep: 10,
    doneWhen: ['A concurrent test in CI proves the books always balance', 'k6 numbers: zero oversells, one charge per idempotency key', 'Live URL with working /docs', 'README with diagram, numbers and decision records'],
    stretch: [
      'Nightly reconciliation against a mock bank settlement file (matched, missing, mismatched), with a runbook',
      'Targeting Razorpay, PhonePe or Juspay? A payment router that spots a failing bank and fails over (circuit breaker)',
      'Targeting Razorpay, Zerodha, Swiggy or Uber? Port one hot path to Go and publish the benchmark',
    ],
    resume: '"Built a checkout and payments backend (FastAPI, PostgreSQL, Redis) with a double-entry ledger and an idempotent payment API; k6 flash-sale tests at N req/s showed zero oversells at p95 X ms."',
  },

  // ---------------------------------------------------------------- Tier 4: Optional lab
  {
    id: 'shortener', tier: 4, tierName: 'Optional lab', name: 'URL shortener with caching and rate limiting', phase: 'Optional: 1–2 weeks, or skip',
    what: 'Short links that redirect fast. Redis cache for hot links, rate limit per user, click counts. A practice lab for the classic system design question, not a resume project: both flagships teach the same Redis, rate limiting and k6 skills.',
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
    resume: 'Not for the resume. It is the classic interview question, so it never stands out. Use it to practise for the system design round.',
  },

  // ---------------------------------------------------------------- Tier 5: Flagship 2 (Phase 4)
  // An open-source developer tool can win real users; a brand-new product needing 10 users is the riskiest route to a job.
  {
    id: 'webhooks', tier: 5, tierName: 'Flagship 2', name: 'Webhook delivery service (open source)', phase: 'Phase 4 (weeks 39–48)',
    what: 'A service that reliably sends event notifications (webhooks) to many customers’ servers, like Atlassian’s or Razorpay’s webhooks: signed deliveries, retries, a dead-letter queue, and one noisy customer can never slow down the others.',
    proves: ['Queues and background workers', 'Retries, backoff and failure handling', 'Multi-tenant fairness and rate limiting', 'Security: HMAC signatures, SSRF protection', 'Running an open-source project'],
    steps: [
      'Design: tenants, endpoints, event subscriptions, deliveries. Draw the diagram',
      'Repo with FastAPI, Postgres, Docker and CI',
      'POST /events fans out to a Postgres queue; async workers claim jobs with SKIP LOCKED',
      'Sign every delivery with HMAC-SHA256 plus a timestamp (blocks replays). Log every attempt',
      'Retries with exponential backoff and jitter; a dead-letter queue with bulk replay',
      'Per-tenant token bucket in Redis (Lua), a concurrency cap per endpoint, auto-disable after repeated failures',
      'SSRF protection: refuse private and cloud-metadata addresses',
      'Read your job contract (outside work and IP clauses), then open-source it with a clear README',
      'Deploy it and share it with other developers',
      'Fairness test: tenant A floods 100,000 events while tenant B’s p95 delivery time stays under a stated limit',
      'Failure tests: a slow endpoint, an SSRF attempt, kill -9 on a worker mid-delivery (nothing is lost)',
      'Metrics and a Grafana dashboard; README with diagram, numbers and decision records',
      'Write a blog post on its hardest trade-off',
    ],
    deployStep: 8,
    doneWhen: ['Fairness, slow-endpoint, SSRF and kill-a-worker tests pass', 'Open source, with a README that shows real numbers', 'Deployed and working'],
    stretch: ['Notification variant: SMS and push providers with failover (for Swiggy, Zomato, CRED, PhonePe)', 'Real users: other developers using it, opening issues and pull requests'],
    resume: '"Built an open-source multi-tenant webhook delivery service (FastAPI, PostgreSQL, Redis) with signed deliveries, retries and a dead-letter queue; kept p95 delivery at X ms for other tenants while one tenant flooded 100k events."',
  },

  // ---------------------------------------------------------------- Tier 6: AI engineering
  {
    id: 'rag', tier: 6, tierName: 'AI engineering', name: 'RAG app with evaluation in CI', phase: 'Phase 4–5 (weeks 46–52, alongside)',
    what: 'Ask questions over real documents (for example, your notes or public government scheme PDFs). Answer quality is scored automatically in CI, so a change that makes answers worse fails the build.',
    proves: ['Embeddings and vector search', 'RAG step by step', 'Evaluation in CI, not just demos', 'Cost and latency awareness'],
    steps: [
      'Collect 20–50 real documents',
      'Ingest them as background jobs (reuse the webhook service’s queue): split into chunks and embed',
      'Store vectors (start simple: pgvector)',
      'Hybrid search: BM25 plus vectors, merged with reciprocal rank fusion',
      'Call an LLM with the chunks and ask it to cite them; refuse when no source supports the answer',
      'Eval set: 30–50 questions, scored on faithfulness, context precision, context recall and answer relevancy',
      'Run the eval in CI with a mock LLM and fail the build when scores drop. Pin the dataset, judge model, embeddings and prompts',
      'Track cost and latency per query',
      'Deploy a small API and write up the before and after scores',
    ],
    deployStep: 8,
    doneWhen: ['CI fails when answer quality drops', 'An eval table: before and after your improvement', 'Cost per 100 questions is known'],
    stretch: ['A thin LLM gateway: a rupee budget per key, a fallback provider on 429s and timeouts, an exact-match cache', 'A tool-calling agent that uses the RAG as one tool'],
    resume: '"Built a RAG service over N documents with hybrid search and CI-gated evaluation; raised faithfulness on a 40-question eval set from X% to Y% at under ₹Z per 100 queries."',
  },

  // ---------------------------------------------------------------- Tier 7: your C# edge
  {
    id: 'dotnet', tier: 7, tierName: '.NET edge', name: '.NET Aspire port of a flagship', phase: '2–3 weeks before Microsoft or UiPath applications',
    what: 'Rebuild the webhook service (or the ledger) in C# with ASP.NET Core and .NET Aspire, deployed to Azure. It turns your day-job C# into visible cloud work for Microsoft, UiPath and other .NET employers. Skip it if your job already ships C# services on Azure.',
    proves: ['Modern C# and ASP.NET Core', 'Cloud-native .NET (Aspire, OpenTelemetry)', 'Deploying to Azure', 'The same design in two stacks'],
    steps: [
      'ASP.NET Core minimal APIs and EF Core with Postgres',
      'A BackgroundService worker for the background jobs',
      '.NET Aspire AppHost for local orchestration, with OpenTelemetry',
      'xUnit tests with Testcontainers',
      'Deploy to Azure with azd',
      'Benchmark Python vs .NET on the same hardware; put the table in the README',
    ],
    deployStep: 4,
    doneWhen: ['Running on Azure', 'The same tests pass as in the Python version', 'A benchmark table in the README'],
    stretch: ['Compare your structure with Microsoft’s eShop reference app (github.com/dotnet/eShop)'],
    resume: 'One line under the original project, not a fourth project: "Ported to ASP.NET Core and .NET Aspire on Azure; N req/s vs M req/s for the Python version on the same hardware."',
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

// ---------------------------------------------------------------- AI project ladder (AI Engineer track)
// Shown ABOVE the ladder above. Same checkbox format ("proj:<id>:<index>").
export const AI_PROJECTS: Project[] = [
  {
    id: 'ai-chatbot', tier: 1, tierName: 'AI step 1', name: 'Simple chatbot (command line)', phase: 'Weeks 12–15',
    what: 'A terminal chat: you type, an LLM answers, and it remembers the conversation until you quit.',
    proves: ['Calling an LLM API from Python', 'Messages and roles', 'Tokens and cost per message', 'Keeping a key out of your code'],
    steps: [
      'Put your API key in an environment variable (never in the code, never in Git)',
      'Send one message and print the answer',
      'Loop: keep the message history so it remembers',
      'Print the tokens used and the cost after each answer',
      'Handle errors: no internet, rate limit, empty input',
      'A system prompt that gives it one job (for example a Python tutor)',
    ],
    doneWhen: ['It runs for 10 messages without crashing', 'The key is not in the repo', 'You can explain tokens and cost from it'],
    stretch: ['Stream the answer word by word', 'Save conversations to a file'],
    resume: 'Not for the resume. It is your first step.',
  },
  {
    id: 'ai-rag', tier: 2, tierName: 'AI step 2', name: 'RAG app over your own notes', phase: 'Weeks 20–26',
    what: 'Ask questions about your own study notes. It finds the right notes and answers with sources.',
    proves: ['Chunking and embeddings', 'A vector store', 'Retrieval plus generation', 'Saying "I don\'t know"'],
    steps: [
      'Load your notes and split them into chunks',
      'Embed the chunks and store them in a vector store',
      'For a question: retrieve the top chunks',
      'Answer using only those chunks, and show the sources',
      'Answer "I don\'t know" when nothing relevant comes back',
      'A README with a diagram of the flow',
    ],
    doneWhen: ['10 real questions answered with correct sources', 'It refuses when the notes do not cover the question'],
    stretch: ['Hybrid search (keywords + vectors)', 'A small web page in front of it'],
    resume: '"Built a RAG assistant over 200 study notes with source citations and refusal when unsupported."',
  },
  {
    id: 'ai-agent', tier: 3, tierName: 'AI step 3', name: 'Agent with 2–3 tools', phase: 'Weeks 31–36',
    what: 'An assistant that decides which tool to call (search notes, calculator, today\'s tasks) and uses the results to answer.',
    proves: ['Tool calling', 'The agent loop', 'Validating tool arguments', 'Limits and safety'],
    steps: [
      'One tool: a Python function the model may call',
      'Validate the arguments before running the tool',
      'Add a second and third tool; let the model pick',
      'The loop: think, call, read the result, repeat, with a step limit',
      'Log every tool call',
      'Ask for confirmation before any action that changes data',
    ],
    doneWhen: ['10 test tasks: the right tool picked in most', 'It stops after the step limit'],
    stretch: ['Expose the tools as an MCP server'],
    resume: '"Built a tool-using agent with argument validation, step limits and full call logging."',
  },
  {
    id: 'ai-evals', tier: 4, tierName: 'AI step 4', name: 'Evals for the RAG app', phase: 'Weeks 27–30 and 39–42',
    what: 'A fixed set of questions with good answers, scored automatically, so you know when a change helps.',
    proves: ['Building an eval set', 'Scoring retrieval and answers', 'Comparing versions with numbers'],
    steps: [
      'Write 20–50 questions with good answers',
      'Score retrieval: did the right chunk come back?',
      'Score answers: correct, grounded, or wrong',
      'One command runs the whole eval and prints a score',
      'Change one thing and compare the scores',
      'Run the eval in CI on every push',
    ],
    doneWhen: ['A score in the README', 'One change that improved the score, with before and after numbers'],
    stretch: ['An LLM-as-judge with a rubric, checked against your own grades'],
    resume: '"Added an automated eval suite (50 questions, run in CI) that raised answer accuracy from X% to Y%."',
  },
  {
    id: 'ai-product', tier: 5, tierName: 'AI step 5', name: 'Final AI product, deployed, with real users', phase: 'Phase 4 (weeks 35–52)',
    what: 'A small AI product that solves one real problem for real people: deployed, measured and improved.',
    proves: ['Deployment (FastAPI)', 'Cost and latency in production', 'Evals and guardrails', 'Listening to users'],
    steps: [
      'Pick one real problem and 3 people who have it',
      'Build the smallest version (RAG, an agent, or both)',
      'Deploy it behind FastAPI with timeouts and retries',
      'Log tokens, cost and latency per request',
      'Evals and guardrails in CI',
      'Get it used by real users; fix the top 3 complaints',
    ],
    deployStep: 2,
    doneWhen: ['Live URL', 'Real users have used it', 'README with design, eval score, cost per user and lessons'],
    stretch: ['A blog post about the hardest trade-off'],
    resume: '"Built and deployed an AI product used by N people; eval score X%, cost ₹Y per user per month."',
  },
]
