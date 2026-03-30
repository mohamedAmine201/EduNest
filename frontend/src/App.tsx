import { createBrowserRouter, RouterProvider } from "react-router-dom"
import MainLayout from "./Layouts/MainLayout"
import HomePage from "./pages/HomePage"
import LoginPage from './pages/LoginPage'
import RoomsPage from "./pages/RoomsPage"
import NotFoundPage from './pages/NotFoundPage'
import RoomPage from "./pages/RoomPage"
import ProfilePage from "./pages/ProfilePage"
import ProtectedRoute from "./MyComponents/ProtectedRoute"


function App() {
  const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {index: true, element: <HomePage />},
      {path: '/login', element: <LoginPage />},
      {path: '/rooms', 
        element: (
        <ProtectedRoute>
          <RoomsPage />
        </ProtectedRoute>
      )
      },
      {path: '/rooms/:id', 
        element: (
        <ProtectedRoute>
          <RoomPage />
        </ProtectedRoute>
      )
      },
      {path: '/profile', 
        element: (
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      )
      },

      {path: '/*', element: <NotFoundPage />}
    ]
  }
  ])
  return <RouterProvider router={router} />
}

export default App
