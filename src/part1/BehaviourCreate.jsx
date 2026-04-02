import { useState } from 'react'

function BehaviourCreate() {
  const [eventId, setEventId] = useState('')
  const [feeding, setFeeding] = useState(false)
  const [aggressionText, setAggressionText] = useState('')
  const [activityNotes, setActivityNotes] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [created, setCreated] = useState(null)

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setCreated(null)

    try {
      const aggression = aggressionText.trim() === '' ? null : Number(aggressionText)

      const res = await fetch('/api/shark-behaviour/create/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: eventId,
          feeding,
          aggression,
          activity_notes: activityNotes,
        }),
      })

      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setError(data || { message: 'Failed to create behaviour' })
        return
      }

      // Backend returns: { message, behaviour: { ...fields } }
      setCreated(data?.behaviour ?? data)
    } catch (err) {
      setError({ message: err?.message ?? 'Request failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 24, textAlign: 'left' }}>
      <h1>Create Behaviour</h1>

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 720 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span>Event ID</span>
          <input value={eventId} onChange={(e) => setEventId(e.target.value)} placeholder="UUID of event" required />
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input type="checkbox" checked={feeding} onChange={(e) => setFeeding(e.target.checked)} />
          <span>Feeding observed</span>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span>Aggression (1-10, optional)</span>
          <input
            value={aggressionText}
            onChange={(e) => setAggressionText(e.target.value)}
            placeholder="e.g. 5"
            inputMode="numeric"
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span>Activity Notes (optional)</span>
          <textarea value={activityNotes} onChange={(e) => setActivityNotes(e.target.value)} rows={4} />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create'}
        </button>
      </form>

      {error ? (
        <div style={{ marginTop: 16, color: 'crimson' }}>
          <strong>Error:</strong>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{JSON.stringify(error, null, 2)}</pre>
        </div>
      ) : null}

      {created ? (
        <div style={{ marginTop: 16 }}>
          <strong>Created Behaviour:</strong>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{JSON.stringify(created, null, 2)}</pre>
        </div>
      ) : null}
    </div>
  )
}

export default BehaviourCreate

