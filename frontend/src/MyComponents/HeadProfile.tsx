import React, { useState, useEffect } from 'react'
import {
  Table, TableBody, TableCaption, TableCell,
  TableFooter, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Select, SelectContent, SelectGroup,
  SelectItem, SelectLabel, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { EditStudentForm, type Student } from './EditStudentForm'
import { EditTeacherForm, type Teacher } from './EditTeacherForm'
import { CreatePersonForm } from './CreatePersonForm'
import { useAuth } from './AuthContext'

const BASE_URL = import.meta.env.VITE_API_URL

interface Person {
  id: number;
  matricule?: string
  course?: string
  nom: string
  prenom: string
  email: string
  role: string
  year: string
  speciality: string
  user_id: number;
}

interface SkippedEntry {
  email: string
  reason: string
}

interface ErrorEntry {
  row: Record<string, unknown>
  error: string
}

interface ImportResult {
  created: number
  skipped: number
  errors: number
  details: {
    created: unknown[]
    skipped: SkippedEntry[]
    errors: ErrorEntry[]
  }
}

interface UploadData {
  detected_columns: Record<string, string>
  headers: string[]
  preview: Record<string, unknown>[]
  total_rows: number
  rows: Record<string, unknown>[]
}

const REQUIRED_FIELDS_STUDENT = ["matricule", "nom", "prenom", "email"]
const REQUIRED_FIELDS_TEACHER  = ["course", "nom", "prenom", "email"]

const HeadProfile = () => {
  const {token} = useAuth()
  const [selectedRole, setSelectedRole]             = useState("student")
  const [selectedYear, setSelectedYear]             = useState("1")
  const [selectedSpeciality, setSelectedSpeciality] = useState("DSIA")
  const [people, setPeople]                         = useState<Person[]>([])
  const [showEditForm, setshowEditForm]             = useState(false)
  const [showCreateForm, setshowCreateForm]             = useState(false)
  const [selectedPerson, setSelectedPerson]         = useState<Student|Teacher|null>(null)

  // --- Import state ---
  const [importStep, setImportStep]     = useState<"preview"|"done"|null>(null)  // null | "preview" | "done"
  const [uploadData, setUploadData]     = useState<UploadData|null>(null)
  const [mapping, setMapping]           = useState({})
  const [importResult, setImportResult] = useState<ImportResult|null>(null)
  const [importing, setImporting]       = useState(false)

  const requiredFields = selectedRole === "student"
    ? REQUIRED_FIELDS_STUDENT
    : REQUIRED_FIELDS_TEACHER

  useEffect(() => {
  const fetchPeople = async () => {
    const res = await fetch(`${BASE_URL}/api/profiles/?role=${selectedRole}&year=${selectedYear}&speciality=${selectedSpeciality}`, {
      headers: {
        "Authorization": `Token ${token}`
      }
    })
    const data = await res.json()
    setPeople(data)
  }
  fetchPeople()
  }, [selectedRole, selectedYear, selectedSpeciality])

  const filtered = people  // backend already filtered, no need to filter again

  // ------------------------------------------------------------------
  // Step 1 — Upload file
  // ------------------------------------------------------------------
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

    const res = await fetch(`${BASE_URL}/api/users/spreadsheet-upload/`, { 
      method: "POST", 
      headers: {
        'Authorization': `Token ${token}`
      },
      body: formData 
    })
    const data: UploadData = await res.json()

    if (!res.ok) {
      alert(data.error || "Upload failed")
      return
    }

    setUploadData(data)
    setMapping(data.detected_columns)
    setImportStep("preview")
  }

  // ------------------------------------------------------------------
  // Step 2 — Confirm and import
  // ------------------------------------------------------------------
  const handleConfirmImport = async () => {
    setImporting(true)

    const res = await fetch(`${BASE_URL}/api/users/bulk-import/`, {
      method: "POST",
      headers: { 
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({
        mapping,
        rows:         uploadData.rows,
        role:         selectedRole,
        speciality:   selectedSpeciality,
        academic_year: selectedYear,
        current_year:  new Date().getFullYear(), 
      }),
    })

    const result = await res.json()
    setImportResult(result)
    console.log("Import result:", result) 
    setImportStep("done")
    setImporting(false)
  }


  // 3- handle export 
  const handleExport = () => {
  const headers = [selectedRole === 'student' ? "Matricule" : "Course", "Nom", "Prenom", "Email"]
  const rows = filtered.map(person => [
    person.matricule ?? person.course,
    person.nom,
    person.prenom,
    person.email
  ])

  const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n")

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `people_${selectedRole}_${selectedYear}_${selectedSpeciality}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

  const handleRowClick = (person) => {
    setSelectedPerson(person)
    console.log(person.role)
    setshowEditForm(true)
  }

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  return (
    <div className='mt-4'>
      <h2 className='mb-4'>Here is a list of Students/Teachers</h2>

      <div className="hidden md:flex gap-4 mb-4">
        <Input type="file" accept=".csv,.xlsx,.xls" onChange={handleImport} />
        <Button onClick={handleExport}>Export CSV</Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <Select value={selectedRole} onValueChange={setSelectedRole}>
          <SelectTrigger className="w-full max-w-48">
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Role</SelectLabel>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="teacher">Teacher</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-full max-w-48">
            <SelectValue placeholder="Select a Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Year</SelectLabel>
              <SelectItem value="1">1 Year</SelectItem>
              <SelectItem value="2">2 Year</SelectItem>
              <SelectItem value="3">3 Year</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select value={selectedSpeciality} onValueChange={setSelectedSpeciality}>
          <SelectTrigger className="w-full max-w-48">
            <SelectValue placeholder="Select a Speciality" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Speciality</SelectLabel>
              <SelectItem value="DSIA">DSIA</SelectItem>
              <SelectItem value="MI">MI</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Button className='hidden md:block ml-auto' onClick={() => setshowCreateForm(true)}>Create a new User</Button>
      </div>

      <Button className='mx-auto md:hidden'>Create a new User</Button>

      {/* Main table */}
      <Table className='mb-4'>
        <TableCaption>The list of {selectedYear} {selectedSpeciality} {selectedRole}s</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">{selectedRole === 'student' ? 'Matricule' : 'Course'}</TableHead>
            <TableHead>Nom</TableHead>
            <TableHead>Prenom</TableHead>
            <TableHead className="text-right">Email</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((person) => (
            <TableRow key={person.matricule ?? person.course} onClick={() => handleRowClick(person)}>
              <TableCell className="font-medium">{person.matricule ?? person.course}</TableCell>
              <TableCell>{person.nom}</TableCell>
              <TableCell>{person.prenom}</TableCell>
              <TableCell className="text-right">{person.email}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Total</TableCell>
            <TableCell className="text-right">{filtered.length}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      {/* ---------- STEP 1 — Preview & mapping modal ---------- */}
      {importStep === "preview" && uploadData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setImportStep(null)} />
          <div className="relative z-10 w-full max-w-2xl mx-4 bg-white text-black rounded-lg shadow-lg p-6 max-h-[90vh] overflow-y-auto">

            <h3 className="text-lg font-semibold mb-4">
              Confirm Column Mapping ({uploadData.total_rows} rows)
            </h3>

            {/* Mapping selects */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {requiredFields.map(field => (
                <div key={field}>
                  <label className="text-sm font-medium capitalize">{field}</label>
                  <Select
                    value={mapping[field] || ""}
                    onValueChange={(val) => setMapping(prev => ({ ...prev, [field]: val }))}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Headers</SelectLabel>
                        {uploadData.headers.map(h => (
                          <SelectItem key={h} value={h}>{h}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            {/* Preview table  */}
            <p className="text-sm text-gray-500 mb-2">First 5 rows preview:</p>
            <Table className="mb-6">
              <TableHeader>
                <TableRow >
                  {uploadData.headers.map(h => (
                    <TableHead key={h} className='text-black'>{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {uploadData.preview.map((row, i) => (
                  <TableRow key={i}>
                    {uploadData.headers.map(h => (
                      <TableCell key={h}>{row[h] ?? "—"}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setImportStep(null)}>Cancel</Button>
              <Button onClick={handleConfirmImport} disabled={importing}>
                {importing ? "Importing..." : `Import ${uploadData.total_rows} rows`}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- STEP 2 — Results modal ---------- */}
      {importStep === "done" && importResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setImportStep(null)} />
          <div className="relative z-10 w-full max-w-md mx-4 bg-white text-black rounded-lg shadow-lg p-6">

            <h3 className="text-lg font-semibold mb-4">Import Results</h3>

            <Table className="mb-4">
              <TableBody>
                <TableRow>
                  <TableCell className="text-green-600 font-medium">Created</TableCell>
                  <TableCell className="text-right">{importResult.created}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-yellow-600 font-medium">Skipped</TableCell>
                  <TableCell className="text-right">{importResult.skipped}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-red-600 font-medium">Errors</TableCell>
                  <TableCell className="text-right">{importResult.errors}</TableCell>
                </TableRow>
              </TableBody>
            </Table>

            {/* Skipped details */}
            {importResult.details.skipped.length > 0 && (
              <>
                <p className="text-sm font-medium mb-2">Skipped details:</p>
                <Table className="mb-4">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importResult.details.skipped.map((s, i) => (
                      <TableRow key={i}>
                        <TableCell>{s.email}</TableCell>
                        <TableCell>{s.reason}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}

            <Button onClick={() => setImportStep(null)}>Close</Button>
          </div>
        </div>
      )}

      {/* Create form modal  */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setshowCreateForm(false)} />
          <div className="relative z-10 w-full max-w-lg mx-4 rounded-lg shadow-lg p-6  max-h-[90vh] overflow-y-auto">
            <Button className="mb-4" variant="outline" onClick={() => setshowCreateForm(false)}>
              Close
            </Button>
            <CreatePersonForm
              onClose={() => setshowCreateForm(false)}
              role={selectedRole as "student" | "teacher"}
              year={selectedYear}
              speciality={selectedSpeciality}
            />
          </div>
        </div>
      )}

      {/* Edit form modal  */}
      {showEditForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed  h-full inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setshowEditForm(false)} />
          <div className="relative h-fit z-10 w-full max-w-lg mx-4 rounded-lg shadow-lg p-6 max-h-[90vh] overflow-y-auto">
            <Button className="mb-4" variant="outline" onClick={() => setshowEditForm(false)}>
              Close
            </Button>
            {selectedPerson && (
                selectedPerson.role === "STUDENT"
                    ? <EditStudentForm person={selectedPerson as Student} onClose={() => setshowEditForm(false)} />
                    : <EditTeacherForm person={selectedPerson as Teacher} onClose={() => setshowEditForm(false)} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default HeadProfile