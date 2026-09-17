import { useState } from 'react'

const SCHOOL_YEARS = ['First-year', 'Sophomore', 'Junior', 'Senior', 'Other']

const FIELD_LABELS = {
  name: 'Your name',
  school_year: 'What year are you?',
  working_style: 'Describe your working style in 1–2 sentences',
}

const EMPTY_FORM = { name: '', school_year: '', working_style: '' }

export default function Survey({ roster, onBack }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [missing, setMissing] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setMissing((prev) => prev.filter((f) => f !== field))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    const empty = Object.entries(FIELD_LABELS)
      .filter(([field]) => !form[field].trim())
      .map(([field]) => field)

    if (empty.length) {
      setMissing(empty)
      return
    }

    setMissing([])
    setLoading(true)
    try {
      const res = await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.fields?.length) {
          setMissing(data.fields)
        }
        throw new Error(data.error || `Backend responded ${res.status}`)
      }
      setSubmitted(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <main className="page">
        <h1>Survey</h1>
        <p className="success">Thanks — your responses have been saved.</p>
        <button type="button" className="link-button" onClick={onBack}>
          ← Back to GroupMaker
        </button>
      </main>
    )
  }

  return (
    <main className="page">
      <h1>Survey</h1>
      <p className="subtitle">{roster.course}</p>

      <button type="button" className="link-button" onClick={onBack}>
        ← Back to GroupMaker
      </button>

      <form className="survey-form" onSubmit={handleSubmit} noValidate>
        <label className="field">
          {FIELD_LABELS.name}
          <select
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            disabled={loading}
          >
            <option value="">Select your name…</option>
            {roster.students.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          {FIELD_LABELS.school_year}
          <select
            value={form.school_year}
            onChange={(e) => updateField('school_year', e.target.value)}
            disabled={loading}
          >
            <option value="">Select…</option>
            {SCHOOL_YEARS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          {FIELD_LABELS.working_style}
          <textarea
            value={form.working_style}
            onChange={(e) => updateField('working_style', e.target.value)}
            rows={4}
            disabled={loading}
          />
        </label>

        {missing.length > 0 && (
          <p className="error">
            Please fill in: {missing.map((f) => FIELD_LABELS[f]).join(', ')}
          </p>
        )}

        {error && <p className="error">{error}</p>}

        <button type="submit" className="randomize" disabled={loading}>
          {loading ? 'Submitting…' : 'Submit'}
        </button>
      </form>
    </main>
  )
}
