// Free learning resources. "main" = the one to finish. "backup" = use only if the main one does not click.
// verify: true means "open the link and check it before you rely on it".
export type Resource = {
  id: string
  name: string
  url?: string // books have no link
  topic: string
  goodFor: string
  when: string
  role: 'main' | 'backup'
  verify?: boolean
}

export const RESOURCES: Resource[] = [
  // Python
  { id: 'cs50p', name: 'CS50P: Harvard Python course', url: 'https://cs50.harvard.edu/python/', topic: 'Python', goodFor: 'Clear video lectures and problem sets from zero.', when: 'Weeks 1–6', role: 'main' },
  { id: 'pytut', name: 'Python official tutorial', url: 'https://docs.python.org/3/tutorial/', topic: 'Python', goodFor: 'Exact rules of the language. Read a section after the lecture.', when: 'Weeks 1–6', role: 'backup' },
  { id: 'pythontutor', name: 'Python Tutor', url: 'https://pythontutor.com', topic: 'Python', goodFor: 'Watch your code run line by line and see memory boxes.', when: 'Every week', role: 'main' },
  { id: 'exercism', name: 'Exercism Python track', url: 'https://exercism.org/tracks/python', topic: 'Python', goodFor: 'Small exercises with free mentor feedback.', when: 'Weeks 3–6', role: 'backup' },
  { id: 'pydocs-ds', name: 'Python docs: data structures', url: 'https://docs.python.org/3/tutorial/datastructures.html', topic: 'Python', goodFor: 'List methods, dicts, sets, comprehensions in one page.', when: 'Weeks 2–4', role: 'backup' },
  { id: 'pydocs-collections', name: 'Python docs: collections', url: 'https://docs.python.org/3/library/collections.html', topic: 'Python', goodFor: 'Counter, defaultdict, deque.', when: 'Week 9 onward', role: 'backup' },
  { id: 'pydocs-heapq', name: 'Python docs: heapq', url: 'https://docs.python.org/3/library/heapq.html', topic: 'Python', goodFor: 'Heap functions used in top-K problems.', when: 'Week 19', role: 'backup' },
  { id: 'pydocs-bisect', name: 'Python docs: bisect', url: 'https://docs.python.org/3/library/bisect.html', topic: 'Python', goodFor: 'Ready-made binary search on sorted lists.', when: 'Week 13', role: 'backup' },
  { id: 'pywiki-tc', name: 'Python wiki: TimeComplexity', url: 'https://wiki.python.org/moin/TimeComplexity', topic: 'Python', goodFor: 'Big O of every list, dict and set operation.', when: 'Week 6 onward', role: 'main' },

  // DSA
  { id: 'neetcode', name: 'NeetCode roadmap (NeetCode 150)', url: 'https://neetcode.io/roadmap', topic: 'DSA', goodFor: 'The order we follow. One video per problem.', when: 'Weeks 7–43', role: 'main' },
  { id: 'leetcode', name: 'LeetCode', url: 'https://leetcode.com', topic: 'DSA', goodFor: 'Where you solve and submit problems.', when: 'Week 6 onward', role: 'main' },
  { id: 'striver', name: 'takeUforward (Striver A2Z sheet)', url: 'https://takeuforward.org', topic: 'DSA', goodFor: 'A second explanation and extra problems by topic.', when: 'If stuck', role: 'backup' },
  { id: 'abdulbari', name: 'Abdul Bari: Algorithms (YouTube)', url: 'https://www.youtube.com/@abdul_bari', topic: 'DSA', goodFor: 'Slow, clear concept videos: sorting, graphs, DP.', when: 'Weeks 13–31', role: 'backup' },
  { id: 'visualgo', name: 'VisuAlgo', url: 'https://visualgo.net', topic: 'DSA', goodFor: 'Animations of sorting, trees, graphs, heaps.', when: 'Weeks 7–35', role: 'backup' },
  { id: 'bigo', name: 'Big-O Cheat Sheet', url: 'https://www.bigocheatsheet.com', topic: 'DSA', goodFor: 'One-page table of common complexities.', when: 'Week 6', role: 'backup' },

  // SQL
  { id: 'sqlbolt', name: 'SQLBolt', url: 'https://sqlbolt.com', topic: 'SQL', goodFor: 'Interactive lessons in the browser. Start here.', when: 'Weeks 7–11 (Fridays)', role: 'main' },
  { id: 'modesql', name: 'Mode SQL tutorial', url: 'https://mode.com/sql-tutorial/', topic: 'SQL', goodFor: 'Longer explanations, good for window functions.', when: 'Weeks 14–19', role: 'backup' },
  { id: 'sql50', name: 'LeetCode SQL 50', url: 'https://leetcode.com/studyplan/top-sql-50/', topic: 'SQL', goodFor: 'Interview-style SQL practice.', when: 'Weeks 12–25 (Fridays)', role: 'main' },
  { id: 'datalemur', name: 'DataLemur', url: 'https://datalemur.com', topic: 'SQL', goodFor: 'Real company SQL questions.', when: 'Weeks 19–26', role: 'backup' },

  // CS fundamentals
  { id: 'cs50x', name: 'CS50x: Harvard intro to CS', url: 'https://cs50.harvard.edu/x/', topic: 'CS fundamentals', goodFor: 'Memory, C, how computers work underneath.', when: 'Optional, any time', role: 'backup' },
  { id: 'ostep', name: 'OSTEP: free operating systems book', url: 'https://pages.cs.wisc.edu/~remzi/OSTEP/', topic: 'CS fundamentals', goodFor: 'Processes, memory, concurrency in simple chapters.', when: 'Weeks 27–30 (Fridays)', role: 'main' },
  { id: 'cmudb', name: 'CMU Database Systems (YouTube)', url: 'https://www.youtube.com/@CMUDatabaseGroup', topic: 'CS fundamentals', goodFor: 'How databases work inside: indexes, transactions.', when: 'Weeks 35–38 (Fridays)', role: 'main' },
  { id: 'missing', name: 'The Missing Semester (MIT)', url: 'https://missing.csail.mit.edu', topic: 'CS fundamentals', goodFor: 'Shell, Git, editors, debugging tools.', when: 'Week 6 onward', role: 'main' },
  { id: 'gitbranching', name: 'Learn Git Branching', url: 'https://learngitbranching.js.org', topic: 'CS fundamentals', goodFor: 'Learn Git by playing levels.', when: 'Week 6', role: 'main' },
  { id: 'mdn-http', name: 'MDN: HTTP', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP', topic: 'CS fundamentals', goodFor: 'HTTP methods, status codes, headers, caching.', when: 'Weeks 27–34', role: 'main' },

  // Backend
  { id: 'roadmapsh', name: 'roadmap.sh: Backend', url: 'https://roadmap.sh/backend', topic: 'Backend', goodFor: 'Map of what a backend engineer should know.', when: 'Week 27', role: 'main' },
  { id: 'fastapi', name: 'FastAPI docs (tutorial)', url: 'https://fastapi.tiangolo.com', topic: 'Backend', goodFor: 'Build Python APIs step by step.', when: 'Weeks 28–34', role: 'main' },
  { id: 'fso', name: 'Full Stack Open', url: 'https://fullstackopen.com', topic: 'Backend', goodFor: 'Full web app course with testing and CI.', when: 'Optional', role: 'backup' },
  { id: 'postgres', name: 'PostgreSQL tutorial (official)', url: 'https://www.postgresql.org/docs/current/tutorial.html', topic: 'Backend', goodFor: 'Set up and use Postgres.', when: 'Week 29', role: 'main' },
  { id: 'docker', name: 'Docker: Get started', url: 'https://docs.docker.com/get-started/', topic: 'Backend', goodFor: 'Containers from zero.', when: 'Week 32', role: 'main' },
  { id: 'gh-actions', name: 'GitHub Actions docs', url: 'https://docs.github.com/en/actions', topic: 'Backend', goodFor: 'CI/CD: run tests and deploy on every push.', when: 'Week 33', role: 'main' },
  { id: 'redis', name: 'Redis docs', url: 'https://redis.io/docs/latest/', topic: 'Backend', goodFor: 'Caching and rate limiting basics.', when: 'Week 36', role: 'main' },
  { id: 'owasp', name: 'OWASP Top 10', url: 'https://owasp.org/www-project-top-ten/', topic: 'Backend', goodFor: 'The 10 most common web security problems.', when: 'Week 38', role: 'main' },
  { id: 'hnasr', name: 'Hussein Nasser (YouTube)', url: 'https://www.youtube.com/@hnasr', topic: 'Backend', goodFor: 'Deep but friendly backend and database talks.', when: 'Commute audio', role: 'backup' },

  // Design
  { id: 'refactoring', name: 'Refactoring Guru: design patterns', url: 'https://refactoring.guru/design-patterns', topic: 'Design', goodFor: 'Pictures and examples for each design pattern.', when: 'Weeks 41–42', role: 'main' },
  { id: 'sdprimer', name: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer', topic: 'System design', goodFor: 'Free, complete notes on every system design topic.', when: 'Week 18 onward (weekends)', role: 'main' },
  { id: 'bytebytego', name: 'ByteByteGo (YouTube)', url: 'https://www.youtube.com/@ByteByteGo', topic: 'System design', goodFor: 'Short animated system design videos.', when: 'Commute audio', role: 'backup' },
  { id: 'gauravsen', name: 'Gaurav Sen (YouTube)', url: 'https://www.youtube.com/@gkcs', topic: 'System design', goodFor: 'System design explained with Indian examples.', when: 'Commute audio', role: 'backup' },

  // Interviews
  { id: 'tih', name: 'Tech Interview Handbook', url: 'https://www.techinterviewhandbook.org', topic: 'Interviews', goodFor: 'Resume, coding rounds, behavioural, negotiation.', when: 'Week 44 onward', role: 'main' },

  // AI and ML
  { id: 'claude-docs', name: 'Claude API docs', url: 'https://docs.claude.com', topic: 'AI and ML', goodFor: 'Calling an LLM from code, prompt design, tool use.', when: 'Week 19 onward (weekends)', role: 'main' },
  { id: 'hf', name: 'Hugging Face courses', url: 'https://huggingface.co/learn', topic: 'AI and ML', goodFor: 'Embeddings, transformers, open models.', when: 'Week 21 onward', role: 'main' },
  { id: 'karpathy', name: 'Karpathy: Neural Networks Zero to Hero', url: 'https://karpathy.ai/zero-to-hero.html', topic: 'AI and ML', goodFor: 'Build a neural net from scratch. Later, slowly.', when: 'After week 44', role: 'backup' },
  { id: 'andrewng', name: 'Andrew Ng: Machine Learning (audit free)', url: 'https://www.coursera.org/specializations/machine-learning-introduction', topic: 'AI and ML', goodFor: 'ML basics: regression, classification, overfitting.', when: 'After week 44', role: 'main' },
  { id: 'fastai', name: 'fast.ai: Practical Deep Learning', url: 'https://course.fast.ai', topic: 'AI and ML', goodFor: 'Top-down deep learning with real projects.', when: 'After week 52', role: 'backup' },

  // Books
  { id: 'polya', name: 'How to Solve It (George Polya)', topic: 'Books', goodFor: 'A 4-step way to attack any problem.', when: 'Read slowly, 10 pages a week', role: 'main' },
  { id: 'makeitstick', name: 'Make It Stick (Brown, Roediger, McDaniel)', topic: 'Books', goodFor: 'Why testing yourself beats re-reading.', when: 'Read slowly, 10 pages a week', role: 'backup' },
]

export const resourceById = (id: string) => RESOURCES.find((r) => r.id === id)
