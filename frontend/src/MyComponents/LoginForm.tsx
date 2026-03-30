import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import {toast} from 'sonner'
import { useAuth } from "./AuthContext"

const BASE_URL = import.meta.env.VITE_API_URL

    export function LoginCard() {
    const {login} = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault() 
        setIsLoading(true);
        const formData = new FormData(e.currentTarget) 
        const email = formData.get("email") 
        const password = formData.get("password")
        const response = await fetch(`${BASE_URL}/api/users/login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password
            })
        });
        const data = await response.json();
        if (response.ok) {
            login(data.token, data.user);
            setIsLoading(false);
            toast.success("You're now logged in!", { position: "bottom-right" })
            navigate('/rooms')
        } else {
            setIsLoading(false);
            toast.error("Wrong credentials, please try again.", { position: "bottom-right" })
        }
    }
    return (
        <Card className="w-full max-w-sm">
        <CardHeader>
            <CardTitle>Login to your account</CardTitle>
            <CardDescription>
            Enter your email below to login to your account
            </CardDescription>
        </CardHeader>
        <CardContent>
            <form id='login-form' onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    name='email'
                    type="email"
                    placeholder="m@example.com"
                    required
                />
                </div>
                <div className="grid gap-2">
                <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                </div>
                <Input id="password" type="password" name='password' required />
                </div>
            </div>
            </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
            <Button type="submit" className="w-full" form='login-form'>
            {isLoading ? <Spinner /> : 'Login'}
            </Button>
        </CardFooter>
        </Card>
    )
}
