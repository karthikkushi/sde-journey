import { describe, expect, it } from 'vitest'
import { WEEKS } from '../../content/data/roadmap'
import { arrayInsertDelete, bfs, binarySearch, dfs, GRAPH, hashBuckets, linkedList, listAppend, slidingWindow, toyHash, twoPointers, VISUALIZERS, type Frame } from './viz'

const last = (frames: Frame[]) => frames[frames.length - 1]
const values = (f: Frame) => (f.kind === 'rows' ? f.rows[0].cells.map((c) => c.v) : [])

describe('visualizers', () => {
  it('array: insert 15 at 1, then delete index 0', () => {
    const frames = arrayInsertDelete()
    expect(values(frames.find((f) => f.caption.startsWith('Now put 15'))!)).toEqual(['10', '15', '20', '30', '40', ''])
    expect(values(last(frames))).toEqual(['15', '20', '30', '40', '', ''])
  })

  it('list append with doubling: 9 appends from room 2 copy 2 + 4 + 8 = 14 items', () => {
    const f = last(listAppend(2, 9))
    expect(f.kind === 'rows' && f.stats).toContain('copies: 14')
    expect(f.kind === 'rows' && f.rows[0].cells.length).toBe(16)
  })

  it('hash buckets: the toy hash puts oil and salt in the same bucket, and finds salt', () => {
    expect(toyHash('oil') % 8).toBe(toyHash('salt') % 8)
    const f = last(hashBuckets())
    expect(f.kind).toBe('buckets')
    expect(f.caption).toContain('Found "salt"')
  })

  it('linked list: after insert and reverse, every arrow points back', () => {
    const f = last(linkedList())
    expect(f.kind === 'list' && f.nodes.map((n) => n.v)).toEqual(['1', '2', '9', '3', '4'])
    expect(f.kind === 'list' && f.links).toEqual(['null', 'prev', 'prev', 'prev', 'prev'])
  })

  it('binary search finds 42 at index 6, and reports a missing value', () => {
    expect(last(binarySearch()).caption).toContain('Found 42 at index 6')
    expect(last(binarySearch([1, 3, 5], 4)).caption).toContain('not in the list')
  })

  it('two pointers finds 4 + 6', () => {
    expect(last(twoPointers()).caption).toContain('4 + 6 = 10')
  })

  it('sliding window: longest part of "abcabcbb" without repeats is 3', () => {
    expect(last(slidingWindow()).caption).toContain('length 3')
    expect(last(slidingWindow('pwwkew')).caption).toContain('length 3')
  })

  it('BFS visits in rings, DFS goes deep', () => {
    const order = (frames: Frame[]) => { const f = last(frames); return f.kind === 'graph' ? f.order : [] }
    expect(order(bfs())).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G'])
    expect(order(dfs())).toEqual(['A', 'B', 'D', 'E', 'G', 'F', 'C'])
  })

  it('the graph is undirected (every edge both ways)', () => {
    for (const [a, ns] of Object.entries(GRAPH)) for (const b of ns) expect(GRAPH[b]).toContain(a)
  })

  it('every roadmap visualizer link points to a real visualizer', () => {
    const ids = new Set(VISUALIZERS.map((v) => v.id))
    const links = WEEKS.flatMap((w) => [...w.learn, ...(w.extras ?? [])]).map((l) => l.to).filter((t) => t?.startsWith('/viz/'))
    for (const to of links) expect(ids.has(to!.slice(5)), to).toBe(true)
  })
})
