"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import { useAuth } from "./AuthContext"
import {
  Trash2, Save, User, Mail, Phone, BookOpen,
  GraduationCap, Hash, X, ChevronDown, Search, Loader2,
} from "lucide-react"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const BASE_URL = import.meta.env.VITE_API_URL

// ─── Types ────────────────────────────────────────────────────────────────────

export type PersonForEdit = {
  user_id:      number
  identifier:   string | null
  nom:          string
  prenom:       string
  email:        string
  phone_number: string | null
  role:         string
  year:         string | null
  speciality:   string | null
  courses:      string | null   // comma-separated course names
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  identifier:   z.string().min(1, "Required").max(50),
  nom:          z.string().min(1, "Required").max(30),
  prenom:       z.string().min(1, "Required").max(30),
  email:        z.string().email("Invalid email").max(100),
  phone_number: z.string().max(20).optional().or(z.literal("")),
  year:         z.string().optional().or(z.literal("")),
  speciality:   z.string().optional().or(z.literal("")),
  // stored as array in the form, serialized to comma-string on submit
  courses:      z.array(z.string()).optional(),
})

type FormValues = z.infer<typeof schema>

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  person:   PersonForEdit
  onClose?: () => void
  onSaved?: () => void
}

// ─── FieldRow ─────────────────────────────────────────────────────────────────

function FieldRow({
  icon: Icon, label, required, error, children,
}: {
  icon: React.ElementType; label: string; required?: boolean; error?: string; children: React.ReactNode
}) {
  return (
    <div className="group">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className="w-3.5 h-3.5 text-zinc-400" />
        <label className="text-xs font-semibold tracking-wide uppercase text-zinc-500">
          {label}
          {required && <span className="text-rose-400 ml-0.5">*</span>}
        </label>
      </div>
      {children}
      {error && (
        <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-rose-400" />
          {error}
        </p>
      )}
    </div>
  )
}

// ─── CourseMultiSelect ────────────────────────────────────────────────────────

interface CourseMultiSelectProps {
  value:    string[]
  onChange: (val: string[]) => void
}

function CourseMultiSelect({ value, onChange }: CourseMultiSelectProps) {
  const { token } = useAuth()
  const [open, setOpen]         = React.useState(false)
  const [query, setQuery]       = React.useState("")
  const [options, setOptions]   = React.useState<string[]>([])
  const [loading, setLoading]   = React.useState(false)
  const containerRef            = React.useRef<HTMLDivElement>(null)
  const inputRef                = React.useRef<HTMLInputElement>(null)

  // Fetch matching courses from DB whenever query changes
  React.useEffect(() => {
    if (!open) return

    const controller = new AbortController()

    const run = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${BASE_URL}/api/courses/`, {
          headers: { Authorization: `Token ${token}` },
          signal: controller.signal,
        })
        if (!res.ok) throw new Error()
        const data = await res.json()
        const list: { name: string }[] = Array.isArray(data) ? data : (data.results ?? [])
        setOptions(list.map(c => c.name))
      } catch {
        // aborted or failed
      } finally {
        setLoading(false)
      }
    }

    run()
    return () => controller.abort()
  }, [open, token])

  // Close on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery("")
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const toggle = (course: string) => {
    onChange(
      value.includes(course)
        ? value.filter(c => c !== course)
        : [...value, course]
    )
  }

  const remove = (course: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(value.filter(c => c !== course))
  }

  const openDropdown = () => {
    setOpen(true)
    setTimeout(() => inputRef.current?.focus(), 10)
  }

  // Filtered: show all fetched options (DB already filters by query)
  const filtered = options.filter(o =>
    !value.includes(o) &&
    o.toLowerCase().includes(query.toLowerCase())
  )
  return (
    <div ref={containerRef} className="relative">
      {/* Trigger box */}
      <div
        onClick={openDropdown}
        className={[
          "min-h-[2.25rem] w-full rounded-lg border px-3 py-1.5 flex flex-wrap gap-1.5 cursor-text",
          "bg-zinc-50 dark:bg-zinc-800/60 transition-all duration-150",
          open
            ? "border-emerald-400 ring-2 ring-emerald-400/25"
            : "border-zinc-200 dark:border-zinc-700",
        ].join(" ")}
      >
        {/* Badges */}
        {value.map(course => (
          <span
            key={course}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-medium"
          >
            {course}
            <button
              type="button"
              onClick={e => remove(course, e)}
              className="hover:text-rose-500 transition-colors ml-0.5"
              tabIndex={-1}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        {/* Inline search input (visible when open) */}
        {open ? (
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Escape") { setOpen(false); setQuery("") }
              if (e.key === "Backspace" && query === "" && value.length > 0) {
                onChange(value.slice(0, -1))
              }
            }}
            placeholder={value.length === 0 ? "Search courses…" : ""}
            className="flex-1 min-w-[120px] bg-transparent text-sm outline-none text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400"
          />
        ) : (
          <span className={["flex-1 flex items-center justify-between text-sm", value.length === 0 ? "text-zinc-400" : ""].join(" ")}>
            {value.length === 0 && "Select courses…"}
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 ml-auto" />
          </span>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1.5 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden">
          {/* Search header */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-100 dark:border-zinc-800">
            <Search className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span className="text-xs text-zinc-400">
              {loading ? "Searching…" : `${filtered.length} course${filtered.length !== 1 ? "s" : ""} found`}
            </span>
            {loading && <Loader2 className="w-3 h-3 text-zinc-400 animate-spin ml-auto" />}
          </div>

          {/* Options list */}
          <ul className="max-h-48 overflow-y-auto py-1">
            {filtered.length === 0 && !loading && (
              <li className="px-3 py-2 text-xs text-zinc-400 italic">
                {query ? `No courses matching "${query}"` : "No more courses available"}
              </li>
            )}
            {filtered.map(course => (
              <li key={course}>
                <button
                  type="button"
                  onMouseDown={e => { e.preventDefault(); toggle(course) }}
                  className="w-full text-left px-3 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors flex items-center gap-2"
                >
                  <BookOpen className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600 shrink-0" />
                  {course}
                </button>
              </li>
            ))}
            {/* Also show already-selected at bottom, dimmed */}
            {value.length > 0 && filtered.length > 0 && (
              <li className="px-3 pt-1 pb-0.5 border-t border-zinc-100 dark:border-zinc-800">
                <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold">Selected</span>
              </li>
            )}
            {value.map(course => (
              <li key={`sel-${course}`}>
                <button
                  type="button"
                  onMouseDown={e => { e.preventDefault(); toggle(course) }}
                  className="w-full text-left px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-rose-50 dark:hover:bg-rose-900/10 hover:text-rose-500 transition-colors flex items-center gap-2"
                >
                  <X className="w-3 h-3 shrink-0" />
                  {course}
                  <span className="ml-auto text-[10px] text-zinc-400">remove</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function EditPersonForm({ person, onClose, onSaved }: Props) {
  const { token } = useAuth()
  const isStudent = person.role === "STUDENT"

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      identifier:   person.identifier   ?? "",
      nom:          person.nom,
      prenom:       person.prenom,
      email:        person.email,
      phone_number: person.phone_number ?? "",
      year:         person.year ? String(person.year) : "",
      speciality:   person.speciality   ?? "",
      // parse comma-string → array, drop empties
      courses: person.courses
        ? person.courses.split(",").map(s => s.trim()).filter(Boolean)
        : [],
    },
  })

  const { formState: { isSubmitting } } = form

  // ── Submit ─────────────────────────────────────────────────────────────────
  async function onSubmit(values: FormValues) {
    try {
      const payload: Record<string, unknown> = {
        identifier:   values.identifier,
        nom:          values.nom,
        prenom:       values.prenom,
        email:        values.email,
        phone_number: values.phone_number || null,
      }
      if (isStudent) {
        payload.year       = values.year       || null
        payload.speciality = values.speciality || null
      } else {
        // serialize back to comma-string for the backend
        payload.courses = values.courses?.join(", ") || null
      }

      const res = await fetch(`${BASE_URL}/api/users/${person.user_id}/update/`, {
        method:  "PATCH",
        headers: { Authorization: `Token ${token}`, "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.detail || "Update failed", { position: "bottom-right" })
        return
      }
      toast.success("Saved successfully", { position: "bottom-right" })
      onSaved?.()
      onClose?.()
    } catch {
      toast.error("Network error", { position: "bottom-right" })
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  async function handleDelete() {
    try {
      const res = await fetch(`${BASE_URL}/api/users/${person.user_id}/delete/`, {
        method:  "DELETE",
        headers: { Authorization: `Token ${token}` },
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.detail || "Delete failed", { position: "bottom-right" })
        return
      }
      toast.success("User deleted", { position: "bottom-right" })
      onSaved?.()
      onClose?.()
    } catch {
      toast.error("Network error", { position: "bottom-right" })
    }
  }

  const inputCls = (invalid: boolean) =>
    [
      "w-full h-9 rounded-lg border bg-zinc-50 dark:bg-zinc-800/60 px-3 text-sm",
      "focus:outline-none focus:ring-2 transition-all duration-150",
      invalid
        ? "border-rose-400 focus:ring-rose-400/30"
        : "border-zinc-200 dark:border-zinc-700 focus:ring-blue-500/30 focus:border-blue-400",
    ].join(" ")

  return (
    <div className="w-full space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Edit {isStudent ? "Student" : "Teacher"}
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            {person.prenom} {person.nom}
            <span className="mx-1.5 text-zinc-300">·</span>
            <span className="font-mono">{person.identifier ?? "—"}</span>
          </p>
        </div>
        <span className={[
          "text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full",
          isStudent
            ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
            : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",
        ].join(" ")}>
          {person.role}
        </span>
      </div>

      <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

      {/* Form */}
      <form id="edit-person-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

        <div className="grid grid-cols-2 gap-3">
          <Controller name="identifier" control={form.control} render={({ field, fieldState }) => (
            <FieldRow icon={Hash} label="Identifier" required error={fieldState.error?.message}>
              <input {...field} className={inputCls(fieldState.invalid)} autoComplete="off" />
            </FieldRow>
          )} />
          <Controller name="nom" control={form.control} render={({ field, fieldState }) => (
            <FieldRow icon={User} label="Nom" required error={fieldState.error?.message}>
              <input {...field} className={inputCls(fieldState.invalid)} autoComplete="off" />
            </FieldRow>
          )} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Controller name="prenom" control={form.control} render={({ field, fieldState }) => (
            <FieldRow icon={User} label="Prénom" required error={fieldState.error?.message}>
              <input {...field} className={inputCls(fieldState.invalid)} autoComplete="off" />
            </FieldRow>
          )} />
          <Controller name="email" control={form.control} render={({ field, fieldState }) => (
            <FieldRow icon={Mail} label="Email" required error={fieldState.error?.message}>
              <input {...field} type="email" className={inputCls(fieldState.invalid)} autoComplete="off" />
            </FieldRow>
          )} />
        </div>

        <Controller name="phone_number" control={form.control} render={({ field, fieldState }) => (
          <FieldRow icon={Phone} label="Phone" error={fieldState.error?.message}>
            <input {...field} className={inputCls(fieldState.invalid)} autoComplete="off" placeholder="Optional" />
          </FieldRow>
        )} />

        {/* Student-only */}
        {isStudent && (
          <div className="rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 p-4 space-y-4">
            <p className="text-[10px] font-bold tracking-widest uppercase text-blue-400">Student info</p>
            <div className="grid grid-cols-2 gap-3">
              <Controller name="year" control={form.control} render={({ field, fieldState }) => (
                <FieldRow icon={GraduationCap} label="Year" error={fieldState.error?.message}>
                  <input {...field} className={inputCls(fieldState.invalid)} placeholder="e.g. 1" />
                </FieldRow>
              )} />
              <Controller name="speciality" control={form.control} render={({ field, fieldState }) => (
                <FieldRow icon={BookOpen} label="Speciality" error={fieldState.error?.message}>
                  <input {...field} className={inputCls(fieldState.invalid)} placeholder="e.g. DSIA" />
                </FieldRow>
              )} />
            </div>
            <FieldRow icon={BookOpen} label="Courses">
              <div className="h-9 flex items-center px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-400 select-none">
                — (not applicable for students)
              </div>
            </FieldRow>
          </div>
        )}

        {/* Teacher-only */}
        {!isStudent && (
          <div className="rounded-xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 space-y-4">
            <p className="text-[10px] font-bold tracking-widest uppercase text-emerald-400">Teacher info</p>

            {/* ── Course multi-select ── */}
            <Controller
              name="courses"
              control={form.control}
              render={({ field, fieldState }) => (
                <FieldRow icon={BookOpen} label="Courses" error={fieldState.error?.message}>
                  <CourseMultiSelect
                    value={field.value ?? []}
                    onChange={field.onChange}
                  />
                  <p className="mt-1 text-[11px] text-zinc-400">
                    Search and select courses from the database
                  </p>
                </FieldRow>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              {["Year", "Speciality"].map(label => (
                <FieldRow key={label} icon={GraduationCap} label={label}>
                  <div className="h-9 flex items-center px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-400 select-none">
                    — (not applicable)
                  </div>
                </FieldRow>
              ))}
            </div>
          </div>
        )}
      </form>

      <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

      {/* Footer */}
      <div className="flex items-center justify-between">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-rose-500 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
              Delete user
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {person.prenom} {person.nom}?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. The account will be permanently removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-rose-500 hover:bg-rose-600 text-white">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <button
          type="submit"
          form="edit-person-form"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-100 transition-colors disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          {isSubmitting ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  )
}