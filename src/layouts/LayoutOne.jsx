import React from 'react'
import Nav from '../constants/Nav'
import { Outlet } from 'react-router-dom'

function LayoutOne() {
  return (
    <div className='layout'>
        <Nav />
        <Outlet />
    </div>
  )
}

export default LayoutOne