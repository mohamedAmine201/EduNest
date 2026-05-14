import React, {useState, useRef, useEffect} from 'react'
import {Link, useParams, useNavigate} from 'react-router-dom'
import {FaArrowLeft, FaArrowRight, FaPaperclip} from 'react-icons/fa'
import { cn } from "@/lib/utils"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    } from "@/components/ui/card"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
    } from "@/components/ui/alert-dialog"
import { X } from 'lucide-react'
import { AvatarDemo } from '@/MyComponents/Avatar'
import { Input } from '@/components/ui/input'
import { toast } from "sonner"
import { useAuth } from '@/MyComponents/AuthContext'
import { Spinner } from '@/components/ui/spinner'

const BASE_URL = import.meta.env.VITE_API_URL

interface Room {
    id: number;
    topic: string;
    description: string;
    host: string;
    host_id: number;
    created: string;
}
interface Message {
    id: number;
    body: string;
    owner: string;
    owner_id: number;
    created: string;
    attachment: string | null;
}

const RoomPage = () => {
    const {id} = useParams();
    const {token, user} = useAuth();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [room, setRoom] = useState<Room|null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [text, setText] = useState("");
    const navigate = useNavigate();

    async function fetchMessages() {
        const response = await fetch(`${BASE_URL}/api/rooms/${id}/messages/`, {
            headers: {
                'Authorization': `Token ${token}`
            }
        });
        const data = await response.json();
        setMessages(data);
    }

    useEffect(() => {
        async function fetchRoom() {
            const response = await fetch(`${BASE_URL}/api/rooms/${id}`, {
                headers: {
                    'Authorization': `Token ${token}`
                }
            });
            const data = await response.json();
            setRoom(data);
            setLoading(false);
        }
        fetchRoom()
        fetchMessages()
    }, [id])

    const timeAgo = (dateString: string): string => {
        const created = new Date(dateString)
        const now = new Date()
        const days = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
        const months = Math.floor(days / 30)
        const years = Math.floor(days / 365)
        if (days === 0) return 'Today'
        if (days === 1) return 'Yesterday'
        if (days < 30) return `${days} days ago`
        if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`
        const remainingMonths = months % 12
        return remainingMonths > 0
            ? `${years} year${years > 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''} ago`
            : `${years} year${years > 1 ? 's' : ''} ago`
    }

    const handleFileClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type.startsWith('image/')) {
                setPreviewUrl(URL.createObjectURL(selectedFile));
            } else {
                setPreviewUrl(null);
            }
            if (selectedFile.size > 5 * 1024 * 1024) {
                toast.error("File is too large (Max 5MB)");
                return;
            }
            setFile(selectedFile);
            e.target.value = '';
        }
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/rooms/${room?.id}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Token ${token}`
                }
            })
            if (!response.ok) throw new Error('Failed to delete room')
            toast.success("Room deleted successfully!", {position: "bottom-right"})
            navigate('/rooms')
        } catch(error) {
            toast.error('Failed to delete room. Please try again', {position: 'bottom-right'})
        }
    }

    const handleMessageDelete = async (id: number) => {
        try {
            const response = await fetch(`${BASE_URL}/api/rooms/message-delete/${id}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Token ${token}`
                }
            });
            if (!response.ok) throw new Error('Failed to delete Message')
            toast.success('Message deleted successfully!', {position: 'bottom-right'})
            fetchMessages();
        } catch(error) {
            toast.error('Failed to delete message. Please try again', {position: 'bottom-right'})
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPreviewUrl(null);
        const cleanText = text.replace(/\s*Attached: .+$/, '').trim()
        if (!cleanText.trim() && !file) return
        try {
            const formData = new FormData();
            formData.append('body', cleanText);
            if (file) formData.append('attachment', file);
            const response = await fetch(`${BASE_URL}/api/rooms/${id}/message-create/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`
                },
                body: formData
            });
            if (!response.ok) throw new Error('failed to send message');
            setText('');
            setFile(null);
            fetchMessages();
            toast.success('Message sent!', {position: 'bottom-right'});
        } catch (error) {
            toast.error('Failed to send message. Please try again', {position: 'bottom-right'});
        }
    }

    if (loading) return (
        <div className='flex justify-center items-center h-screen'>
            <Spinner className='text-[var(--primary)]'/>
        </div>
    )

    return (
        <div className='py-2 px-4 w-full md:w-[85%] mx-auto mt-4'>
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>
                        <div className='flex justify-between items-center text-[var(--primary)]'>
                            <Link to='/rooms'>
                                <div className="flex items-center gap-2">
                                    <FaArrowLeft />
                                    <p>Back to Rooms</p>
                                </div>
                            </Link>
                            {user.id == room?.host_id &&
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <X className='cursor-pointer' />
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete the
                                                room from the servers.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            }
                        </div>
                    </CardTitle>
                    <CardDescription>
                        {timeAgo(room.created)}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <p className='mb-2 text-2xl break-words'>{room?.description}</p>
                    <h4 className='text-sm text-gray-300'>Hosted By</h4>
                    <div className="flex items-center mt-2 gap-2">
                        <AvatarDemo src="https://github.com/shadcn.png"/>
                        <span className="text-[var(--primary)]">@{room?.host}</span>
                    </div>
                </CardContent>

                <CardFooter>
                    <div className={cn(
                        "w-full flex flex-col justify-start items-start gap-6",
                        "border border-input rounded-md p-4 bg-background",
                        "shadow-xs hover:bg-accent hover:text-accent-foreground duration-300",
                        "dark:bg-input/30 dark:border-input dark:hover:bg-input/50"
                    )}>
                        <div className='flex flex-col gap-4 w-full'>
                            {messages.map((message) => (
                                <div className='p-2 flex flex-col gap-2 border-l-2 border-[var(--primary)]' key={message.id}>
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 min-w-0">
                                        <AvatarDemo src="https://github.com/shadcn.png"/>
                                        <span className="text-[var(--primary)] font-medium truncate max-w-[120px]">
                                            @{message.owner}
                                        </span>
                                        <p className='text-sm text-gray-300 whitespace-nowrap'>
                                            Sent {timeAgo(message.created)}
                                        </p>
                                        {user.id == message?.owner_id &&
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <X className='ml-auto cursor-pointer flex-shrink-0' size={16} />
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete the
                                                            message from the servers.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleMessageDelete(message.id)}>Continue</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        }
                                    </div>
                                    <p className='break-words'>{message.body}</p>
                                    {message.attachment && (
                                        <a
                                            href={message.attachment}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="self-start flex items-center gap-1 text-sm text-[var(--primary)] underline break-all"
                                        >
                                            <FaPaperclip className="text-xs flex-shrink-0"/>
                                            View Attachment
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>

                        <form className='w-full' onSubmit={handleSubmit}>
                            <div className="flex items-center gap-2 w-full">
                                <Input
                                    className="flex-1 min-w-0"
                                    placeholder="Enter text"
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-md border border-input bg-background bg-white text-black hover:bg-accent transition-colors"
                                    onClick={handleFileClick}
                                >
                                    <FaPaperclip className="text-sm" />
                                </button>
                                <button
                                    type="submit"
                                    className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-md border border-input bg-background bg-white text-black hover:bg-accent transition-colors"
                                >
                                    <FaArrowRight className="text-sm" />
                                </button>
                            </div>

                            {file && (
                                <div className="mt-2 flex items-center gap-2">
                                    {previewUrl ? (
                                        <img
                                            src={previewUrl}
                                            alt="preview"
                                            className="max-h-32 max-w-full rounded-md border border-input object-contain"
                                        />
                                    ) : (
                                        <span className="text-sm text-muted-foreground flex items-center gap-1 truncate">
                                            <FaPaperclip className="text-xs flex-shrink-0" />
                                            <span className="truncate">{file.name}</span>
                                        </span>
                                    )}
                                    <button
                                        type="button"
                                        className="flex-shrink-0 text-muted-foreground hover:text-destructive"
                                        onClick={() => { setFile(null); setPreviewUrl(null); }}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            )}

                            <input
                                type="file"
                                accept="application/pdf, image/*"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </form>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}

export default RoomPage