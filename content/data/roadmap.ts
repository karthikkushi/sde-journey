// =====================================================================
// THE 15-MONTH PLAN. Edit this file to change the roadmap.
//
// Each week lists:
//   learn     – things to read/watch/do, in order (go to morning sessions first)
//   problems  – LeetCode slugs from problems.json, easy to hard
//   friday    – the Friday evening topic (SQL in phase 2, CS basics in phase 3)
//   extras    – weekend side-tracks: system design, AI, project, interviews
//   checkpoint – a small test for Sunday
//
// src/lib/plan.ts turns each week into 7 days of tasks automatically.
// =====================================================================

export type Learn = {
  text: string
  res?: string // resource id from resources.ts (opens the website)
  note?: string // note id (opens the note in this app)
  to?: string // any page in this app, e.g. a visualizer
}

export type WeekSpec = {
  n: number
  title: string
  goal: string
  learn: Learn[]
  problems: string[]
  friday: Learn
  extras?: Learn[]
  checkpoint: string
}

export type Phase = { n: number; name: string; from: number; to: number; summary: string }

export const START_DATE = '2026-10-14' // Wednesday. Week 1 runs Wed 14 Oct to Tue 20 Oct.
export const TOTAL_WEEKS = 65

// Phases 3, 4 and 5 overlap on purpose: they run as parallel tracks.
export const PHASES: Phase[] = [
  { n: 1, name: 'Basics', from: 1, to: 6, summary: 'Python from zero. Lists, dicts, loops, functions, Big O.' },
  { n: 2, name: 'Core DSA', from: 7, to: 26, summary: 'NeetCode order: arrays to graphs. SQL every Friday. About 150 problems.' },
  { n: 3, name: 'Harder topics', from: 27, to: 43, summary: 'DP, tries, union-find, greedy. CS basics and backend skills alongside.' },
  { n: 4, name: 'Project', from: 35, to: 52, summary: 'One real backend product, deployed, with real users.' },
  { n: 5, name: 'Interviews', from: 44, to: 65, summary: 'Timed mediums, mocks, resume, referrals, applications.' },
]

// Small helpers so each line below stays short.
const R = (text: string, res: string): Learn => ({ text, res })
const N = (text: string, note: string): Learn => ({ text, note })
const T = (text: string, to: string): Learn => ({ text, to })
const D = (text: string): Learn => ({ text })

export const WEEKS: WeekSpec[] = [
  // ------------------------------------------------------------------ PHASE 1: BASICS
  {
    n: 1, title: 'Python start: functions and variables', goal: 'See how Python runs your code, one line at a time.',
    learn: [
      R('Watch CS50P Lecture 0 (Functions, Variables), first half', 'cs50p'),
      N('Read: How a computer runs code', 'a01-how-code-runs'),
      R('Watch CS50P Lecture 0, second half', 'cs50p'),
      N('Read: Variables and memory', 'a02-variables-memory'),
      R('Run 3 small programs in Python Tutor and watch each step', 'pythontutor'),
      N('Read: Lists (part 1: what a list is)', 'a09-lists'),
      D('By hand, no AI: sum of a list'),
      D('By hand, no AI: largest number in a list'),
      D('By hand, no AI: reverse a list'),
      D('By hand, no AI: count words in a sentence'),
      D('By hand, no AI: is a word a palindrome?'),
    ],
    problems: [],
    friday: R('CS50P Problem Set 0: try 2 problems', 'cs50p'),
    checkpoint: 'CS50P lecture 0 done. 5 list exercises written by me, no AI.',
  },
  {
    n: 2, title: 'Conditionals, loops, and how a list sits in memory', goal: 'Write loops without looking anything up.',
    learn: [
      R('Watch CS50P Lecture 1 (Conditionals)', 'cs50p'),
      N('Read: if / else', 'a05-if-else'),
      R('Watch CS50P Lecture 2 (Loops)', 'cs50p'),
      N('Read: Loops', 'a06-loops'),
      T('Visualizer: what happens when a list grows (append)', '/viz/list-append'),
      D('Loop set 1: print 1 to 10, even numbers to 50, table of 7, sum 1 to 100, count vowels'),
      D('Loop set 2: factorial, reverse the digits of a number, max without max(), count positives, star triangle'),
      N('Read again: Lists (memory, append, insert, slicing)', 'a09-lists'),
    ],
    problems: [],
    friday: R('CS50P Problem Set 1: try 2 problems', 'cs50p'),
    checkpoint: 'Find the second-largest number in a list with a loop, no help.',
  },
  {
    n: 3, title: 'Exceptions, libraries, strings', goal: 'Read error messages calmly. Handle text well.',
    learn: [
      R('Watch CS50P Lecture 3 (Exceptions)', 'cs50p'),
      N('Read: Exceptions', 'a20-exceptions'),
      N('Read: Reading error messages', 'a23-reading-errors'),
      R('Watch CS50P Lecture 4 (Libraries)', 'cs50p'),
      N('Read: Numbers and strings', 'a03-numbers-strings'),
      D('String drill: one line each for upper, lower, strip, split, join, replace, find'),
      D('Write: count words, title-case a name, check if text is only digits'),
      N('Read: Input and output', 'a04-input-output'),
      N('Read: Debugging with print and a debugger', 'a24-debugging'),
    ],
    problems: [],
    friday: R('CS50P Problem Set 2 or 3: try 2 problems', 'cs50p'),
    checkpoint: 'Split a sentence into words, clean them (strip, lower), and count them. No help.',
  },
  {
    n: 4, title: 'Dictionaries, sets, tuples, comprehensions', goal: 'Understand hashing: why dict lookup is fast.',
    learn: [
      N('Read: Dictionaries (hashing explained)', 'a11-dictionaries'),
      T('Visualizer: dictionary buckets', '/viz/hash'),
      N('Read: Sets', 'a12-sets'),
      N('Read: Tuples', 'a10-tuples'),
      N('Read: Comprehensions', 'a13-comprehensions'),
      D('Kirana register: dict of item → price. Add, update, delete, total bill'),
      D('Two shopping lists: find common items with a set'),
      D('Rewrite 5 loops from week 2 as comprehensions'),
    ],
    problems: [],
    friday: R('Exercism Python: 2 exercises on dicts or sets', 'exercism'),
    checkpoint: 'Count each word in a paragraph using a dict. No help.',
  },
  {
    n: 5, title: 'Functions deeper, recursion, classes, sorting', goal: 'Write small functions and one class with confidence.',
    learn: [
      N('Read: Functions', 'a07-functions'),
      N('Read: Scope', 'a08-scope'),
      N('Read: Recursion basics', 'a18-recursion'),
      N('Read: Classes and objects', 'a19-classes'),
      N('Read: Sorting and key', 'a14-sorting-key'),
      D('Recursion: factorial, sum of list, power(x, n). Trace each in Python Tutor'),
      D('Class: AutoRide with distance and a fare() method'),
      D('Sort cricket players by runs (high first), then by name, using key='),
    ],
    problems: [],
    friday: N('Files: read and write a text file', 'a21-files'),
    checkpoint: 'Write a recursive function and a small class with one method. No help.',
  },
  {
    n: 6, title: 'Big O, first LeetCode problems, Git', goal: 'Solve 10 easy problems and say their Big O.',
    learn: [
      N('Read: Big O', 'b01-big-o'),
      N('Read: Best, average, worst case', 'b02-cases'),
      N('Read: Amortized cost (why append is O(1))', 'b03-amortized'),
      N('Read: Space and the recursion stack', 'b04-space-recursion'),
      N('Read: Guess the Big O from input size', 'b05-estimate-n'),
      N('Read: Modules and virtual environments', 'a22-modules-venv'),
    ],
    problems: [
      'running-sum-of-1d-array', 'concatenation-of-array', 'shuffle-the-array', 'richest-customer-wealth',
      'kids-with-the-greatest-number-of-candies', 'fizz-buzz', 'reverse-string', 'defanging-an-ip-address',
      'jewels-and-stones', 'number-of-good-pairs',
    ],
    friday: R('Learn Git Branching: first 4 levels, then push your exercises to GitHub', 'gitbranching'),
    checkpoint: 'Loops, functions, list and dict code without copying. Say the Big O of each.',
  },

  // ------------------------------------------------------------------ PHASE 2: CORE DSA
  {
    n: 7, title: 'Arrays and strings', goal: 'Move through an array with one or two indexes.',
    learn: [
      N('Read: Arrays and strings', 'c-arrays-strings'),
      T('Visualizer: array insert and delete', '/viz/array'),
      R('Look up list costs on the TimeComplexity page', 'pywiki-tc'),
    ],
    problems: ['remove-element', 'merge-sorted-array', 'remove-duplicates-from-sorted-array', 'majority-element', 'longest-common-prefix', 'is-subsequence', 'move-zeroes', 'pascals-triangle'],
    friday: R('SQL: SQLBolt lessons 1–4 (SELECT, WHERE)', 'sqlbolt'),
    checkpoint: 'Remove duplicates from a sorted array in place, no help.',
  },
  {
    n: 8, title: 'Prefix sums and Kadane', goal: 'Answer "sum of a range" fast.',
    learn: [
      N('Read: Prefix sums', 'c-prefix-sums'),
      T('Pattern: prefix sum', '/patterns/prefix'),
      D("Kadane's idea: keep the best sum ending here. Try Maximum Subarray first, then watch NeetCode"),
    ],
    problems: ['range-sum-query-immutable', 'find-pivot-index', 'product-of-array-except-self', 'maximum-subarray', 'subarray-sum-equals-k', 'contiguous-array'],
    friday: R('SQL: SQLBolt lessons 5–6 (joins)', 'sqlbolt'),
    checkpoint: 'Explain prefix sums with a cricket score example. Solve Find Pivot Index again.',
  },
  {
    n: 9, title: 'Hashing', goal: 'Use a dict to turn O(n²) into O(n).',
    learn: [
      N('Read: Hash maps and sets', 'c-hashmaps'),
      T('Pattern: frequency counting', '/patterns/freq'),
      N('Read: collections (Counter, defaultdict, deque)', 'a15-collections'),
    ],
    problems: ['contains-duplicate', 'valid-anagram', 'two-sum', 'ransom-note', 'isomorphic-strings', 'group-anagrams', 'top-k-frequent-elements', 'valid-sudoku', 'longest-consecutive-sequence', 'encode-and-decode-strings'],
    friday: R('SQL: SQLBolt lessons 7–9 (outer joins, NULL, expressions)', 'sqlbolt'),
    checkpoint: 'Two Sum in O(n) from a blank page. Explain why a dict makes it fast.',
  },
  {
    n: 10, title: 'Two pointers', goal: 'Spot "sorted + pair" problems.',
    learn: [
      N('Read: Two pointers', 'd-two-pointers'),
      T('Pattern: two pointers (opposite ends)', '/patterns/tp-opposite'),
      T('Visualizer: two pointers', '/viz/two-pointers'),
    ],
    problems: ['squares-of-a-sorted-array', 'valid-palindrome', 'two-sum-ii-input-array-is-sorted', '3sum', 'container-with-most-water', 'trapping-rain-water'],
    friday: R('SQL: SQLBolt lessons 10–12 (GROUP BY, HAVING)', 'sqlbolt'),
    checkpoint: '3Sum without hints in 40 minutes.',
  },
  {
    n: 11, title: 'Sliding window', goal: 'Grow and shrink a window instead of re-counting.',
    learn: [
      N('Read: Sliding window', 'd-sliding-window'),
      T('Pattern: sliding window (fixed)', '/patterns/sw-fixed'),
      T('Pattern: sliding window (variable)', '/patterns/sw-variable'),
      T('Visualizer: sliding window', '/viz/sliding-window'),
    ],
    problems: ['contains-duplicate-ii', 'maximum-average-subarray-i', 'best-time-to-buy-and-sell-stock', 'longest-substring-without-repeating-characters', 'longest-repeating-character-replacement', 'permutation-in-string', 'minimum-window-substring', 'sliding-window-maximum'],
    friday: R('SQL: finish SQLBolt (INSERT, UPDATE, DELETE, CREATE)', 'sqlbolt'),
    checkpoint: 'Longest Substring Without Repeating Characters from a blank page.',
  },
  {
    n: 12, title: 'Stacks and monotonic stack', goal: 'Use a stack for "last in, first out" and "next greater".',
    learn: [
      N('Read: Stacks', 'c-stacks'),
      T('Visualizer: stack push and pop', '/viz/stack'),
      N('Read: Monotonic stack and queue', 'c-monotonic'),
      T('Pattern: monotonic stack', '/patterns/mono-stack'),
    ],
    problems: ['valid-parentheses', 'min-stack', 'evaluate-reverse-polish-notation', 'next-greater-element-i', 'daily-temperatures', 'generate-parentheses', 'car-fleet', 'largest-rectangle-in-histogram'],
    friday: R('SQL 50: "Select" section', 'sql50'),
    checkpoint: 'Daily Temperatures with a monotonic stack, no hints.',
  },
  {
    n: 13, title: 'Binary search', goal: 'Cut the search space in half, without off-by-one bugs.',
    learn: [
      N('Read: Binary search', 'd-binary-search'),
      T('Visualizer: binary search', '/viz/binary-search'),
      T('Pattern: binary search on index', '/patterns/bs-index'),
      N('Read: bisect', 'a17-bisect'),
      N('Read: Sorting algorithms and when to use which', 'd-sorting'),
    ],
    problems: ['binary-search', 'search-insert-position', 'guess-number-higher-or-lower', 'first-bad-version', 'search-a-2d-matrix', 'find-minimum-in-rotated-sorted-array', 'search-in-rotated-sorted-array'],
    friday: R('SQL 50: "Basic Joins" section', 'sql50'),
    checkpoint: 'Write binary search from memory, then Search in Rotated Sorted Array.',
  },
  {
    n: 14, title: 'Binary search on the answer', goal: 'Binary search over possible answers, not the array.',
    learn: [
      T('Pattern: binary search on answer', '/patterns/bs-answer'),
      R('Abdul Bari: binary search video (if the idea is still fuzzy)', 'abdulbari'),
    ],
    problems: ['sqrtx', 'find-peak-element', 'koko-eating-bananas', 'capacity-to-ship-packages-within-d-days', 'time-based-key-value-store', 'median-of-two-sorted-arrays'],
    friday: N('SQL: subqueries (read the note, then 3 SQL 50 problems)', 'e-subqueries-ctes'),
    checkpoint: 'Koko Eating Bananas: explain why the answer space is sorted.',
  },
  {
    n: 15, title: 'Linked lists', goal: 'Draw boxes and arrows before you code.',
    learn: [
      N('Read: Linked lists (dummy node, reversal, fast/slow)', 'c-linked-lists'),
      T('Visualizer: linked list insert and reverse', '/viz/linked-list'),
      T('Pattern: linked list reversal', '/patterns/ll-reverse'),
    ],
    problems: ['middle-of-the-linked-list', 'reverse-linked-list', 'merge-two-sorted-lists', 'remove-linked-list-elements', 'linked-list-cycle', 'remove-nth-node-from-end-of-list', 'reorder-list', 'add-two-numbers', 'copy-list-with-random-pointer'],
    friday: N('SQL: CTEs (WITH ... AS)', 'e-subqueries-ctes'),
    checkpoint: 'Reverse a linked list, both loop and recursive, from a blank page.',
  },
  {
    n: 16, title: 'Trees 1: DFS', goal: 'Think "what does my child return to me?"',
    learn: [
      N('Read: Trees (DFS, BFS, height, diameter)', 'c-trees'),
      T('Pattern: tree DFS', '/patterns/tree-dfs'),
      R('VisuAlgo: binary tree traversal', 'visualgo'),
    ],
    problems: ['binary-tree-inorder-traversal', 'invert-binary-tree', 'maximum-depth-of-binary-tree', 'same-tree', 'symmetric-tree', 'diameter-of-binary-tree', 'balanced-binary-tree', 'subtree-of-another-tree'],
    friday: R('SQL 50: "Basic Aggregate Functions"', 'sql50'),
    checkpoint: 'Diameter of Binary Tree without hints.',
  },
  {
    n: 17, title: 'Trees 2: BFS and harder DFS', goal: 'Level order with a queue. Pass values down and up.',
    learn: [
      N('Read: Queues and deques', 'c-queues-deques'),
      T('Visualizer: queue', '/viz/queue'),
      T('Pattern: tree BFS (level order)', '/patterns/tree-bfs'),
    ],
    problems: ['path-sum', 'binary-tree-level-order-traversal', 'binary-tree-right-side-view', 'count-good-nodes-in-binary-tree', 'construct-binary-tree-from-preorder-and-inorder-traversal', 'binary-tree-maximum-path-sum'],
    friday: R('SQL 50: "Sorting and Grouping"', 'sql50'),
    checkpoint: 'Level Order Traversal from memory in 15 minutes.',
  },
  {
    n: 18, title: 'Binary search trees', goal: 'Use the BST rule: left < node < right.',
    learn: [
      N('Read: Binary search trees', 'c-bst'),
      N('Read: Divide and conquer', 'd-divide-conquer'),
    ],
    problems: ['search-in-a-binary-search-tree', 'insert-into-a-binary-search-tree', 'convert-sorted-array-to-binary-search-tree', 'lowest-common-ancestor-of-a-binary-search-tree', 'validate-binary-search-tree', 'kth-smallest-element-in-a-bst', 'delete-node-in-a-bst', 'serialize-and-deserialize-binary-tree'],
    friday: N('SQL: window functions part 1 (ROW_NUMBER, RANK)', 'e-window-functions'),
    extras: [
      N('System design: scalability, vertical vs horizontal scaling', 'i-scaling'),
      N('AI: what an LLM is, and what tokens are', 'j-llm-basics'),
    ],
    checkpoint: 'Validate BST: explain why checking only parent-child is wrong.',
  },
  {
    n: 19, title: 'Heaps and priority queues', goal: 'Get the smallest (or largest) item fast.',
    learn: [
      N('Read: Heaps', 'c-heaps'),
      N('Read: heapq in Python', 'a16-heapq'),
      T('Pattern: top K with heap', '/patterns/top-k'),
      T('Pattern: two heaps (median)', '/patterns/two-heaps'),
    ],
    problems: ['kth-largest-element-in-a-stream', 'last-stone-weight', 'k-closest-points-to-origin', 'kth-largest-element-in-an-array', 'top-k-frequent-words', 'task-scheduler', 'merge-k-sorted-lists', 'find-median-from-data-stream'],
    friday: N('SQL: window functions part 2 (LAG, LEAD, running totals)', 'e-window-functions'),
    extras: [
      N('System design: load balancing', 'i-load-balancing'),
      N('AI: call an LLM API from Python (hello world)', 'j-llm-api'),
    ],
    checkpoint: 'Kth Largest Element: explain heap vs sorting cost.',
  },
  {
    n: 20, title: 'Recursion and backtracking 1', goal: 'Choose, explore, un-choose.',
    learn: [
      N('Read again: Recursion basics', 'a18-recursion'),
      N('Read: Backtracking', 'd-backtracking'),
      T('Pattern: backtracking', '/patterns/backtracking'),
    ],
    problems: ['fibonacci-number', 'powx-n', 'subsets', 'combination-sum', 'permutations', 'letter-combinations-of-a-phone-number'],
    friday: R('SQL 50: "Advanced Select and Joins"', 'sql50'),
    extras: [
      N('System design: caching layers', 'i-caching'),
      N('AI: prompt design basics', 'j-prompts'),
    ],
    checkpoint: 'Subsets: draw the decision tree on paper, then code it.',
  },
  {
    n: 21, title: 'Backtracking 2', goal: 'Handle duplicates and pruning.',
    learn: [D('Draw the decision tree on paper before coding every problem this week')],
    problems: ['combinations', 'subsets-ii', 'combination-sum-ii', 'word-search', 'palindrome-partitioning', 'n-queens'],
    friday: N('SQL: indexes and how a B-tree index works', 'e-indexes'),
    extras: [
      N('System design: CDN', 'i-cdn'),
      N('AI: embeddings in simple words', 'j-embeddings'),
    ],
    checkpoint: 'Subsets II: explain how sorting helps skip duplicates.',
  },
  {
    n: 22, title: 'Graphs 1: DFS, components', goal: 'Turn a grid or edge list into a graph and walk it.',
    learn: [
      N('Read: Graphs (adjacency list, BFS, DFS)', 'c-graphs'),
      T('Visualizer: DFS on a small graph', '/viz/dfs'),
      T('Pattern: graph DFS (islands, components)', '/patterns/graph-dfs'),
    ],
    problems: ['flood-fill', 'island-perimeter', 'number-of-islands', 'max-area-of-island', 'clone-graph', 'pacific-atlantic-water-flow', 'surrounded-regions'],
    friday: N('SQL: transactions and ACID', 'e-transactions'),
    extras: [
      N('System design: SQL vs NoSQL', 'i-sql-nosql'),
      N('AI: vector search with a tiny example', 'j-vector-search'),
    ],
    checkpoint: 'Number of Islands with DFS and with BFS.',
  },
  {
    n: 23, title: 'Graphs 2: BFS, topological sort', goal: 'Shortest path in steps. Order tasks with dependencies.',
    learn: [
      T('Visualizer: BFS on a small graph', '/viz/bfs'),
      T('Pattern: graph BFS (shortest path)', '/patterns/graph-bfs'),
      T('Pattern: topological sort', '/patterns/topo'),
    ],
    problems: ['rotting-oranges', 'walls-and-gates', 'shortest-path-in-binary-matrix', 'course-schedule', 'course-schedule-ii', 'word-ladder'],
    friday: N('SQL: normalization (1NF, 2NF, 3NF)', 'e-normalization'),
    extras: [
      N('System design: replication', 'i-replication'),
      N('AI: RAG step by step (read)', 'j-rag'),
    ],
    checkpoint: 'Course Schedule: explain cycle detection in your own words.',
  },
  {
    n: 24, title: 'Graphs 3: components and Dijkstra', goal: 'Shortest path when edges have weights.',
    learn: [
      T('Pattern: Dijkstra', '/patterns/dijkstra'),
      R('Abdul Bari: Dijkstra video', 'abdulbari'),
      D('Bellman-Ford: read only, no code yet'),
    ],
    problems: ['find-if-path-exists-in-graph', 'number-of-provinces', 'number-of-connected-components-in-an-undirected-graph', 'graph-valid-tree', 'network-delay-time', 'path-with-minimum-effort'],
    friday: N('SQL: reading a query plan (EXPLAIN)', 'e-query-plans'),
    extras: [
      N('System design: partitioning and sharding', 'i-partitioning'),
      D('AI: build a tiny RAG over 5 text files (no framework)'),
    ],
    checkpoint: 'Network Delay Time with heapq, from a blank page.',
  },
  {
    n: 25, title: 'Mixed revision + self-mock 1', goal: 'Mix topics. Practice under a timer.',
    learn: [
      N('Read: How to approach a problem', 'k-approach'),
      N('Read: LRU cache and design problems', 'c-lru-design'),
      D('Self-mock 1: 2 mediums in 60 minutes, timer on, explain aloud'),
    ],
    problems: ['sort-colors', 'lru-cache', 'find-the-duplicate-number', 'design-twitter', 'spiral-matrix', 'rotate-image'],
    friday: R('SQL 50: "Advanced String Functions / Regex / Clause"', 'sql50'),
    extras: [
      N('System design: consistent hashing', 'i-consistent-hashing'),
      N('AI: evaluating LLM outputs', 'j-evals'),
    ],
    checkpoint: 'LRU Cache in 40 minutes.',
  },
  {
    n: 26, title: 'Mixed revision + self-mock 2', goal: 'Close phase 2. Fix weak spots.',
    learn: [
      D('Self-mock 2: 2 mediums in 60 minutes, timer on, explain aloud'),
      D('Redo 10 problems you marked wrong in weeks 7–25'),
      N('Read: Edge case checklist', 'k-edge-cases'),
    ],
    problems: ['reverse-nodes-in-k-group', 'set-matrix-zeroes', 'happy-number', 'plus-one', 'multiply-strings'],
    friday: R('DataLemur: 3 medium SQL questions, timed', 'datalemur'),
    extras: [
      N('System design: CAP theorem', 'i-cap'),
      N('AI: cost and latency of LLM calls', 'j-cost-latency'),
    ],
    checkpoint: 'Month 6 check: most mediums in 30–40 minutes without help.',
  },

  // ------------------------------------------------------------------ PHASE 3: HARDER TOPICS
  {
    n: 27, title: 'DP 1: 1D basics', goal: 'Recursion → memo → table.',
    learn: [
      N('Read: DP 1D', 'd-dp-1d'),
      T('Pattern: DP 1D', '/patterns/dp-1d'),
      D('For each problem: draw the recursion tree, add memo, then build the table'),
    ],
    problems: ['climbing-stairs', 'min-cost-climbing-stairs', 'n-th-tribonacci-number', 'house-robber', 'house-robber-ii'],
    friday: R('OS: processes vs threads (OSTEP chapters 4–5)', 'ostep'),
    extras: [
      N('Backend: how the internet works (DNS, TCP, HTTP)', 'f-internet'),
      R('Backend: skim the roadmap.sh backend map', 'roadmapsh'),
    ],
    checkpoint: 'House Robber: write all three versions (recursive, memo, table).',
  },
  {
    n: 28, title: 'DP 2: 1D harder', goal: 'Define dp[i] in one clear sentence.',
    learn: [N('Read: LIS, LCS, edit distance', 'd-dp-lis-lcs')],
    problems: ['decode-ways', 'coin-change', 'maximum-product-subarray', 'word-break', 'longest-increasing-subsequence'],
    friday: N('OS: CPU scheduling', 'g-scheduling'),
    extras: [
      N('Backend: REST API design and status codes', 'f-rest'),
      R('Backend: FastAPI tutorial first steps', 'fastapi'),
    ],
    checkpoint: 'Coin Change: say what dp[i] means before coding.',
  },
  {
    n: 29, title: 'DP 3: 2D and grid', goal: 'Fill a table row by row.',
    learn: [N('Read: DP 2D and grid', 'd-dp-2d'), T('Pattern: DP 2D / grid', '/patterns/dp-2d')],
    problems: ['unique-paths', 'unique-paths-ii', 'minimum-path-sum', 'longest-common-subsequence', 'longest-increasing-path-in-a-matrix'],
    friday: N('OS: memory and virtual memory', 'g-memory'),
    extras: [
      N('Backend: databases in apps (ORM vs raw SQL)', 'f-orm'),
      R('Backend: FastAPI + PostgreSQL CRUD', 'postgres'),
    ],
    checkpoint: 'Longest Common Subsequence: draw the table for "abc" and "ac".',
  },
  {
    n: 30, title: 'DP 4: knapsack', goal: 'Take it or leave it.',
    learn: [N('Read: Knapsack DP', 'd-dp-knapsack'), T('Pattern: DP knapsack', '/patterns/dp-knapsack')],
    problems: ['partition-equal-subset-sum', 'target-sum', 'coin-change-ii', 'last-stone-weight-ii', 'ones-and-zeroes'],
    friday: N('OS: concurrency, locks, deadlocks', 'g-concurrency'),
    extras: [N('Backend: authentication (sessions, JWT, OAuth basics)', 'f-auth')],
    checkpoint: 'Partition Equal Subset Sum: explain why it is a knapsack.',
  },
  {
    n: 31, title: 'DP 5: strings and state machine', goal: 'Two strings = 2D table. Stock problems = states.',
    learn: [
      N('Read: State machine and interval DP', 'd-dp-state-interval'),
      T('Pattern: DP on strings', '/patterns/dp-strings'),
      T('Pattern: DP state machine', '/patterns/dp-state'),
    ],
    problems: ['longest-palindromic-substring', 'palindromic-substrings', 'edit-distance', 'interleaving-string', 'best-time-to-buy-and-sell-stock-ii', 'best-time-to-buy-and-sell-stock-with-cooldown'],
    friday: N('Networking: OSI and TCP/IP layers', 'g-layers'),
    extras: [N('Backend: testing (unit and integration with pytest)', 'f-testing')],
    checkpoint: 'Edit Distance: fill the table by hand for "horse" → "ros".',
  },
  {
    n: 32, title: 'Tries', goal: 'Store words letter by letter.',
    learn: [N('Read: Tries', 'c-tries'), T('Pattern: trie', '/patterns/trie')],
    problems: ['implement-trie-prefix-tree', 'design-add-and-search-words-data-structure', 'replace-words', 'search-suggestions-system', 'word-search-ii'],
    friday: N('Networking: TCP vs UDP, the 3-way handshake', 'g-tcp-udp'),
    extras: [N('Backend: Docker basics, containerize your API', 'f-docker')],
    checkpoint: 'Implement Trie from a blank page in 20 minutes.',
  },
  {
    n: 33, title: 'Union-find and intervals', goal: 'Merge groups fast. Sort intervals by start.',
    learn: [
      N('Read: Union-find', 'c-union-find'),
      T('Pattern: union-find', '/patterns/union-find'),
      N('Read: Minimum spanning tree', 'c-mst'),
      N('Read: Intervals', 'd-intervals'),
    ],
    problems: ['redundant-connection', 'accounts-merge', 'most-stones-removed-with-same-row-or-column', 'min-cost-to-connect-all-points', 'insert-interval', 'merge-intervals'],
    friday: N('Networking: HTTP versions and HTTPS', 'g-http'),
    extras: [N('Backend: CI/CD with GitHub Actions', 'f-cicd')],
    checkpoint: 'Write union-find with path compression from memory.',
  },
  {
    n: 34, title: 'Intervals and greedy', goal: 'Make the best local choice, and prove it is safe.',
    learn: [
      T('Pattern: intervals', '/patterns/intervals'),
      N('Read: Greedy', 'd-greedy'),
      T('Pattern: greedy', '/patterns/greedy'),
    ],
    problems: ['non-overlapping-intervals', 'meeting-rooms', 'meeting-rooms-ii', 'jump-game', 'jump-game-ii', 'gas-station', 'partition-labels'],
    friday: N('Networking: DNS and load balancers', 'g-dns-lb'),
    extras: [
      N('Backend: deploy to a free cloud tier', 'f-deploy'),
      N('Backend: logging and monitoring', 'f-logging'),
    ],
    checkpoint: 'Meeting Rooms II: two ways (heap, and sorted starts/ends).',
  },
  {
    n: 35, title: 'Bit manipulation and math', goal: 'Know the 5 bit tricks and basic number theory.',
    learn: [
      N('Read: Bit manipulation', 'd-bits'),
      T('Pattern: bit tricks', '/patterns/bits'),
      N('Read: Math for coding (modulo, GCD, primes, sieve)', 'd-math'),
    ],
    problems: ['single-number', 'number-of-1-bits', 'counting-bits', 'reverse-bits', 'missing-number', 'sum-of-two-integers', 'reverse-integer', 'count-primes', 'greatest-common-divisor-of-strings'],
    friday: N('DB internals: B+ tree indexes in depth', 'g-db-indexes'),
    extras: [
      N('System design classic: URL shortener', 'i-url-shortener'),
      D('Project: write 3 problem ideas, one page each (who has it, how they solve it today)'),
    ],
    checkpoint: 'Month 8 check: a new medium in 30 minutes without hints.',
  },
  {
    n: 36, title: 'Greedy 2 and advanced graphs', goal: 'Bellman-Ford and harder graph problems.',
    learn: [D('Bellman-Ford: now code it for Cheapest Flights'), N('Read: Bitmask DP (intro, light)', 'd-dp-bitmask')],
    problems: ['hand-of-straights', 'merge-triplets-to-form-target-triplet', 'valid-parenthesis-string', 'cheapest-flights-within-k-stops', 'reconstruct-itinerary', 'swim-in-rising-water'],
    friday: N('DB internals: isolation levels', 'g-isolation'),
    extras: [
      N('System design: rate limiter', 'i-rate-limiter'),
      N('Backend: caching with Redis', 'f-caching'),
      D('Project: talk to 5 people who have your problem. Write notes'),
      N('Resume v1: one page, honest', 'k-resume'),
    ],
    checkpoint: 'Cheapest Flights: explain why plain Dijkstra fails with the K limit.',
  },
  {
    n: 37, title: 'Segment tree and Fenwick tree (light)', goal: 'Know they exist. Code one once.',
    learn: [N('Read: Segment tree and Fenwick tree', 'c-segment-fenwick'), N('Read: Matrices', 'c-matrices')],
    problems: ['range-sum-query-mutable', 'my-calendar-i', 'count-of-smaller-numbers-after-self', 'detect-squares'],
    friday: N('DB internals: replication', 'g-replication'),
    extras: [
      N('System design classic: pastebin', 'i-pastebin'),
      N('Backend: message queues and background jobs', 'f-queues'),
      D('Project: talk to 5 more people. Pick one idea. Write a one-page spec'),
      N('AI: agents and tool calling basics', 'j-agents'),
    ],
    checkpoint: 'Range Sum Query Mutable with a Fenwick tree.',
  },
  {
    n: 38, title: 'Hard DP and topo revisit', goal: 'Hard problems: slow is fine. Understand fully.',
    learn: [D('Interval DP: re-read the state machine and interval DP note')],
    problems: ['distinct-subsequences', 'burst-balloons', 'regular-expression-matching', 'alien-dictionary', 'minimum-interval-to-include-each-query'],
    friday: N('DB internals: sharding', 'g-sharding'),
    extras: [
      N('System design classic: notification system', 'i-notifications'),
      N('Backend: security basics (OWASP top 10)', 'f-security'),
      D('Project design: data model, API endpoints, architecture diagram'),
      D('Apply to 3 mid-tier product companies'),
    ],
    checkpoint: 'Burst Balloons: explain the "last balloon" idea.',
  },
  {
    n: 39, title: 'String algorithms (light)', goal: 'KMP and rolling hash, at a basic level.',
    learn: [N('Read: KMP and rolling hash', 'd-string-algos')],
    problems: ['find-the-index-of-the-first-occurrence-in-a-string', 'repeated-substring-pattern', 'longest-happy-prefix', 'repeated-dna-sequences'],
    friday: N('LLD: OOP four pillars', 'h-oop'),
    extras: [
      N('System design classic: chat app', 'i-chat'),
      D('Project: repo, FastAPI skeleton, Postgres, Docker, CI'),
      N('AI: deploying an AI-backed API', 'j-deploy-ai'),
      D('Apply to 3 more companies'),
    ],
    checkpoint: 'Build the KMP prefix table for "aabaaab" by hand.',
  },
  {
    n: 40, title: 'Timed set 1: stacks and windows', goal: '2 mediums in 60 minutes, explain aloud.',
    learn: [N('Read: Thinking aloud', 'k-thinking-aloud')],
    problems: ['decode-string', 'asteroid-collision', 'online-stock-span', 'minimum-size-subarray-sum', 'fruit-into-baskets', 'find-all-anagrams-in-a-string'],
    friday: N('LLD: SOLID', 'h-solid'),
    extras: [
      N('System design classic: news feed', 'i-news-feed'),
      D('Project: core feature 1 with tests'),
      D('Apply to 3 more companies'),
    ],
    checkpoint: 'Month 10 check: mediums under a timer while explaining aloud.',
  },
  {
    n: 41, title: 'Timed set 2: trees and graphs', goal: 'Mixed graph and tree mediums under a timer.',
    learn: [N('Read: Handling being stuck', 'k-stuck')],
    problems: ['binary-tree-zigzag-level-order-traversal', 'all-nodes-distance-k-in-binary-tree', 'flatten-binary-tree-to-linked-list', 'open-the-lock', 'evaluate-division', 'snakes-and-ladders'],
    friday: N('LLD: design patterns 1 (singleton, factory, strategy)', 'h-patterns-1'),
    extras: [
      N('System design classic: file storage', 'i-file-storage'),
      D('Project: core feature 2 and auth'),
      D('Apply to 3 more companies'),
    ],
    checkpoint: 'All Nodes Distance K: explain turning a tree into a graph.',
  },
  {
    n: 42, title: 'Timed set 3: DP mix', goal: 'Recognise which DP type in under 5 minutes.',
    learn: [D('For each problem, first write: state, choice, base case. Then code')],
    problems: ['house-robber-iii', 'perfect-squares', 'maximal-square', 'triangle', 'sort-list', 'next-permutation'],
    friday: N('LLD: design patterns 2 (observer, adapter, decorator)', 'h-patterns-2'),
    extras: [
      N('System design classic: ride booking', 'i-ride-booking'),
      D('Project: AI feature. LLM call with a prompt, plus an eval set of 20 examples'),
      D('Apply to 3 more companies'),
    ],
    checkpoint: 'Maximal Square: say dp[i][j] in one sentence.',
  },
  {
    n: 43, title: 'Timed set 4: cyclic sort and design', goal: 'Close phase 3 at about 250 problems.',
    learn: [T('Pattern: cyclic sort', '/patterns/cyclic-sort'), N('LLD: design a parking lot', 'h-parking-lot')],
    problems: ['find-all-numbers-disappeared-in-an-array', 'set-mismatch', 'first-missing-positive', 'insert-delete-getrandom-o1', 'kth-smallest-element-in-a-sorted-matrix', 'search-a-2d-matrix-ii'],
    friday: N('System design: back-of-the-envelope estimation', 'i-estimation'),
    extras: [
      D('Project: deploy v0.1. Share with 3 people you interviewed'),
      N('LLD: design a library system', 'h-library'),
      D('Apply to 3 more companies'),
    ],
    checkpoint: 'First Missing Positive in O(n) time and O(1) space.',
  },

  // ------------------------------------------------------------------ PHASE 5: INTERVIEWS (+ PHASE 4 PROJECT until week 52)
  {
    n: 44, title: 'Interview mode: resume and stories', goal: 'Resume v2. First STAR stories.',
    learn: [N('Read: Behavioural stories with STAR', 'k-star'), T('Story builder: write stories 1 and 2', '/career')],
    problems: ['interval-list-intersections', 'minimum-number-of-arrows-to-burst-balloons', 'car-pooling'],
    friday: N('LLD: design an elevator', 'h-elevator'),
    extras: [
      D('Project: fix the top 3 feedback items. Add logging and error tracking'),
      N('Resume v2 with project numbers', 'k-resume'),
      D('Apply to 5 companies'),
    ],
    checkpoint: 'Tell story 1 aloud in under 2 minutes.',
  },
  {
    n: 45, title: 'Interview mode: BFS mix', goal: 'Timed mediums, explain aloud.',
    learn: [R('Tech Interview Handbook: coding interview prep section', 'tih'), T('Story builder: stories 3 and 4', '/career')],
    problems: ['01-matrix', 'shortest-bridge', 'as-far-from-land-as-possible'],
    friday: N('LLD: design Splitwise', 'h-splitwise'),
    extras: [D('Project: add metrics (users, latency, error rate)'), D('Apply to 5 companies')],
    checkpoint: '01 Matrix: explain multi-source BFS.',
  },
  {
    n: 46, title: 'Interview mode: trees + mock 1', goal: 'First real mock interview.',
    learn: [T('Mock interview 1 (with a friend). Log it', '/career'), T('Story builder: stories 5 and 6', '/career')],
    problems: ['path-sum-ii', 'path-sum-iii', 'maximum-width-of-binary-tree'],
    friday: N('Questions to ask the interviewer', 'k-questions'),
    extras: [D('Project: caching or rate limiting where needed. Small load test'), D('Referral plan: 20 companies, one real connection each')],
    checkpoint: 'Path Sum III: explain prefix sums on a tree path.',
  },
  {
    n: 47, title: 'Interview mode: binary search + mock 2', goal: 'Search on answer under pressure.',
    learn: [T('Mock interview 2. Log it', '/career')],
    problems: ['split-array-largest-sum', 'minimum-number-of-days-to-make-m-bouquets', 'find-k-closest-elements'],
    friday: R('Tech Interview Handbook: behavioural round', 'tih'),
    extras: [D('Project: README with architecture, screenshots, metrics'), D('Apply to 5 companies')],
    checkpoint: 'Split Array Largest Sum in 35 minutes.',
  },
  {
    n: 48, title: 'Interview mode: heaps + mock 3', goal: 'Keep 3 new mediums a week.',
    learn: [T('Mock interview 3. Log it', '/career')],
    problems: ['reorganize-string', 'ugly-number-ii', 'random-pick-with-weight'],
    friday: D('System design mock: URL shortener, 45 minutes, aloud'),
    extras: [D('Project: get 10 real users. Collect feedback'), D('Apply to 5 companies')],
    checkpoint: 'Reorganize String: explain the greedy + heap idea.',
  },
  {
    n: 49, title: 'Interview mode: DP + mock 4', goal: 'DP under a timer.',
    learn: [T('Mock interview 4. Log it', '/career')],
    problems: ['longest-string-chain', 'number-of-longest-increasing-subsequence', 'longest-palindromic-subsequence'],
    friday: N('Salary talk basics', 'k-salary'),
    extras: [D('Project: one improvement from user feedback'), D('Update LinkedIn and GitHub profile README')],
    checkpoint: 'Longest String Chain in 30 minutes.',
  },
  {
    n: 50, title: 'Interview mode: graphs + mock 5', goal: 'Bipartite and reachability.',
    learn: [T('Mock interview 5. Log it', '/career')],
    problems: ['is-graph-bipartite', 'possible-bipartition', 'keys-and-rooms'],
    friday: D('System design mock: chat app, 45 minutes'),
    extras: [D('Project: write a short case study or blog post'), D('Apply to 5 companies')],
    checkpoint: 'Is Graph Bipartite with BFS colouring.',
  },
  {
    n: 51, title: 'Interview mode: greedy + mock 6', goal: 'Two-pointer greedy problems.',
    learn: [T('Mock interview 6. Log it', '/career')],
    problems: ['continuous-subarray-sum', 'boats-to-save-people', 'two-city-scheduling'],
    friday: D('Review your mock log: which mistake repeats?'),
    extras: [D('Project: resume bullets with real numbers'), D('Apply to 5 companies')],
    checkpoint: 'Continuous Subarray Sum: explain the modulo trick.',
  },
  {
    n: 52, title: 'Interview mode: trees + mock 7', goal: 'Close phase 4. Project retro.',
    learn: [T('Mock interview 7. Log it', '/career')],
    problems: ['populating-next-right-pointers-in-each-node', 'count-sub-islands', 'time-needed-to-inform-all-employees'],
    friday: D('System design mock: notification system'),
    extras: [D('Project retro: what worked, what to cut. Decide: continue or park'), D('Apply to 5 companies')],
    checkpoint: 'Month 12 check: 5–10 mocks done, one-page resume, referral plan ready.',
  },
  ...[
    { n: 53, title: 'Interviews: search and DP', problems: ['search-in-rotated-sorted-array-ii', 'longest-arithmetic-subsequence', 'stock-price-fluctuation'] },
    { n: 54, title: 'Interviews: heaps and design', problems: ['sliding-window-median', 'maximum-frequency-stack', 'minimum-cost-for-tickets'] },
    { n: 55, title: 'Interviews: DP practice', problems: ['partition-array-for-maximum-sum', 'maximum-length-of-repeated-subarray', 'delete-and-earn'] },
    { n: 56, title: 'Interviews: design problems', problems: ['design-underground-system', 'snapshot-array', 'lfu-cache'] },
    { n: 57, title: 'Interviews: hard graphs', problems: ['bus-routes', 'critical-connections-in-a-network', 'making-a-large-island'] },
  ].map(
    (w): WeekSpec => ({
      ...w,
      goal: 'Interviews running. Keep skills warm with 3 new problems and redo.',
      learn: [T('Mock interview. Log it', '/career'), D('Review every real interview the same day: what went well, what to fix')],
      friday: D('System design: redo one classic design from memory'),
      extras: [D('Apply to 5 companies, follow up on referrals'), D('Redo 3 problems from your redo list, timed')],
      checkpoint: 'One timed medium, explained aloud, recorded on your phone. Watch it back.',
    }),
  ),
  ...[58, 59, 60, 61, 62, 63, 64, 65].map(
    (n): WeekSpec => ({
      n,
      title: n <= 60 ? 'Interviews and offers' : 'Google plan',
      goal: n <= 60 ? 'Interviews, offers, honest decisions.' : 'Plan the Google attempt: date, referral, prep.',
      learn:
        n <= 60
          ? [T('Mock interview. Log it', '/career'), D('Timed: 2 mediums from your redo list, explain aloud')]
          : [N('Read: Google levels and hiring', 'k-google'), D('Timed: 2 Google-style mediums from your redo list'), D('Write the Google plan: target date, referral, weekly prep')],
      problems: [],
      friday: D('System design: one classic design, 45 minutes, aloud'),
      extras: [D('Applications and follow-ups'), D('Rest well. One full day off this week')],
      checkpoint: n <= 60 ? 'Offers or clear feedback. Keep 3 mediums a week.' : 'Google plan written and shared with one mentor or friend.',
    }),
  ),
]

// ------------------------------------------------------------------ MONTHLY CHECKPOINTS
// Shown on /checkpoint/<month>. The three life checks are added to every month.
export const MONTH_CHECKS: Record<number, string[]> = {
  1: ['CS50P lecture 0 done', '5 list exercises written by me, no AI', 'I can explain what a variable and a list are'],
  2: ['Loops, functions, list and dict code without copying', 'First 10 LeetCode easy problems solved', 'I can commit and push with Git'],
  3: ['I can solve easy problems alone', 'I can solve some mediums with a hint', 'SQL: SELECT, JOIN, GROUP BY without notes'],
  4: ['I can spot two pointers and sliding window problems', 'Stack and binary search mediums with a hint'],
  5: ['I can draw and code linked list and tree problems', 'I can explain vertical vs horizontal scaling'],
  6: ['Most mediums in 30–40 minutes without help', 'About 150 problems solved', '2 timed self-mocks done'],
  7: ['DP: I can write recursion, memo and table for 1D problems', 'I can build a small FastAPI app'],
  8: ['A new medium in 30 minutes without hints', 'I started applying to mid-tier product companies', 'I can build a REST API with FastAPI and Postgres'],
  9: ['Project idea chosen after talking to 10 people', 'Resume v1 ready'],
  10: ['Mediums under a timer while explaining aloud', 'Project live (deployed)', 'About 250 problems solved'],
  11: ['First mock interviews done', 'Applications going out every week'],
  12: ['5–10 mocks done', 'One-page resume, final', 'Referral plan ready'],
  13: ['Interviews in progress, each one reviewed in my mock log'],
  14: ['Offers or clear feedback', 'Still 3 mediums a week'],
  15: ['Google plan written: target date, referral, prep schedule'],
}
export const LIFE_CHECKS = ['Savings checked this month', 'Sleep OK (7+ hours most nights)', 'Exercise streak OK']

// ------------------------------------------------------------------ DAILY HABITS
export const HABITS = [
  { id: 'exercise', text: 'Exercise' },
  { id: 'biz', text: 'Business time' },
  { id: 'notebook', text: 'Notebook: 3 lines' },
  { id: 'sleep', text: 'Sleep by 10:30' },
]

// The "minimum day" for tired days. Doing these keeps the streak alive.
export const MINIMUM_DAY = [
  { id: 'dsa', text: '30 minutes of DSA (one easy problem or one redo)' },
  { id: 'exercise', text: '10 minutes of exercise' },
  { id: 'sleep', text: 'Sleep on time' },
]
