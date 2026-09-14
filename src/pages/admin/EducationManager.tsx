import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { mapEducationRow } from '../../data/mappers'
import type { Education } from '../../data/seed'
import AssetUploader from '../../components/admin/AssetUploader'

const emptyForm = {
  institution: '',
  degree: '',
  start_date: '',
  end_date: '',
  logo_url: '',
}

export default function EducationManager() {
  const [education, setEducation] = useState<Education[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [isEditorOpen, setIsEditorOpen] = useState(false)

  async function load() {
    if (!supabase) {
      setLoading(false)
      return
    }

    setLoading(true)

    const { data, error } = await supabase
      .from('education')
      .select('*')
      .order('sort_order', { ascending: true })

    if (!error && data) {
      setEducation(data.map(mapEducationRow))
    }

    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  function openNewEducation() {
    setEditingId(null)
    setForm(emptyForm)
    setError(null)
    setIsEditorOpen(true)
  }

  function resetForm() {
    setEditingId(null)
    setForm(emptyForm)
    setError(null)
    setIsEditorOpen(false)
  }

  function startEdit(item: Education) {
    setEditingId(item.id)

    setForm({
      institution: item.institution,
      degree: item.degree,
      start_date: item.startDate,
      end_date: item.endDate ?? '',
      logo_url: item.logoUrl ?? '',
    })

    setError(null)
    setIsEditorOpen(true)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (!supabase) {
      setError('Supabase is not configured yet.')
      return
    }

    setSaving(true)
    setError(null)

    const payload = {
      institution: form.institution.trim(),
      degree: form.degree.trim(),
      start_date: form.start_date.trim(),
      end_date: form.end_date.trim() || null,
      logo_url: form.logo_url.trim() || null,
    }

    const { error: saveError } = editingId
      ? await supabase.from('education').update(payload).eq('id', editingId)
      : await supabase.from('education').insert(payload)

    setSaving(false)

    if (saveError) {
      setError(saveError.message)
      return
    }

    resetForm()
    load()
  }

  async function handleDelete(id: string) {
    if (!supabase) return

    if (!window.confirm('Delete this education entry permanently?')) return

    const { error: deleteError } = await supabase
      .from('education')
      .delete()
      .eq('id', id)

    if (deleteError) {
      setError(deleteError.message)
      return
    }

    load()
  }

  const inputStyle = {
    borderColor: 'var(--border)',
    backgroundColor: 'var(--bg)',
    color: 'var(--text)',
  }

  return (
    <div className="relative">
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="eyebrow">Portfolio Content</p>

          <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight" style={{ color: 'var(--text)' }}>
            Education Management
          </h1>

          <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            Manage your academic background.
          </p>
        </div>

        <button type="button" onClick={openNewEducation} className="primary-button">
          + Add Education
        </button>
      </div>

      {/* =====================================================
          EXISTING EDUCATION
      ====================================================== */}
      <section className="mt-9">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Portfolio Content</p>

            <h2 className="font-display mt-2 text-2xl font-semibold" style={{ color: 'var(--text)' }}>
              Existing Education
            </h2>
          </div>

          <span
            className="rounded-full border px-3 py-1.5 font-mono text-xs"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            {education.length} total
          </span>
        </div>

        <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          The first entry (top of this list) is the one shown on the homepage. Reorder by editing sort order in Supabase if needed.
        </p>

        {loading ? (
          <p className="mt-8 text-sm" style={{ color: 'var(--text-muted)' }}>
            Loading education...
          </p>
        ) : (
          <div className="mt-7 space-y-4">
            {education.map((item) => (
              <article key={item.id} className="soft-panel rounded-2xl p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border"
                      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}
                    >
                      {item.logoUrl ? (
                        <img
                          src={item.logoUrl}
                          alt={item.institution}
                          className="h-full w-full object-contain p-1.5"
                        />
                      ) : (
                        <span className="font-display text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                          {item.institution.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div>
                      <p className="font-mono text-xs" style={{ color: 'var(--accent)' }}>
                        {item.startDate} – {item.endDate ?? 'Present'}
                      </p>

                      <h3 className="font-display mt-1 text-lg font-semibold" style={{ color: 'var(--text)' }}>
                        {item.degree}
                      </h3>

                      <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                        {item.institution}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      className="rounded-full border px-3 py-1.5 text-xs"
                      style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="rounded-full border px-3 py-1.5 text-xs"
                      style={{ borderColor: '#DC5B4B', color: '#DC5B4B' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}

            {education.length === 0 && (
              <div
                className="rounded-2xl border border-dashed p-12 text-center"
                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
              >
                <p className="text-sm">No education entries have been added yet.</p>

                <button
                  type="button"
                  onClick={openNewEducation}
                  className="mt-4 text-sm font-medium"
                  style={{ color: 'var(--accent)' }}
                >
                  + Add your first education entry
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* =====================================================
          ADD / EDIT EDUCATION MODAL
      ====================================================== */}
      {isEditorOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto px-4 py-6 sm:py-10"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.78)' }}
        >
          <div className="mx-auto max-w-3xl">
            <section
              className="soft-panel rounded-2xl p-5 shadow-2xl sm:p-7"
              style={{ backgroundColor: 'var(--surface)' }}
            >
              {/* MODAL HEADER */}
              <div
                className="flex items-start justify-between gap-4 border-b pb-5"
                style={{ borderColor: 'var(--border)' }}
              >
                <div>
                  <p className="eyebrow">Education Editor</p>

                  <h2 className="font-display mt-2 text-2xl font-semibold" style={{ color: 'var(--text)' }}>
                    {editingId ? 'Edit Education' : 'New Education'}
                  </h2>

                  <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                    Add degree, institution, and logo.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={resetForm}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-lg transition-opacity hover:opacity-70"
                  style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              {/* FORM */}
              <form onSubmit={handleSubmit} className="mt-7 space-y-4">
                <div>
                  <label className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                    Degree
                  </label>

                  <input
                    required
                    value={form.degree}
                    onChange={(event) => setForm({ ...form, degree: event.target.value })}
                    className="mt-1.5 w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                    style={inputStyle}
                    placeholder="Example: Bachelor of Commerce"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                    Institution
                  </label>

                  <input
                    required
                    value={form.institution}
                    onChange={(event) => setForm({ ...form, institution: event.target.value })}
                    className="mt-1.5 w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                    style={inputStyle}
                    placeholder="Example: Cairo University"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                      Start date
                    </label>

                    <input
                      required
                      value={form.start_date}
                      onChange={(event) => setForm({ ...form, start_date: event.target.value })}
                      className="mt-1.5 w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                      style={inputStyle}
                      placeholder="Example: 2021"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                      End date
                    </label>

                    <input
                      value={form.end_date}
                      onChange={(event) => setForm({ ...form, end_date: event.target.value })}
                      className="mt-1.5 w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                      style={inputStyle}
                      placeholder="Leave empty for Present"
                    />
                  </div>
                </div>

                <AssetUploader
                  label="Institution logo"
                  value={form.logo_url}
                  onChange={(url) => setForm({ ...form, logo_url: url })}
                  folder="education"
                  cropShape="square"
                  helpText="Optional. Upload your college/institution logo."
                />

                {error && (
                  <p
                    className="rounded-xl border px-3 py-2 text-sm"
                    style={{ borderColor: '#DC5B4B', color: '#DC5B4B' }}
                  >
                    {error}
                  </p>
                )}

                <div className="flex justify-end gap-3 border-t pt-5" style={{ borderColor: 'var(--border)' }}>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-xl border px-5 py-2.5 text-sm transition-opacity hover:opacity-70"
                    style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                  >
                    Cancel
                  </button>

                  <button type="submit" disabled={saving} className="primary-button disabled:opacity-50">
                    {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Save Education'}
                  </button>
                </div>
              </form>
            </section>
          </div>
        </div>
      )}
    </div>
  )
}