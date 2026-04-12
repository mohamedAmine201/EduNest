import React, { useState, useRef, useEffect } from 'react'
import {
  Table, TableBody, TableCaption, TableCell,
  TableFooter, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Upload, CheckCircle2, AlertTriangle,
  X, FileSpreadsheet, Loader2, Plus, Scale, Download,
  BarChart2, TableIcon
} from 'lucide-react'
import { useAuth } from './AuthContext'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, Cell
} from 'recharts'
import EditGradeForm from './EditGradeForm'

const BASE_URL = import.meta.env.VITE_API_URL

// ─── Types ───────────────────────────────────────────────────────────────────

interface Student {
  id: number
  first_name: string
  last_name: string
}

interface Evaluation {
  id: number
  name: string
  weight: number
}

interface Course {
  id: number
  name: string
  coefficient: number
  evaluations: Evaluation[]
  students: Student[]
}

interface MatchedRow {
  student_id: number
  display_name: string
  match_score: number
  grades: Record<string, number | null>
}

interface UnmatchedRow {
  raw_name: string
  grades: Record<string, number | null>
}

interface PreviewData {
  eval_columns: string[]
  matched: MatchedRow[]
  unmatched: UnmatchedRow[]
}

type GradeMap = Record<number, Record<string, number | null>>
type FinalsMap = Record<number, number | null>

// ─── CreateEvaluationModal ────────────────────────────────────────────────────

interface CreateEvaluationModalProps {
  course: Course
  token: string
  usedWeight: number
  onClose: () => void
  onCreated: (ev: Evaluation) => void
}

function CreateEvaluationModal({ course, token, usedWeight, onClose, onCreated }: CreateEvaluationModalProps) {
  const [name, setName] = useState('')
  const [weight, setWeight] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const remaining = parseFloat((1 - usedWeight).toFixed(3))
  const weightNum = parseFloat(weight)
  const weightValid = !isNaN(weightNum) && weightNum > 0 && weightNum <= remaining

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Evaluation name is required.'); return }
    if (!weightValid) { setError(`Weight must be between 0 and ${remaining}.`); return }
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${BASE_URL}/api/courses/${course.id}/evaluations/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({ name: name.trim(), weight: weightNum }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(Array.isArray(data) ? data.join(' ') : data.detail || data.non_field_errors?.[0] || 'Failed to create evaluation.')
        return
      }
      onCreated(data)
      onClose()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-blue-600" />
            <p className="font-semibold text-sm">New Evaluation — {course.name}</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <div className="flex justify-between text-xs text-zinc-500 mb-1">
              <span>Weight budget</span>
              <span>{(usedWeight * 100).toFixed(0)}% used · {(remaining * 100).toFixed(0)}% remaining</span>
            </div>
            <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${usedWeight * 100}%` }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">Evaluation name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Examen, Interro, TP1…"
              className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">
              Weight <span className="text-zinc-400">(0 – {remaining})</span>
            </label>
            <input
              type="number"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              placeholder={`max ${remaining}`}
              min={0}
              max={remaining}
              step={0.05}
              className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {weight && !isNaN(weightNum) && (
              <p className="text-xs text-zinc-400 mt-1">= {(weightNum * 100).toFixed(0)}% of final grade</p>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-zinc-200 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !name.trim() || !weightValid}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── GradeImportModal ─────────────────────────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 15) return 'text-emerald-600'
  if (score >= 10) return 'text-amber-500'
  return 'text-orange-500'
}

interface GradeImportModalProps {
  course: Course
  token: string
  onClose: () => void
  onSuccess: (result: { created: number; updated: number }) => void
}

function GradeImportModal({ course, token, onClose, onSuccess }: GradeImportModalProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<'idle' | 'loading' | 'preview' | 'confirming' | 'done'>('idle')
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [fileName, setFileName] = useState('')
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ created: number; updated: number } | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setError('')
    setStep('loading')
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch(`${BASE_URL}/api/courses/${course.id}/grades/upload/`, {
        method: 'POST',
        headers: { 'Authorization': `Token ${token}` },
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Upload failed.'); setStep('idle'); return }
      setPreview(data)
      setStep('preview')
    } catch {
      setError('Network error. Please try again.')
      setStep('idle')
    }
  }

  const handleConfirm = async () => {
    if (!preview) return
    setStep('confirming')
    try {
      const res = await fetch(`${BASE_URL}/api/courses/${course.id}/grades/confirm/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
        body: JSON.stringify({
          eval_columns: preview.eval_columns,
          rows: preview.matched.map(r => ({ student_id: r.student_id, grades: r.grades })),
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Confirmation failed.'); setStep('preview'); return }
      setResult({ created: data.created, updated: data.updated })
      setStep('done')
      onSuccess({ created: data.created, updated: data.updated })
    } catch {
      setError('Network error during confirmation.')
      setStep('preview')
    }
  }

  const reset = () => {
    setStep('idle'); setPreview(null); setFileName(''); setError(''); setResult(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-semibold text-sm">Import Grades</p>
              <p className="text-xs text-zinc-500">{course.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
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
                  {step === 'loading' ? 'Analysing your file…' : 'Click to upload a spreadsheet'}
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  CSV or Excel — must include <code>nom</code> and <code>prenom</code> columns
                </p>
                {course.evaluations.length > 0 && (
                  <p className="text-xs text-blue-500 mt-1">
                    Column headers will be matched to: {course.evaluations.map(e => e.name).join(', ')}
                  </p>
                )}
              </div>
              <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFileChange} />
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          {(step === 'preview' || step === 'confirming') && preview && (
            <>
              <div className="flex flex-wrap gap-2 items-center text-sm">
                <span className="text-zinc-500">File:</span>
                <Badge variant="secondary">{fileName}</Badge>
                <span className="text-zinc-500 ml-2">Matched evaluations:</span>
                {preview.eval_columns.map(col => (
                  <Badge key={col} className="bg-blue-100 text-blue-700">{col}</Badge>
                ))}
              </div>

              {preview.matched.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-zinc-700 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Matched students ({preview.matched.length})
                  </p>
                  <div className="rounded-lg border border-zinc-200 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-zinc-800">
                          <TableHead className="text-xs">Name</TableHead>
                          <TableHead className="text-xs">Match %</TableHead>
                          {preview.eval_columns.map(col => (
                            <TableHead key={col} className="text-xs">{col}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {preview.matched.map(row => (
                          <TableRow key={row.student_id}>
                            <TableCell className="font-medium text-sm">{row.display_name}</TableCell>
                            <TableCell className={`text-sm font-mono ${scoreColor(row.match_score)}`}>
                              {row.match_score}%
                            </TableCell>
                            {preview.eval_columns.map(col => (
                              <TableCell key={col} className="text-sm">
                                {row.grades[col] ?? <span className="text-zinc-400">—</span>}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {preview.unmatched.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-amber-600 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Unmatched — will be skipped ({preview.unmatched.length})
                  </p>
                  <div className="rounded-lg border border-amber-200 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-amber-800">
                          <TableHead className="text-xs">Raw Name</TableHead>
                          {preview.eval_columns.map(col => (
                            <TableHead key={col} className="text-xs">{col}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {preview.unmatched.map((row, i) => (
                          <TableRow key={i} className="bg-amber-500/50">
                            <TableCell className="text-sm text-white">{row.raw_name}</TableCell>
                            {preview.eval_columns.map(col => (
                              <TableCell key={col} className="text-sm text-zinc-400">
                                {row.grades[col] ?? '—'}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </>
          )}

          {step === 'done' && result && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <CheckCircle2 className="w-14 h-14 text-emerald-500" />
              <div>
                <p className="text-lg font-semibold">Grades saved successfully</p>
                <p className="text-sm text-zinc-500 mt-1">
                  {result.created} created · {result.updated} updated
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-zinc-200 flex justify-between items-center">
          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={reset}>← Different file</Button>
              <Button
                onClick={handleConfirm}
                disabled={preview?.matched.length === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Save grades for {preview?.matched.length} student{preview?.matched.length !== 1 ? 's' : ''}
              </Button>
            </>
          )}
          {step === 'confirming' && (
            <Button disabled className="ml-auto bg-blue-600 text-white">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…
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

// ─── GradeBarChart ────────────────────────────────────────────────────────────

interface GradeBarChartProps {
  students: Student[]
  evaluations: Evaluation[]
  grades: GradeMap
  finals: FinalsMap
}

function barColor(grade: number): string {
  if (grade >= 16) return '#10b981'
  if (grade >= 12) return '#3b82f6'
  if (grade >= 10) return '#f59e0b'
  return '#ef4444'
}

interface CustomBarTooltipProps {
  active?: boolean
  payload?: Array<{ payload: { name: string; grade: number } }>
}

function CustomBarTooltip({ active, payload }: CustomBarTooltipProps) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white border border-zinc-200 rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="font-semibold text-zinc-800">{d.name}</p>
      <p className="text-zinc-500">
        Grade: <span className="font-mono font-medium text-zinc-800">{d.grade.toFixed(2)}</span>
      </p>
    </div>
  )
}

function GradeBarChart({ students, evaluations, grades, finals }: GradeBarChartProps) {
  const [graphTarget, setGraphTarget] = useState<string>('average')

  useEffect(() => {
    if (graphTarget !== 'average' && !evaluations.find(ev => ev.name === graphTarget)) {
      setGraphTarget('average')
    }
  }, [evaluations])

  const chartData = students
    .map(s => {
      const grade = graphTarget === 'average'
        ? finals[s.id]
        : grades[s.id]?.[graphTarget]
      if (grade === null || grade === undefined) return null
      return {
        name: `${s.first_name} ${s.last_name}`,
        shortName: s.last_name,
        grade,
      }
    })
    .filter(Boolean) as { name: string; shortName: string; grade: number }[]

  const avg = chartData.length > 0
    ? chartData.reduce((sum, d) => sum + d.grade, 0) / chartData.length
    : null

  const targetLabel = graphTarget === 'average'
    ? 'Average'
    : evaluations.find(ev => ev.name === graphTarget)?.name ?? graphTarget

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium text-zinc-500 mr-1">Show:</span>
        {evaluations.map(ev => (
          <button
            key={ev.name}
            onClick={() => setGraphTarget(ev.name)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              graphTarget === ev.name
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-zinc-600 border-zinc-300 hover:border-blue-400'
            }`}
          >
            {ev.name}
            <span className="ml-1 opacity-60">· {(ev.weight * 100).toFixed(0)}%</span>
          </button>
        ))}
        <button
          onClick={() => setGraphTarget('average')}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
            graphTarget === 'average'
              ? 'bg-zinc-800 text-white border-zinc-800'
              : 'bg-white text-zinc-600 border-zinc-300 hover:border-zinc-500'
          }`}
        >
          Average
        </button>
      </div>

      {chartData.length > 0 && avg !== null && (
        <div className="flex gap-4 flex-wrap text-xs text-zinc-500 bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2.5">
          <span><span className="font-medium text-zinc-700">Showing:</span> {targetLabel}</span>
          <span><span className="font-medium text-zinc-700">Graded:</span> {chartData.length} / {students.length}</span>
          <span>
            <span className="font-medium text-zinc-700">Class avg:</span>{' '}
            <span className="font-mono">{avg.toFixed(2)}</span>
          </span>
          <span>
            <span className="font-medium text-zinc-700">Min:</span>{' '}
            <span className="font-mono">{Math.min(...chartData.map(d => d.grade)).toFixed(2)}</span>
          </span>
          <span>
            <span className="font-medium text-zinc-700">Max:</span>{' '}
            <span className="font-mono">{Math.max(...chartData.map(d => d.grade)).toFixed(2)}</span>
          </span>
        </div>
      )}

      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-64 bg-zinc-50 border border-dashed border-zinc-300 rounded-xl text-sm text-zinc-400">
          No grades recorded for {targetLabel} yet.
        </div>
      ) : (
        <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData} margin={{ top: 16, right: 24, bottom: 32, left: 0 }} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
              <XAxis
                dataKey="shortName"
                tick={{ fontSize: 11, fill: 'black' }}
                angle={-35}
                textAnchor="end"
                interval={0}
                height={48}
              />
              <YAxis
                domain={[0, 20]}
                ticks={[0, 5, 10, 15, 20]}
                tick={{ fontSize: 11, fill: '#a1a1aa' }}
                width={28}
              />
              <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
              <ReferenceLine
                y={10}
                stroke="black"
                strokeDasharray="4 4"
                strokeWidth={1}
                label={{ value: 'pass', position: 'insideTopRight', fontSize: 10, fill: 'black' }}
              />
              {avg !== null && (
                <ReferenceLine
                  y={avg}
                  stroke="#6366f1"
                  strokeDasharray="6 3"
                  strokeWidth={1.5}
                  label={{
                    value: `avg ${avg.toFixed(2)}`,
                    position: 'insideTopRight',
                    fontSize: 11,
                    fill: '#6366f1',
                    fontWeight: 600,
                  }}
                />
              )}
              <Bar dataKey="grade" radius={[4, 4, 0, 0]} isAnimationActive={true}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={barColor(entry.grade)} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="flex items-center gap-4 justify-center mt-2 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /> ≥ 16</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" /> 12 – 15</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" /> 10 – 11</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block" /> &lt; 10</span>
            <span className="flex items-center gap-1.5">
              <svg width="20" height="8"><line x1="0" y1="4" x2="20" y2="4" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="6 3" /></svg>
              Class avg
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── TeacherProfile ───────────────────────────────────────────────────────────

const TeacherProfile = () => {
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [grades, setGrades] = useState<GradeMap>({})
  const [loading, setLoading] = useState(true)
  const [showImport, setShowImport] = useState(false)
  const [showCreateEval, setShowCreateEval] = useState(false)
  const [finals, setFinals] = useState<FinalsMap>({})
  const [view, setView] = useState<'table' | 'graph'>('table')

  // ── NEW: selected student for grade editing ──
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)

  const { token } = useAuth()

  const fetchGrades = async (course: Course) => {
    const res = await fetch(`${BASE_URL}/api/courses/${course.id}/grades/`, {
      headers: { 'Authorization': `Token ${token}` },
    })
    const data = await res.json()
    const map: GradeMap = {}
    for (const entry of data.grades) {
      if (!map[entry.student_id]) map[entry.student_id] = {}
      map[entry.student_id][entry.eval_name] = entry.grade
    }
    setGrades(map)
    setFinals(data.finals)
  }

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/courses/`, {
          headers: { 'Authorization': `Token ${token}` },
        })
        const data: Course[] = await res.json()
        setCourses(data)
        if (data.length > 0) {
          setSelectedCourse(data[0])
          await fetchGrades(data[0])
        }
      } catch (err) {
        console.error('Failed to fetch courses:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [token])

  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course)
    setGrades({})
    setEditingStudent(null)
    fetchGrades(course)
  }

  const handleEvalCreated = (newEval: Evaluation) => {
    if (!selectedCourse) return
    const updated = {
      ...selectedCourse,
      evaluations: [...(selectedCourse.evaluations ?? []), newEval],
    }
    setSelectedCourse(updated)
    setCourses(prev => prev.map(c => c.id === updated.id ? updated : c))
  }

  const handleImportSuccess = () => {
    setShowImport(false)
    if (selectedCourse) fetchGrades(selectedCourse)
  }

  // ── NEW: called by EditGradeForm after a successful save ──
  const handleGradeSaved = () => {
    if (selectedCourse) fetchGrades(selectedCourse)
  }

  const exportGradesToCSV = (
    course: Course,
    students: Student[],
    evaluations: Evaluation[],
    grades: GradeMap,
    finals: FinalsMap,
  ) => {
    const headers = ['Nom', 'Prénom', ...evaluations.map(ev => `${ev.name} (${(ev.weight * 100).toFixed(0)}%)`), 'Average']
    const rows = students.map(student => [
      student.last_name,
      student.first_name,
      ...evaluations.map(ev => {
        const grade = grades[student.id]?.[ev.name]
        return grade !== null && grade !== undefined ? grade : ''
      }),
      finals[student.id] !== undefined && finals[student.id] !== null
        ? finals[student.id]!.toFixed(2)
        : '',
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${course.name}_grades.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const usedWeight = (selectedCourse?.evaluations ?? []).reduce((sum, ev) => sum + ev.weight, 0)
  const remaining = parseFloat((1 - usedWeight).toFixed(3))
  const evaluations = selectedCourse?.evaluations ?? []
  const students = selectedCourse?.students ?? []

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
      </div>
    )
  }

  if (courses.length === 0) {
    return <div className="mt-4 text-sm text-zinc-500 w-[85%] mx-auto p-2">No courses assigned to you yet.</div>
  }

  return (
    <div className="mt-4 space-y-4 w-[85%] mx-auto p-2">
      <h2 className="font-semibold text-lg">Your Courses</h2>

      {/* Course tabs */}
      <div className="flex gap-2 flex-wrap">
        {courses.map(course => (
          <button
            key={course.id}
            onClick={() => handleSelectCourse(course)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              selectedCourse?.id === course.id
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-zinc-600 border-zinc-300 hover:border-blue-400'
            }`}
          >
            {course.name}
          </button>
        ))}
      </div>

      {selectedCourse && (
        <>
          {/* Actions bar */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-4">
              <p className="text-sm text-zinc-500">
                Coefficient: <span className="font-medium text-zinc-600">{selectedCourse.coefficient}</span>
              </p>
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-full">
                <Scale className="w-3 h-3" />
                <span>
                  {(usedWeight * 100).toFixed(0)}% assigned
                  {remaining > 0 && <span className="text-zinc-400"> · {(remaining * 100).toFixed(0)}% free</span>}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* View toggle */}
              <div className="flex items-center bg-zinc-100 rounded-lg p-0.5 border border-zinc-200">
                <button
                  onClick={() => setView('table')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    view === 'table'
                      ? 'bg-white text-zinc-800 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-700'
                  }`}
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  Table
                </button>
                <button
                  onClick={() => setView('graph')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    view === 'graph'
                      ? 'bg-white text-zinc-800 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-700'
                  }`}
                >
                  <BarChart2 className="w-3.5 h-3.5" />
                  Graph
                </button>
              </div>

              <Button
                variant="outline"
                onClick={() => setShowCreateEval(true)}
                disabled={remaining <= 0}
                className="flex items-center gap-2 text-sm"
                title={remaining <= 0 ? 'All weight assigned (total = 100%)' : ''}
              >
                <Plus className="w-4 h-4" />
                New Evaluation
              </Button>
              <Button
                variant="outline"
                onClick={() => exportGradesToCSV(selectedCourse, students, evaluations, grades, finals)}
                disabled={students.length === 0 || evaluations.length === 0}
                className="flex items-center gap-2 text-sm"
                title={students.length === 0 || evaluations.length === 0 ? 'No data to export' : ''}
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
              <Button
                onClick={() => setShowImport(true)}
                disabled={evaluations.length === 0}
                className="flex items-center gap-2"
                title={evaluations.length === 0 ? 'Create at least one evaluation first' : ''}
              >
                <Upload className="w-4 h-4" />
                Import Grades
              </Button>
            </div>
          </div>

          {/* Hint when no evaluations yet */}
          {evaluations.length === 0 && (
            <div className="flex items-center gap-2 text-sm text-zinc-400 bg-zinc-50 border border-dashed border-zinc-300 rounded-lg px-4 py-3">
              <Plus className="w-4 h-4" />
              Create your first evaluation to get started. Each evaluation gets a weight that contributes to the final grade.
            </div>
          )}

          {/* Evaluation pills */}
          {evaluations.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {evaluations.map(ev => (
                <span
                  key={ev.id}
                  className="inline-flex items-center gap-1.5 text-xs bg-blue-50 border border-blue-200 text-blue-700 px-2.5 py-1 rounded-full"
                >
                  {ev.name}
                  <span className="text-blue-400">·</span>
                  {(ev.weight * 100).toFixed(0)}%
                </span>
              ))}
            </div>
          )}

          {/* ── TABLE VIEW ── */}
          {view === 'table' && (
            <>
              {evaluations.length > 0 && students.length > 0 && (
                <p className="text-xs text-zinc-400 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400" />
                  Click a student row to edit their grades.
                </p>
              )}
              <Table>
                <TableCaption>{selectedCourse.name} — grade sheet</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Prénom</TableHead>
                    {evaluations.map(ev => (
                      <TableHead key={ev.id}>
                        <div className="flex flex-col gap-0.5">
                          <span>{ev.name}</span>
                          <span className="text-[10px] font-normal text-zinc-400">{(ev.weight * 100).toFixed(0)}%</span>
                        </div>
                      </TableHead>
                    ))}
                    <TableHead className="text-right">Average</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={evaluations.length + 3} className="text-center text-zinc-400 py-8">
                        No students enrolled yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    students.map(student => {
                      const isEditing = editingStudent?.id === student.id
                      return (
                        <TableRow
                          key={student.id}
                          // ── row click opens EditGradeForm ──
                          onClick={() => {
                            if (evaluations.length === 0) return
                            setEditingStudent(isEditing ? null : student)
                          }}
                          className={`transition-colors ${
                            evaluations.length > 0
                              ? 'cursor-pointer hover:bg-blue-50/60 dark:hover:bg-blue-900/20'
                              : 'cursor-default'
                          } ${isEditing ? 'bg-blue-50 dark:bg-blue-900/30 ring-1 ring-inset ring-blue-200' : ''}`}
                        >
                          <TableCell>{student.last_name}</TableCell>
                          <TableCell>{student.first_name}</TableCell>
                          {evaluations.map(ev => {
                            const grade = grades[student.id]?.[ev.name]
                            return (
                              <TableCell key={ev.id} className="text-sm">
                                {grade !== null && grade !== undefined
                                  ? <span className="font-medium">{grade}</span>
                                  : <span className="text-zinc-400">—</span>}
                              </TableCell>
                            )
                          })}
                          <TableCell className="text-right font-medium text-sm">
                            {finals[student.id] !== undefined && finals[student.id] !== null
                              ? finals[student.id]!.toFixed(2)
                              : '—'}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={evaluations.length + 2}>Course</TableCell>
                    <TableCell className="text-right">{selectedCourse.name}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </>
          )}

          {/* ── GRAPH VIEW ── */}
          {view === 'graph' && (
            evaluations.length === 0 ? (
              <div className="flex items-center justify-center h-64 bg-zinc-50 border border-dashed border-zinc-300 rounded-xl text-sm text-zinc-400">
                Create evaluations first to see the graph view.
              </div>
            ) : (
              <GradeBarChart
                students={students}
                evaluations={evaluations}
                grades={grades}
                finals={finals}
              />
            )
          )}
        </>
      )}

      {/* ── Modals ── */}
      {showCreateEval && selectedCourse && (
        <CreateEvaluationModal
          course={selectedCourse}
          token={token!}
          usedWeight={usedWeight}
          onClose={() => setShowCreateEval(false)}
          onCreated={handleEvalCreated}
        />
      )}

      {showImport && selectedCourse && (
        <GradeImportModal
          course={selectedCourse}
          token={token!}
          onClose={() => setShowImport(false)}
          onSuccess={handleImportSuccess}
        />
      )}

      {/* ── EditGradeForm side panel ── */}
      {editingStudent && selectedCourse && (
        <EditGradeForm
          student={editingStudent}
          evaluations={evaluations}
          courseId={selectedCourse.id}
          token={token!}
          initialGrades={grades[editingStudent.id] ?? {}}
          onClose={() => setEditingStudent(null)}
          onSaved={handleGradeSaved}
        />
      )}
    </div>
  )
}

export default TeacherProfile