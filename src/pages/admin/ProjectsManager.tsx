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