"use client"

import { useEffect, useState } from "react"
import { useAuth } from "./AuthContext"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
    import { Input } from "@/components/ui/input"
    import {
    InputGroup,
    InputGroupAddon,
    InputGroupText,
    InputGroupTextarea,
} from "@/components/ui/input-group"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

    const BASE_URL = import.meta.env.VITE_API_URL

    const formSchema = z.object({
    topic: z
        .string()
        .min(5, "topic must be at least 5 characters.")
        .max(32, "topic must be at most 32 characters."),
    description: z
        .string()
        .min(10, "Description must be at least 10 characters.")
        .max(100, "Description must be at most 100 characters."),
    speciality_year: z
        .string()
        .min(1, 'please enter a speciality')
    })

    export function CreateRoomForm({ onClose }: { onClose?: () => void }) {
    const {token} = useAuth();
    const [specialities, setSpecialities] = useState([]);
    useEffect(() => {
        const fetchSpecialities = async () => {
            const response = await fetch(`${BASE_URL}/api/specialities/`, {
                headers: {
                    'Authorization': `Token ${token}`
                }
            });
            const data = await response.json();
            console.log(data)
            setSpecialities(data);
        }
        fetchSpecialities();
    }, [])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
        topic: "",
        description: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const response = await fetch('http://localhost:8000/api/rooms/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}` 
            },
            body: JSON.stringify(values)
            });
            if (response.ok) {
                toast.success("Room created successfully!", { position: "bottom-right" }) 
                if (onClose) onClose()
            } else {
                toast.error("Failed to create the room.", {position: "bottom-right"})
            }
            
        }
        catch (err){ 
            toast.error("Network error while creating the room.", {position: 'bottom-right'})
        }
    }

    return (
        <Card className="w-full sm:max-w-md">
        <CardHeader>
            <CardTitle>Create a Room</CardTitle>
            <CardDescription>
            Creat a Room to help students.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
                <Controller
                    name="speciality_year"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel>Speciality</FieldLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a speciality" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Specialities</SelectLabel>
                                        {specialities.map((spec: any) => (
                                            <SelectItem key={spec.id} value={String(spec.id)}>
                                                {spec.year} - {spec.speciality}  {/* adjust field name to match your API */}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />
                <Controller
                name="topic"
                control={form.control}
                render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-rhf-demo-title">
                        Room Topic
                    </FieldLabel>
                    <Input
                        {...field}
                        id="form-rhf-demo-title"
                        aria-invalid={fieldState.invalid}
                        placeholder="Room of TNS"
                        autoComplete="off"
                    />
                    {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                    )}
                    </Field>
                )}
                />
                <Controller
                name="description"
                control={form.control}
                render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-rhf-demo-description">
                        Description
                    </FieldLabel>
                    <InputGroup>
                        <InputGroupTextarea
                        {...field}
                        id="form-rhf-demo-description"
                        placeholder="Correction d'examen de premier semestre"
                        rows={6}
                        className="min-h-24 resize-none"
                        aria-invalid={fieldState.invalid}
                        />
                        <InputGroupAddon align="block-end">
                        <InputGroupText className="tabular-nums">
                            {field.value.length}/100 characters
                        </InputGroupText>
                        </InputGroupAddon>
                    </InputGroup>
                    <FieldDescription>
                        Include useful information about the Exam or Interrogation.
                    </FieldDescription>
                    {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                    )}
                    </Field>
                )}
                />
            </FieldGroup>
            </form>
        </CardContent>
        <CardFooter>
            <Field orientation="horizontal">
            <Button type="button" variant="outline" onClick={() => form.reset()}>
                Reset
            </Button>
            <Button type="submit" form="form-rhf-demo">
                Submit
            </Button>
            </Field>
        </CardFooter>
        </Card>
    )
}
