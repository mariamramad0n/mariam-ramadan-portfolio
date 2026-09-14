import React, { useState } from 'react'

const inputStyle = {
  backgroundColor: 'var(--bg-input, transparent)',
  borderColor: 'var(--border)',
  color: 'var(--text)',
}

export default function ProjectsManager() {
  const [form, setForm] = useState({
    github_url: '',
    live_url: '',
    featured: false,
    images: [] as string[],
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(true)

  const removeProjectImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const resetForm = () => {
    setForm({
      github_url: '',
      live_url: '',
      featured: false,
      images: [],
    })
    setEditingId(null)
    setShowModal(false)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      // Logic for save/update project
      resetForm()
    } catch (err: any) {
      setError(err.message || 'Failed to save project')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6">
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-var-bg p-6 shadow-xl" style={{ backgroundColor: 'var(--bg)' }}>
            <section>
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* GALLERY DISPLAY */}
                <div>
                  {form.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {form.images.map((image, index) => (
                        <div key={index} className="relative overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border)' }}>
                          <div className="relative aspect-video w-full">
                            <img src={image} alt={`Project ${index}`} className="h-full w-full object-cover" />
                            <div className="absolute top-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] text-white backdrop-blur-sm">
                              {index === 0 ? 'Primary Image' : `Image ${index + 1}`}
                            </div>
                          </div>

                          {/* IMAGE ACTIONS */}
                          <div className="flex items-center justify-between p-3">
                            <span
                              className="truncate font-mono text-[11px]"
                              style={{ color: 'var(--text-muted)' }}
                              title={image}
                            >
                              {image.split('/').pop()}
                            </span>

                            <button
                              type="button"
                              onClick={() => removeProjectImage(index)}
                              className="
                                ml-2
                                rounded-lg
                                px-2.5
                                py-1
                                text-xs
                                transition-opacity
                                hover:opacity-80
                              "
                              style={{
                                backgroundColor: 'rgba(220, 91, 75, 0.1)',
                                color: '#DC5B4B',
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* GITHUB & LIVE URLS */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      className="text-sm font-medium"
                      style={{ color: 'var(--text)' }}
                    >
                      GitHub URL
                    </label>
                    <input
                      type="url"
                      value={form.github_url}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          github_url: event.target.value,
                        })
                      }
                      className="
                        mt-1.5
                        w-full
                        rounded-xl
                        border
                        px-3
                        py-2.5
                        text-sm
                        outline-none
                      "
                      style={inputStyle}
                      placeholder="https://github.com/username/repo"
                    />
                  </div>

                  <div>
                    <label
                      className="text-sm font-medium"
                      style={{ color: 'var(--text)' }}
                    >
                      Live Demo / Project Link
                    </label>
                    <input
                      type="url"
                      value={form.live_url}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          live_url: event.target.value,
                        })
                      }
                      className="
                        mt-1.5
                        w-full
                        rounded-xl
                        border
                        px-3
                        py-2.5
                        text-sm
                        outline-none
                      "
                      style={inputStyle}
                      placeholder="https://your-project-demo.com"
                    />
                  </div>
                </div>

                {/* FEATURED FLAG */}
                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={form.featured}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        featured: event.target.checked,
                      })
                    }
                    className="
                      h-4
                      w-4
                      rounded
                      border-gray-300
                      text-accent
                      focus:ring-accent
                    "
                  />
                  <label
                    htmlFor="featured"
                    className="cursor-pointer text-sm font-medium"
                    style={{ color: 'var(--text)' }}
                  >
                    Feature this project on the home page
                  </label>
                </div>

                {/* ERROR MESSAGE */}
                {error && (
                  <div
                    className="rounded-xl border p-3.5 text-sm"
                    style={{
                      borderColor: 'rgba(220, 91, 75, 0.4)',
                      backgroundColor: 'rgba(220, 91, 75, 0.08)',
                      color: '#DC5B4B',
                    }}
                  >
                    {error}
                  </div>
                )}

                {/* FORM ACTIONS */}
                <div
                  className="
                    flex
                    items-center
                    justify-end
                    gap-3
                    border-t
                    pt-5
                  "
                  style={{ borderColor: 'var(--border)' }}
                >
                  <button
                    type="button"
                    onClick={resetForm}
                    className="
                      rounded-xl
                      border
                      px-4
                      py-2.5
                      text-sm
                      font-medium
                      transition-opacity
                      hover:opacity-80
                    "
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
                    className="
                      primary-button
                      disabled:opacity-50
                    "
                  >
                    {saving ? 'Saving...' : editingId ? 'Update Project' : 'Save Project'}
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