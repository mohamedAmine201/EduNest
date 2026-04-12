import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, User, CheckCircle2, AlertTriangle, Loader2, Save } from 'lucide-react'

const BASE_URL = import.meta.env.VITE_API_URL

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface EditGradeFormProps {
  student: Student
  evaluations: Evaluation[]
  courseId: number
  token: string
  /** Current grades map: eval_name → grade */
  initialGrades: Record<string, number | null>
  onClose: () => void
  /** Called after a successful save so the parent can refresh grades */
  onSaved: () => void
}

// ─── EditGradeForm ────────────────────────────────────────────────────────────

const EditGradeForm: React.FC<EditGradeFormProps> = ({
  student,
  evaluations,
  courseId,
  token,
  initialGrades,
  onClose,
  onSaved,
}) => {
  // Local draft state: eval name → string (to keep empty string while typing)
  const [draft, setDraft] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    for (const ev of evaluations) {
      const g = initialGrades[ev.name]
      init[ev.name] = g !== null && g !== undefined ? String(g) : ''
    }
    return init
  })

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Sync draft when evaluations change (e.g. new eval added while panel open)
  useEffect(() => {
    setDraft(prev => {
      const next = { ...prev }
      for (const ev of evaluations) {
        if (!(ev.name in next)) {
          const g = initialGrades[ev.name]
          next[ev.name] = g !== null && g !== undefined ? String(g) : ''
        }
      }
      return next
    })
  }, [evaluations])

  const validate = (): string => {
    for (const ev of evaluations) {
      const val = draft[ev.name]
      if (val === '' || val === undefined) continue // null/blank is OK
      const num = parseFloat(val)
      if (isNaN(num)) return `"${ev.name}" must be a number.`
      if (num < 0 || num > 20) return `"${ev.name}" must be between 0 and 20.`
    }
    return ''
  }

  const handleSave = async () => {
    const validationError = validate()
    if (validationError) { setError(validationError); return }

    setError('')
    setSaving(true)

    // Build payload: only send grades that changed
    const grades: Record<string, number | null> = {}
    for (const ev of evaluations) {
      const val = draft[ev.name]
      grades[ev.name] = val === '' ? null : parseFloat(val)
    }

    try {
      const res = await fetch(
        `${BASE_URL}/api/courses/${courseId}/students/${student.id}/grades/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({ grades }),
        }
      )

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || data.detail || 'Failed to save grades.')
        setSaving(false)
        return
      }

      setSuccess(true)
      onSaved()
      setTimeout(() => setSuccess(false), 2000)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const totalWeightCovered = evaluations
    .filter(ev => draft[ev.name] !== '' && draft[ev.name] !== undefined)
    .reduce((sum, ev) => sum + ev.weight, 0)

  // Computed preview average (only from filled evaluations)
  const filledEvals = evaluations.filter(ev => {
    const v = draft[ev.name]
    return v !== '' && v !== undefined && !isNaN(parseFloat(v))
  })
  const previewAvg =
    filledEvals.length > 0 && totalWeightCovered > 0
      ? filledEvals.reduce((sum, ev) => sum + parseFloat(draft[ev.name]) * ev.weight, 0) /
        totalWeightCovered
      : null

  return (
    // Overlay
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Dimmed backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Side panel */}
      <div className="relative z-10 h-full w-full max-w-sm bg-white dark:bg-zinc-900 shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="font-semibold text-sm leading-tight">
                {student.first_name} {student.last_name}
              </p>
              <p className="text-xs text-zinc-400 mt-0.5">Edit grades</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Read-only identity */}
        <div className="px-5 py-3 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider mb-1">Last name</p>
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md px-3 py-1.5 select-none">
                {student.last_name}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider mb-1">First name</p>
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md px-3 py-1.5 select-none">
                {student.first_name}
              </p>
            </div>
          </div>
        </div>

        {/* Grade inputs */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {evaluations.length === 0 && (
            <p className="text-sm text-zinc-400 text-center py-8">
              No evaluations created for this course yet.
            </p>
          )}

          {evaluations.map(ev => {
            const val = draft[ev.name] ?? ''
            const num = parseFloat(val)
            const hasValue = val !== '' && !isNaN(num)
            const isInvalid = hasValue && (num < 0 || num > 20)

            return (
              <div key={ev.id} className="group">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    {ev.name}
                  </label>
                  <span className="text-[10px] text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                    {(ev.weight * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={20}
                    step={0.25}
                    value={val}
                    onChange={e => {
                      setDraft(prev => ({ ...prev, [ev.name]: e.target.value }))
                      setError('')
                      setSuccess(false)
                    }}
                    placeholder="— not graded"
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors
                      ${isInvalid
                        ? 'border-red-300 focus:ring-red-400 bg-red-50'
                        : hasValue
                          ? 'border-blue-300 focus:ring-blue-400 bg-white dark:bg-zinc-900'
                          : 'border-zinc-200 dark:border-zinc-700 focus:ring-blue-400 bg-white dark:bg-zinc-900'
                      }`}
                  />
                  {hasValue && !isInvalid && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <span className={`text-xs font-semibold ${
                        num >= 16 ? 'text-emerald-500'
                        : num >= 12 ? 'text-blue-500'
                        : num >= 10 ? 'text-amber-500'
                        : 'text-red-500'
                      }`}>
                        /20
                      </span>
                    </div>
                  )}
                </div>
                {isInvalid && (
                  <p className="text-[11px] text-red-500 mt-0.5">Must be between 0 and 20.</p>
                )}
              </div>
            )
          })}
        </div>

        {/* Preview average */}
        {previewAvg !== null && (
          <div className="px-5 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500">
                Preview average
                {totalWeightCovered < 1 && (
                  <span className="text-zinc-400 ml-1">
                    ({(totalWeightCovered * 100).toFixed(0)}% of weight filled)
                  </span>
                )}
              </span>
              <span className={`font-mono font-semibold text-sm ${
                previewAvg >= 16 ? 'text-emerald-600'
                : previewAvg >= 12 ? 'text-blue-600'
                : previewAvg >= 10 ? 'text-amber-500'
                : 'text-red-500'
              }`}>
                {previewAvg.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Error / success banner */}
        {error && (
          <div className="mx-5 mb-2 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            {error}
          </div>
        )}
        {success && (
          <div className="mx-5 mb-2 flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-sm text-emerald-700">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Grades saved successfully.
          </div>
        )}

        {/* Footer actions */}
        <div className="px-5 py-4 border-t border-zinc-100 dark:border-zinc-800 flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1" disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || evaluations.length === 0}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
          >
            {saving
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
              : <><Save className="w-4 h-4" /> Save grades</>
            }
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.22s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      `}</style>
    </div>
  )
}

export default EditGradeForm