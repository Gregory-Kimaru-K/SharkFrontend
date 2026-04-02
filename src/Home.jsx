import React from 'react'
import { useNavigate } from 'react-router-dom'

function Home() {
  const navigate = useNavigate()
  return (
    <div className='home'>
      <div className='evt_btn' onClick={() => navigate("/event/create/")}>Add an event</div>
    </div>
  )
}

export default Home