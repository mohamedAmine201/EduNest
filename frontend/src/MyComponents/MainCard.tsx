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

interface Room {
    id: number;
    topic: string;
    description: string;
    host: string;
    created: string;
}

    export function MainCard({room}: {room:Room}) {
    return (
        <Card className="mx-auto w-full">
        <CardHeader>
            <CardTitle>
                <div className="flex items-end">
                    <AvatarDemo src="https://github.com/shadcn.png"/>
                    <h2 className="ml-2"> Host <span className="text-[var(--primary)]">@{room.host}</span></h2>
                </div>
            </CardTitle>
            <CardDescription>
            {room.topic}.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <p>
            {room.description}
            </p>
        </CardContent>
        <CardFooter>
            <Button variant={'outline'}>
                Published "{room.created}"
            </Button>
        </CardFooter>
        </Card>
    )
}
