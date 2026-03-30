"use client"

import * as React from "react"
import {Link, useNavigate} from 'react-router-dom'
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
    } from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"
import {toast} from 'sonner'
import {useAuth} from './AuthContext'


    export function NavigationMenuDemo() {
    return (
        <NavigationMenu>
        <NavigationMenuList>
            <NavigationMenuItem>
            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <Link to="/">Home</Link>
            </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <Link to="/rooms">Rooms</Link>
            </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <Link to="/profile">Profile</Link>
            </NavigationMenuLink>
            </NavigationMenuItem>
        </NavigationMenuList>
        </NavigationMenu>
    )
    }

    export function LoginLink() {
        const {logout, token} = useAuth();
        const navigate = useNavigate();
        const handleLogout = () => {
        toast.success("You've been successfully logged out!", {position: 'bottom-right'})
        logout();
        navigate('/');
        }
        
        return (
            <NavigationMenu>
            <NavigationMenuList>
            {token 
            ?<NavigationMenuItem>
                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                    <Button className="text-white cursor-pointer" onClick={handleLogout}>Logout</Button>
                </NavigationMenuLink>
            </NavigationMenuItem>
            :
            <NavigationMenuItem>
                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                    <Link to="/login">Login</Link>
                </NavigationMenuLink>
            </NavigationMenuItem>
            }
            </NavigationMenuList>
            </NavigationMenu>
        )
    }
