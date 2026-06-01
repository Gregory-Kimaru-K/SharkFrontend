import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './Pages/Home'
import Posts from './Pages/Posts'
import EventLogger from './Pages/EventLogger'
import Stats from './Pages/Stats'
import LayoutOne from './layouts/LayoutOne'

function App() {
  const router = createBrowserRouter([
    {
      element: <LayoutOne />,
      children: [
        { path: '/', element: <Home /> },
        { path: '/stats/', element: <Stats /> }
      ]
    },
    { path: '/post/:id/', element: <Posts /> },
    { path: '/event/create/', element: <EventLogger /> }
  ])

  return <RouterProvider router={router} />
}

export default App