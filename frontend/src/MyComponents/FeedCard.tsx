import { FaPaperclip } from "react-icons/fa"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    } from "@/components/ui/card"
import { AvatarDemo } from "./Avatar"

    export function FeedCard({message}) {
    
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
    return (
        <Card size="sm" className="w-full">
        <CardHeader>
            <CardTitle>
                <div className="flex items-end">
                    <AvatarDemo src="https://github.com/shadcn.png"/>
                    <h2 className="ml-1 text-[var(--primary)]"> @{message.owner}</h2>
                </div>
            </CardTitle>
            <CardDescription>
            {timeAgo(message.created)}
            </CardDescription>
        </CardHeader>
        <CardContent>
            <p>
                commented on 
                "{message.room}"
            </p>
        </CardContent>
        <CardFooter>
            <Button variant="outline" size="sm" className="w-full h-fit flex flex-col justify-center items-center gap-1 p-2">
            <p>{message.body}</p>
                {message.attachment && (
                <a 
                    href={message.attachment} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-sm text-[var(--primary)] underline"
                >
                    <FaPaperclip className="text-xs"/>
                    View Attachment
                </a>
            )}
            </Button>
        </CardFooter>
        </Card>
    )
}
