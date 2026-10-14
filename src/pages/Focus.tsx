import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { Heatmap } from '../components/Heatmap'
import { Icon } from '../components/Icon'
import { chime, keepAwake, notificationsSupported, notify } from '../lib/alerts'
import { todayIST } from '../lib/dates'
import {
  BLOCKS_PER_ROUND, BREAK_ACTIVITIES, DEFAULT_PRESET, PRESETS, breakMinutes, clock, loadSession, minutesSpent,
  msLeft, phaseLength, presetById, saveSession, type Session,
} from '../lib/focus'
import { buildWeek, position, weekSpec } from '../lib/plan'
import { getProgress, logFocus, setText, toggleDone, useProgress } from '../store/progress'

const randomActivity = () => Math.floor(Math.random() * BREAK_ACTIVITIES.length)

/** First roadmap task of today that is not ticked yet: a good default for "what to focus on". */
function nextTask() {
  const p = getProgress()
  const pos = position(todayIST(), p.shiftWeeks)
  if (pos.status !== 'during') return undefined
  return buildWeek(weekSpec(pos.week), p.shiftWeeks)[pos.dayIndex].tasks.find((t) => !p.done[t.id])
}

// Full-screen focus timer. It lives outside the normal layout, so nothing else is on screen.
export function Focus() {
  const p = useProgress()
  const [session, setSessionState] = useState<Session | null>(loadSession)
  const sessionRef = useRef(session)
  const [now, setNow] = useState(() => Date.now())
  const [presetId, setPresetId] = useState(session?.preset ?? DEFAULT_PRESET)
  const suggested = nextTask()
  const [task, setTask] = useState(session?.task ?? suggested?.text ?? '')
  const [skipArmed, setSkipArmed] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)
  const [perm, setPerm] = useState(notificationsSupported() ? Notification.permission : 'denied')

  function setSession(s: Session | null) {
    sessionRef.current = s
    setSessionState(s)
    saveSession(s)
  }

  // Move to the next phase when time is up. Reads the ref, so it is safe inside setInterval.
  function advance() {
    const s = sessionRef.current
    if (!s || s.phase === 'ready' || s.pausedLeft != null || Date.now() < s.endsAt) return
    const preset = presetById(s.preset)
    chime()
    if (s.phase === 'focus') {
      const blocks = s.blocks + 1
      logFocus(preset.focus, true)
      const rest = breakMinutes(blocks, preset)
      notify('Focus block done', `Well done. Take a ${rest}-minute break.`)
      setSession({ ...s, phase: 'break', blocks, endsAt: Date.now() + rest * 60_000, activity: randomActivity() })
    } else {
      notify('Break over', 'Ready for the next block?')
      setSession({ ...s, phase: 'ready' })
    }
  }

  // Tick every second.
  useEffect(() => {
    advance()
    const id = setInterval(() => {
      setNow(Date.now())
      advance()
    }, 1000)
    return () => clearInterval(id)
  }, [])

  // Keep the screen awake while the timer runs (also after coming back to the tab).
  const running = !!session && session.phase !== 'ready' && session.pausedLeft == null
  useEffect(() => {
    if (!running) return
    let release = () => {}
    const lock = () => keepAwake().then((r) => { release = r })
    lock()
    const onVisible = () => document.visibilityState === 'visible' && lock()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      release()
    }
  }, [running])

  function startBlock() {
    const preset = presetById(presetId)
    setSession({
      phase: 'focus',
      preset: preset.id,
      endsAt: Date.now() + preset.focus * 60_000,
      blocks: session?.blocks ?? 0,
      task: task.trim() || 'Focus',
      taskId: suggested && task === suggested.text ? suggested.id : session?.taskId,
      activity: 0,
    })
    setNow(Date.now())
  }

  function togglePause() {
    if (!session) return
    if (session.pausedLeft != null) setSession({ ...session, endsAt: Date.now() + session.pausedLeft, pausedLeft: undefined })
    else setSession({ ...session, pausedLeft: msLeft(session, Date.now()) })
  }

  /** Stop the block early. Minutes already spent still count. */
  function endBlock() {
    if (!session) return
    if (session.phase === 'focus') logFocus(minutesSpent(session, Date.now()), false)
    setSession({ ...session, phase: 'ready', pausedLeft: undefined })
  }

  // Skipping a break needs two taps, so you do not skip it by habit.
  function skipBreak() {
    if (!skipArmed) {
      setSkipArmed(true)
      setTimeout(() => setSkipArmed(false), 3000)
      return
    }
    setSkipArmed(false)
    if (session) setSession({ ...session, phase: 'ready' })
  }

  async function askPermission() {
    setPerm(await Notification.requestPermission())
  }

  const today = todayIST()
  const distraction = p.texts.distraction ?? ''

  // ---------------- Running: focus or break ----------------
  if (session && session.phase !== 'ready') {
    const left = msLeft(session, now)
    const share = 1 - left / phaseLength(session)
    const isBreak = session.phase === 'break'
    const activity = BREAK_ACTIVITIES[session.activity]
    return (
      <div className={`focus-screen${isBreak ? ' is-break' : ''}`}>
        <div className="focus-top">
          <span className="muted small">
            {isBreak ? 'Break' : `Block ${(session.blocks % BLOCKS_PER_ROUND) + 1} of ${BLOCKS_PER_ROUND}`}
          </span>
          {document.fullscreenEnabled && (
            <button className="icon-btn" aria-label="Full screen" onClick={() => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen())}>
              <Icon name="expand" />
            </button>
          )}
        </div>

        <div className="focus-center">
          {isBreak ? (
            <div className="break-card">
              <div className="muted small">Break activity</div>
              <h2>{activity.title}</h2>
              <p>{activity.text}</p>
            </div>
          ) : (
            <h1 className="focus-task">{session.task}</h1>
          )}
          <Ring share={share} label={clock(left)} paused={session.pausedLeft != null} />
        </div>

        <div className="focus-actions">
          {isBreak ? (
            <button className={`btn${skipArmed ? ' danger' : ''}`} onClick={skipBreak}>
              {skipArmed ? 'Tap again to skip the break' : 'Skip break'}
            </button>
          ) : (
            <>
              <button className="btn primary" onClick={togglePause}>{session.pausedLeft != null ? 'Resume' : 'Pause'}</button>
              <button className="btn" onClick={endBlock}>End block</button>
            </>
          )}
          <button className="link-btn" onClick={() => setNotesOpen((o) => !o)}>
            {notesOpen ? 'Hide distraction notepad' : 'Distracted? Write it down'}
          </button>
          {notesOpen && (
            <textarea className="input" rows={3} placeholder="Write the thought here. Come back to it after the block." value={distraction} onChange={(e) => setText('distraction', e.target.value)} />
          )}
          {isBreak && distraction && <p className="muted small">Your notepad has notes. Look at them now or after you finish today.</p>}
        </div>
      </div>
    )
  }

  // ---------------- Ready: set up the next block ----------------
  const totalMin = Object.values(p.focus).reduce((a, b) => a + b, 0)
  return (
    <div className="focus-page">
      <div className="focus-top">
        <Link to="/" className="btn">← Exit</Link>
        {session && <span className="muted small">{session.blocks} {session.blocks === 1 ? 'block' : 'blocks'} done this sitting</span>}
      </div>

      <section className="page">
        <h1>{session ? 'Break over. Ready for the next block?' : 'Focus'}</h1>

        <div className="card stack">
          <label htmlFor="focus-task"><strong>What will you work on?</strong></label>
          <input id="focus-task" className="input" value={task} onChange={(e) => setTask(e.target.value)} placeholder="One task only" />
          {session?.taskId && !p.done[session.taskId] && (
            <button className="btn" onClick={() => toggleDone(session.taskId!)}>Mark “{session.task}” as done</button>
          )}

          <strong>Timer</strong>
          <div className="segmented" role="radiogroup" aria-label="Timer preset">
            {PRESETS.map((pr) => (
              <button key={pr.id} role="radio" aria-checked={presetId === pr.id} className={presetId === pr.id ? 'on' : ''} onClick={() => setPresetId(pr.id)}>
                {pr.id}
              </button>
            ))}
          </div>
          <p className="muted small" style={{ margin: 0 }}>
            {presetById(presetId).focus} minutes focus, {presetById(presetId).rest} minutes break. After {BLOCKS_PER_ROUND} blocks, a 20-minute long break.
          </p>
          <button className="btn primary big" onClick={startBlock}>Start focus</button>
          {session && <button className="link-btn" onClick={() => setSession(null)}>Finish for today</button>}
        </div>

        {notificationsSupported() && perm === 'default' && (
          <div className="card">
            <p>Want a gentle alert when a block or break ends, even if you switch apps?</p>
            <button className="btn" onClick={askPermission}>Yes, allow alerts</button>
          </div>
        )}

        <div className="card">
          <label htmlFor="distraction"><h2>Distraction notepad</h2></label>
          <textarea id="distraction" className="input" rows={3} value={distraction} onChange={(e) => setText('distraction', e.target.value)} placeholder="Thoughts to deal with later" />
        </div>

        <div className="card">
          <h2>Focus heatmap</h2>
          <div className="row muted small" style={{ gap: 16, marginBottom: 8 }}>
            <span>Today: {p.focus[today] ?? 0} min</span>
            <span>Total: {(totalMin / 60).toFixed(1)} hours</span>
          </div>
          <Heatmap minutes={p.focus} extraWeeks={p.shiftWeeks} />
          <div className="row muted small" style={{ gap: 6, marginTop: 8 }}>
            Less {[0, 1, 2, 3, 4].map((l) => <svg key={l} width="10" height="10"><rect width="10" height="10" rx="2" className={`hm-${l}`} /></svg>)} More
          </div>
        </div>
      </section>
    </div>
  )
}

/** Circular progress with the time in the middle. */
function Ring({ share, label, paused }: { share: number; label: string; paused: boolean }) {
  const r = 90
  const c = 2 * Math.PI * r
  return (
    <div className="ring">
      <svg viewBox="0 0 200 200" aria-hidden="true">
        <circle cx="100" cy="100" r={r} className="ring-bg" />
        <circle cx="100" cy="100" r={r} className="ring-fg" strokeDasharray={c} strokeDashoffset={c * (1 - share)} />
      </svg>
      <div className="ring-label" role="timer" aria-live="off">
        {label}
        {paused && <div className="small muted">Paused</div>}
      </div>
    </div>
  )
}
