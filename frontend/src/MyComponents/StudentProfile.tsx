import React, { useState, useEffect } from 'react'
import {
  Table, TableBody, TableCell,
  TableFooter, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Loader2, BarChart2, TableIcon, TrendingUp, TrendingDown, Minus
} from 'lucide-react'
import { useAuth } from './AuthContext'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, Cell,
} from 'recharts'

const BASE_URL = import.meta.env.VITE_API_URL

// ─── Types ────────────────────────────────────────────────────────────────────

interface Evaluation {
  id: number
  name: string
  weight: number
  grade: number | null
}

interface CourseGrade {
  id: number
  name: string
  coefficient: number
  semester: number
  evaluations: Evaluation[]
  final_grade: number | null
}

type Semester = 1 | 2

// ─── Helpers ──────────────────────────────────────────────────────────────────

function gradeColor(grade: number | null): string {
  if (grade === null) return 'text-zinc-400'
  if (grade >= 16) return 'text-emerald-600'
  if (grade >= 12) return 'text-blue-600'
  if (grade >= 10) return 'text-amber-500'
  return 'text-red-500'
}

function barFill(grade: number): string {
  if (grade >= 16) return '#10b981'
  if (grade >= 12) return '#3b82f6'
  if (grade >= 10) return '#f59e0b'
  return '#ef4444'
}

function GradeBadge({ grade }: { grade: number | null }) {
  if (grade === null) return <span className="text-zinc-400 font-mono">—</span>
  return (
    <span className={`font-mono font-medium ${gradeColor(grade)}`}>
      {grade.toFixed(2)}
    </span>
  )
}

function TrendIcon({ values }: { values: (number | null)[] }) {
  const valid = values.filter((v): v is number => v !== null)
  if (valid.length < 2) return <Minus className="w-3.5 h-3.5 text-zinc-400" />
  const diff = valid[valid.length - 1] - valid[valid.length - 2]
  if (diff > 0.5) return <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
  if (diff < -0.5) return <TrendingDown className="w-3.5 h-3.5 text-red-400" />
  return <Minus className="w-3.5 h-3.5 text-zinc-400" />
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white border border-zinc-200 rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="font-semibold text-zinc-800">{d.course}</p>
      <p className="text-zinc-500">
        Grade:{' '}
        <span className={`font-mono font-medium ${gradeColor(d.grade)}`}>
          {d.grade !== null ? d.grade.toFixed(2) : '—'}
        </span>
      </p>
      {d.coeff > 1 && <p className="text-zinc-400 text-xs">Coeff: {d.coeff}</p>}
    </div>
  )
}

// ─── Chart ────────────────────────────────────────────────────────────────────

function StudentGradeChart({ courses, semester }: { courses: CourseGrade[]; semester: Semester }) {
  const chartData = courses
    .filter(c => c.final_grade !== null)
    .map(c => ({ course: c.name, grade: c.final_grade!, coeff: c.coefficient }))

  const avg =
    chartData.length > 0
      ? chartData.reduce((s, d) => s + d.grade * d.coeff, 0) /
        chartData.reduce((s, d) => s + d.coeff, 0)
      : null

  const passing = chartData.filter(d => d.grade >= 10).length
  const failing = chartData.length - passing

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-zinc-50 border border-dashed border-zinc-300 rounded-xl text-sm text-zinc-400">
        No final grades recorded for Semester {semester} yet.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Courses', value: chartData.length, cls: '' },
          { label: 'Weighted avg', value: avg !== null ? avg.toFixed(2) : '—', cls: avg !== null ? gradeColor(avg) : '' },
          { label: 'Passing', value: passing, cls: 'text-emerald-600' },
          { label: 'Below 10', value: failing, cls: failing > 0 ? 'text-red-500' : 'text-zinc-700' },
        ].map(stat => (
          <div key={stat.label} className="bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2.5 text-center">
            <p className="text-xs text-zinc-400 mb-0.5">{stat.label}</p>
            <p className={`text-lg font-semibold font-mono ${stat.cls || 'text-zinc-800'}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4">
        <p className="text-xs font-medium text-zinc-500 mb-3">Final grade per course — Semester {semester}</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ top: 12, right: 20, bottom: 28, left: 0 }} barCategoryGap="28%">
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
            <XAxis
              dataKey="course"
              tick={{ fontSize: 11, fill: '#71717a' }}
              angle={-25}
              textAnchor="end"
              interval={0}
              height={44}
            />
            <YAxis domain={[0, 20]} ticks={[0, 5, 10, 15, 20]} tick={{ fontSize: 11, fill: '#a1a1aa' }} width={26} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
            <ReferenceLine
              y={10}
              stroke="#18181b"
              strokeDasharray="4 4"
              strokeWidth={1}
              label={{ value: 'pass', position: 'insideTopRight', fontSize: 10, fill: '#52525b' }}
            />
            {avg !== null && (
              <ReferenceLine
                y={avg}
                stroke="#6366f1"
                strokeDasharray="6 3"
                strokeWidth={1.5}
                label={{ value: `avg ${avg.toFixed(2)}`, position: 'insideTopRight', fontSize: 11, fill: '#6366f1', fontWeight: 600 }}
              />
            )}
            <Bar dataKey="grade" radius={[4, 4, 0, 0]} isAnimationActive>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={barFill(entry.grade)} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <div className="flex items-center gap-4 justify-center mt-1 text-xs text-zinc-500 flex-wrap">
          {[
            { color: 'bg-emerald-500', label: '≥ 16' },
            { color: 'bg-blue-500', label: '12 – 15' },
            { color: 'bg-amber-400', label: '10 – 11' },
            { color: 'bg-red-500', label: '< 10' },
          ].map(({ color, label }) => (
            <span key={label} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-sm ${color} inline-block`} />
              {label}
            </span>
          ))}
          <span className="flex items-center gap-1.5">
            <svg width="20" height="8">
              <line x1="0" y1="4" x2="20" y2="4" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="6 3" />
            </svg>
            Weighted avg
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Course table ─────────────────────────────────────────────────────────────

function CourseGradeTable({ course }: { course: CourseGrade }) {
  return (
    <div className="rounded-xl border border-zinc-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-50 border-b border-zinc-200">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-zinc-800">{course.name}</span>
          <span className="text-xs text-zinc-400 bg-zinc-200 rounded-full px-2 py-0.5">
            Coeff {course.coefficient}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <TrendIcon values={course.evaluations.map(ev => ev.grade)} />
          <span className="text-xs text-zinc-500 mr-1">Final:</span>
          <GradeBadge grade={course.final_grade} />
        </div>
      </div>

      {course.evaluations.length === 0 ? (
        <p className="text-sm text-zinc-400 px-4 py-3">No evaluations yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Evaluation</TableHead>
              <TableHead className="text-xs">Weight</TableHead>
              <TableHead className="text-right text-xs">Grade /20</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {course.evaluations.map(ev => (
              <TableRow key={ev.id}>
                <TableCell className="text-sm font-medium">{ev.name}</TableCell>
                <TableCell>
                  <span className="text-xs bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 rounded-full">
                    {(ev.weight * 100).toFixed(0)}%
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <GradeBadge grade={ev.grade} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2} className="text-xs text-zinc-500">Weighted final</TableCell>
              <TableCell className="text-right"><GradeBadge grade={course.final_grade} /></TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      )}
    </div>
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function SimplePagination({ current, total, onChange }: {
  current: number; total: number; onChange: (p: number) => void
}) {
  if (total <= 1) return null
  return (
    <div className="flex items-center justify-center gap-1 mt-4">
      <button
        onClick={() => onChange(Math.max(current - 1, 1))}
        disabled={current === 1}
        className="px-3 py-1.5 text-xs rounded-lg border border-zinc-300 text-zinc-600 disabled:opacity-40 hover:bg-zinc-50 transition-colors"
      >
        ← Prev
      </button>
      {Array.from({ length: total }, (_, i) => i + 1).map(p => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`w-8 h-8 text-xs rounded-lg border transition-colors ${
            p === current
              ? 'bg-blue-600 text-white border-blue-600'
              : 'border-zinc-300 text-zinc-600 hover:bg-zinc-50'
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onChange(Math.min(current + 1, total))}
        disabled={current === total}
        className="px-3 py-1.5 text-xs rounded-lg border border-zinc-300 text-zinc-600 disabled:opacity-40 hover:bg-zinc-50 transition-colors"
      >
        Next →
      </button>
    </div>
  )
}

// ─── StudentProfile ───────────────────────────────────────────────────────────

const COURSES_PER_PAGE = 3

const StudentProfile = () => {
  const [courses, setCourses] = useState<CourseGrade[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'table' | 'graph'>('table')
  const [semester, setSemester] = useState<Semester>(1)
  const [yearAvg, setYearAvg] = useState<number|null>(null)
  const [page, setPage] = useState(1)
  const { token } = useAuth()

  useEffect(() => {
  const fetchCourses = async () => {
    setLoading(true)
    setCourses([])

    try {
      // current semester
      const res = await fetch(
        `${BASE_URL}/api/courses/student/?semester=${semester}`,
        { headers: { Authorization: `Token ${token}` } }
      )
      const data: CourseGrade[] = await res.json()
      setCourses(data)

      // fetch both semesters for year avg
      const [res1, res2] = await Promise.all([
        fetch(`${BASE_URL}/api/courses/student/?semester=1`, {
          headers: { Authorization: `Token ${token}` },
        }),
        fetch(`${BASE_URL}/api/courses/student/?semester=2`, {
          headers: { Authorization: `Token ${token}` },
        }),
      ])

      const sem1: CourseGrade[] = await res1.json()
      const sem2: CourseGrade[] = await res2.json()

      const computeAvg = (courses: CourseGrade[]) => {
        const graded = courses.filter(c => c.final_grade !== null)
        if (graded.length === 0) return null
        return (
          graded.reduce((s, c) => s + c.final_grade! * c.coefficient, 0) /
          graded.reduce((s, c) => s + c.coefficient, 0)
        )
      }

      const avg1 = computeAvg(sem1)
      const avg2 = computeAvg(sem2)

      if (avg1 !== null && avg2 !== null) {
        setYearAvg((avg1 + avg2) / 2)
      } else {
        setYearAvg(null)
      }

      setPage(1)
    } catch (err) {
      console.error('Failed to fetch grades:', err)
    } finally {
      setLoading(false)
    }
  }

  fetchCourses()
}, [token, semester])

  const graded = courses.filter(c => c.final_grade !== null)
  const overallAvg =
    graded.length > 0
      ? graded.reduce((s, c) => s + c.final_grade! * c.coefficient, 0) /
        graded.reduce((s, c) => s + c.coefficient, 0)
      : null

  const totalPages = Math.ceil(courses.length / COURSES_PER_PAGE)
  const paginated = courses.slice((page - 1) * COURSES_PER_PAGE, page * COURSES_PER_PAGE)

  return (
    <div className="mt-4 space-y-4 w-[85%] mx-auto p-2">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-semibold text-lg">Your Grades</h2>
          {!loading && (
            <p className="text-sm text-zinc-500 mt-0.5">
              {yearAvg !== null && (
                <>
                  Year average:{' '}
                  <span className={`font-mono font-semibold ${gradeColor(yearAvg)}`}>
                    {yearAvg.toFixed(2)}
                  </span>
                  <span className="text-zinc-400 mx-2">|</span>
                </>
              )}

              Semester {semester} average:{' '}
              <span className={`font-mono font-semibold ${gradeColor(overallAvg)}`}>
                {overallAvg?.toFixed(2)}
              </span>
              <span className="text-zinc-400 ml-1">/ 20</span>
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Semester toggle */}
          <div className="flex items-center bg-zinc-100 rounded-lg p-0.5 border border-zinc-200">
            {([1, 2] as Semester[]).map(s => (
              <button
                key={s}
                onClick={() => setSemester(s)}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                  semester === s
                    ? 'bg-white text-zinc-800 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-700'
                }`}
              >
                Semester {s}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex items-center bg-zinc-100 rounded-lg p-0.5 border border-zinc-200">
            <button
              onClick={() => setView('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                view === 'table' ? 'bg-white text-zinc-800 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              Table
            </button>
            <button
              onClick={() => setView('graph')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                view === 'graph' ? 'bg-white text-zinc-800 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              Graph
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
        </div>
      ) : courses.length === 0 ? (
        <div className="flex items-center justify-center py-16 bg-zinc-50 border border-dashed border-zinc-300 rounded-xl text-sm text-zinc-400">
          No courses found for Semester {semester}.
        </div>
      ) : view === 'table' ? (
        <>
          <div className="space-y-4">
            {paginated.map(course => (
              <CourseGradeTable key={course.id} course={course} />
            ))}
          </div>
          <SimplePagination current={page} total={totalPages} onChange={setPage} />
        </>
      ) : (
        <StudentGradeChart courses={courses} semester={semester} />
      )}
    </div>
  )
}

export default StudentProfile