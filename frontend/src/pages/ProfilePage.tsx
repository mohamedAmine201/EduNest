import * as React from 'react'
import { useAuth } from '@/MyComponents/AuthContext'
import { Pencil, Check, X, Camera, Phone, FileText } from 'lucide-react'
import { toast } from 'sonner'

const BASE_URL = import.meta.env.VITE_API_URL

// ─── Types ────────────────────────────────────────────────────────────────────

type EditFields = {
  bio:          string
  phone_number: string
  profile_pic:  File | null
}

// ─── Helper: field row ────────────────────────────────────────────────────────

function InfoRow({
  icon: Icon,
  label,
  value,
  editing,
  inputNode,
}: {
  icon:      React.ElementType
  label:     string
  value:     React.ReactNode
  editing:   boolean
  inputNode: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 text-zinc-400" />
        <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-400">{label}</span>
      </div>
      {editing ? inputNode : (
        <p className="text-sm text-zinc-700 dark:text-zinc-200 leading-relaxed pl-5">
          {value || <span className="text-zinc-400 italic">Not set</span>}
        </p>
      )}
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

const ProfilePage = () => {
  const { user, token, setUser } = useAuth()

  const [editing, setEditing]       = React.useState(false)
  const [saving, setSaving]         = React.useState(false)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const fileInputRef                = React.useRef<HTMLInputElement>(null)

  const [fields, setFields] = React.useState<EditFields>({
    bio:          user?.bio          ?? '',
    phone_number: user?.phone_number ?? '',
    profile_pic:  null,
  })

  // Reset draft to current user values when entering edit mode
  function startEditing() {
    setFields({
      bio:          user?.bio          ?? '',
      phone_number: user?.phone_number ?? '',
      profile_pic:  null,
    })
    setPreviewUrl(null)
    setEditing(true)
  }

  function cancelEditing() {
    setEditing(false)
    setPreviewUrl(null)
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFields(f => ({ ...f, profile_pic: file }))
    setPreviewUrl(URL.createObjectURL(file))
  }

  async function handleConfirm() {
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('bio',          fields.bio)
      formData.append('phone_number', fields.phone_number)
      if (fields.profile_pic) formData.append('profile_pic', fields.profile_pic)

      const res = await fetch(`${BASE_URL}/api/profiles/update/`, {
        method:  'PATCH',
        headers: { Authorization: `Token ${token}` },
        body:    formData,
      })

      if (!res.ok) {
        const err = await res.json()
        toast.error(err.detail || 'Update failed', { position: 'bottom-right' })
        return
      }

      const updated = await res.json()
      setUser?.(updated)
      setFields({                          // ← add this
        bio:          updated.bio          ?? '',
        phone_number: updated.phone_number ?? '',
        profile_pic:  null,
      })

      console.log('updated:', updated)
      toast.success('Profile updated', { position: 'bottom-right' })
      setEditing(false)
      setPreviewUrl(null)
    } catch {
      toast.error('Network error', { position: 'bottom-right' })
    } finally {
      setSaving(false)
    }
  }
  React.useEffect(() => {
    if (!editing) return 
    const handler = (e:KeyboardEvent) => {
      if (e.key=='Enter' && !e.shiftKey) {
        e.preventDefault()
        handleConfirm()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [editing, fields, saving])

  const avatarSrc = previewUrl ?? user?.profile_pic ?? null

  const inputCls =
    'w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all duration-150 resize-none'

  return (
    <div className="w-[85%] mx-auto py-10">
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">

        {/* ── Top accent bar ── */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400" />

        <div className="flex flex-col md:flex-row">

          {/* ── Left: identity ───────────────────────────────────────────── */}
          <div className="md:w-64 shrink-0 flex flex-col items-center gap-4 p-8 border-b md:border-b-0 md:border-r border-zinc-100 dark:border-zinc-800">

            {/* Avatar */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-full ring-2 ring-zinc-200 dark:ring-zinc-700 overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-zinc-300 dark:text-zinc-600 select-none">
                    {user?.first_name?.[0]?.toUpperCase() ?? '?'}
                  </span>
                )}
              </div>

              {/* Camera overlay (edit mode only) */}
              {editing && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Camera className="w-5 h-5 text-white" />
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            {/* Name */}
            <div className="text-center space-y-0.5">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
                {user?.last_name} {user?.first_name}
              </h2>
              <p className="text-xs text-zinc-400 font-mono">{user?.email}</p>
            </div>

            {/* Role badge */}
            {user?.role && (
              <span className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                {user.role}
              </span>
            )}
          </div>

          {/* ── Right: details + edit ─────────────────────────────────────── */}
          <div className="flex-1 p-8 space-y-6">

            {/* Header row */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Profile details
              </h3>

              {!editing ? (
                <button
                  onClick={startEditing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-blue-400 hover:text-blue-500 transition-all duration-150"
                >
                  <Pencil className="w-3 h-3" />
                  Edit
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={cancelEditing}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-500 border border-zinc-200 dark:border-zinc-700 hover:border-rose-400 hover:text-rose-500 transition-all duration-150 disabled:opacity-50"
                  >
                    <X className="w-3 h-3" />
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-100 transition-all duration-150 disabled:opacity-50"
                  >
                    <Check className="w-3 h-3" />
                    {saving ? 'Saving…' : 'Confirm'}
                  </button>
                </div>
              )}
            </div>

            <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

            {/* Bio */}
            <InfoRow
              icon={FileText}
              label="Bio"
              value={user?.bio}
              editing={editing}
              inputNode={
                <textarea
                  rows={3}
                  value={fields.bio}
                  onChange={e => setFields(f => ({ ...f, bio: e.target.value }))}
                  placeholder="Write something about yourself…"
                  className={inputCls + ' pl-5'}
                />
              }
            />

            {/* Phone */}
            <InfoRow
              icon={Phone}
              label="Phone number"
              value={user?.phone_number}
              editing={editing}
              inputNode={
                <input
                  type="tel"
                  value={fields.phone_number}
                  onChange={e => setFields(f => ({ ...f, phone_number: e.target.value }))}
                  placeholder="e.g. +213 555 000 000"
                  className={inputCls + ' pl-5'}
                />
              }
            />

            {/* Image hint (edit mode) */}
            {editing && (
              <p className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                <Camera className="w-3 h-3" />
                Hover your avatar and click to change your profile picture
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage