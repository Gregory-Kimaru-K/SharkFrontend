import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { backendUrl } from '../constants/Urls'

const formatNumber = (value, digits = 1) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—'
  return Number(value).toLocaleString(undefined, { maximumFractionDigits: digits })
}

const formatPercent = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—'
  return `${formatNumber(value, 1)}%`
}

const toIsoDateTime = (value) => {
  if (!value) return ''
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString()
}

const maxCount = (rows, field = 'count') => {
  const values = rows.map((row) => Number(row?.[field]) || 0)
  return Math.max(1, ...values)
}

function StatCard({ label, value, detail, icon, tone = 'blue' }) {
  return (
    <article className={`stat-card ${tone}`}>
      <div className='stat-card-top'>
        <span>{label}</span>
        <ion-icon name={icon}></ion-icon>
      </div>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  )
}

function BarList({ rows = [], labelKey = 'label', valueKey = 'count', rateKey }) {
  const ceiling = maxCount(rows, valueKey)

  if (!rows.length) {
    return <div className='stat-empty'>No data</div>
  }

  return (
    <div className='bar-list'>
      {rows.map((row, index) => {
        const value = Number(row?.[valueKey]) || 0
        const width = `${Math.max(4, (value / ceiling) * 100)}%`
        return (
          <div className='bar-row' key={`${row?.[labelKey] || row?.label || index}-${index}`}>
            <div className='bar-label'>
              <span>{row?.[labelKey] || row?.label || 'Unknown'}</span>
              <strong>{rateKey ? formatPercent(row?.[rateKey]) : formatNumber(value, 0)}</strong>
            </div>
            <div className='bar-track'>
              <div className='bar-fill' style={{ width }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function HourlyActivity({ rows = [] }) {
  const ceiling = maxCount(rows, 'total')

  return (
    <div className='hour-grid'>
      {rows.map((row) => {
        const total = Number(row?.total) || 0
        const height = `${Math.max(total ? 12 : 2, (total / ceiling) * 100)}%`
        return (
          <div className='hour-bar' key={row.hour}>
            <div className='hour-column'>
              <span style={{ height }} title={`${row.hour}:00 • ${total} events`} />
            </div>
            <small>{row.hour}</small>
          </div>
        )
      })}
    </div>
  )
}

function Stats() {
  const [stats, setStats] = useState(null)
  const [filters, setFilters] = useState({
    start: '',
    end: '',
    country: '',
    region: '',
    outcome: '',
  })
  const [appliedFilters, setAppliedFilters] = useState(filters)
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const queryString = useMemo(() => {
    const params = new URLSearchParams()
    const start = toIsoDateTime(appliedFilters.start)
    const end = toIsoDateTime(appliedFilters.end)

    if (start) params.set('start', start)
    if (end) params.set('end', end)
    if (appliedFilters.country.trim()) params.set('country', appliedFilters.country.trim())
    if (appliedFilters.region.trim()) params.set('region', appliedFilters.region.trim())
    if (appliedFilters.outcome) params.set('outcome', appliedFilters.outcome)

    return params.toString()
  }, [appliedFilters])

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`${backendUrl}api/stats/summary/${queryString ? `?${queryString}` : ''}`)
      const data = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(data?.error || 'Unable to load stats')
      }

      setStats(data)
    } catch (err) {
      setError(err.message || 'Unable to load stats')
      setStats(null)
    } finally {
      setLoading(false)
    }
  }, [queryString])

  const processPendingStats = async () => {
    setProcessing(true)
    setError('')
    setNotice('')

    try {
      const res = await fetch(`${backendUrl}api/stats/process-pending/${queryString ? `?${queryString}` : ''}`, {
        method: 'POST',
      })
      const data = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(data?.error || 'Unable to build pending stats')
      }

      setNotice(`${formatNumber(data?.events_processed || 0, 0)} events processed`)
      await fetchStats()
    } catch (err) {
      setError(err.message || 'Unable to build pending stats')
    } finally {
      setProcessing(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    const nextFilters = { start: '', end: '', country: '', region: '', outcome: '' }
    setFilters(nextFilters)
    setAppliedFilters(nextFilters)
  }

  const kpis = stats?.kpis || {}
  const distributions = stats?.distributions || {}
  const environment = stats?.environment || {}
  const averages = environment?.averages || {}
  const timeSeries = stats?.time_series || {}
  const monthly = timeSeries?.monthly_events || []
  const latestMonth = monthly[monthly.length - 1]
  const pendingEvents = Math.max(0, Number(kpis.total_events || 0) - Number(kpis.processed_events || 0))

  return (
    <main className='stats-page'>
      <section className='stats-header'>
        <div>
          <p>Analytics</p>
          <h1>System Stats</h1>
        </div>
        <div className='stats-header-actions'>
          <button className='build-btn' type='button' onClick={processPendingStats} disabled={processing || pendingEvents === 0}>
            <ion-icon name='construct-outline'></ion-icon>
            <span>{processing ? 'Building' : `Build Pending Stats (${formatNumber(pendingEvents, 0)})`}</span>
          </button>
          <button className='refresh-btn' type='button' onClick={fetchStats} disabled={loading}>
            <ion-icon name='refresh-outline'></ion-icon>
            <span>{loading ? 'Loading' : 'Refresh'}</span>
          </button>
        </div>
      </section>

      <section className='stats-filters'>
        <label>
          <span>Start</span>
          <input type='datetime-local' value={filters.start} onChange={(e) => updateFilter('start', e.target.value)} />
        </label>
        <label>
          <span>End</span>
          <input type='datetime-local' value={filters.end} onChange={(e) => updateFilter('end', e.target.value)} />
        </label>
        <label>
          <span>Country</span>
          <input value={filters.country} onChange={(e) => updateFilter('country', e.target.value)} />
        </label>
        <label>
          <span>Region</span>
          <input value={filters.region} onChange={(e) => updateFilter('region', e.target.value)} />
        </label>
        <label>
          <span>Outcome</span>
          <select value={filters.outcome} onChange={(e) => updateFilter('outcome', e.target.value)}>
            <option value=''>All</option>
            <option value='FEEDING'>Feeding</option>
            <option value='NO_FEEDING'>No feeding</option>
          </select>
        </label>
        <div className='filter-actions'>
          <button type='button' onClick={() => setAppliedFilters(filters)}>
            <ion-icon name='funnel-outline'></ion-icon>
            <span>Apply</span>
          </button>
          <button type='button' onClick={clearFilters}>
            <ion-icon name='close-outline'></ion-icon>
            <span>Clear</span>
          </button>
        </div>
      </section>

      {error && <div className='stats-error'>{error}</div>}
      {notice && <div className='stats-notice'>{notice}</div>}

      <section className='kpi-grid'>
        <StatCard label='Total Events' value={formatNumber(kpis.total_events, 0)} detail={`${formatNumber(kpis.processed_events, 0)} processed`} icon='layers-outline' tone='blue' />
        <StatCard label='Feeding Rate' value={formatPercent(kpis.feeding_rate)} detail={`${formatNumber(kpis.feeding_events, 0)} feeding events`} icon='pulse-outline' tone='green' />
        <StatCard label='Avg Sharks' value={formatNumber(kpis.avg_sharks_observed, 2)} detail='per observation' icon='eye-outline' tone='amber' />
        <StatCard label='Data Quality' value={formatNumber(kpis.avg_environmental_quality, 2)} detail='environment completeness' icon='shield-checkmark-outline' tone='rose' />
      </section>

      <section className='stats-grid'>
        <article className='stats-panel wide'>
          <div className='panel-title'>
            <h2>Hourly Events</h2>
            <span>{formatNumber(kpis.total_events, 0)} total</span>
          </div>
          <HourlyActivity rows={timeSeries.hourly_events || []} />
        </article>

        <article className='stats-panel'>
          <div className='panel-title'>
            <h2>Outcomes</h2>
            <span>{formatPercent(kpis.feeding_rate)} feeding</span>
          </div>
          <BarList rows={distributions.outcomes || []} />
        </article>

        <article className='stats-panel'>
          <div className='panel-title'>
            <h2>Species</h2>
            <span>{formatNumber((distributions.species || []).length, 0)} groups</span>
          </div>
          <BarList rows={distributions.species || []} labelKey='species' />
        </article>

        <article className='stats-panel'>
          <div className='panel-title'>
            <h2>Tide State</h2>
            <span>feeding rate</span>
          </div>
          <BarList rows={environment.feeding_rate_by_tide_state || []} valueKey='total' rateKey='feeding_rate' />
        </article>

        <article className='stats-panel'>
          <div className='panel-title'>
            <h2>Daylight</h2>
            <span>feeding rate</span>
          </div>
          <BarList rows={environment.feeding_rate_by_daylight || []} valueKey='total' rateKey='feeding_rate' />
        </article>

        <article className='stats-panel wide'>
          <div className='panel-title'>
            <h2>Environmental Averages</h2>
            <span>{latestMonth?.month || 'All time'}</span>
          </div>
          <div className='env-grid'>
            <div><span>Pressure</span><strong>{formatNumber(averages.pressure, 0)}</strong></div>
            <div><span>Wind</span><strong>{formatNumber(averages.wind_speed, 1)}</strong></div>
            <div><span>Air Temp</span><strong>{formatNumber(averages.temperature, 1)}</strong></div>
            <div><span>Water Temp</span><strong>{formatNumber(averages.water_temperature, 1)}</strong></div>
            <div><span>Tide</span><strong>{formatNumber(averages.tide_height, 2)}</strong></div>
            <div><span>Current</span><strong>{formatNumber(averages.current_speed, 1)}</strong></div>
          </div>
        </article>

        <article className='stats-panel'>
          <div className='panel-title'>
            <h2>Countries</h2>
            <span>{formatNumber((distributions.countries || []).length, 0)} groups</span>
          </div>
          <BarList rows={distributions.countries || []} labelKey='country' />
        </article>

        <article className='stats-panel'>
          <div className='panel-title'>
            <h2>Moon Phase</h2>
            <span>feeding rate</span>
          </div>
          <BarList rows={environment.feeding_rate_by_moon_phase || []} valueKey='total' rateKey='feeding_rate' />
        </article>

        <article className='stats-panel wide'>
          <div className='panel-title'>
            <h2>Top Locations</h2>
            <span>event volume</span>
          </div>
          <div className='location-table'>
            {(stats?.top_locations || []).map((location) => (
              <div className='location-row' key={location.id}>
                <div>
                  <strong>{location.name || 'Unknown'}</strong>
                  <span>{[location.region, location.country].filter(Boolean).join(', ') || 'Unknown'}</span>
                </div>
                <p>{formatNumber(location.count, 0)}</p>
                <p>{formatPercent(location.feeding_rate)}</p>
              </div>
            ))}
            {!(stats?.top_locations || []).length && <div className='stat-empty'>No data</div>}
          </div>
        </article>
      </section>
    </main>
  )
}

export default Stats
