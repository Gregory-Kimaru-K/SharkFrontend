import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './Home'
import Posts from './Posts'
import EventLogger from './Pages/EventLogger'

function App() {
  const router = createBrowserRouter([
    { path: '/', element: <Home /> },
    { path: '/post/', element: <Posts /> },
    { path: '/event/create/', element: <EventLogger /> },
  ])

  return <RouterProvider router={router} />
}

export default App