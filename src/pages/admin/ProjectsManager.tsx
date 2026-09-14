import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { mapProjectRow } from '../../data/mappers'
import type { Project } from '../../data/seed'
import AssetUploader from '../../components/admin/AssetUploader'

const emptyForm = {
  title: '',
  short_description: '',
  full_description: '',
  technologies: '',
  key_features: '',
  github_url: '',
  live_url: '',
  image_url: '',
  category: '',
  project_date: '',
  featured: false,
}

export default function ProjectsManager() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)

  const [projectImages, setProjectImages] = useState<string[]>([])
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
      .from('projects')
      .select('*')
      .order('sort_order', { ascending: true })

    if (!error && data) {
      setProjects(data.map(mapProjectRow))
    }

    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function loadProjectImages(projectId: string) {
    if (!supabase) return

    const { data, error } = await supabase
      .from('project_images')
      .select('image_url')
      .eq('project_id', projectId)
      .order('sort_order', { ascending: true })

    if (!error && data) {
      setProjectImages(data.map((item) => item.image_url))
    }
  }

  function openNewProject() {
    setEditingId(null)
    setForm(emptyForm)
    setProjectImages([])
    setError(null)
    setIsEditorOpen(true)
  }

  async function startEdit(project: Project) {
    setEditingId(project.id)

    setForm({
      title: project.title,
      short_description: project.shortDescription,
      full_description: project.fullDescription,
      technologies: project.technologies.join(', '),
      key_features: project.keyFeatures.join('\n'),
      github_url: project.githubUrl ?? '',
      live_url: project.liveUrl ?? '',
      image_url: project.image ?? '',
      category: project.category,
      project_date: project.date,
      featured: project.featured,
    })

    setProjectImages([])
    setError(null)
    setIsEditorOpen(true)

    await loadProjectImages(project.id)
  }

  function resetForm() {
    setEditingId(null)
    setForm(emptyForm)
    setProjectImages([])
    setError(null)
    setIsEditorOpen(false)
  }

  function addProjectImage(url: string) {
    if (!url.trim()) return

    setProjectImages((current) => [...current, url.trim()])
  }

  function removeProjectImage(index: number) {
    setProjectImages((current) =>
      current.filter((_, itemIndex) => itemIndex !== index)
    )
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (!supabase) {
      setError('Supabase is not configured yet.')
      return
    }

    setSaving(true)
    setError(null)

    const imagesToSave = projectImages.length
      ? projectImages
      : form.image_url.trim()
        ? [form.image_url.trim()]
        : []

    const primaryImage = imagesToSave[0] ?? null

    const payload = {
      title: form.title.trim(),
      short_description: form.short_description.trim(),
      full_description: form.full_description.trim(),

      technologies: form.technologies
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),

      key_features: form.key_features
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean),

      github_url: form.github_url.trim() || null,
      live_url: form.live_url.trim() || null,

      image_url: primaryImage,

      category: form.category.trim(),
      project_date: form.project_date.trim(),
      featured: form.featured,
    }

    let projectId = editingId

    // =========================
    // CREATE PROJECT
    // =========================
    if (!editingId) {
      const { data, error: saveError } = await supabase
        .from('projects')
        .insert(payload)
        .select('id')
        .single()

      if (saveError) {
        setSaving(false)
        setError(saveError.message)
        return
      }

      projectId = data?.id ?? null
    }

    // =========================
    // UPDATE PROJECT
    // =========================
    if (editingId) {
      const { error: saveError } = await supabase
        .from('projects')
        .update(payload)
        .eq('id', editingId)

      if (saveError) {
        setSaving(false)
        setError(saveError.message)
        return
      }
    }

    if (!projectId) {
      setSaving(false)
      setError('Project could not be saved.')
      return
    }

    // =========================
    // REPLACE PROJECT IMAGES
    // =========================
    const { error: deleteImagesError } = await supabase
      .from('project_images')
      .delete()
      .eq('project_id', projectId)

    if (deleteImagesError) {
      setSaving(false)
      setError(deleteImagesError.message)
      return
    }

    if (imagesToSave.length > 0) {
      const imageRows = imagesToSave.map((url, index) => ({
        project_id: projectId,
        image_url: url,
        sort_order: index,
      }))

      const { error: imagesError } = await supabase
        .from('project_images')
        .insert(imageRows)

      if (imagesError) {
        setSaving(false)
        setError(imagesError.message)
        return
      }
    }

    setSaving(false)

    resetForm()
    await load()
  }

  async function handleDelete(id: string) {
    if (!supabase) return

    const confirmed = window.confirm(
      'Delete this project permanently?'
    )

    if (!confirmed) return

    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (deleteError) {
      setError(deleteError.message)
      return
    }

    await load()
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
          <p className="eyebrow">
            Portfolio Content
          </p>

          <h1
            className="font-display mt-2 text-3xl font-semibold tracking-tight"
            style={{ color: 'var(--text)' }}
          >
            Projects Management
          </h1>

          <p
            className="mt-2 text-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            Manage your portfolio projects.
          </p>
        </div>

        <button
          type="button"
          onClick={openNewProject}
          className="primary-button"
        >
          + Add Project
        </button>

      </div>


      {/* =====================================================
          EXISTING PROJECTS
      ====================================================== */}
      <section className="mt-9">

        <div className="flex items-center justify-between gap-4">

          <div>
            <p className="eyebrow">
              Portfolio Content
            </p>

            <h2
              className="font-display mt-2 text-2xl font-semibold"
              style={{ color: 'var(--text)' }}
            >
              Existing Projects
            </h2>
          </div>

          <span
            className="rounded-full border px-3 py-1.5 font-mono text-xs"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--text-muted)',
            }}
          >
            {projects.length} total
          </span>

        </div>


        {/* LOADING */}
        {loading ? (
          <p
            className="mt-8 text-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            Loading projects...
          </p>
        ) : (

          <div
            className="
              mt-7
              grid
              gap-6
              sm:grid-cols-2
              xl:grid-cols-3
            "
          >

            {projects.map((project) => (

              <article
                key={project.id}
                className="
                  soft-panel
                  overflow-hidden
                  rounded-2xl
                  transition-transform
                  duration-200
                  hover:-translate-y-1
                "
              >

                {/* PROJECT IMAGE */}
                <div
                  className="relative h-56 w-full overflow-hidden"
                  style={{
                    backgroundColor: 'var(--surface-2)',
                  }}
                >

                  {project.image ? (

                    <img
                      src={project.image}
                      alt={project.title}
                      className="
                        h-full
                        w-full
                        object-cover
                      "
                    />

                  ) : (

                    <div
                      className="
                        flex
                        h-full
                        w-full
                        items-center
                        justify-center
                      "
                    >
                      <span
                        className="font-mono text-xs"
                        style={{
                          color: 'var(--accent)',
                        }}
                      >
                        NO IMAGE
                      </span>
                    </div>

                  )}

                </div>


                {/* PROJECT INFO */}
                <div className="p-5">

                  <div className="flex flex-wrap items-center gap-2">

                    <span
                      className="font-mono text-xs"
                      style={{
                        color: 'var(--accent)',
                      }}
                    >
                      {project.category}
                    </span>

                    {project.featured && (

                      <span
                        className="
                          rounded-full
                          px-2.5
                          py-1
                          font-mono
                          text-[9px]
                        "
                        style={{
                          backgroundColor: 'var(--surface-2)',
                          color: 'var(--accent)',
                        }}
                      >
                        FEATURED
                      </span>

                    )}

                  </div>


                  <h3
                    className="
                      font-display
                      mt-2
                      line-clamp-2
                      text-xl
                      font-semibold
                    "
                    style={{
                      color: 'var(--text)',
                    }}
                  >
                    {project.title}
                  </h3>


                  <p
                    className="
                      mt-2
                      line-clamp-3
                      text-sm
                      leading-relaxed
                    "
                    style={{
                      color: 'var(--text-muted)',
                    }}
                  >
                    {project.shortDescription}
                  </p>


                  <p
                    className="mt-3 text-xs"
                    style={{
                      color: 'var(--text-muted)',
                    }}
                  >
                    {project.date}
                  </p>


                  {/* ACTIONS */}
                  <div className="mt-5 flex gap-2">

                    <button
                      type="button"
                      onClick={() => startEdit(project)}
                      className="
                        flex-1
                        rounded-xl
                        border
                        px-3
                        py-2.5
                        text-sm
                        transition-opacity
                        hover:opacity-80
                      "
                      style={{
                        borderColor: 'var(--border)',
                        color: 'var(--text)',
                      }}
                    >
                      Edit
                    </button>


                    <button
                      type="button"
                      onClick={() => handleDelete(project.id)}
                      className="
                        flex-1
                        rounded-xl
                        border
                        px-3
                        py-2.5
                        text-sm
                        transition-opacity
                        hover:opacity-80
                      "
                      style={{
                        borderColor: '#DC5B4B',
                        color: '#DC5B4B',
                      }}
                    >
                      Delete
                    </button>

                  </div>

                </div>

              </article>

            ))}


            {/* EMPTY STATE */}
            {projects.length === 0 && (

              <div
                className="
                  rounded-2xl
                  border
                  border-dashed
                  p-12
                  text-center
                  sm:col-span-2
                  xl:col-span-3
                "
                style={{
                  borderColor: 'var(--border)',
                  color: 'var(--text-muted)',
                }}
              >
                <p className="text-sm">
                  No projects have been added yet.
                </p>

                <button
                  type="button"
                  onClick={openNewProject}
                  className="mt-4 text-sm font-medium"
                  style={{
                    color: 'var(--accent)',
                  }}
                >
                  + Add your first project
                </button>

              </div>

            )}

          </div>

        )}

      </section>


      {/* =====================================================
          ADD / EDIT PROJECT MODAL
      ====================================================== */}
      {isEditorOpen && (

        <div
          className="
            fixed
            inset-0
            z-50
            overflow-y-auto
            px-4
            py-6
            sm:py-10
          "
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.78)',
          }}
        >

          <div className="mx-auto max-w-5xl">

            <section
              className="
                soft-panel
                rounded-2xl
                p-5
                shadow-2xl
                sm:p-7
              "
              style={{
                backgroundColor: 'var(--surface)',
              }}
            >

              {/* MODAL HEADER */}
              <div
                className="
                  flex
                  items-start
                  justify-between
                  gap-4
                  border-b
                  pb-5
                "
                style={{
                  borderColor: 'var(--border)',
                }}
              >

                <div>

                  <p className="eyebrow">
                    Project Editor
                  </p>

                  <h2
                    className="
                      font-display
                      mt-2
                      text-2xl
                      font-semibold
                    "
                    style={{
                      color: 'var(--text)',
                    }}
                  >
                    {editingId
                      ? 'Edit Project'
                      : 'New Project'}
                  </h2>

                  <p
                    className="mt-2 text-sm"
                    style={{
                      color: 'var(--text-muted)',
                    }}
                  >
                    Add project information, links and images.
                  </p>

                </div>


                <button
                  type="button"
                  onClick={resetForm}
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    border
                    text-lg
                    transition-opacity
                    hover:opacity-70
                  "
                  style={{
                    borderColor: 'var(--border)',
                    color: 'var(--text)',
                  }}
                  aria-label="Close"
                >
                  ×
                </button>

              </div>


              {/* FORM */}
              <form
                onSubmit={handleSubmit}
                className="mt-7 space-y-5"
              >

                {/* TITLE */}
                <div>

                  <label
                    className="text-sm font-medium"
                    style={{
                      color: 'var(--text)',
                    }}
                  >
                    Project Title
                  </label>

                  <input
                    required
                    value={form.title}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        title: event.target.value,
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
                    placeholder="Example: Sales Dashboard"
                  />

                </div>


                {/* SHORT DESCRIPTION */}
                <div>

                  <label
                    className="text-sm font-medium"
                    style={{
                      color: 'var(--text)',
                    }}
                  >
                    Short Description
                  </label>

                  <input
                    required
                    value={form.short_description}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        short_description: event.target.value,
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
                    placeholder="One concise sentence for the project card"
                  />

                </div>


                {/* FULL DESCRIPTION */}
                <div>

                  <label
                    className="text-sm font-medium"
                    style={{
                      color: 'var(--text)',
                    }}
                  >
                    Full Description
                  </label>

                  <textarea
                    required
                    rows={6}
                    value={form.full_description}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        full_description: event.target.value,
                      })
                    }
                    className="
                      mt-1.5
                      w-full
                      resize-y
                      rounded-xl
                      border
                      px-3
                      py-2.5
                      text-sm
                      leading-relaxed
                      outline-none
                    "
                    style={inputStyle}
                    placeholder="Describe the project, its goal, and what you built."
                  />

                </div>


                {/* CATEGORY + DATE */}
                <div className="grid gap-4 sm:grid-cols-2">

                  <div>

                    <label
                      className="text-sm font-medium"
                      style={{
                        color: 'var(--text)',
                      }}
                    >
                      Category
                    </label>

                    <input
                      required
                      value={form.category}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          category: event.target.value,
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
                      placeholder="Example: BI Dashboards"
                    />

                  </div>


                  <div>

                    <label
                      className="text-sm font-medium"
                      style={{
                        color: 'var(--text)',
                      }}
                    >
                      Date
                    </label>

                    <input
                      required
                      value={form.project_date}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          project_date: event.target.value,
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
                      placeholder="Example: 2026"
                    />

                  </div>

                </div>


                {/* TECHNOLOGIES */}
                <div>

                  <label
                    className="text-sm font-medium"
                    style={{
                      color: 'var(--text)',
                    }}
                  >
                    Technologies
                  </label>

                  <input
                    value={form.technologies}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        technologies: event.target.value,
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
                    placeholder="Python, SQL, Power BI"
                  />

                  <p
                    className="mt-1.5 text-xs"
                    style={{
                      color: 'var(--text-muted)',
                    }}
                  >
                    Separate each technology with a comma.
                  </p>

                </div>


                {/* KEY FEATURES */}
                <div>

                  <label
                    className="text-sm font-medium"
                    style={{
                      color: 'var(--text)',
                    }}
                  >
                    Key Features
                  </label>

                  <textarea
                    rows={4}
                    value={form.key_features}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        key_features: event.target.value,
                      })
                    }
                    className="
                      mt-1.5
                      w-full
                      resize-y
                      rounded-xl
                      border
                      px-3
                      py-2.5
                      text-sm
                      leading-relaxed
                      outline-none
                    "
                    style={inputStyle}
                    placeholder={
                      'One feature per line\nExample: Built interactive KPI reporting'
                    }
                  />

                  <p
                    className="mt-1.5 text-xs"
                    style={{
                      color: 'var(--text-muted)',
                    }}
                  >
                    Write one feature on each line.
                  </p>

                </div>


                {/* =================================================
                    MULTIPLE PROJECT IMAGES
                ================================================== */}
                <div
                  className="
                    rounded-2xl
                    border
                    p-4
                    sm:p-5
                  "
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--bg)',
                  }}
                >

                  <div className="flex items-center justify-between gap-3">

                    <div>

                      <label
                        className="text-sm font-medium"
                        style={{
                          color: 'var(--text)',
                        }}
                      >
                        Project Images
                      </label>

                      <p
                        className="mt-1 text-xs"
                        style={{
                          color: 'var(--text-muted)',
                        }}
                      >
                        You can upload multiple images for one project.
                      </p>

                    </div>


                    <span
                      className="
                        shrink-0
                        rounded-full
                        border
                        px-3
                        py-1.5
                        text-xs
                      "
                      style={{
                        borderColor: 'var(--border)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {projectImages.length} images
                    </span>

                  </div>


                  {/* UPLOADER */}
                  <div className="mt-4">

                    <AssetUploader
                      label="Upload Project Image"
                      value=""
                      onChange={addProjectImage}
                      folder="projects"
                      helpText="Upload another image for this project."
                    />

                  </div>


                  {/* UPLOADED IMAGES */}
                  {projectImages.length > 0 && (

                    <div
                      className="
                        mt-5
                        grid
                        gap-4
                        sm:grid-cols-2
                        lg:grid-cols-3
                      "
                    >

                      {projectImages.map((image, index) => (

                        <div
                          key={`${image}-${index}`}
                          className="
                            overflow-hidden
                            rounded-xl
                            border
                          "
                          style={{
                            borderColor: 'var(--border)',
                            backgroundColor: 'var(--surface)',
                          }}
                        >

                          {/* IMAGE PREVIEW */}
                          <div
                            className="relative h-40 overflow-hidden"
                            style={{
                              backgroundColor: 'var(--surface-2)',
                            }}
                          >

                            <img
                              src={image}
                              alt={`Project image ${index + 1}`}
                              className="
                                h-full
                                w-full
                                object-cover
                              "
                            />

                            <div
                              className="
                                absolute
                                left-2
                                top-2
                                rounded-full
                                px-2.5
                                py-1
                                text-[10px]
                                font-semibold
                              "
                              style={{
                                backgroundColor:
                                  'rgba(0,0,0,0.68)',
                                color: '#fff',
                              }}
                            >
                              Image {index + 1}
                            </div>

                          </div>


                          {/* IMAGE ACTIONS */}
                          <div
                            className="
                              flex
                              items-center
                              justify-between
                              gap-2
                              p-3
                            "
                          >

                            {index === 0 ? (

                              <span
                                className="text-xs font-medium"
                                style={{
                                  color: 'var(--accent)',
                                }}
                              >
                                Main image
                              </span>

                            ) : (

                              <span
                                className="text-xs"
                                style={{
                                  color: 'var(--text-muted)',
                                }}
                              >
                                Project image
                              </span>

                            )}


                            <button
                              type="button"
                              onClick={() =>
                                removeProjectImage(index)
                              }
                              className="
                                rounded-lg
                                border
                                px-3
                                py-1.5
                                text-xs
                                transition-opacity
                                hover:opacity-70
                              "
                              style={{
                                borderColor: '#DC5B4B',
                                color: '#DC5B4B',
                              }}
                            >
                              Delete
                            </button>

                          </div>

                        </div>

                      ))}

                    </div>

                  )}

                </div>


                {/* GITHUB + LIVE DEMO */}
                <div className="grid gap-4 sm:grid-cols-2">

                  <div>

                    <label
                      className="text-sm font-medium"
                      style={{
                        color: 'var(--text)',
                      }}
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
                      placeholder="https://github.com/..."
                    />

                  </div>


                  <div>

                    <label
                      className="text-sm font-medium"
                      style={{
                        color: 'var(--text)',
                      }}
                    >
                      Live Demo URL
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
                      placeholder="https://..."
                    />

                  </div>

                </div>


                {/* FEATURED */}
                <label
                  className="
                    flex
                    cursor-pointer
                    items-center
                    gap-2
                    text-sm
                  "
                  style={{
                    color: 'var(--text)',
                  }}
                >

                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        featured: event.target.checked,
                      })
                    }
                  />

                  Show this project as featured

                </label>


                {/* ERROR */}
                {error && (

                  <p
                    className="
                      rounded-xl
                      border
                      px-3
                      py-2.5
                      text-sm
                    "
                    style={{
                      borderColor: '#DC5B4B',
                      color: '#DC5B4B',
                    }}
                  >
                    {error}
                  </p>

                )}


                {/* FORM ACTIONS */}
                <div
                  className="
                    flex
                    flex-col-reverse
                    gap-3
                    border-t
                    pt-5
                    sm:flex-row
                    sm:justify-end
                  "
                  style={{
                    borderColor: 'var(--border)',
                  }}
                >

                  <button
                    type="button"
                    onClick={resetForm}
                    className="
                      rounded-xl
                      border
                      px-5
                      py-2.5
                      text-sm
                      transition-opacity
                      hover:opacity-70
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
                    {saving
                      ? 'Saving...'
                      : editingId
                        ? 'Save Changes'
                        : 'Save Project'}
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