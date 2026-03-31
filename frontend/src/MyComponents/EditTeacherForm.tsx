"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useAuth } from "./AuthContext"

const BASE_URL = import.meta.env.VITE_API_URL

const teacherSchema = z.object({
    course: z.string().min(2).max(32),
    nom: z.string().min(2).max(30),
    prenom: z.string().min(2).max(30),
    email: z.string().email().max(100),
})

export type Teacher = {
    id: number;
    role: "teacher";
    course: string;
    nom: string;
    prenom: string;
    email: string;
    user_id: number;
}

type Props = { onClose?: () => void; person: Teacher }

export function EditTeacherForm({ onClose, person }: Props) {
    const { token } = useAuth()
    const form = useForm<z.infer<typeof teacherSchema>>({
        resolver: zodResolver(teacherSchema),
        defaultValues: {
            course: person.course,
            nom: person.nom,
            prenom: person.prenom,
            email: person.email,
        },
    })

    async function onSubmit(values: z.infer<typeof teacherSchema>) {
        try {
            const res = await fetch(`${BASE_URL}/api/users/${person.user_id}/update/`, {
                method: 'PATCH',
                headers: { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nom: values.nom,
                    prenom: values.prenom,
                    email: values.email,
                    course: values.course,
                })
            })
            if (!res.ok) {
                const error = await res.json()
                toast.error(error.detail || "Something went wrong", { position: "bottom-right" })
                return
            }
            toast.success("Teacher updated successfully!", { position: "bottom-right" })
            if (onClose) onClose()
        } catch {
            toast.error("Network error, please try again", { position: "bottom-right" })
        }
    }

    const handleDelete = async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/users/${person.user_id}/delete/`, {
                method: 'DELETE',
                headers: { 'Authorization': `Token ${token}` }
            })
            if (!res.ok) {
                const error = await res.json()
                toast.error(error.detail || "Something went wrong", { position: "bottom-right" })
                return
            }
            toast.success("Teacher deleted successfully!", { position: "bottom-right" })
            if (onClose) onClose()
        } catch {
            toast.error("Network error, please try again", { position: "bottom-right" })
        }
    }

    return (
        <Card className="w-full sm:max-w-md">
            <CardHeader>
                <CardTitle>Edit Teacher</CardTitle>
                <CardDescription>Update teacher data or delete them.</CardDescription>
            </CardHeader>
            <CardContent>
                <form id="edit-teacher-form" onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup>
                        {[
                            { name: "course" as const, label: "Course" },
                            { name: "nom" as const, label: "Nom" },
                            { name: "prenom" as const, label: "Prénom" },
                            { name: "email" as const, label: "Email" },
                        ].map(({ name, label }) => (
                            <Controller
                                key={name}
                                name={name}
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={name}>{label}</FieldLabel>
                                        <Input {...field} id={name} autoComplete="off" aria-invalid={fieldState.invalid} />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                        ))}
                    </FieldGroup>
                </form>
            </CardContent>
            <CardFooter>
                <Field orientation="horizontal">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button type="button" variant="destructive">Delete</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the account.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <Button type="submit" form="edit-teacher-form">Update</Button>
                </Field>
            </CardFooter>
        </Card>
    )
}