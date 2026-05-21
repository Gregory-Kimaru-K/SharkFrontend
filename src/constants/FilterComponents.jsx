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
                    <input className={`input ${values[baseKey + '__gte'] ? 'filled' : ''}`} type="number" placeholder=" " value={values[baseKey + '_Gte'] ?? ''} onChange={e => setVal(baseKey + '__gte', e.target.value)} />
                    <label className="user-label">{label} min</label>
                </div>
                <div className="input-group">
                    <input className={`input ${values[baseKey + '__lte'] ? 'filled' : ''}`} type="number" placeholder=" " value={values[baseKey + '_Lte'] ?? ''} onChange={e => setVal(baseKey + '__lte', e.target.value)} />
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
                {TextField({ keyName: 'title__Icontains', label: 'Title contains' })}
                {SelectField({
                    keyName: 'sharkType_Species',
                    label: 'Shark type',
                    options: (sharks || []).map(s => ({ value: s.species || '', label: s.species ? `${s.name} (${s.species})` : s.name }))
                })}
                {NumericPair({ baseKey: "shark_number", label: "Shark Number" })}
                {BooleanField({ keyName: 'isProcessed', label: 'Processed' })}
            </div>
        </details>

        <details className='details'>
            <summary className='sum'>Location</summary>
            <div className='filters'>
                {TextField({ keyName: 'location_Name_Icontains', label: 'Location name' })}
                {TextField({ keyName: 'location_Region_Icontains', label: 'Region' })}
                {TextField({ keyName: 'location_Country', label: 'Country' })}
                {NumericPair({ baseKey: 'location_Latitude', label: 'Latitude' })}
                {NumericPair({ baseKey: 'location_Longitude', label: 'Longitude' })}
            </div>
        </details>

        <details className='details'>
            <summary className='sum'>Environmental</summary>
            <div className='filters'>
                {NumericPair({ baseKey: 'environmentalData_Pressure', label: 'Pressure' })}
                {NumericPair({ baseKey: 'environmentalData_WindSpeed', label: 'Wind speed' })}
                {NumericPair({ baseKey: 'environmentalData_Temperature', label: 'Temperature' })}
                {NumericPair({ baseKey: 'environmentalData_WaterTemperature', label: 'Water temperature' })}
                {NumericPair({ baseKey: 'environmentalData_TideHeight', label: 'Tide height' })}
                {NumericPair({ baseKey: 'environmentalData_CurrentSpeed', label: 'Current speed' })}
                {NumericPair({ baseKey: "environmentalData_RelativeHumidity", label: "Relative Humidity" })}
                {NumericPair({ baseKey: "environmentalData_CloudCover", label: "Cloud Cover" })}
                {NumericPair({ baseKey: "environmentalData_Conductivity", label: "Conductivity" })}
                {NumericPair({ baseKey: "environmentalData_CurrentDirection", label: "Current Direction" })}
            </div>
        </details>

        <details className='details'>
            <summary className='sum'>Solar / Lunar</summary>
            <div className='filters'>
                {DateRange({ baseKey: 'environmentalData_Sunrise', label: 'Sunrise' })}
                {DateRange({ baseKey: 'environmentalData_Sunset', label: 'Sunset' })}
                {TextField({ keyName: 'environmentalData_MoonPhase', label: 'Moon phase' })}
                {DateRange({ baseKey: "environmentalData_Moonrise", label: "Moon Rise" })}
                {DateRange({ baseKey: "environmentalData_Moonset", label: "Moon Set" })}
                {NumericPair({ baseKey: "environmentalData_PhaseAngle", label: "Phase Angle" })}
                {NumericPair({ baseKey: 'environmentalData_Illumination', label: 'Illumination' })}
            </div>
        </details>

        <details className='details'>
            <summary className='sum'>Behaviour</summary>
            <div className='filters'>
                {BooleanField({ keyName: 'behaviour_Feeding', label: 'Feeding' })}
                {NumericPair({ baseKey: 'behaviour_Aggression', label: 'Aggression' })}
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