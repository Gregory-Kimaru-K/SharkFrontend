import { useEffect, useMemo, useState } from 'react'
import '../constants/eventLogger.css'

const OUTCOME_OPTIONS = [
  { value: 'FEEDING', label: 'Feeding observed' },
  { value: 'NO_FEEDING', label: 'No feeding observed' },
]

function EventLogger() {
  const [step, setStep] = useState(1)

  // Step 1: Shark
  const [sharks, setSharks] = useState([])
  const [sharksLoading, setSharksLoading] = useState(false)
  const [sharksError, setSharksError] = useState(null)

  const [sharkMode, setSharkMode] = useState('existing') // 'existing' | 'create'
  const [selectedSharkId, setSelectedSharkId] = useState('')
  const [newSharkName, setNewSharkName] = useState('')
  const [newSharkSpecies, setNewSharkSpecies] = useState('')
  const [createdShark, setCreatedShark] = useState(null)

  // Step 2: Location
  const [locationName, setLocationName] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [region, setRegion] = useState('')
  const [country, setCountry] = useState('')
  const [createdLocation, setCreatedLocation] = useState(null)

  // Step 3: Event
  const [eventTitle, setEventTitle] = useState('')
  const [eventNotes, setEventNotes] = useState('')
  const [sharkNumberText, setSharkNumberText] = useState('')
  const [observedAtUtc, setObservedAtUtc] = useState('')
  const [outcome, setOutcome] = useState('FEEDING')
  const [createdEvent, setCreatedEvent] = useState(null)
  const [createdEnvironmentalData, setCreatedEnvironmentalData] = useState(null)

  // Step 4: Observation
  const [sourceName, setSourceName] = useState('')
  const [recordedAtUtc, setRecordedAtUtc] = useState('')
  const [observationText, setObservationText] = useState('')
  const [payloadText, setPayloadText] = useState('{}')
  const [createdObservation, setCreatedObservation] = useState(null)

  // Step 5: Behaviour
  const [feeding, setFeeding] = useState(false)
  const [aggressionText, setAggressionText] = useState('')
  const [activityNotes, setActivityNotes] = useState('')
  const [createdBehaviour, setCreatedBehaviour] = useState(null)

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const selectedShark = useMemo(() => {
    if (createdShark) return createdShark
    return sharks.find((s) => String(s.id) === String(selectedSharkId)) || null
  }, [createdShark, selectedSharkId, sharks])


  /**FETCH SHARKS */
  useEffect(() => {
    async function loadSharks() {
      setSharksLoading(true)
      setSharksError(null)
      try {
        const res = await fetch('https://sharkbackend.onrender.com/api/sharks/')
        const data = await res.json().catch(() => null)
        if (!res.ok) throw new Error(data?.message || 'Failed to load sharks')
        setSharks(Array.isArray(data) ? data : [])
      } catch (e) {
        setSharksError({ message: e?.message ?? 'Failed to load sharks' })
      } finally {
        setSharksLoading(false)
      }
    }
    loadSharks()
  }, [])

  function resetFlow() {
    setStep(1)
    setSharkMode('existing')
    setSelectedSharkId('')
    setNewSharkName('')
    setNewSharkSpecies('')
    setCreatedShark(null)

    setCreatedLocation(null)
    setLocationName('')
    setLatitude('')
    setLongitude('')
    setRegion('')
    setCountry('')

    setCreatedEvent(null)
    setCreatedEnvironmentalData(null)
    setEventTitle('')
    setEventNotes('')
    setSharkNumberText('')
    setObservedAtUtc('')
    setOutcome('FEEDING')

    setCreatedObservation(null)
    setSourceName('')
    setRecordedAtUtc('')
    setObservationText('')
    setPayloadText('{}')

    setCreatedBehaviour(null)
    setFeeding(false)
    setAggressionText('')
    setActivityNotes('')

    setBusy(false)
    setError(null)
  }

  /** CREATE SHARK */
  async function createSharkIfNeeded() {
    if (sharkMode === 'existing') {
      if (!selectedSharkId) throw new Error('Choose a shark')
      return { id: selectedSharkId }
    }

    if (!newSharkName.trim() || !newSharkSpecies.trim()) {
      throw new Error('Enter shark name and species')
    }

    const res = await fetch('https://sharkbackend.onrender.com/api/shark/create/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newSharkName, species: newSharkSpecies }),
    })
    const data = await res.json().catch(() => null)
    if (!res.ok) throw new Error(data?.message || 'Failed to create shark')

    const shark = data?.shark ?? data
    if (!shark?.id) throw new Error('Backend did not return a shark id')
    setCreatedShark(shark)
    setSelectedSharkId(shark.id)
    return shark
  }

    /** CREATE LOCATION */
  async function createLocation() {
    const res = await fetch('https://sharkbackend.onrender.com/api/location/create/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: locationName,
        latitude: Number(latitude),
        longitude: Number(longitude),
        region,
        country,
      }),
    })
    const data = await res.json().catch(() => null)
    if (!res.ok) throw new Error(data?.message || 'Failed to create location')

    const location = data?.location ?? data
    if (!location?.id) throw new Error('Backend did not return a location id')
    setCreatedLocation(location)
    return location
  }

  /** CREATE EVENT */

  async function createEvent(sharkId, locationId) {
    const sharkNumber = sharkNumberText.trim() === '' ? null : Number(sharkNumberText)
    const observedAtIso = observedAtUtc ? new Date(observedAtUtc).toISOString() : null

    if (sharkNumber == null || Number.isNaN(sharkNumber)) throw new Error('Enter shark number')
    if (!observedAtIso) throw new Error('Enter observed date/time (UTC)')

    const res = await fetch('https://sharkbackend.onrender.com/api/event/create/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: eventTitle,
        notes: eventNotes,
        location: locationId,
        shark_type: sharkId,
        shark_number: sharkNumber,
        observed_at_utc: observedAtIso,
        outcome,
      }),
    })

    const data = await res.json().catch(() => null)
    if (!res.ok) throw new Error(data?.message || 'Failed to create event')

    const event = data?.event ?? data
    if (!event?.id) throw new Error('Backend did not return an event id')
    setCreatedEvent(event)
    setCreatedEnvironmentalData(data?.environmental_data ?? null)
    return event
  }
  

  /** CREATE OBSERVATION */
  async function createObservation(eventId) {
    let payload = {}
    try {
      payload = JSON.parse(payloadText || '{}')
    } catch {
      throw new Error('Payload must be valid JSON')
    }

    const recordedAtIso = recordedAtUtc ? new Date(recordedAtUtc).toISOString() : null
    if (!recordedAtIso) throw new Error('Enter recorded date/time (UTC)')

    const res = await fetch('https://sharkbackend.onrender.com/api/observation/create/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: eventId,
        source_name: sourceName,
        recorded_at_utc: recordedAtIso,
        observation: observationText,
        payload,
      }),
    })

    const data = await res.json().catch(() => null)
    if (!res.ok) throw new Error(data?.message || 'Failed to create observation')

    const observation = data?.observation ?? data
    if (!observation?.id) throw new Error('Backend did not return an observation id')
    setCreatedObservation(observation)
    return observation
  }

  async function createBehaviour(eventId) {
    const aggression = aggressionText.trim() === '' ? null : Number(aggressionText)
    if (aggression != null && Number.isNaN(aggression)) throw new Error('Aggression must be a number')

    const res = await fetch('https://sharkbackend.onrender.com/api/shark-behaviour/create/', {
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
    if (!res.ok) throw new Error(data?.message || 'Failed to create behaviour')

    const behaviour = data?.behaviour ?? data
    if (!behaviour?.id) throw new Error('Backend did not return a behaviour id')
    setCreatedBehaviour(behaviour)
    return behaviour
  }

  async function nextFromCurrentStep() {
    setError(null)
    setBusy(true)
    try {
      if (step === 1) {
        await createSharkIfNeeded()
        setStep(2)
        return
      }
      if (step === 2) {
        const location = await createLocation()
        if (!location?.id) throw new Error('Location missing')
        setStep(3)
        return
      }
      if (step === 3) {
        if (!selectedShark?.id) throw new Error('Shark missing')
        if (!createdLocation?.id) throw new Error('Location missing')
        await createEvent(selectedShark.id, createdLocation.id)
        setStep(4)
        return
      }
      if (step === 4) {
        if (!createdEvent?.id) throw new Error('Event missing')
        await createObservation(createdEvent.id)
        setStep(5)
        return
      }
      if (step === 5) {
        if (!createdEvent?.id) throw new Error('Event missing')
        await createBehaviour(createdEvent.id)
        setStep(6)
        return
      }
    } catch (e) {
      setError({ message: e?.message ?? 'Something failed' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="el-page">
      <h1 className="el-title">Event Logger</h1>

      <div className="el-card">
        <div className="el-stepper">
        {[
          { n: 1, label: 'Shark' },
          { n: 2, label: 'Location' },
          { n: 3, label: 'Event' },
          { n: 4, label: 'Observation' },
          { n: 5, label: 'Behaviour' },
        ].map((s) => (
          <button
            key={s.n}
            type="button"
            disabled={busy || step !== s.n}
            onClick={() => setStep(s.n)}
            className={`el-stepButton ${step === s.n ? 'is-active' : ''}`}
          >
            {s.label}
          </button>
        ))}
        </div>

      {error ? (
        <div className="el-errorBox">
          <strong>Error:</strong> {error.message}
        </div>
      ) : null}

      {createdEnvironmentalData && step >= 4 ? (
        <div className="el-summaryBox" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 900 }}>Environmental data saved</div>
          <div className="el-summaryRow">
            {createdEnvironmentalData.recorded_at_utc ? `Recorded: ${createdEnvironmentalData.recorded_at_utc}` : 'Recorded time: (unknown)'}
          </div>
          {createdEnvironmentalData.tide_height != null ? (
            <div className="el-summaryRow">Tide height: {createdEnvironmentalData.tide_height}</div>
          ) : null}
          {createdEnvironmentalData.water_temperature != null ? (
            <div className="el-summaryRow">Water temperature: {createdEnvironmentalData.water_temperature}</div>
          ) : null}
          {createdEnvironmentalData.salinity != null ? (
            <div className="el-summaryRow">Salinity: {createdEnvironmentalData.salinity}</div>
          ) : null}
          {createdEnvironmentalData.sources?.weather_station_id ? (
            <div className="el-summaryRow">Weather station: {createdEnvironmentalData.sources.weather_station_id}</div>
          ) : null}
          {createdEnvironmentalData.sources?.water_level?.station_id ? (
            <div className="el-summaryRow">Tides station: {createdEnvironmentalData.sources.water_level.station_id}</div>
          ) : null}
        </div>
      ) : null}

      {step === 1 ? (
        <div className="el-section">
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="radio"
                name="sharkMode"
                checked={sharkMode === 'existing'}
                onChange={() => setSharkMode('existing')}
              />
              Existing shark
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="radio"
                name="sharkMode"
                checked={sharkMode === 'create'}
                onChange={() => setSharkMode('create')}
              />
              Create new shark
            </label>
          </div>

          {sharkMode === 'existing' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sharksLoading ? <div>Loading sharks...</div> : null}
              {sharksError ? <div style={{ color: 'crimson' }}>{sharksError.message}</div> : null}
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span>Select shark</span>
                <select value={selectedSharkId} onChange={(e) => setSelectedSharkId(e.target.value)} required>
                  <option value="" disabled>
                    Choose...
                  </option>
                  {sharks.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.species})
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span>Name</span>
                <input value={newSharkName} onChange={(e) => setNewSharkName(e.target.value)} placeholder="Blue Shark" required />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span>Species (unique)</span>
                <input value={newSharkSpecies} onChange={(e) => setNewSharkSpecies(e.target.value)} placeholder="Prionace glauca" required />
              </label>
            </div>
          )}
        </div>
      ) : null}

      {step === 2 ? (
        <div className="el-section">
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span>Name</span>
            <input value={locationName} onChange={(e) => setLocationName(e.target.value)} placeholder="e.g. Monterey Bay" required />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span>Latitude</span>
              <input value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="36.6002" required />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span>Longitude</span>
              <input value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="-121.8947" required />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span>Region</span>
              <input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="California" required />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span>Country</span>
              <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="USA" required />
            </label>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="el-section">
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span>Title</span>
            <input value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} placeholder="Observation of feeding" required />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span>Notes (optional)</span>
            <textarea value={eventNotes} onChange={(e) => setEventNotes(e.target.value)} rows={3} />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span>Shark number</span>
              <input value={sharkNumberText} onChange={(e) => setSharkNumberText(e.target.value)} placeholder="e.g. 3" required />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span>Observed at (UTC)</span>
              <input value={observedAtUtc} onChange={(e) => setObservedAtUtc(e.target.value)} type="datetime-local" required />
            </label>
          </div>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span>Outcome</span>
            <select value={outcome} onChange={(e) => setOutcome(e.target.value)} required>
              {OUTCOME_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="el-section">
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span>Source name</span>
            <input value={sourceName} onChange={(e) => setSourceName(e.target.value)} placeholder="User submission" required />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span>Recorded at (UTC)</span>
            <input value={recordedAtUtc} onChange={(e) => setRecordedAtUtc(e.target.value)} type="datetime-local" required />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span>Observation</span>
            <textarea value={observationText} onChange={(e) => setObservationText(e.target.value)} rows={4} required />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span>Payload (JSON)</span>
            <textarea value={payloadText} onChange={(e) => setPayloadText(e.target.value)} rows={6} required />
          </label>
        </div>
      ) : null}

      {step === 5 ? (
        <div className="el-section">
          <label style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="checkbox" checked={feeding} onChange={(e) => setFeeding(e.target.checked)} />
            Feeding observed
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span>Aggression (optional, 1-10)</span>
            <input value={aggressionText} onChange={(e) => setAggressionText(e.target.value)} placeholder="e.g. 5" inputMode="numeric" />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span>Activity notes (optional)</span>
            <textarea value={activityNotes} onChange={(e) => setActivityNotes(e.target.value)} rows={3} />
          </label>
        </div>
      ) : null}

      {step === 6 ? (
        <div className="el-section">
          <div className="el-summaryBox">
            <strong>Created successfully.</strong>
            <div style={{ marginTop: 8 }}>
              {selectedShark ? <div className="el-summaryRow">Shark: {selectedShark.id}</div> : null}
              {createdLocation ? <div className="el-summaryRow">Location: {createdLocation.id}</div> : null}
              {createdEvent ? <div className="el-summaryRow">Event: {createdEvent.id}</div> : null}
              {createdObservation ? <div className="el-summaryRow">Observation: {createdObservation.id}</div> : null}
              {createdBehaviour ? <div className="el-summaryRow">Behaviour: {createdBehaviour.id}</div> : null}
            </div>

            {createdEnvironmentalData ? (
              <div style={{ marginTop: 14 }}>
                <div style={{ fontWeight: 800, marginBottom: 6 }}>Environmental data</div>
                {createdEnvironmentalData.recorded_at_utc ? (
                  <div className="el-summaryRow">Recorded: {createdEnvironmentalData.recorded_at_utc}</div>
                ) : null}
                {createdEnvironmentalData.sources ? (
                  <details style={{ marginTop: 10 }}>
                    <summary style={{ cursor: 'pointer', fontWeight: 700 }}>NOAA payload</summary>
                    <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {JSON.stringify(createdEnvironmentalData.sources, null, 2)}
                    </pre>
                  </details>
                ) : null}
              </div>
            ) : null}
          </div>

          <button type="button" onClick={resetFlow}>
            Log another event
          </button>
        </div>
      ) : (
        <div className="el-actions">
          <button
            type="button"
            className="el-btn"
            disabled={busy || step === 1 || step > 5}
            onClick={() => setStep((s) => Math.max(1, s - 1))}
          >
            Back
          </button>
          <button type="button" className="el-btn el-btnPrimary" disabled={busy} onClick={nextFromCurrentStep}>
            {busy ? 'Working...' : step === 5 ? 'Create behaviour' : 'Continue'}
          </button>
        </div>
      )}
      </div>
    </div>
  )
}

export default EventLogger

