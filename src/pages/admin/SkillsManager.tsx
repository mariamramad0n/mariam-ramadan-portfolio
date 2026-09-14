import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { mapSkillRow } from '../../data/mappers'
import type { Skill } from '../../data/seed'
import AssetUploader from '../../components/admin/AssetUploader'

const emptyForm = {
  name: '',
  description: '',
  image_url: '',
}

export default function SkillsManager() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)

  async function load() {
    if (!supabase) {
      setLoading(false)
      return
    }

    setLoading(true)

    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('sort_order', { ascending: true })

    if (!error && data) {
      setSkills(data.map(mapSkillRow))
    }

    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  function resetForm() {
    setEditingId(null)
    setForm(emptyForm)
    setError(null)
    setEditorOpen(false)
  }

  function openAddSkill() {
    setEditingId(null)
    setForm(emptyForm)
    setError(null)
    setEditorOpen(true)
  }

  function startEdit(skill: Skill) {
    setEditingId(skill.id)

    setForm({
      name: skill.name,
      description: skill.description ?? '',
      image_url: skill.image_url ?? '',
    })

    setError(null)
    setEditorOpen(true)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (!supabase) {
      setError('Supabase is not configured yet.')
      return
    }

    if (!form.name.trim()) {
      setError('Skill name is required.')
      return
    }

    setSaving(true)
    setError(null)

    const payload = {
      name: form.name.trim(),
      category: 'Other', // تعيين قيمة افتراضية للباك إيند بدون التقسيم
      description: form.description.trim() || null,
      image_url: form.image_url.trim() || null,
    }

    const { error: saveError } = editingId
      ? await supabase.from('skills').update(payload).eq('id', editingId)
      : await supabase.from('skills').insert(payload)

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

    if (!window.confirm('Delete this skill permanently?')) return

    const { error: deleteError } = await supabase
      .from('skills')
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
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow">Tech Stack Editor</p>

          <h2
            className="font-display mt-2 text-2xl font-semibold sm:text-3xl"
            style={{ color: 'var(--text)' }}
          >
            Skills
          </h2>

          <p
            className="mt-1.5 text-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            Manage the skills displayed on your portfolio.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddSkill}
          className="primary-button shrink-0"
        >
          + Add Skill
        </button>
      </div>

      {/* Skills Grid */}
      {loading ? (
        <div
          className="soft-panel rounded-2xl p-8 text-center text-sm"
          style={{ color: 'var(--text-muted)' }}
        >
          Loading skills...
        </div>
      ) : skills.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {skills.map((skill, index) => (
            <article
              key={skill.id}
              className="soft-panel h-[150px] rounded-2xl p-4"
            >
              <div className="flex h-full flex-col">
                {/* Card Header */}
                <div className="flex items-center gap-3">
                  {/* Skill Image / Fallback */}
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border"
                    style={{
                      borderColor: 'var(--border)',
                      backgroundColor: 'var(--bg)',
                    }}
                  >
                    {skill.image_url ? (
                      <img
                        src={skill.image_url}
                        alt={skill.name}
                        className="h-full w-full object-contain p-1.5"
                      />
                    ) : (
                      <span
                        className="font-display text-base font-semibold"
                        style={{ color: 'var(--accent)' }}
                      >
                        {skill.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Skill Name */}
                  <div className="min-w-0 flex-1">
                    <h4
                      className="truncate font-display text-base font-semibold"
                      style={{ color: 'var(--text)' }}
                    >
                      {skill.name}
                    </h4>

                    <p
                      className="mt-0.5 text-xs"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Skill #{String(index + 1).padStart(2, '0')}
                    </p>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div
                  className="mt-auto grid grid-cols-2 border-t"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <button
                    type="button"
                    onClick={() => startEdit(skill)}
                    className="flex items-center justify-center border-r py-2 text-xs font-medium transition-opacity hover:opacity-70"
                    style={{
                      borderColor: 'var(--border)',
                      color: 'var(--accent)',
                    }}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(skill.id)}
                    className="flex items-center justify-center py-2 text-xs font-medium transition-opacity hover:opacity-70"
                    style={{ color: '#DC5B4B' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div
          className="soft-panel rounded-2xl border border-dashed p-12 text-center"
          style={{
            borderColor: 'var(--border)',
            color: 'var(--text-muted)',
          }}
        >
          <p className="text-sm">No skills added yet.</p>

          <button
            type="button"
            onClick={openAddSkill}
            className="mt-2 text-sm font-medium"
            style={{ color: 'var(--accent)' }}
          >
            + Add a skill
          </button>
        </div>
      )}

      {/* Add / Edit Modal */}
      {editorOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.55)' }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              resetForm()
            }
          }}
        >
          <section
            className="soft-panel w-full max-w-2xl rounded-2xl p-5 shadow-2xl sm:p-7"
            role="dialog"
            aria-modal="true"
            aria-labelledby="skill-editor-title"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Tech Stack Editor</p>

                <h2
                  id="skill-editor-title"
                  className="font-display mt-2 text-2xl font-semibold"
                  style={{ color: 'var(--text)' }}
                >
                  {editingId ? 'Edit skill' : 'Add skill'}
                </h2>
              </div>

              <button
                type="button"
                onClick={resetForm}
                className="flex h-9 w-9 items-center justify-center rounded-full border text-lg transition-opacity hover:opacity-70"
                style={{
                  borderColor: 'var(--border)',
                  color: 'var(--text-muted)',
                }}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              {/* Skill Name */}
              <div>
                <label
                  className="text-sm font-medium"
                  style={{ color: 'var(--text)' }}
                >
                  Skill name
                </label>

                <input
                  required
                  value={form.name}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      name: event.target.value,
                    })
                  }
                  className="mt-1.5 w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                  style={inputStyle}
                  placeholder="Example: Power BI"
                />
              </div>

              {/* Skill Image */}
              <AssetUploader
                label="Skill icon / logo"
                value={form.image_url}
                onChange={(url) =>
                  setForm({
                    ...form,
                    image_url: url,
                  })
                }
                folder="skills"
                helpText="Optional. Upload the skill logo or paste an image URL."
              />

              {/* Error */}
              {error && (
                <p
                  className="rounded-xl border px-3 py-2 text-sm"
                  style={{
                    borderColor: '#DC5B4B',
                    color: '#DC5B4B',
                  }}
                >
                  {error}
                </p>
              )}

              {/* Modal Actions */}
              <div
                className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end"
                style={{ borderColor: 'var(--border)' }}
              >
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-75"
                  style={{
                    borderColor: 'var(--border)',
                    color: 'var(--text)',
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="primary-button disabled:opacity-50"
                >
                  {saving
                    ? 'Saving...'
                    : editingId
                      ? 'Save changes'
                      : 'Add skill'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}