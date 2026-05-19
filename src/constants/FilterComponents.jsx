import React, { useEffect, useState } from 'react'
import { backendUrl } from './Urls'

function FieldRow({ children }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>{children}</div>
  )
}

function FilterComponents({ onApply, onClear, initial = {} }) {
    const [sharks, setSharks] = useState([])
    const [loading, setLoading] = useState(false)
    const [values, setValues] = useState(() => ({ ...initial }))
    const setVal = (key, v) => setValues(prev => ({ ...prev, [key]: v }))

    const getSharks = async() => {
        if (loading) return
        try{
            setLoading(true)
            const query = `
                    query AllSharks {
                        allSharks {
                            name
                            species
                        }
                    }`
            const res = await fetch(`${backendUrl}qlsciqy/`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ query })
            })

            const data = await res.json().catch(() => null)
            if (!res.ok) throw new Error(data?.errors?.[0]?.message || "Failed getting data")
            const sharkdt = data?.data?.allSharks || []
            setSharks(sharkdt)
            return
        } catch(error){
            return error
        } finally {
            setLoading(false)
        }
    }

    useEffect(() =>{
        getSharks()
    }, [])
    // helpers to convert between ISO UTC and datetime-local input values
    const pad = (n) => String(n).padStart(2, '0')
    const formatISOToLocalInput = (iso) => {
        if (!iso) return ''
        try {
            const d = new Date(iso)
            if (Number.isNaN(d.getTime())) return ''
            const year = d.getFullYear()
            const month = pad(d.getMonth() + 1)
            const day = pad(d.getDate())
            const hours = pad(d.getHours())
            const mins = pad(d.getMinutes())
            return `${year}-${month}-${day}T${hours}:${mins}`
        } catch { return '' }
    }

    const isoFromLocalInput = (local) => {
        if (!local) return ''
        try {
            // local is like 'YYYY-MM-DDTHH:MM' (browser gives local timezone)
            const d = new Date(local)
            if (Number.isNaN(d.getTime())) return ''
            return d.toISOString()
        } catch { return '' }
    }
    // helpers to render numeric min/max inputs
    const NumericPair = ({ baseKey, label }) => (
        <FieldRow>
            <div style={{ display: 'flex', gap: 8 }}>
                <div className="input-group">
                    <input className={`input ${values[baseKey + '__gte'] ? 'filled' : ''}`} type="number" placeholder=" " value={values[baseKey + '__gte'] ?? ''} onChange={e => setVal(baseKey + '__gte', e.target.value)} />
                    <label className="user-label">{label} min</label>
                </div>
                <div className="input-group">
                    <input className={`input ${values[baseKey + '__lte'] ? 'filled' : ''}`} type="number" placeholder=" " value={values[baseKey + '__lte'] ?? ''} onChange={e => setVal(baseKey + '__lte', e.target.value)} />
                    <label className="user-label">{label} max</label>
                </div>
            </div>
        </FieldRow>
    )

    const TextField = ({ keyName, label, placeholder }) => (
        <FieldRow>
            <div className="input-group">
                <input className={`input ${values[keyName] ? 'filled' : ''}`} placeholder=" " value={values[keyName] ?? ''} onChange={e => setVal(keyName, e.target.value)} />
                <label className="user-label">{label}</label>
            </div>
        </FieldRow>
    )

    const SelectField = ({ keyName, label, options = [] }) => (
        <FieldRow>
            <div className="input-group" style={{ minWidth: 200 }}>
                <select className={`input ${values[keyName] ? 'filled' : ''}`} value={values[keyName] ?? ''} onChange={e => setVal(keyName, e.target.value)}>
                    <option value="">-- any --</option>
                    {options.map((opt, i) => (
                        <option key={i} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <label className="user-label">{label}</label>
            </div>
        </FieldRow>
    )

    const DateRange = ({ baseKey, label }) => (
        <FieldRow>
            <div style={{ display: 'flex', gap: 8 }}>
                <div className="input-group">
                    <input className={`input ${values[baseKey + '__gte'] ? 'filled' : ''}`} type="datetime-local" placeholder=" " value={formatISOToLocalInput(values[baseKey + '__gte']) ?? ''} onChange={e => setVal(baseKey + '__gte', isoFromLocalInput(e.target.value))} />
                    <label className="user-label">{label} from</label>
                </div>
                <div className="input-group">
                    <input className={`input ${values[baseKey + '__lte'] ? 'filled' : ''}`} type="datetime-local" placeholder=" " value={formatISOToLocalInput(values[baseKey + '__lte']) ?? ''} onChange={e => setVal(baseKey + '__lte', isoFromLocalInput(e.target.value))} />
                    <label className="user-label">{label} to</label>
                </div>
            </div>
        </FieldRow>
    )

    const BooleanField = ({ keyName, label }) => (
        <FieldRow>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={!!values[keyName]} onChange={e => setVal(keyName, e.target.checked)} />
                {label}
            </label>
        </FieldRow>
    )

    const handleApply = () => {
    // Only include keys with non-empty values
        const filters = {}
        Object.entries(values).forEach(([k, v]) => {
            if (v === null || v === undefined) return
            if (typeof v === 'string' && v.trim() === '') return
            filters[k] = v
        })
        onApply && onApply(filters)
        }

        const handleClear = () => {
            setValues({})
            onClear && onClear()
        }

    return (
    <div className="filter-components">
        <h3>FILTER EVENTS</h3>
        <details open className='details'>
            <summary className='sum'>Basic</summary>
            <div className='filters'>
                {TextField({ keyName: 'title__icontains', label: 'Title contains' })}
                {SelectField({
                    keyName: 'shark_type__name__icontains',
                    label: 'Shark type',
                    options: (sharks || []).map(s => ({ value: s.name || s.species || '', label: s.species ? `${s.name} (${s.species})` : s.name }))
                })}
                {NumericPair({ baseKey: "shark_number", label: "Shark Number" })}
                {BooleanField({ keyName: 'is_processed__exact', label: 'Processed' })}
            </div>
        </details>

        <details className='details'>
            <summary className='sum'>Location</summary>
            <div className='filters'>
                {TextField({ keyName: 'location__name__icontains', label: 'Location name' })}
                {TextField({ keyName: 'location__region__icontains', label: 'Region' })}
                {TextField({ keyName: 'location__country__icontains', label: 'Country' })}
                {NumericPair({ baseKey: 'location__latitude', label: 'Latitude' })}
                {NumericPair({ baseKey: 'location__longitude', label: 'Longitude' })}
            </div>
        </details>

        <details className='details'>
            <summary className='sum'>Environmental</summary>
            <div className='filters'>
                {NumericPair({ baseKey: 'environmental_data__pressure', label: 'Pressure' })}
                {NumericPair({ baseKey: 'environmental_data__wind_speed', label: 'Wind speed' })}
                {NumericPair({ baseKey: 'environmental_data__temperature', label: 'Temperature' })}
                {NumericPair({ baseKey: 'environmental_data__water_temperature', label: 'Water temperature' })}
                {NumericPair({ baseKey: 'environmental_data__tide_height', label: 'Tide height' })}
                {NumericPair({ baseKey: 'environmental_data__current_speed', label: 'Current speed' })}
            </div>
        </details>

        <details className='details'>
            <summary className='sum'>Solar / Lunar</summary>
            <div className='filters'>
                {DateRange({ baseKey: 'environmental_data__sunrise', label: 'Sunrise' })}
                {DateRange({ baseKey: 'environmental_data__sunset', label: 'Sunset' })}
                {TextField({ keyName: 'environmental_data__moon_phase__icontains', label: 'Moon phase' })}
                {NumericPair({ baseKey: 'environmental_data__illumination', label: 'Illumination' })}
            </div>
        </details>

        <details className='details'>
            <summary className='sum'>Behaviour</summary>
            <div className='filters'>
                {BooleanField({ keyName: 'behaviour__feeding__exact', label: 'Feeding' })}
                {NumericPair({ baseKey: 'behaviour__aggression', label: 'Aggression' })}
            </div>
        </details>

        <div className='filter_btn'>
            <button onClick={handleApply} style={{ padding: '6px 12px' }}>Apply</button>
            <button onClick={handleClear} style={{ padding: '6px 12px' }}>Clear</button>
        </div>
    </div>
    )
    }

export default FilterComponents