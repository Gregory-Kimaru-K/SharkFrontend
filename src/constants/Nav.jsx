import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Nav() {
  const navigate = useNavigate()

  const [toggle, setToggle] = useState("HOME")
  useEffect(() => {}, [])
  const navigating = (name) => {
    setToggle(name)
    if(name === "HOME") {
      navigate("/")
    } else if(name === "STATS") {
      navigate("/stats/")
    }
  }

  return (
    <div className='nav'>
        <div
            className={toggle === "HOME" ? "nav-btn focused" : "nav-btn"}
            onClick={() => navigating("HOME")}><ion-icon className="icon" name="home-outline"></ion-icon></div>
        <div 
            className={toggle === "STATS" ? "nav-btn focused" : "nav-btn"}
            onClick={() => navigating("STATS")}><ion-icon className="icon" name="stats-chart-outline"></ion-icon></div>
    </div>
  )
}

export default Nav