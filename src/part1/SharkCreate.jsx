import { useState } from 'react'

function SharkCreate() {
  const [name, setName] = useState('')
  const [species, setSpecies] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [created, setCreated] = useState(null)

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setCreated(null)

    try {
      const res = await fetch('/api/shark/create/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, species }),
      })

      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setError(data || { message: 'Failed to create shark' })
        return
      }

      // Backend returns: { message, shark: { ...fields } }
      setCreated(data?.shark ?? data)
    } catch (err) {
      setError({ message: err?.message ?? 'Request failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 24, textAlign: 'left' }}>
      <h1>Create Shark</h1>

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 480 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span>Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Blue Shark"
            required
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span>Species (unique)</span>
          <input
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
            placeholder="e.g. Prionace glauca"
            required
          />
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
          <strong>Created Shark:</strong>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{JSON.stringify(created, null, 2)}</pre>
        </div>
      ) : null}
    </div>
  )
}

export default SharkCreate

