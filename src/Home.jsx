import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import FilterComponents from './constants/FilterComponents'
import { backendUrl } from './constants/Urls'

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

  const fetchEvents = async(after = null, append = false) => {
    if (loading) return
    setLoading(true)
    const query = `query AllEvents($after: String) {
                    allEvents(first: 5, after: $after) {
                        edges{
                            node{
                                id
                                title
                                location{
                                    country
                                    region
                                    name
                                }
                                observedAtUtc
                            }
                        }
                        pageInfo{
                            hasNextPage
                            endCursor
                        }

                    }
                }`
    const variables = { after, filters }
    const res = await fetch(`${backendUrl}qlsciqy/`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ query, variables })
    })

    const data = await res.json().catch(() => null)
    if (!res.ok) throw new Error(data || 'Failed getting data')
    
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
    fetchEvents(null, false)
  }

  const clearFilters = () => {
    setFilters({})
    setNextPage(null)
    fetchEvents(null, false)
  }

  useEffect(() => {
    if (!sentinelRef.current) return
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && isNext && !loading) {
          fetchEvents(nextPage, true)
        }
      })
    }, { root: null, rootMargin: '200px', threshold: 0.1 })

    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [nextPage, isNext, loading])

  return (
    <div className='home'>
      <div className='evt_btn' onClick={() => navigate("/event/create/")}>Add an event</div>
      <div className='divs'>
        <FilterComponents onApply={applyFilters} onClear={clearFilters} initial={filters} />
        <div className='events'>
          {events.map((event, idx) => (
            <div className='event' key={event?.id || idx}>
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