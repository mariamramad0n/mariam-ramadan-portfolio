import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { mapCertificateRow } from '../../data/mappers'
import type { Certificate } from '../../data/seed'
import AssetUploader from '../../components/admin/AssetUploader'

const emptyForm = {
  title: '',
  image_url: '',
}

export default function CertificatesManager() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
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
      .from('certificates')
      .select('*')
      .order('sort_order', { ascending: true })

    if (!error && data) {
      setCertificates(data.map(mapCertificateRow))
    }

    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  function openNewCertificate() {
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

  function startEdit(certificate: Certificate) {
    setEditingId(certificate.id)

    setForm({
      title: certificate.title,
      image_url: certificate.image ?? '',
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
      title: form.title.trim(),
      image_url: form.image_url.trim() || null,
    }

    const { error: saveError } = editingId
      ? await supabase.from('certificates').update(payload).eq('id', editingId)
      : await supabase.from('certificates').insert(payload)

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

    if (!window.confirm('Delete this certificate permanently?')) return

    const { error: deleteError } = await supabase
      .from('certificates')
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
            Certificates Management
          </h1>

          <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            Manage your certificates.
          </p>
        </div>

        <button type="button" onClick={openNewCertificate} className="primary-button">
          + Add Certificate
        </button>
      </div>

      {/* =====================================================
          EXISTING CERTIFICATES
      ====================================================== */}
      <section className="mt-9">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Portfolio Content</p>

            <h2 className="font-display mt-2 text-2xl font-semibold" style={{ color: 'var(--text)' }}>
              Existing Certificates
            </h2>
          </div>

          <span
            className="rounded-full border px-3 py-1.5 font-mono text-xs"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            {certificates.length} total
          </span>
        </div>

        {loading ? (
          <p className="mt-8 text-sm" style={{ color: 'var(--text-muted)' }}>
            Loading certificates...
          </p>
        ) : (
          <div className="mt-7 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {certificates.map((certificate) => (
              <article
                key={certificate.id}
                className="soft-panel overflow-hidden rounded-2xl transition-transform duration-200 hover:-translate-y-1"
              >
                <div
                  className="flex h-40 items-center justify-center"
                  style={{ backgroundColor: 'var(--surface-2)' }}
                >
                  {certificate.image ? (
                    <img
                      src={certificate.image}
                      alt={certificate.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="font-mono text-xs" style={{ color: 'var(--accent)' }}>
                      CERTIFICATE
                    </span>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="font-display text-base font-semibold" style={{ color: 'var(--text)' }}>
                    {certificate.title}
                  </h3>

                  <div className="mt-5 flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(certificate)}
                      className="flex-1 rounded-xl border px-3 py-2.5 text-sm transition-opacity hover:opacity-80"
                      style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(certificate.id)}
                      className="flex-1 rounded-xl border px-3 py-2.5 text-sm transition-opacity hover:opacity-80"
                      style={{ borderColor: '#DC5B4B', color: '#DC5B4B' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}

            {certificates.length === 0 && (
              <div
                className="rounded-2xl border border-dashed p-12 text-center sm:col-span-2 xl:col-span-3"
                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
              >
                <p className="text-sm">No certificates have been added yet.</p>

                <button
                  type="button"
                  onClick={openNewCertificate}
                  className="mt-4 text-sm font-medium"
                  style={{ color: 'var(--accent)' }}
                >
                  + Add your first certificate
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* =====================================================
          ADD / EDIT CERTIFICATE MODAL
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
                  <p className="eyebrow">Certificate Editor</p>

                  <h2 className="font-display mt-2 text-2xl font-semibold" style={{ color: 'var(--text)' }}>
                    {editingId ? 'Edit Certificate' : 'New Certificate'}
                  </h2>

                  <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                    Add certificate title and image.
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
                    Certificate title
                  </label>

                  <input
                    required
                    value={form.title}
                    onChange={(event) => setForm({ ...form, title: event.target.value })}
                    className="mt-1.5 w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                    style={inputStyle}
                    placeholder="Example: Data Analysis with Power BI"
                  />
                </div>

                <AssetUploader
                  label="Certificate image"
                  value={form.image_url}
                  onChange={(url) => setForm({ ...form, image_url: url })}
                  folder="certificates"
                  helpText="Upload the certificate image or paste an image URL."
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
                    {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Save Certificate'}
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