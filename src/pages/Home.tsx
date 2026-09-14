import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import Nav from '../components/Nav'
import ProjectsGrid from '../components/ProjectsGrid'
import CertificateCard from '../components/CertificateCard'
import { useContent } from '../hooks/useContent'
import {
  profile as seedProfile,
  skills as seedSkills,
  projects as seedProjects,
  certificates as seedCertificates,
  experience as seedExperience,
  education as seedEducation,
  type Project,
  type Certificate,
  type Skill,
  type Experience,
  type Education,
  type Profile,
} from '../data/seed'
import {
  mapProjectRow,
  mapCertificateRow,
  mapSkillRow,
  mapExperienceRow,
  mapEducationRow,
  mapProfileRow,
} from '../data/mappers'

type PortfolioTab = 'projects' | 'certificates' | 'skills'

type ContactLink = {
  label: string
  href: string
  external: boolean
  icon: JSX.Element
}

function PhoneIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M3 5a2 2 0 012-2h2.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-1.7.85a11.05 11.05 0 005.516 5.516l.85-1.7a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.163 21 3 14.837 3 7V5z"
      />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 110-4.124 2.062 2.062 0 010 4.124zM7.114 20.452H3.56V9h3.554v11.452z" />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.833.092-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.269 2.75 1.026A9.548 9.548 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.747-1.026 2.747-1.026.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.749 0 .268.18.58.688.482A10.02 10.02 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  )
}

function CertificatesSection({
  certificates,
  fadeUp,
  staggerContainer,
}: {
  certificates: Certificate[]
  fadeUp: any
  staggerContainer: any
}) {
  const [showAll, setShowAll] = useState(false)

  const visibleCertificates = showAll ? certificates : certificates.slice(0, 8)
  const hasMore = certificates.length > 8

  return (
    <div className="w-full space-y-10">
      <motion.div
        className="flex flex-wrap justify-center gap-5"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence>
          {visibleCertificates.map((certificate) => (
            <motion.div
              key={certificate.id}
              variants={fadeUp}
              layout
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-[280px] shrink-0"
            >
              <CertificateCard cert={certificate} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="secondary-button text-sm font-medium transition-transform duration-200 hover:scale-105"
          >
            {showAll
              ? 'See Less'
              : `See More (${certificates.length - 8} more)`}
          </button>
        </div>
      )}
    </div>
  )
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<PortfolioTab>('projects')
  const [imgError, setImgError] = useState(false)
  const [eduImgError, setEduImgError] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  const fadeUp = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0 : 0.4, ease: 'easeInOut' },
    },
  }

  const staggerContainer = {
    hidden: {},
    visible: {
      transition: { staggerChildren: shouldReduceMotion ? 0 : 0.08 },
    },
  }

  useEffect(() => {
    function handleTabSelect(event: Event) {
      const tab = (event as CustomEvent<PortfolioTab>).detail
      if (tab) setActiveTab(tab)
    }

    window.addEventListener('portfolio-tab-select', handleTabSelect)
    return () => window.removeEventListener('portfolio-tab-select', handleTabSelect)
  }, [])

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('portfolio-tab-changed', { detail: activeTab }))
  }, [activeTab])

  const { data: profile } = useContent<any, Profile>('profile', seedProfile, (rows) => {
    return rows && rows.length > 0 ? mapProfileRow(rows[0]) : seedProfile
  })

  useEffect(() => {
    if (profile?.name) {
      document.title = profile.title
        ? `${profile.name} — ${profile.title}`
        : profile.name
    } else {
      document.title = 'Data Analyst Portfolio'
    }
  }, [profile?.name, profile?.title])

  const { data: skills } = useContent<any, Skill[]>(
    'skills',
    seedSkills,
    (rows) => rows.map(mapSkillRow),
    'sort_order'
  )

  const { data: projects } = useContent<any, Project[]>(
    'projects',
    seedProjects,
    (rows) => rows.map(mapProjectRow),
    'sort_order'
  )

  const { data: certificates } = useContent<any, Certificate[]>(
    'certificates',
    seedCertificates,
    (rows) => rows.map(mapCertificateRow),
    'sort_order'
  )

  const { data: experience } = useContent<any, Experience[]>(
    'experience',
    seedExperience,
    (rows) => rows.map(mapExperienceRow),
    'sort_order'
  )

  const { data: education } = useContent<any, Education[]>(
    'education',
    seedEducation,
    (rows) => rows.map(mapEducationRow),
    'sort_order'
  )

  const primaryEducation = education[0]
  const eduLogoUrl = primaryEducation?.logoUrl || ''

  const tabs: { id: PortfolioTab; label: string }[] = [
    { id: 'projects', label: 'Projects' },
    { id: 'certificates', label: 'Certificates' },
    { id: 'skills', label: 'Skills' },
  ]

  const profileImageUrl =
    profile?.profileImage ||
    (profile as any)?.profile_image ||
    (profile as any)?.profile_image_url ||
    (profile as any)?.image_url ||
    ''

  const phoneNumber = (profile as any)?.phone || ''
  const githubUrl = (profile as any)?.github || ''
  const linkedinUrl = profile?.linkedin || ''

  const contactLinks = [
    profile?.email && {
      label: 'Email',
      href: `mailto:${profile.email}`,
      external: false,
      icon: <MailIcon />,
    },
    phoneNumber && {
      label: 'Phone',
      href: `tel:${phoneNumber.replace(/\s+/g, '')}`,
      external: false,
      icon: <PhoneIcon />,
    },
    linkedinUrl && {
      label: 'LinkedIn',
      href: linkedinUrl,
      external: true,
      icon: <LinkedInIcon />,
    },
    githubUrl && {
      label: 'GitHub',
      href: githubUrl,
      external: true,
      icon: <GitHubIcon />,
    },
  ].filter(Boolean) as ContactLink[]

  return (
    <div id="top" className="relative min-h-screen overflow-hidden bg-[#F5F4EC]">
      {/* Abstract Background Shapes */}
      <div className="bg-blob-top-left" />
      <div className="bg-blob-bottom-left" />
      <div className="bg-blob-right-dark hidden lg:block" />

      <Nav name={profile.name} />

      {/* Hero / About Me Section */}
      <section id="about" className="section-shell z-10 pt-12 md:pt-20">
        <motion.div
          className="mx-auto grid max-w-[1350px] items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Left Column: Heading & Bio */}
          <motion.div variants={staggerContainer} className="z-10">
            <motion.div variants={fadeUp} className="flex items-center gap-3">
              <span className="eyebrow">ABOUT ME</span>
              <span className="h-[2px] w-12 bg-[#323B3D]" />
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-display mt-4 text-5xl font-bold tracking-tight text-[#323B3D] sm:text-6xl lg:text-7xl"
            >
              {profile.name}
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-2xl text-base leading-relaxed text-[#323B3D]/80 sm:text-lg"
            >
              {profile.bio}
            </motion.p>

            <motion.div variants={fadeUp} className="mt-9 flex flex-wrap items-center gap-4">
              {profile.cvUrl && (
                <a
                  href={profile.cvUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="primary-button"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  Download CV
                </a>
              )}

              <a href="#projects" className="secondary-button">
                Explore Portfolio
                <span className="text-lg">→</span>
              </a>
            </motion.div>
          </motion.div>

          {/* Right Column: Circle Frame & Palette Dots */}
          <motion.div variants={fadeUp} className="relative z-10 mx-auto flex items-center justify-center">
            {/* Color Palette Indicators */}
            <div className="absolute -right-8 top-1/2 hidden -translate-y-1/2 flex-col gap-3.5 lg:flex">
              <span className="h-4 w-4 rounded-full bg-[#C1D3DE] shadow-sm" />
              <span className="h-4 w-4 rounded-full bg-[#72897A] shadow-sm" />
              <span className="h-4 w-4 rounded-full bg-[#A1B2A7] shadow-sm" />
              <span className="h-4 w-4 rounded-full bg-[#323B3D] shadow-sm" />
            </div>

            <div className="relative flex h-80 w-80 items-end justify-center sm:h-[420px] sm:w-[420px]">
              {/* Circular Border Container */}
              <div
                className="absolute bottom-0 flex h-72 w-72 items-end justify-center overflow-hidden rounded-full border-2 border-[#323B3D] bg-[#F5F4EC] shadow-2xl sm:h-96 sm:w-96"
              >
                <div className="mb-4 text-center font-mono text-xs font-semibold uppercase tracking-wider text-[#323B3D]">
                  Assignment
                </div>
              </div>

              {/* Profile Image Overflow */}
              {profileImageUrl && profileImageUrl.trim() !== '' && !imgError ? (
                <img
                  src={profileImageUrl}
                  alt={profile.name || 'Profile'}
                  onError={() => setImgError(true)}
                  className="relative z-10 max-h-[118%] w-auto object-bottom transition-transform duration-300 hover:scale-105"
                />
              ) : (
                <div
                  className="relative z-10 flex h-full w-full items-center justify-center p-6 text-center font-mono text-xs text-[#72897A]"
                >
                  <span>No Profile Image Found in Admin</span>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Education Section (Borderless / Plain Flat Layout) */}
      <section id="education" className="section-shell z-10 my-10">
        <motion.div
          className="mx-auto grid max-w-[1350px] items-center gap-12 lg:grid-cols-2"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
        >
          <motion.div variants={fadeUp}>
            <p className="eyebrow">EDUCATION</p>

            <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-[#323B3D] sm:text-4xl">
              {primaryEducation?.degree || 'Academic Background'}
            </h2>

            <p className="mt-4 text-base leading-relaxed text-[#323B3D]/80">
              {primaryEducation?.institution ||
                'Education details will appear here once added from the admin panel.'}
            </p>

            {primaryEducation && (primaryEducation.startDate || primaryEducation.endDate) && (
              <p className="mt-4 font-mono text-sm font-semibold text-[#72897A]">
                {primaryEducation.startDate || '—'} – {primaryEducation.endDate || 'Present'}
              </p>
            )}
          </motion.div>

          <motion.div variants={fadeUp} className="relative mx-auto w-full max-w-md">
            <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border border-[#A1B2A7]/40 bg-white/40 p-8 shadow-sm">
              {eduLogoUrl && eduLogoUrl.trim() !== '' && !eduImgError ? (
                <img
                  src={eduLogoUrl}
                  alt={primaryEducation?.institution || 'Institution logo'}
                  onError={() => setEduImgError(true)}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="p-6 text-center font-mono text-xs text-[#72897A]">
                  <span>No Education Logo Found in Admin</span>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Portfolio Showcase Section */}
      <section id="projects" className="section-shell z-10">
        <div className="mx-auto max-w-[1350px]">
          <motion.div
            className="text-center"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.4 }}
          >
            <h2 className="font-display text-3xl font-bold tracking-tight text-[#323B3D] sm:text-4xl">
              Portfolio Showcase
            </h2>
          </motion.div>

          <motion.div
            className="mt-8 flex justify-center"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.4 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-[#A1B2A7] bg-white/80 p-1.5 shadow-sm backdrop-blur-md">
              {tabs.map((tab) => {
                const selected = activeTab === tab.id

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className="rounded-full px-6 py-2 text-sm font-medium transition-all duration-200"
                    style={
                      selected
                        ? { backgroundColor: '#72897A', color: '#ffffff' }
                        : { color: '#323B3D' }
                    }
                    aria-pressed={selected}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </motion.div>

          <div className="mt-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -12 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: 'easeInOut' }}
              >
                {activeTab === 'projects' && <ProjectsGrid projects={projects} />}

                {activeTab === 'certificates' && (
                  <CertificatesSection
                    certificates={certificates}
                    fadeUp={fadeUp}
                    staggerContainer={staggerContainer}
                  />
                )}

                {activeTab === 'skills' && (
                  <motion.div
                    className="flex flex-wrap items-center justify-center gap-4"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    {skills.map((skill) => (
                      <motion.div
                        key={skill.id}
                        variants={fadeUp}
                        whileHover={{ y: -6, scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                        className="flex aspect-square w-28 shrink-0 flex-col items-center justify-center gap-3 rounded-2xl border border-[#A1B2A7] bg-white p-4 text-center shadow-sm"
                      >
                        {skill.image_url ? (
                          <img
                            src={skill.image_url}
                            alt={skill.name}
                            className="h-10 w-10 shrink-0 object-contain"
                          />
                        ) : (
                          <span className="font-display text-xl font-bold text-[#72897A]">
                            {skill.name.charAt(0).toUpperCase()}
                          </span>
                        )}

                        <p className="w-full truncate text-xs font-medium text-[#323B3D]">
                          {skill.name}
                        </p>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      {experience.length > 0 && (
        <section id="experience" className="section-shell z-10">
          <motion.div
            className="mx-auto max-w-4xl"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
          >
            <motion.p variants={fadeUp} className="eyebrow">
              CAREER
            </motion.p>

            <motion.h2 variants={fadeUp} className="font-display mt-2 text-3xl font-bold text-[#323B3D]">
              Work Experience
            </motion.h2>

            <div className="mt-10 space-y-6">
              {experience.map((item) => (
                <motion.article
                  key={item.id}
                  variants={fadeUp}
                  className="rounded-2xl border border-[#A1B2A7] bg-white/70 p-6 shadow-sm backdrop-blur-sm"
                >
                  <h3 className="font-display text-xl font-bold text-[#323B3D]">
                    {item.position}
                  </h3>
                  <span className="mt-1 block font-mono text-xs font-semibold text-[#72897A]">
                    {item.startDate} – {item.endDate ?? 'Present'}
                  </span>
                  <p className="mt-1 text-sm text-[#323B3D]/80">{item.organization}</p>

                  {item.description.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {item.description.map((line, idx) => (
                        <li key={idx} className="flex gap-2 text-sm text-[#323B3D]/80">
                          <span className="text-[#72897A]">—</span>
                          {line}
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.article>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* Contact Section */}
      <section id="contact" className="section-shell z-10 pb-20">
        <div className="mx-auto max-w-[1350px]">
          <div className="rounded-3xl border border-[#A1B2A7] bg-[#323B3D] p-10 text-center text-[#F5F4EC] shadow-xl lg:p-16">
            <p className="font-mono text-xs font-semibold uppercase tracking-widest text-[#A1B2A7]">
              CONTACT
            </p>
            <h2 className="font-display mt-3 text-3xl font-bold sm:text-4xl">
              Let&apos;s talk data.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm text-[#C1D3DE] sm:text-base">
              Have a project, dashboard, or data problem that needs a clearer answer? Get in touch.
            </p>

            {contactLinks.length > 0 && (
              <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
                {contactLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noreferrer' : undefined}
                    aria-label={link.label}
                    title={link.label}
                    className="flex h-14 w-14 items-center justify-center rounded-full border border-[#A1B2A7]/40 bg-white/5 text-[#F5F4EC] shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#72897A] hover:bg-[#72897A] hover:text-white"
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <footer className="border-t border-[#A1B2A7] px-5 py-6 text-center text-xs text-[#72897A]">
        © {new Date().getFullYear()} {profile.name}. Built with React, Tailwind, and Supabase.
        <a href="/admin" className="ml-2 underline decoration-dotted">
          Admin
        </a>
      </footer>
    </div>
  )
}