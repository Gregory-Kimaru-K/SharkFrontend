import { useState } from 'react'

function LocationCreate() {
  const [name, setName] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [region, setRegion] = useState('')
  const [country, setCountry] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [created, setCreated] = useState(null)

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setCreated(null)

    try {
      const res = await fetch('/api/location/create/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          latitude: latitude === '' ? null : Number(latitude),
          longitude: longitude === '' ? null : Number(longitude),
          region,
          country,
        }),
      })

      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setError(data || { message: 'Failed to create location' })
        return
      }

      // Backend returns: { message, location: { ...fields } }
      setCreated(data?.location ?? data)
    } catch (err) {
      setError({ message: err?.message ?? 'Request failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 24, textAlign: 'left' }}>
      <h1>Create Location</h1>

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 520 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span>Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Monterey Bay" required />
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span>Latitude</span>
            <input value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="e.g. 36.6002" required />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span>Longitude</span>
            <input value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="e.g. -121.8947" required />
          </label>
        </div>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span>Region</span>
          <input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="e.g. California" required />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span>Country</span>
          <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. USA" required />
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
          <strong>Created Location:</strong>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{JSON.stringify(created, null, 2)}</pre>
        </div>
      ) : null}
    </div>
  )
}

export default LocationCreate

