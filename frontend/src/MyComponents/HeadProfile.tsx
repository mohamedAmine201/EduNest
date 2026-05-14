import React, { useState, useEffect, useRef } from 'react'
import {
  Table, TableBody, TableCaption, TableCell,
  TableFooter, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Select, SelectContent, SelectGroup,
  SelectItem, SelectLabel, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EditPersonForm, type PersonForEdit } from './EditPersonForm'
import { CreatePersonForm } from './CreatePersonForm'
import { useAuth } from './AuthContext'
import {
  Upload, Download, X, FileSpreadsheet,
  Loader2, CheckCircle2, AlertTriangle, Plus,
} from 'lucide-react'

const BASE_URL = import.meta.env.VITE_API_URL

// ─── Types ────────────────────────────────────────────────────────────────────

interface Person {
  user_id:      number
  identifier:   string | null
  nom:          string
  prenom:       string
  email:        string
  phone_number: string | null
  role:         string
  year:         string | null
  speciality:   string | null
  display_year:       string | null  // shown in table
  display_speciality: string | null 
  courses:      string | null   // null for students, comma-separated for teachers
  _role:        'student' | 'teacher'
}

interface SkippedEntry { email: string; reason: string }
interface ErrorEntry   { row: Record<string, unknown>; error: string }

interface ImportResult {
  created: number
  skipped: number
  errors:  number
  details: {
    created: unknown[]
    skipped: SkippedEntry[]
    errors:  ErrorEntry[]
  }
}

interface UploadData {
  detected_columns: Record<string, string>
  headers:          string[]
  preview:          Record<string, unknown>[]
  total_rows:       number
  rows:             Record<string, unknown>[]
}

const REQUIRED_FIELDS = ['identifier', 'nom', 'prenom', 'email']

// ─── ImportModal ──────────────────────────────────────────────────────────────

interface ImportModalProps {
  selectedRole:       string
  selectedYear:       string
  selectedSpeciality: string
  token:              string
  onClose:            () => void
  onSuccess:          () => void
}

function ImportModal({
  selectedRole, selectedYear, selectedSpeciality, token, onClose, onSuccess,
}: ImportModalProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [step, setStep]               = useState<'idle' | 'loading' | 'preview' | 'confirming' | 'done'>('idle')
  const [uploadData, setUploadData]   = useState<UploadData | null>(null)
  const [mapping, setMapping]         = useState<Record<string, string>>({})
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [fileName, setFileName]       = useState('')
  const [error, setError]             = useState('')

  const REQUIRED_FIELDS = ['identifier', 'nom', 'prenom', 'email']

  // inside ImportModal, derive which fields to show in the mapper:
  const mappableFields = [
    'identifier', 'nom', 'prenom', 'email', 'phone_number',
    ...(selectedRole === 'teacher' ? ['course'] : []),
  ]
  const allMapped      = REQUIRED_FIELDS.every(f => mapping[f])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setError('')
    setStep('loading')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res  = await fetch(`${BASE_URL}/api/users/spreadsheet-upload/`, {
        method:  'POST',
        headers: { Authorization: `Token ${token}` },
        body:    formData,
      })
      const data: UploadData = await res.json()
      if (!res.ok) { setError((data as any).error || 'Upload failed.'); setStep('idle'); return }
      setUploadData(data)
      setMapping(data.detected_columns)
      setStep('preview')
    } catch {
      setError('Network error. Please try again.')
      setStep('idle')
    }
  }

  const handleConfirm = async () => {
    if (!uploadData) return
    setStep('confirming')
    try {
      const res = await fetch(`${BASE_URL}/api/users/bulk-import/`, {
        method:  'POST',
        headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mapping,
          rows:          uploadData.rows,
          role:          selectedRole,
          speciality:    selectedSpeciality,
          year: selectedYear,
          current_year:  new Date().getFullYear(),
        }),
      })
      const result: ImportResult = await res.json()
      if (!res.ok) { setError((result as any).error || 'Import failed.'); setStep('preview'); return }
      setImportResult(result)
      setStep('done')
      onSuccess()
    } catch {
      setError('Network error during import.')
      setStep('preview')
    }
  }

  const reset = () => {
    setStep('idle'); setUploadData(null); setMapping({}); setFileName(''); setError('')
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-semibold text-sm">
                Import {selectedRole === 'student' ? 'Students' : 'Teachers'}
              </p>
              <p className="text-xs text-zinc-500">
                {selectedYear ? `${selectedYear}ère année · ` : ''}{selectedSpeciality}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Step: idle / loading */}
          {(step === 'idle' || step === 'loading') && (
            <div
              className="border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-xl p-10 flex flex-col items-center gap-4 cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition-all"
              onClick={() => fileRef.current?.click()}
            >
              {step === 'loading'
                ? <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                : <Upload className="w-10 h-10 text-zinc-400" />}
              <div className="text-center">
                <p className="font-medium text-zinc-700 dark:text-zinc-300">
                  {step === 'loading' ? 'Reading your file…' : 'Click to upload a spreadsheet'}
                </p>
                <p className="text-xs text-zinc-400 mt-1">CSV or Excel</p>
              </div>
              <input
                ref={fileRef} type="file" accept=".csv,.xlsx,.xls"
                className="hidden" onChange={handleFileChange}
              />
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          {/* Step: preview */}
          {(step === 'preview' || step === 'confirming') && uploadData && (
            <>
              <div className="flex flex-wrap gap-2 items-center text-sm">
                <span className="text-zinc-500">File:</span>
                <Badge variant="secondary">{fileName}</Badge>
                <span className="text-zinc-500 ml-2">{uploadData.total_rows} rows detected</span>
              </div>

              <div>
                <p className="text-sm font-semibold text-zinc-700 mb-3">Map columns</p>
                <div className="grid grid-cols-2 gap-3">
                  {mappableFields.map(field => {
                    const isRequired = REQUIRED_FIELDS.includes(field)
                    return (
                      <div key={field}>
                        <label className="block text-xs font-medium text-zinc-600 mb-1 capitalize">
                          {field.replace('_', ' ')}
                          {isRequired
                            ? <span className="text-red-500 ml-1">*</span>
                            : <span className="text-zinc-400 ml-1">(optional)</span>
                          }
                        </label>
                        <Select
                          value={mapping[field] || ''}
                          onValueChange={val => setMapping(prev => ({ ...prev, [field]: val }))}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select column" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Spreadsheet columns</SelectLabel>
                              {uploadData.headers.map(h => (
                                <SelectItem key={h} value={h}>{h}</SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-zinc-700 mb-2">Preview — first 5 rows</p>
                <div className="rounded-lg border border-zinc-200 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-zinc-800">
                        {uploadData.headers.map(h => (
                          <TableHead key={h} className="text-xs">{h}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {uploadData.preview.map((row, i) => (
                        <TableRow key={i}>
                          {uploadData.headers.map(h => (
                            <TableCell key={h} className="text-sm">{String(row[h] ?? '—')}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </>
          )}

          {/* Step: done */}
          {step === 'done' && importResult && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                <div>
                  <p className="text-lg font-semibold">Import complete</p>
                  <div className="flex gap-4 justify-center mt-2 text-sm">
                    <span className="text-emerald-600 font-medium">{importResult.created} created</span>
                    <span className="text-amber-500 font-medium">{importResult.skipped} skipped</span>
                    {importResult.errors > 0 && (
                      <span className="text-red-500 font-medium">{importResult.errors} errors</span>
                    )}
                  </div>
                </div>
              </div>

              {importResult.details.skipped.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-amber-600 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Skipped ({importResult.details.skipped.length})
                  </p>
                  <div className="rounded-lg border border-amber-200 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-amber-50">
                          <TableHead className="text-xs">Email</TableHead>
                          <TableHead className="text-xs">Reason</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {importResult.details.skipped.map((s, i) => (
                          <TableRow key={i} className="bg-amber-50/50">
                            <TableCell className="text-sm text-amber-700">{s.email}</TableCell>
                            <TableCell className="text-sm text-zinc-500">{s.reason}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-200 flex justify-between items-center">
          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={reset}>← Different file</Button>
              <Button
                onClick={handleConfirm}
                disabled={!allMapped}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                title={!allMapped ? 'Map all required columns first' : ''}
              >
                Import {uploadData?.total_rows} rows
              </Button>
            </>
          )}
          {step === 'confirming' && (
            <Button disabled className="ml-auto bg-blue-600 text-white">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Importing…
            </Button>
          )}
          {step === 'done' && (
            <Button onClick={onClose} className="ml-auto bg-emerald-600 hover:bg-emerald-700 text-white">
              Done
            </Button>
          )}
          {(step === 'idle' || step === 'loading') && (
            <Button variant="outline" onClick={onClose} className="ml-auto">Cancel</Button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── HeadProfile ──────────────────────────────────────────────────────────────

const HeadProfile = () => {
  const { token } = useAuth()

  const [selectedRole,       setSelectedRole]       = useState('')
  const [selectedYear,       setSelectedYear]       = useState('')
  const [selectedSpeciality, setSelectedSpeciality] = useState('')

  const [allStudents, setAllStudents] = useState<Person[]>([])
  const [allTeachers, setAllTeachers] = useState<Person[]>([])
  const [people,      setPeople]      = useState<Person[]>([])

  const [showEditForm,   setShowEditForm]   = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showImport,     setShowImport]     = useState(false)
  const canImport = !!selectedRole && !!selectedYear && !!selectedSpeciality
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const [loading,        setLoading]        = useState(false)

  // ── Fetch all profiles once on mount ────────────────────────────────────────
  const fetchPeople = async () => {
    setLoading(true)
    try {
      const res  = await fetch(`${BASE_URL}/api/profiles/`, {
        headers: { Authorization: `Token ${token}` },
      })
      const data = await res.json()
      console.log('RAW API RESPONSE:', data)          // ← check this
      console.log('teachers:', data.teachers)          // ← is it an array?
      console.log('students:', data.students)

      setAllStudents(
        data.students.map((s: Person) => ({ ...s, _role: 'student' as const, courses: null }))
      )
      setAllTeachers(
        data.teachers.map((t: Person) => ({ ...t, _role: 'teacher' as const }))
      )
    } catch (err) {
      console.error('Failed to fetch people:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPeople() }, [])

  // ── Filter locally whenever filters or source data change ───────────────────
  useEffect(() => {
    let pool: Person[] =
      selectedRole === 'student' ? allStudents
      : selectedRole === 'teacher' ? allTeachers
      : [...allStudents, ...allTeachers]

    if (selectedYear) {
      pool = pool.filter(p =>
        String(p.year ?? '').split(', ').includes(selectedYear)
      )
    }

    if (selectedSpeciality) {
      pool = pool.filter(p =>
        String(p.speciality ?? '').split(', ').includes(selectedSpeciality)
      )
    }

    setPeople(pool)
  }, [allStudents, allTeachers, selectedRole, selectedYear, selectedSpeciality])

  // ── Export ──────────────────────────────────────────────────────────────────
  const handleExport = () => {
    const headers = ['Identifier', 'Nom', 'Prenom', 'Email', 'Phone', 'Role', 'Year', 'Speciality', 'Courses']
    const rows = people.map(p => [
      p.identifier    ?? '',
      p.nom,
      p.prenom,
      p.email,
      p.phone_number  ?? '',
      p.role,
      p.year          ?? '',
      p.speciality    ?? '',
      p.courses       ?? '',
    ])
    const csv  = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `people_${selectedRole || 'all'}_${selectedYear || 'allyears'}_${selectedSpeciality || 'allspecialities'}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Row click → open edit modal ─────────────────────────────────────────────
  const handleRowClick = (person: Person) => {
    setSelectedPerson(person)
    setShowEditForm(true)
  }

  // ── Caption ─────────────────────────────────────────────────────────────────
  const caption = [
    selectedYear       ? `Year ${selectedYear}` : null,
    selectedSpeciality ? selectedSpeciality      : null,
    selectedRole       ? `${selectedRole}s`      : 'All users',
  ].filter(Boolean).join(' · ')

  return (
    <div className="mt-4 space-y-4 w-[85%] mx-auto p-2">
      <h2 className="font-semibold text-lg">Students & Teachers</h2>

      {/* ── Filters + actions ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">

          {/* Role */}
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Role</SelectLabel>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Year */}
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All years" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Year</SelectLabel>
                <SelectItem value="1">1st Year</SelectItem>
                <SelectItem value="2">2nd Year</SelectItem>
                <SelectItem value="3">3rd Year</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Speciality */}
          <Select value={selectedSpeciality} onValueChange={setSelectedSpeciality}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All specialities" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Speciality</SelectLabel>
                <SelectItem value="DSIA">DSIA</SelectItem>
                <SelectItem value="MI">MI</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Clear filters */}
          {(selectedRole || selectedSpeciality || selectedYear) && (
            <button
              onClick={() => { setSelectedRole(''); setSelectedSpeciality(''); setSelectedYear('') }}
              className="text-zinc-400 hover:text-zinc-700 transition-colors"
              title="Clear filters"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} className="hidden md:flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" /> Export
          </Button>
          <Button variant="outline" onClick={() => setShowImport(true)} className="hidden md:flex items-center gap-2 text-sm" disabled={!canImport}>
            <Upload className="w-4 h-4" /> Import
          </Button>
          <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> New User
          </Button>
        </div>
      </div>

      {/* ── Main table ────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
        </div>
      ) : (
        <Table>
          <TableCaption>{caption}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Identifier</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Prenom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Speciality</TableHead>
              <TableHead>Courses</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {people.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-zinc-400 py-8">
                  No results found for this filter.
                </TableCell>
              </TableRow>
            ) : (
              people.map(person => (
                <TableRow
                  key={`${person._role}-${person.user_id}`}
                  onClick={() => handleRowClick(person)}
                  className="cursor-pointer hover:bg-zinc-800"
                >
                  <TableCell className="font-medium font-mono text-sm">
                    {person.identifier ?? '—'}
                  </TableCell>
                  <TableCell>{person.nom}</TableCell>
                  <TableCell>{person.prenom}</TableCell>
                  <TableCell>{person.email}</TableCell>
                  <TableCell>{person.phone_number ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant={person._role === 'student' ? 'secondary' : 'outline'}>
                      {person.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{person.display_year        ?? '—'}</TableCell>
                  <TableCell>{person.display_speciality  ?? '—'}</TableCell>
                  <TableCell>{person.courses        ?? '—'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={8}>Total</TableCell>
              <TableCell className="text-right">{people.length}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      )}

      {/* ── Import modal ──────────────────────────────────────────────────── */}
      {showImport && (
        <ImportModal
          selectedRole={selectedRole}
          selectedYear={selectedYear}
          selectedSpeciality={selectedSpeciality}
          token={token!}
          onClose={() => setShowImport(false)}
          onSuccess={() => { setShowImport(false); fetchPeople() }}
        />
      )}

      {/* ── Create form modal ─────────────────────────────────────────────── */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowCreateForm(false)}
          />
          <div className="relative z-10 w-full max-w-lg mx-4 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowCreateForm(false)}
              className="mb-4 text-zinc-400 hover:text-zinc-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <CreatePersonForm
              onClose={() => setShowCreateForm(false)}
              onCreated={fetchPeople}          // ← add this
              role={selectedRole as 'student' | 'teacher'}
              year={selectedYear}
              speciality={selectedSpeciality}
            />
          </div>
        </div>
      )}

      {/* ── Edit form modal ───────────────────────────────────────────────── */}
      {showEditForm && selectedPerson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowEditForm(false)}
          />
          <div className="relative z-10 w-full max-w-lg mx-4 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowEditForm(false)}
              className="mb-4 text-zinc-400 hover:text-zinc-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <EditPersonForm
              person={selectedPerson as PersonForEdit}
              onClose={() => setShowEditForm(false)}
              onSaved={fetchPeople}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default HeadProfile