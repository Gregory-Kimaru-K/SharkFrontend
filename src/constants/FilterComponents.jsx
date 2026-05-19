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
    // helpers to render numeric min/max inputs
    const NumericPair = ({ baseKey, label }) => (
        <FieldRow>
            <label>{label}</label>
            <input type="number" placeholder="min" value={values[baseKey + '__gte'] ?? ''} onChange={e => setVal(baseKey + '__gte', e.target.value)} />
            <input type="number" placeholder="max" value={values[baseKey + '__lte'] ?? ''} onChange={e => setVal(baseKey + '__lte', e.target.value)} />
        </FieldRow>
    )

    const TextField = ({ keyName, label, placeholder }) => (
        <FieldRow>
            <label>{label}:</label>
            <input placeholder={placeholder || label} value={values[keyName] ?? ''} onChange={e => setVal(keyName, e.target.value)} />
        </FieldRow>
    )

    const SelectField = ({ keyName, label, options = [] }) => (
        <FieldRow>
            <label>{label}:</label>
            <select value={values[keyName] ?? ''} onChange={e => setVal(keyName, e.target.value)}>
                <option value="">-- any --</option>
                {options.map((opt, i) => (
                    <option key={i} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </FieldRow>
    )

    const DateRange = ({ baseKey, label }) => (
        <FieldRow>
            <label>{label}:</label>
            <input type="date" value={values[baseKey + '__gte'] ?? ''} onChange={e => setVal(baseKey + '__gte', e.target.value)} />
            <input type="date" value={values[baseKey + '__lte'] ?? ''} onChange={e => setVal(baseKey + '__lte', e.target.value)} />
        </FieldRow>
    )

    const BooleanField = ({ keyName, label }) => (
        <FieldRow>
            <label>{label}:</label>
            <input type="checkbox" checked={!!values[keyName]} onChange={e => setVal(keyName, e.target.checked)} />
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