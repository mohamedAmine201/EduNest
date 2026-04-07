import { createBrowserRouter, RouterProvider } from "react-router-dom"
import MainLayout from "./Layouts/MainLayout"
import HomePage from "./pages/HomePage"
import LoginPage from './pages/LoginPage'
import RoomsPage from "./pages/RoomsPage"
import NotFoundPage from './pages/NotFoundPage'
import RoomPage from "./pages/RoomPage"
import ProfilePage from "./pages/ProfilePage"
import ProtectedRoute from "./MyComponents/ProtectedRoute"
import { useAuth } from "./MyComponents/AuthContext"
import HeadProfile from "./MyComponents/HeadProfile"
import TeacherProfile from "./MyComponents/TeacherProfile"
import StudentProfile from "./MyComponents/StudentProfile"


function App() {
  const {user} = useAuth();
  const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {index: true, element: <HomePage />},
      {path: '/login', element: <LoginPage />},
      {path: '/rooms', 
        element: (
        <ProtectedRoute allowedRoles={['STUDENT', 'TEACHER', 'HEAD']}>
          <RoomsPage />
        </ProtectedRoute>
      )
      },
      {path: '/rooms/:id', 
        element: (
        <ProtectedRoute allowedRoles={['STUDENT', 'TEACHER', 'HEAD']}>
          <RoomPage />
        </ProtectedRoute>
      )
      },
      {
        path: '/users',
        element: (
          <ProtectedRoute allowedRoles={['HEAD']}>
            <HeadProfile />
          </ProtectedRoute>
        )
      },
      {
        path: '/data',
        element: (
          <ProtectedRoute allowedRoles={['TEACHER']}>
            <TeacherProfile />
          </ProtectedRoute>
        )
      },
      {
        path: '/grades',
        element: (
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentProfile />
          </ProtectedRoute>
        )
      },
      {path: '/profile', 
        element: (
        <ProtectedRoute allowedRoles={['STUDENT', 'TEACHER', 'HEAD']}>
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
