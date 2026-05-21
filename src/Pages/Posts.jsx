import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { backendUrl } from '../constants/Urls'

function Posts() {
  const {id} = useParams()
  const [event, setEvent] = useState(null)

  const fetchEvent = async() => {
    const query = `query Event ($id: ID!) {
              event(id: $id) {
                  id
                  createdAt
                  updatedAt
                  title
                  notes
                  sharkNumber
                  observedAtUtc
                  outcome
                  isProcessed
                  location {
                      id
                      createdAt
                      updatedAt
                      latitude
                      longitude
                      region
                      country
                      name
                  }
                  sharkType {
                      id
                      createdAt
                      updatedAt
                      name
                      species
                  }
                  observations {
                      id
                      createdAt
                      updatedAt
                      sourceType
                      sourceName
                      recordedAtUtc
                      observation
                      payload
                  }
                  environmentalData {
                      id
                      createdAt
                      updatedAt
                      sources
                      recordedAtUtc
                      atmosphericText
                      rawMessage
                      pressure
                      windSpeed
                      windDirection
                      temperature
                      dewpoint
                      relativeHumidity
                      visibility
                      windGust
                      precipitationLastHour
                      cloudCover
                      cloudLayers
                      atmosphericText1hrPrior
                      rawMessage1hrPrior
                      pressure1hrPrior
                      windSpeed1hrPrior
                      windDirection1hrPrior
                      temperature1hrPrior
                      dewpoint1hrPrior
                      relativeHumidity1hrPrior
                      visibility1hrPrior
                      windGust1hrPrior
                      precipitationLastHour1hrPrior
                      cloudCover1hrPrior
                      cloudLayers1hrPrior
                      atmosphericText3hrPrior
                      rawMessage3hrPrior
                      pressure3hrPrior
                      windSpeed3hrPrior
                      windDirection3hrPrior
                      temperature3hrPrior
                      dewpoint3hrPrior
                      relativeHumidity3hrPrior
                      visibility3hrPrior
                      windGust3hrPrior
                      precipitationLastHour3hrPrior
                      cloudCover3hrPrior
                      cloudLayers3hrPrior
                      tideHeight
                      tideStandardDeviation
                      tideFlags
                      tideQualityIndicator
                      tideHeight1hrPrior
                      tideStandardDeviation1hrPrior
                      tideFlags1hrPrior
                      tideQualityIndicator1hrPrior
                      tideHeight3hrPrior
                      tideStandardDeviation3hrPrior
                      tideFlags3hrPrior
                      tideQualityIndicator3hrPrior
                      tideHeight6hrPrior
                      tideStandardDeviation6hrPrior
                      tideFlags6hrPrior
                      tideQualityIndicator6hrPrior
                      waterTemperature
                      waterTemperatureFlags
                      conductivity
                      conductivityFlags
                      currentSpeed
                      currentDirection
                      currentBinNumber
                      salinity
                      sunrise
                      sunset
                      solarNoon
                      civilTwilightBegin
                      civilTwilightEnd
                      nauticalTwilightBegin
                      nauticalTwilightEnd
                      astronomicalTwilightBegin
                      astronomicalTwilightEnd
                      dayLength
                      moonPhase
                      phaseAngle
                      illumination
                      ageDays
                      distanceKm
                      isWaxing
                      moonrise
                      moonset
                      isEclipse
                      isBloodMoon
                      nextNewMoon
                      nextFirstQuarter
                      nextFullMoon
                      nextLastQuarter
                      moonPhase1hrPrior
                      phaseAngle1hrPrior
                      illumination1hrPrior
                      ageDays1hrPrior
                      distanceKm1hrPrior
                      isWaxing1hrPrior
                      moonrise1hrPrior
                      moonset1hrPrior
                      isEclipse1hrPrior
                      isBloodMoon1hrPrior
                      moonPhase3hrPrior
                      phaseAngle3hrPrior
                      illumination3hrPrior
                      ageDays3hrPrior
                      distanceKm3hrPrior
                      isWaxing3hrPrior
                      moonrise3hrPrior
                      moonset3hrPrior
                      isEclipse3hrPrior
                      isBloodMoon3hrPrior
                      moonPhase6hrPrior
                      phaseAngle6hrPrior
                      illumination6hrPrior
                      ageDays6hrPrior
                      distanceKm6hrPrior
                      isWaxing6hrPrior
                      moonrise6hrPrior
                      moonset6hrPrior
                      isEclipse6hrPrior
                      isBloodMoon6hrPrior
                  }
                  behaviour {
                      id
                      createdAt
                      updatedAt
                      feeding
                      aggression
                      activityNotes
                  }
              }
          }
          `
    
    const variables = { id }
    let res
    try {
      res = await fetch(`${backendUrl}qlsciqy/`, {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({ query, variables })
        })
    } catch (err) {
      console.error('Network error', err)
      return
    }

    const data = await res.json().catch(() => null)
    if (!res.ok) {
      console.error('GraphQL error', data)
      return
    }

    const evt = data?.data?.event || null
    if (!evt) {
      console.warn('No event data returned', data)
    }
    console.log(evt)
    setEvent(evt)
  }
  useEffect(() => { if (id) fetchEvent() }, [id])

  const renderObject = (obj) => {
    if (obj === null || obj === undefined) return <em>null</em>
    if (typeof obj !== 'object') return String(obj)
    return Object.entries(obj).map(([k, v]) => (
      <div key={k} className="post-row">
        <strong className="post-key">{k}:</strong>
        <div className="post-value">{renderObject(v)}</div>
      </div>
    ))
  }

  return (
    <div className='pscontainer'>
      <div className='post'>
        <h2 className='title'>{event?.title}</h2>
        {!event && <div>No data loaded</div>}
        {event && (
          <div className="post-grid">
            <div className="post-structured">
              {renderObject(event)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Posts
