import { useState } from 'react'

function ObservationCreate() {
  const [eventId, setEventId] = useState('')
  const [sourceName, setSourceName] = useState('')
  const [recordedAtUtc, setRecordedAtUtc] = useState('')
  const [observation, setObservation] = useState('')
  const [payloadText, setPayloadText] = useState('{}')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [created, setCreated] = useState(null)

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setCreated(null)

    try {
      let payload = {}
      if (payloadText.trim() !== '') {
        payload = JSON.parse(payloadText)
      }

      const recordedAtIso = recordedAtUtc ? new Date(recordedAtUtc).toISOString() : null

      const res = await fetch('/api/observation/create/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: eventId,
          source_name: sourceName,
          recorded_at_utc: recordedAtIso,
          observation,
          payload,
        }),
      })

      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setError(data || { message: 'Failed to create observation' })
        return
      }

      // Backend returns: { message, observation: { ...fields } }
      setCreated(data?.observation ?? data)
    } catch (err) {
      setError({ message: err?.message ?? 'Request failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 24, textAlign: 'left' }}>
      <h1>Create Observation</h1>

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 720 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span>Event ID</span>
          <input value={eventId} onChange={(e) => setEventId(e.target.value)} placeholder="UUID of event" required />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span>Source Name</span>
          <input
            value={sourceName}
            onChange={(e) => setSourceName(e.target.value)}
            placeholder="e.g. User device / sensor name"
            required
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span>Recorded At (UTC)</span>
          <input value={recordedAtUtc} onChange={(e) => setRecordedAtUtc(e.target.value)} type="datetime-local" required />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span>Observation</span>
          <textarea value={observation} onChange={(e) => setObservation(e.target.value)} rows={4} required />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span>Payload (JSON)</span>
          <textarea value={payloadText} onChange={(e) => setPayloadText(e.target.value)} rows={6} required />
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
          <strong>Created Observation:</strong>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{JSON.stringify(created, null, 2)}</pre>
        </div>
      ) : null}
    </div>
  )
}

export default ObservationCreate

