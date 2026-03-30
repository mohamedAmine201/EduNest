import React from 'react'
import StudentProfile from '@/MyComponents/StudentProfile'
import HeadProfile from '@/MyComponents/HeadProfile'
import TeacherProfile from '@/MyComponents/TeacherProfile'
import { useAuth } from '@/MyComponents/AuthContext'

const ProfilePage = () => {
  const {user} = useAuth()
  
  return (
    <div className='w-[85%] mx-auto p-2'>
      <div className='flex flex-col justify-center items-center gap-2'>
          <img src={user.profile_pic} className='rounded-full w-16'/>
          <h2 className='text-lg'>{user.last_name} {user.first_name}</h2>
          <p className='text-gray-400'>"{user.bio}"</p>
      </div>  
      {user.role==="STUDENT" && <StudentProfile />}
      {user.role==="TEACHER" && <TeacherProfile />}
      {user.role==="HEAD" && <HeadProfile />}
    </div>
  )
}

export default ProfilePage