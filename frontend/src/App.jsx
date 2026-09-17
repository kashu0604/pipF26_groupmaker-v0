import { useEffect, useState } from 'react'
import Survey from './Survey.jsx'

export default function App() {
  const [view, setView] = useState('home')
  const [roster, setRoster] = useState(null)
  const [groups, setGroups] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [groupSize, setGroupSize] = useState(4)

  useEffect(() => {
    fetch('/api/roster')
      .then((res) => {
        if (!res.ok) throw new Error(`Backend responded ${res.status}`)
        return res.json()
      })
      .then(setRoster)
      .catch((err) => setError(err.message))
  }, [])

  async function randomize() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/groups/randomize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group_size: groupSize }),
      })
      if (!res.ok) throw new Error(`Backend responded ${res.status}`)
      const data = await res.json()
      setGroups(data.groups)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <main className="page">
        <h1>GroupMaker</h1>
        <p className="error">
          Could not reach the backend: {error}. Is <code>python app.py</code> running?
        </p>
      </main>
    )
  }

  if (!roster) {
    return (
      <main className="page">
        <h1>GroupMaker</h1>
        <p>Loading roster…</p>
      </main>
    )
  }

  if (view === 'survey') {
    return <Survey roster={roster} onBack={() => setView('home')} />
  }

  return (
    <main className="page">
      <h1>GroupMaker</h1>
      <p className="subtitle">{roster.course}</p>

      <button type="button" className="link-button" onClick={() => setView('survey')}>
        Survey →
      </button>

      <div className="controls">
        <label className="group-size">
          Group size
          <select
            value={groupSize}
            onChange={(e) => setGroupSize(Number(e.target.value))}
            disabled={loading}
          >
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
          </select>
        </label>
        <button className="randomize" onClick={randomize} disabled={loading}>
          {loading ? 'Randomizing…' : 'Randomize Groups'}
        </button>
      </div>

      {groups ? (
        <section className="groups">
          {groups.map((g) => (
            <div className="card" key={g.number}>
              <h2>Group {g.number}</h2>
              <ul>
                {g.members.map((s) => (
                  <li key={s.id}>{s.name}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      ) : (
        <section>
          <h2>Roster ({roster.students.length})</h2>
          <ul className="roster">
            {roster.students.map((s) => (
              <li key={s.id}>{s.name}</li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}
