// Step-by-step visualizers. Each one is a pure function that returns a list of "frames".
// A frame is a snapshot of the data plus a caption that explains the step.
// The Visualizer page just shows frame 0, 1, 2... (Play / Step / Reset).

export type Tone = 'hi' | 'dim' | 'new' | 'found' | 'bad'
export type Cell = { v: string; tone?: Tone }

/** A row of boxes, like an array. Empty strings are empty slots. */
export type Row = { label?: string; cells: Cell[]; pointers?: Record<number, string>; vertical?: boolean }

export type Frame =
  | { kind: 'rows'; caption: string; rows: Row[]; stats?: string }
  | { kind: 'buckets'; caption: string; buckets: Cell[][]; active?: number; stats?: string }
  | { kind: 'list'; caption: string; nodes: Cell[]; links: ('next' | 'prev' | 'null')[]; pointers: Record<number, string>; side?: string }
  | { kind: 'graph'; caption: string; tones: Record<string, Tone>; holder: { name: string; items: string[] }; order: string[] }

const cells = (values: (string | number)[], tones: Record<number, Tone | undefined> = {}): Cell[] =>
  values.map((v, i) => ({ v: String(v), tone: tones[i] }))

// ------------------------------------------------------------------ Array insert and delete
export function arrayInsertDelete(): Frame[] {
  const f: Frame[] = []
  const row = (vals: (string | number)[], tones: Record<number, Tone | undefined> = {}, caption = '') =>
    f.push({ kind: 'rows', caption, rows: [{ label: 'array (room for 6)', cells: cells(vals, tones) }] })

  let a: (string | number)[] = [10, 20, 30, 40, '', '']
  row(a, {}, 'An array keeps items side by side in memory. 4 items, room for 6. Reading a[2] is instant: jump straight to slot 2.')
  row(a, { 1: 'hi' }, 'Insert 15 at index 1. First we must make a gap at index 1.')
  for (let i = 3; i >= 1; i--) {
    a = [...a]
    a[i + 1] = a[i]
    a[i] = ''
    row(a, { [i + 1]: 'new' }, `Move ${a[i + 1]} one step right (from index ${i} to ${i + 1}). We start from the end, so nothing is overwritten.`)
  }
  a = [...a]
  a[1] = 15
  row(a, { 1: 'found' }, 'Now put 15 into the gap. 3 items had to move to insert 1. Inserting near the front of n items is O(n).')
  a = [...a]
  a[0] = ''
  row(a, { 0: 'bad' }, 'Delete index 0 (the 10). This leaves a hole at the front.')
  for (let i = 1; i <= 4; i++) {
    a = [...a]
    a[i - 1] = a[i]
    a[i] = ''
    row(a, { [i - 1]: 'new' }, `Move ${a[i - 1]} one step left to close the gap.`)
  }
  row(a, {}, 'Done. Deleting from the front moved every item: O(n). Adding or removing at the END moves nothing: O(1).')
  return f
}

// ------------------------------------------------------------------ Python list growing on append
export function listAppend(start = 2, count = 9): Frame[] {
  const f: Frame[] = []
  let items: number[] = []
  let cap = start
  let copies = 0
  const slots = (vals: number[], room: number, tones: Record<number, Tone | undefined> = {}) =>
    cells([...vals, ...Array(room - vals.length).fill('')], tones)
  const stats = (n: number) => `appends: ${n} · copies: ${copies} · steps per append ≈ ${n ? ((n + copies) / n).toFixed(2) : '0'}`

  f.push({ kind: 'rows', caption: `An empty list with room for ${cap}. (Python grows by about 1.125× plus a little; this picture doubles, to keep it simple.)`, rows: [{ label: `room ${cap}`, cells: slots([], cap) }], stats: stats(0) })
  for (let x = 1; x <= count; x++) {
    if (items.length === cap) {
      f.push({
        kind: 'rows',
        caption: `Full! To add ${x}, Python asks for a new block twice as big (room ${cap * 2}).`,
        rows: [{ label: `old (room ${cap})`, cells: slots(items, cap) }, { label: `new (room ${cap * 2})`, cells: slots([], cap * 2) }],
        stats: stats(x - 1),
      })
      copies += items.length
      f.push({
        kind: 'rows',
        caption: `Copy all ${items.length} items into the new block. This one append is slow: O(n). Then the old block is freed.`,
        rows: [{ label: `new (room ${cap * 2})`, cells: slots(items, cap * 2, Object.fromEntries(items.map((_, i) => [i, 'hi']))) }],
        stats: stats(x - 1),
      })
      cap *= 2
    }
    items = [...items, x]
    f.push({ kind: 'rows', caption: `Append ${x}: there is free room, so just put it at the end. 1 step.`, rows: [{ label: `room ${cap}`, cells: slots(items, cap, { [items.length - 1]: 'new' }) }], stats: stats(x) })
  }
  f.push({ kind: 'rows', caption: 'Copies happen less and less often, so on average each append costs about 2 steps: O(1) amortized.', rows: [{ label: `room ${cap}`, cells: slots(items, cap) }], stats: stats(count) })
  return f
}

// ------------------------------------------------------------------ Dictionary (hash table) buckets
/** A toy hash for the picture: add up the letter codes. (Python's real hash is much better mixed.) */
export const toyHash = (s: string) => [...s].reduce((sum, ch) => sum + ch.charCodeAt(0), 0)

export function hashBuckets(): Frame[] {
  const SIZE = 8
  const entries: [string, number][] = [['rice', 60], ['dal', 120], ['oil', 180], ['salt', 20], ['tea', 90], ['milk', 30]]
  const buckets: Cell[][] = Array.from({ length: SIZE }, () => [])
  const snap = () => buckets.map((b) => b.map((c) => ({ ...c })))
  const f: Frame[] = [{ kind: 'buckets', caption: 'A dict starts as a table of empty slots ("buckets"). Here: 8 buckets.', buckets: snap() }]

  for (const [key, value] of entries) {
    const h = toyHash(key)
    const i = h % SIZE
    const clash = buckets[i].length > 0
    buckets.forEach((b) => b.forEach((c) => (c.tone = undefined)))
    buckets[i].push({ v: `${key}: ${value}`, tone: 'new' })
    f.push({
      kind: 'buckets',
      active: i,
      buckets: snap(),
      caption: clash
        ? `hash("${key}") = ${h}, and ${h} % 8 = ${i}. Bucket ${i} is already used: a collision! Here we keep a short list in the bucket. (Python instead tries another slot. Same idea.)`
        : `hash("${key}") = ${h}, and ${h} % 8 = ${i}. Put "${key}" in bucket ${i}. No searching needed.`,
    })
  }
  buckets.forEach((b) => b.forEach((c) => (c.tone = undefined)))
  const find = 'salt'
  const i = toyHash(find) % SIZE
  f.push({ kind: 'buckets', active: i, buckets: snap(), caption: `Look up "${find}": compute the hash again → bucket ${i}. Go straight there.` })
  for (const c of buckets[i]) {
    const hit = c.v.startsWith(`${find}:`)
    c.tone = hit ? 'found' : 'dim'
    f.push({ kind: 'buckets', active: i, buckets: snap(), caption: hit ? `Found "${find}". We only checked this one bucket, not the whole table: O(1) on average.` : `"${c.v.split(':')[0]}" is not "${find}". Check the next key in this bucket.` })
  }
  return f
}

// ------------------------------------------------------------------ Stack
export function stackPushPop(): Frame[] {
  const f: Frame[] = []
  let s: string[] = []
  const show = (caption: string, tones: Record<number, Tone | undefined> = {}) =>
    f.push({ kind: 'rows', caption, rows: [{ label: 'stack', vertical: true, cells: cells(s, tones), pointers: s.length ? { [s.length - 1]: 'top' } : {} }] })
  show('An empty stack. Like a pile of plates: you add and remove only at the top.')
  for (const x of ['dosa', 'idli', 'vada']) {
    s = [...s, x]
    show(`push("${x}"): put it on top. O(1).`, { [s.length - 1]: 'new' })
  }
  show(`peek: look at the top ("${s.at(-1)}") without removing it. O(1).`, { [s.length - 1]: 'hi' })
  for (let k = 0; k < 2; k++) {
    show(`pop: take the top item ("${s.at(-1)}") off. Last in, first out.`, { [s.length - 1]: 'bad' })
    s = s.slice(0, -1)
    show(`"${s.at(-1)}" is now on top.`)
  }
  return f
}

// ------------------------------------------------------------------ Queue
export function queueFlow(): Frame[] {
  const f: Frame[] = []
  let q: string[] = []
  const show = (caption: string, tones: Record<number, Tone | undefined> = {}) =>
    f.push({ kind: 'rows', caption, rows: [{ label: 'queue', cells: cells(q, tones), pointers: q.length ? (q.length === 1 ? { 0: 'front/back' } : { 0: 'front', [q.length - 1]: 'back' }) : {} }] })
  show('An empty queue, like a ticket counter. Join at the back, leave from the front.')
  for (const x of ['Ravi', 'Asha', 'Meena']) {
    q = [...q, x]
    show(`${x} joins at the back. deque.append: O(1).`, { [q.length - 1]: 'new' })
  }
  for (let k = 0; k < 2; k++) {
    show(`${q[0]} is served from the front. deque.popleft: O(1). First in, first out.`, { 0: 'bad' })
    q = q.slice(1)
    show(`Now ${q[0]} is at the front.`)
  }
  q = [...q, 'John']
  show('John joins at the back. (With a plain list, pop(0) would be O(n). That is why BFS uses deque.)', { [q.length - 1]: 'new' })
  return f
}

// ------------------------------------------------------------------ Linked list: insert, then reverse
export function linkedList(): Frame[] {
  const f: Frame[] = []
  let nodes = cells([1, 2, 3, 4])
  let links: ('next' | 'prev' | 'null')[] = ['next', 'next', 'next', 'null']
  const push = (caption: string, pointers: Record<number, string> = {}, side?: string) =>
    f.push({ kind: 'list', caption, nodes: nodes.map((c) => ({ ...c })), links: [...links], pointers, side })

  push('A linked list: each node holds a value and an arrow to the next node. The last arrow points to None.', { 0: 'head' })
  push('Insert 9 after node 2. Walk from the head to node 2 (that walk is O(n)).', { 1: 'here' })
  push('Make a new node 9.', { 1: 'here' }, 'new node: 9 → ?')
  push("Point 9's arrow to node 3 FIRST, so we do not lose the rest of the list.", { 1: 'here' }, 'new node: 9 → 3')
  nodes = cells([1, 2, 9, 3, 4], { 2: 'new' })
  links = ['next', 'next', 'next', 'next', 'null']
  push("Now point node 2's arrow to 9. Only two arrows changed: O(1). No items moved, unlike an array.", { 0: 'head' })
  nodes = cells([1, 2, 9, 3, 4])
  push('Now reverse the list. Keep three names: prev (starts as None), curr (starts at head), nxt.', { 0: 'curr' })
  for (let i = 0; i < nodes.length; i++) {
    links[i] = i === 0 ? 'null' : 'prev'
    nodes = nodes.map((c, k) => ({ ...c, tone: k <= i ? 'hi' : undefined }))
    const pointers: Record<number, string> = { [i]: 'prev' }
    if (i + 1 < nodes.length) pointers[i + 1] = 'curr'
    push(
      i === 0
        ? 'Save nxt = curr.next. Turn curr\'s arrow back to prev (None). Move prev and curr one step forward.'
        : `Node ${nodes[i].v}: save nxt, point its arrow back to node ${nodes[i - 1].v}, then step forward.`,
      pointers,
    )
  }
  push('curr is None, so stop. prev (node 4) is the new head. Every arrow was turned once: O(n) time, O(1) extra space.', { [nodes.length - 1]: 'new head' })
  return f
}

// ------------------------------------------------------------------ Binary search
export function binarySearch(nums = [3, 8, 12, 17, 23, 31, 42, 56], target = 42): Frame[] {
  const f: Frame[] = []
  let lo = 0
  let hi = nums.length - 1
  const show = (caption: string, mid?: number, found = false) => {
    const tones: Record<number, Tone> = {}
    nums.forEach((_, i) => { if (i < lo || i > hi) tones[i] = 'dim' })
    if (mid !== undefined) tones[mid] = found ? 'found' : 'hi'
    const pointers: Record<number, string> = {}
    const add = (i: number, label: string) => { if (i >= 0 && i < nums.length) pointers[i] = pointers[i] ? `${pointers[i]}/${label}` : label }
    if (lo <= hi) { add(lo, 'lo'); add(hi, 'hi') }
    if (mid !== undefined) add(mid, 'mid')
    f.push({ kind: 'rows', caption, rows: [{ label: `sorted, find ${target}`, cells: cells(nums, tones), pointers }] })
  }
  show(`Find ${target} in a sorted list. lo = 0, hi = ${hi}. The answer, if it exists, is between them.`)
  let steps = 0
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2)
    steps++
    if (nums[mid] === target) {
      show(`mid = ${mid}, nums[mid] = ${nums[mid]}. Found ${target} at index ${mid} in ${steps} steps. A plain scan would take ${mid + 1}.`, mid, true)
      return f
    }
    show(`mid = (${lo} + ${hi}) // 2 = ${mid}. nums[mid] = ${nums[mid]}, which is ${nums[mid] < target ? 'smaller' : 'bigger'} than ${target}.`, mid)
    if (nums[mid] < target) lo = mid + 1
    else hi = mid - 1
    show(`So the ${nums[mid] < target ? 'left' : 'right'} half can be thrown away. Now lo = ${lo}, hi = ${hi}.`)
  }
  show(`lo > hi: ${target} is not in the list. Each step halved the range: O(log n).`)
  return f
}

// ------------------------------------------------------------------ Two pointers
export function twoPointers(nums = [1, 3, 4, 6, 8, 11], target = 10): Frame[] {
  const f: Frame[] = []
  let l = 0
  let r = nums.length - 1
  const show = (caption: string, found = false) =>
    f.push({ kind: 'rows', caption, rows: [{ label: `sorted, pair summing to ${target}`, cells: cells(nums, Object.fromEntries(nums.map((_, i) => [i, i === l || i === r ? (found ? 'found' : 'hi') : i < l || i > r ? 'dim' : undefined]))), pointers: { [l]: 'L', [r]: 'R' } }] })
  show(`Sorted list. Find two numbers that add up to ${target}. L starts at the smallest, R at the biggest.`)
  while (l < r) {
    const s = nums[l] + nums[r]
    if (s === target) {
      show(`${nums[l]} + ${nums[r]} = ${s}. Found it! Each step removed one number, so this is O(n), not O(n²).`, true)
      return f
    }
    if (s < target) {
      show(`${nums[l]} + ${nums[r]} = ${s}: too small. ${nums[l]} cannot work even with the biggest number left, so move L right.`)
      l++
    } else {
      show(`${nums[l]} + ${nums[r]} = ${s}: too big. ${nums[r]} cannot work even with the smallest number left, so move R left.`)
      r--
    }
  }
  show('L met R: no pair adds up to the target.')
  return f
}

// ------------------------------------------------------------------ Sliding window (longest substring without repeats)
export function slidingWindow(text = 'abcabcbb'): Frame[] {
  const f: Frame[] = []
  const chars = [...text]
  const last = new Map<string, number>()
  let left = 0
  let best = 0
  const show = (caption: string, right: number) =>
    f.push({
      kind: 'rows',
      caption,
      stats: `window "${chars.slice(left, right + 1).join('')}" · best length ${best}`,
      rows: [{ label: 'longest part with no repeats', cells: cells(chars, Object.fromEntries(chars.map((_, i) => [i, i === right ? 'new' : i >= left && i < right ? 'hi' : i < left ? 'dim' : undefined]))), pointers: left === right ? { [left]: 'L/R' } : { [left]: 'L', [right]: 'R' } }],
    })
  chars.forEach((ch, right) => {
    const seen = last.get(ch)
    if (seen !== undefined && seen >= left) {
      left = seen + 1
      show(`"${ch}" is already in the window (at ${seen}). Shrink: move L to ${left}, just past it.`, right)
    }
    last.set(ch, right)
    best = Math.max(best, right - left + 1)
    show(`Add "${ch}" (R = ${right}). Window length ${right - left + 1}. Best so far: ${best}.`, right)
  })
  f.push({ ...f[f.length - 1], caption: `Done: the longest part with no repeated letters has length ${best}. L and R only move forward, so it is O(n).` } as Frame)
  return f
}

// ------------------------------------------------------------------ Graph BFS and DFS
export const GRAPH: Record<string, string[]> = {
  A: ['B', 'C'],
  B: ['A', 'D', 'E'],
  C: ['A', 'F'],
  D: ['B'],
  E: ['B', 'G'],
  F: ['C', 'G'],
  G: ['E', 'F'],
}
export const GRAPH_POS: Record<string, [number, number]> = {
  A: [150, 30], B: [80, 95], C: [220, 95], D: [35, 165], E: [125, 165], F: [230, 165], G: [180, 215],
}

export function bfs(start = 'A'): Frame[] {
  const f: Frame[] = []
  const tones: Record<string, Tone> = { [start]: 'hi' }
  const dist: Record<string, number> = { [start]: 0 }
  const queue = [start]
  const order: string[] = []
  const push = (caption: string) => f.push({ kind: 'graph', caption, tones: { ...tones }, holder: { name: 'Queue (front on the left)', items: [...queue] }, order: [...order] })
  push(`Start at ${start}. Put it in the queue and mark it seen.`)
  while (queue.length) {
    const node = queue.shift()!
    order.push(node)
    tones[node] = 'new'
    push(`Take ${node} from the FRONT of the queue (distance ${dist[node]}). Look at its neighbours.`)
    for (const n of GRAPH[node]) {
      if (dist[n] === undefined) {
        dist[n] = dist[node] + 1
        tones[n] = 'hi'
        queue.push(n)
        push(`${n} is new: mark it seen and add it to the BACK of the queue. Its distance is ${dist[n]}.`)
      }
    }
    tones[node] = 'found'
  }
  push(`Done. BFS visited nodes in rings: distance 0, then 1, then 2... Order: ${order.join(' ')}. That is why BFS finds shortest paths.`)
  return f
}

export function dfs(start = 'A'): Frame[] {
  const f: Frame[] = []
  const tones: Record<string, Tone> = {}
  const seen = new Set<string>()
  const stack = [start]
  const order: string[] = []
  const push = (caption: string) => f.push({ kind: 'graph', caption, tones: { ...tones }, holder: { name: 'Stack (top on the right)', items: [...stack] }, order: [...order] })
  push(`Start: put ${start} on the stack.`)
  while (stack.length) {
    const node = stack.pop()!
    if (seen.has(node)) {
      push(`${node} was already visited. Skip it.`)
      continue
    }
    seen.add(node)
    order.push(node)
    tones[node] = 'new'
    const next = GRAPH[node].filter((n) => !seen.has(n)).reverse() // reversed so the first neighbour is on top
    stack.push(...next)
    push(next.length ? `Pop ${node} from the TOP and visit it. Push its unvisited neighbours (${[...next].reverse().join(', ')}).` : `Pop ${node} and visit it. No new neighbours: a dead end, so we go back.`)
    tones[node] = 'found'
  }
  push(`Done. DFS went as deep as it could before coming back. Order: ${order.join(' ')}.`)
  return f
}

export const VISUALIZERS: { id: string; name: string; about: string; make: () => Frame[]; note?: string; pattern?: string }[] = [
  { id: 'array', name: 'Array insert and delete', about: 'Why inserting at the front is slow.', make: arrayInsertDelete, note: 'c-arrays-strings' },
  { id: 'list-append', name: 'Python list: append and resize', about: 'Why append is O(1) on average.', make: listAppend, note: 'a09-lists' },
  { id: 'hash', name: 'Dictionary buckets', about: 'How hashing finds a key without searching.', make: hashBuckets, note: 'a11-dictionaries' },
  { id: 'stack', name: 'Stack push and pop', about: 'Last in, first out.', make: stackPushPop, note: 'c-stacks' },
  { id: 'queue', name: 'Queue', about: 'First in, first out.', make: queueFlow, note: 'a15-collections' },
  { id: 'linked-list', name: 'Linked list: insert and reverse', about: 'Change arrows, not positions.', make: linkedList, pattern: 'll-reverse' },
  { id: 'binary-search', name: 'Binary search', about: 'Halve the range every step.', make: binarySearch, pattern: 'bs-index' },
  { id: 'two-pointers', name: 'Two pointers', about: 'Throw away one number per step.', make: twoPointers, pattern: 'tp-opposite' },
  { id: 'sliding-window', name: 'Sliding window', about: 'Grow and shrink, never restart.', make: slidingWindow, pattern: 'sw-variable' },
  { id: 'bfs', name: 'BFS on a graph', about: 'Explore in rings, with a queue.', make: bfs, pattern: 'graph-bfs' },
  { id: 'dfs', name: 'DFS on a graph', about: 'Go deep first, with a stack.', make: dfs, pattern: 'graph-dfs' },
]
