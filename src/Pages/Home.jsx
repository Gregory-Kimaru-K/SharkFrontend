import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import FilterComponents from '../constants/FilterComponents'
import { backendUrl } from '../constants/Urls'
import Nav from '../constants/Nav'

const formatDate = (iso) => {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return iso
  }
}

function Home() {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [nextPage, setNextPage] = useState(null)
  const [isNext, setIsNext] = useState(false)
  const [loading, setLoading] = useState(false)
  const sentinelRef = useRef(null)
  const [filters, setFilters] = useState({})

  const fetchEvents = async(after = null, append = false, filtersArg) => {
    if (loading) return
    setLoading(true)
    const query = `
                    query AllEvents(
                        $after: String

                        # BASIC
                        $title_Icontains: String
                        $sharkType_Species: String
                        $sharkNumber_Gte: Int
                        $sharkNumber_Lte: Int
                        $isProcessed: Boolean

                        # LOCATION
                        $location_Name_Icontains: String
                        $location_Region_Icontains: String
                        $location_Country: String
                        $location_Latitude_Gte: Decimal
                        $location_Latitude_Lte: Decimal
                        $location_Longitude_Gte: Decimal
                        $location_Longitude_Lte: Decimal

                        # ENVIRONMENTAL
                        $environmentalData_Pressure_Gte: Float
                        $environmentalData_Pressure_Lte: Float

                        $environmentalData_WindSpeed_Gte: Float
                        $environmentalData_WindSpeed_Lte: Float

                        $environmentalData_Temperature_Gte: Float
                        $environmentalData_Temperature_Lte: Float

                        $environmentalData_WaterTemperature_Gte: Float
                        $environmentalData_WaterTemperature_Lte: Float

                        $environmentalData_TideHeight_Gte: Float
                        $environmentalData_TideHeight_Lte: Float

                        $environmentalData_CurrentSpeed_Gte: Float
                        $environmentalData_CurrentSpeed_Lte: Float

                        $environmentalData_RelativeHumidity_Gte: Float
                        $environmentalData_RelativeHumidity_Lte: Float

                        $environmentalData_CloudCover_Gte: Float
                        $environmentalData_CloudCover_Lte: Float

                        $environmentalData_Conductivity_Gte: Float
                        $environmentalData_Conductivity_Lte: Float

                        # SOLAR / LUNAR
                        $environmentalData_Sunrise_Gte: DateTime
                        $environmentalData_Sunrise_Lte: DateTime

                        $environmentalData_Sunset_Gte: DateTime
                        $environmentalData_Sunset_Lte: DateTime

                        $environmentalData_MoonPhase: String

                        $environmentalData_Moonrise_Gte: DateTime
                        $environmentalData_Moonrise_Lte: DateTime

                        $environmentalData_Moonset_Gte: DateTime
                        $environmentalData_Moonset_Lte: DateTime

                        $environmentalData_PhaseAngle_Gte: Float
                        $environmentalData_PhaseAngle_Lte: Float

                        $environmentalData_Illumination_Gte: Float
                        $environmentalData_Illumination_Lte: Float

                        # BEHAVIOUR
                        $behaviour_Feeding: Boolean

                        $behaviour_Aggression_Gte: Int
                        $behaviour_Aggression_Lte: Int
                    ) {
                        allEvents(
                            first: 5
                            after: $after

                            # BASIC
                            title_Icontains: $title_Icontains
                            sharkType_Species: $sharkType_Species
                            sharkNumber_Gte: $sharkNumber_Gte
                            sharkNumber_Lte: $sharkNumber_Lte
                            isProcessed: $isProcessed

                            # LOCATION
                            location_Name_Icontains: $location_Name_Icontains
                            location_Region_Icontains: $location_Region_Icontains
                            location_Country: $location_Country
                            location_Latitude_Gte: $location_Latitude_Gte
                            location_Latitude_Lte: $location_Latitude_Lte
                            location_Longitude_Gte: $location_Longitude_Gte
                            location_Longitude_Lte: $location_Longitude_Lte

                            # ENVIRONMENTAL
                            environmentalData_Pressure_Gte: $environmentalData_Pressure_Gte
                            environmentalData_Pressure_Lte: $environmentalData_Pressure_Lte

                            environmentalData_WindSpeed_Gte: $environmentalData_WindSpeed_Gte
                            environmentalData_WindSpeed_Lte: $environmentalData_WindSpeed_Lte

                            environmentalData_Temperature_Gte: $environmentalData_Temperature_Gte
                            environmentalData_Temperature_Lte: $environmentalData_Temperature_Lte

                            environmentalData_WaterTemperature_Gte: $environmentalData_WaterTemperature_Gte
                            environmentalData_WaterTemperature_Lte: $environmentalData_WaterTemperature_Lte

                            environmentalData_TideHeight_Gte: $environmentalData_TideHeight_Gte
                            environmentalData_TideHeight_Lte: $environmentalData_TideHeight_Lte

                            environmentalData_CurrentSpeed_Gte: $environmentalData_CurrentSpeed_Gte
                            environmentalData_CurrentSpeed_Lte: $environmentalData_CurrentSpeed_Lte

                            environmentalData_RelativeHumidity_Gte: $environmentalData_RelativeHumidity_Gte
                            environmentalData_RelativeHumidity_Lte: $environmentalData_RelativeHumidity_Lte

                            environmentalData_CloudCover_Gte: $environmentalData_CloudCover_Gte
                            environmentalData_CloudCover_Lte: $environmentalData_CloudCover_Lte

                            environmentalData_Conductivity_Gte: $environmentalData_Conductivity_Gte
                            environmentalData_Conductivity_Lte: $environmentalData_Conductivity_Lte

                            # SOLAR / LUNAR
                            environmentalData_Sunrise_Gte: $environmentalData_Sunrise_Gte
                            environmentalData_Sunrise_Lte: $environmentalData_Sunrise_Lte

                            environmentalData_Sunset_Gte: $environmentalData_Sunset_Gte
                            environmentalData_Sunset_Lte: $environmentalData_Sunset_Lte

                            environmentalData_MoonPhase: $environmentalData_MoonPhase

                            environmentalData_Moonrise_Gte: $environmentalData_Moonrise_Gte
                            environmentalData_Moonrise_Lte: $environmentalData_Moonrise_Lte

                            environmentalData_Moonset_Gte: $environmentalData_Moonset_Gte
                            environmentalData_Moonset_Lte: $environmentalData_Moonset_Lte

                            environmentalData_PhaseAngle_Gte: $environmentalData_PhaseAngle_Gte
                            environmentalData_PhaseAngle_Lte: $environmentalData_PhaseAngle_Lte

                            environmentalData_Illumination_Gte: $environmentalData_Illumination_Gte
                            environmentalData_Illumination_Lte: $environmentalData_Illumination_Lte

                            # BEHAVIOUR
                            behaviour_Feeding: $behaviour_Feeding

                            behaviour_Aggression_Gte: $behaviour_Aggression_Gte
                            behaviour_Aggression_Lte: $behaviour_Aggression_Lte
                        ) {
                            edges {
                                node {
                                    id
                                    title

                                    location {
                                        country
                                        region
                                        name
                                    }

                                    observedAtUtc
                                }
                            }

                            pageInfo {
                                hasNextPage
                                endCursor
                            }
                        }
                    }
                    `
    const rawVars = { after, ...(filtersArg !== undefined ? filtersArg : filters) }

    const normalizeVariables = (obj) => {
      const out = {}
      Object.entries(obj || {}).forEach(([k, v]) => {
        if (v === null || v === undefined) return
        if (typeof v === 'string') {
          const s = v.trim()
          if (s === '') return
          if (/^(true|false)$/i.test(s)) {
            out[k] = s.toLowerCase() === 'true'
            return
          }
          if (/^-?\d+$/.test(s)) {
            out[k] = Number.parseInt(s, 10)
            return
          }
          if (/^-?\d*\.\d+$/.test(s)) {
            out[k] = Number.parseFloat(s)
            return
          }
          out[k] = s
          return
        }
        out[k] = v
      })
      return out
    }

    const variables = normalizeVariables(rawVars)
    console.log('variables (normalized):', variables)
    const res = await fetch(`${backendUrl}qlsciqy/`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ query, variables })
    })

    const data = await res.json().catch(() => null)
    if (!res.ok || data?.errors) {
      console.error('GraphQL error', data)
      setLoading(false)
      return
    }
    
    const nodes = data?.data?.allEvents?.edges?.map(edge => edge.node) || []
    setEvents(prev => append ? [...prev, ...nodes] : nodes)

    const pi = data?.data?.allEvents?.pageInfo || { hasNextPage: false, endCursor: null }
    setIsNext(pi.hasNextPage)
    setNextPage(pi.endCursor || null)
    setLoading(false)
    return
  }

  useEffect(() => {
    fetchEvents(null, false)
  }, [])

  const applyFilters = (newFilters) => {
    setFilters(newFilters || {})
    // reset pagination and fetch first page with new filters
    setNextPage(null)
    fetchEvents(null, false, newFilters || {})
  }

  const clearFilters = () => {
    setFilters({})
    setNextPage(null)
    fetchEvents(null, false, {})
  }

  useEffect(() => {console.log(filters)}, [filters])
  useEffect(() => {
    if (!sentinelRef.current) return
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && isNext && !loading) {
          fetchEvents(nextPage, true, filters)
        }
      })
    }, { root: null, rootMargin: '200px', threshold: 0.1 })

    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [nextPage, isNext, loading, filters])

  const postNav = (id) => {
    const decoded = atob(id)
    console.log(id)
    console.log(decoded)
  }
  return (
    <div className='home'>
      <div className='evt_btn' onClick={() => navigate("/event/create/")}>Add an event</div>
      <div className='divs'>
        <FilterComponents onApply={applyFilters} onClear={clearFilters} initial={filters} />
        <div className='events'>
          {events.map((event, idx) => (
            <div className='event' key={event?.id || idx} onClick={() => navigate(`/post/${event?.id}`)}>
              <h3>{event?.title || 'Untitled'}</h3>
              <div className='ltdt'>
                <p className='location'>
                  {event?.location?.country || ''}{event?.location ? ', ' : ''}{event?.location?.region || ''}{event?.location ? ', ' : ''}{event?.location?.name || ''}
                </p>
                <p>{formatDate(event?.observedAtUtc)}</p>
              </div>
            </div>
          ))}
          <div ref={sentinelRef} style={{ height: 1 }} />
        </div>
      </div>
    </div>

  )
}

export default Home