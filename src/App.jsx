import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './Pages/Home'
import Posts from './Pages/Posts'
import EventLogger from './Pages/EventLogger'

function App() {
  const router = createBrowserRouter([
    { path: '/', element: <Home /> },
    { path: '/post/:id/', element: <Posts /> },
    { path: '/event/create/', element: <EventLogger /> },
  ])

  return <RouterProvider router={router} />
}

export default App