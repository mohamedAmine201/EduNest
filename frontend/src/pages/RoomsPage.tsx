import React, {useEffect, useState} from 'react'
import {Link} from 'react-router-dom'
import {motion} from 'framer-motion'
import { Button } from '@/components/ui/button'
import { MainCard } from '../MyComponents/MainCard'
import { FeedCard } from '../MyComponents/FeedCard'
import { CreateRoomForm } from '@/MyComponents/CreateRoomForm'
import { useAuth } from '@/MyComponents/AuthContext'

const BASE_URL = import.meta.env.VITE_API_URL

interface Room {
    id: number;
    topic: string;
    description: string;
    host: string;
    created: string;
}
interface Message {
    id: number;
    room: string;
    room_id: number;
    owner: string;
    owner_id: number;
    body: string;
    created: string;
    attachment: string|null;
}


const RoomsPage = () => {
    const [roomCount, setRoomCount] = useState(0);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const {token, user} = useAuth();
    useEffect(() => {
    const fetchCount = async () => {
        const response = await fetch(`${BASE_URL}/api/rooms/count/`, {
            headers: {
                'Authorization': `Token ${token}`
            }
        });
        const data = await response.json();
        setRoomCount(data.room_count);
    }
    const fetchRooms = async () => {
        const response = await fetch(`${BASE_URL}/api/rooms/`, {
            headers: {
                'Authorization': `Token ${token}`
            }
        });
        const data = await response.json();
        setRooms(data)
    }
    const fetchMessages = async () => {
        const response = await fetch(`${BASE_URL}/api/rooms/messages/`, {
            headers: {
                'Authorization': `Token ${token}`
            }
        });
        const data = await response.json();
        setMessages(data);
    }
    fetchRooms();
    fetchMessages();
    fetchCount();
    }, [token])
    const [showForm, setShowForm] = useState(false);

    return (
    <div className='py-2 px-4 w-full md:w-[85%] mx-auto flex justify-between items-start'>
        <div className='w-full md:w-[60%]'>
            <div className='flex items-start justify-between'>
                <div className='self-start'>
                    <h2 className='text-lg font-bold'>Rooms</h2>
                    <p>{roomCount} Rooms Available</p>
                </div>
                {user.role !== 'STUDENT' && 
                    <div className='self-end'>
                    <Button onClick = {() => setShowForm(true)}>
                        + Create Room
                    </Button>
                    </div>}
            </div>
            {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                {/* Overlay */}
                <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => setShowForm(false)}
                ></div>

                {/* Modal */}
                <div className="relative z-10 w-full max-w-lg mx-4 rounded-lg shadow-lg p-6">
                <Button
                    className="mb-4 self-end"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                >
                    Close
                </Button>

                <CreateRoomForm onClose={() => setShowForm(false)}/>
                </div>
            </div>
            )}



            <h2 className='text-lg font-bold my-4'>All Rooms</h2>
            <div className='flex flex-col justify-center items-center gap-4'>
                {rooms.map(room => (
                    <div key={room.id} className='w-full'>
                        <Link to={`/rooms/${room.id}`} className='block w-full'>
                            <MainCard room={room} />
                        </Link>
                    </div>
                ))}
            </div>
        </div>
        <div className='hidden md:flex flex-col justify-center items-center gap-4 w-[35%]'>
            <h2 className=' text-lg font-bold'>Recent Activity</h2>
            {messages.map((message) => (
                <div key={message.id} className='w-full'>
                    <Link to={`/rooms/${message.room_id}`}>
                        <FeedCard message={message}/>
                    </Link>
                </div>
            ))}
        </div>
    </div>
  )
}

export default RoomsPage