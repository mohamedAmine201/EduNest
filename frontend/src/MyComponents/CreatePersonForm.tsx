"use client"
import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "./AuthContext"

const BASE_URL = import.meta.env.VITE_API_URL

const personSchema = z.object({
    identifier: z.string().min(2, "Must be at least 2 characters").max(32),
    nom: z.string().min(2, "Must be at least 2 characters").max(30),
    prenom: z.string().min(2, "Must be at least 2 characters").max(30),
    email: z.string().email().max(100),
})

type CreatePersonFormProps = {
    onClose?: () => void
    role: "student" | "teacher"
    year: string        // from selectedYear
    speciality: string  // from selectedSpeciality — only relevant for students
}

export function CreatePersonForm({ onClose, role, year, speciality }: CreatePersonFormProps) {
    const {token} = useAuth();
    const form = useForm<z.infer<typeof personSchema>>({
        resolver: zodResolver(personSchema),
        defaultValues: { identifier: '', nom: '', prenom: '', email: '' },
    })

    async function onSubmit(values: z.infer<typeof personSchema>) {
        const payload = {
        nom: values.nom,
        prenom: values.prenom,
        email: values.email,
        role,
        ...(role === "student"
            ? { matricule: values.identifier, year, speciality }
            : { course: values.identifier }
        ),
        }

        try {
            const res = await fetch(`${BASE_URL}/api/users/register/`, {
            method: 'POST',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
            })
            if (!res.ok) {
                const error = await res.json();
                toast.error(error.detail || "Something went wrong", { position: "bottom-right" })
                return
            }
            toast.success(`${role === "student" ? "Student" : "Teacher"} created successfully!`, {position: "bottom-right",})

            if (onClose) onClose()
        } catch {
            toast.error("Network error, please try again", { position: "bottom-right" })
        }
  }

    return (
        <Card className="w-full">
        <CardHeader>
            <CardTitle>Create a {role === "student" ? "Student" : "Teacher"}</CardTitle>
            <CardDescription>Fill in the details below.</CardDescription>
        </CardHeader>
        <CardContent>
            <form id="create-person-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
                {[
                { name: "identifier", label: role === "student" ? "Matricule" : "Course" },
                { name: "nom",        label: "Nom" },
                { name: "prenom",     label: "Prenom" },
                { name: "email",      label: "Email" },
                ].map(({ name, label }) => (
                <Controller
                    key={name}
                    name={name as keyof z.infer<typeof personSchema>}
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
        <CardFooter className="flex justify-end">
            <Button type="submit" form="create-person-form">Create</Button>
        </CardFooter>
        </Card>
    )
}