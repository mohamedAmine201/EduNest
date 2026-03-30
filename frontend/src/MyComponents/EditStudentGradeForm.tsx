"use client"

import * as React from "react"
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
    FieldError,
    FieldGroup,
    FieldLabel,
    } from "@/components/ui/field"
    import { Input } from "@/components/ui/input"

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



    const formSchema = z.object({
    course_matricule: z.string().min(2).max(32),
    nom: z.string().min(2, "Nom must be at least 2 characters").max(30),
    prenom: z.string().min(2, "Prenom must be at least 2 characters").max(30),
    email: z.string().email().max(100),
    year: z.string().min(1).max(4),
    speciality: z.string().min(2).max(20),
    });


    type Student = { 
        role: "student"; 
        matricule: string; 
        nom: string; 
        prenom: string; 
        email: string; 
        year: string; 
        speciality: string; 
    }; 
    type Teacher = { 
        role: "teacher"; 
        course: string; 
        nom: string; 
        prenom: string; 
        email: string; 
        year: string; 
        speciality: string; 
    }; 
    type Person = Student | Teacher;

    type EditPersonFormProps = { 
        onClose?: () => void; 
        role: string; 
        person: Person | null;
    };
    export function EditStudentGradeForm({ onClose, role, person }:EditPersonFormProps) {
    console.log(person!.year);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
        course_matricule:
        role === "student"
        ? (person as Student)?.matricule
        : (person as Teacher)?.course,

        nom: person?.nom , 
        prenom: person?.prenom, 
        email: person?.email , 
        year: person?.year , 
        speciality: person?.speciality 
        },
    })

    function onSubmit() {
        toast.success("User updated successfully!", { position: "bottom-right" }) 
        if (onClose) onClose() // tell parent to hide
    }

    const handleDelete = () => {
        toast.success("User deleted successfully!", {position: "bottom-right"})
        if (onClose) onClose()
    }


    return (
        <Card 
        key={
            person?.role === "student"
            ? person.matricule
            : person?.role === "teacher"
            ? person.course
            : "empty"
        }
        className="w-full sm:max-w-md mt-34">
        <CardHeader>
            <CardTitle>Edit a Student/Teacher</CardTitle>
            <CardDescription>
            Update a user's data or delete him.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
                <Controller
                name="course_matricule"
                control={form.control}
                render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="course_matricule">
                        {role === 'student' ? 'Matricule' : 'Course'}
                    </FieldLabel>
                    <Input
                        {...field}
                        id="course_matricule"
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
                name="nom"
                control={form.control}
                render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="nom">
                        Nom
                    </FieldLabel>
                    <Input
                        {...field}
                        id="nom"
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
                name="prenom"
                control={form.control}
                render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="prenom">
                        Prenom
                    </FieldLabel>
                    <Input
                        {...field}
                        id="prenom"
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
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="email">
                        Email
                    </FieldLabel>
                    <Input
                        {...field}
                        id="email"
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
                name="speciality"
                control={form.control}
                render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="speciality">
                        Speciality
                    </FieldLabel>
                    <Input
                        {...field}
                        id="speciality"
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
                name="year"
                control={form.control}
                render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="year">
                        Year
                    </FieldLabel>
                    <Input
                        {...field}
                        id="year"
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
            </FieldGroup>
            </form>
        </CardContent>
        <CardFooter>
            <Field orientation="horizontal">
            <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive" >
                    Delete
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the
                    account from the servers.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
            </AlertDialog>
            <Button type="submit" form="form-rhf-demo">
                Update
            </Button>
            </Field>
        </CardFooter>
        </Card>
    )
}
