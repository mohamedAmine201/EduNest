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

const studentSchema = z.object({
    matricule: z.string().min(2).max(32),
    nom: z.string().min(2).max(30),
    prenom: z.string().min(2).max(30),
    email: z.string().email().max(100),
    year: z.number().min(1).max(4),
    speciality: z.string().min(2).max(20),
})

export type Student = {
    id: number;
    role: "student";
    matricule: string;
    nom: string;
    prenom: string;
    email: string;
    year: number;
    speciality: string;
    user_id: number;
}

type Props = { onClose?: () => void; person: Student }

export function EditStudentForm({ onClose, person }: Props) {
    const { token } = useAuth()
    const form = useForm<z.infer<typeof studentSchema>>({
        resolver: zodResolver(studentSchema),
        defaultValues: {
            matricule: person.matricule,
            nom: person.nom,
            prenom: person.prenom,
            email: person.email,
            year: person.year,
            speciality: person.speciality,
        },
    })

    async function onSubmit(values: z.infer<typeof studentSchema>) {
        try {
            const res = await fetch(`${BASE_URL}/api/users/${person.user_id}/update/`, {
                method: 'PATCH',
                headers: { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nom: values.nom,
                    prenom: values.prenom,
                    email: values.email,
                    matricule: values.matricule,
                    year: values.year,
                    speciality: values.speciality,
                })
            })
            if (!res.ok) {
                const error = await res.json()
                toast.error(error.detail || "Something went wrong", { position: "bottom-right" })
                return
            }
            toast.success("Student updated successfully!", { position: "bottom-right" })
            if (onClose) onClose()
        } catch {
            toast.error("Network error, please try again", { position: "bottom-right" })
        }
    }

    const handleDelete = async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/users/${person.id}/delete/`, {
                method: 'DELETE',
                headers: { 'Authorization': `Token ${token}` }
            })
            if (!res.ok) {
                const error = await res.json()
                toast.error(error.detail || "Something went wrong", { position: "bottom-right" })
                return
            }
            toast.success("Student deleted successfully!", { position: "bottom-right" })
            if (onClose) onClose()
        } catch {
            toast.error("Network error, please try again", { position: "bottom-right" })
        }
    }

    return (
        <Card className="w-full sm:max-w-md">
            <CardHeader>
                <CardTitle>Edit Student</CardTitle>
                <CardDescription>Update student data or delete them.</CardDescription>
            </CardHeader>
            <CardContent>
                <form id="edit-student-form" onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup>
                        {[
                            { name: "matricule" as const, label: "Matricule" },
                            { name: "nom" as const, label: "Nom" },
                            { name: "prenom" as const, label: "Prénom" },
                            { name: "email" as const, label: "Email" },
                            { name: "speciality" as const, label: "Speciality" },
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
                        <Controller
                            name="year"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="year">Year</FieldLabel>
                                    <Input
                                        {...field}
                                        id="year"
                                        type="number"
                                        autoComplete="off"
                                        aria-invalid={fieldState.invalid}
                                        onChange={e => field.onChange(e.target.valueAsNumber)}
                                    />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
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
                    <Button type="submit" form="edit-student-form">Update</Button>
                </Field>
            </CardFooter>
        </Card>
    )
}