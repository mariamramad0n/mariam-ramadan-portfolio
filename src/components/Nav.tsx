import { useEffect, useState } from 'react'
import ThemeToggle from './ThemeToggle'

const links = [
  { href: '#about', label: 'About', id: 'about' },
  { href: '#education', label: 'Education', id: 'education' },
  { href: '#projects', label: 'Projects', id: 'projects', tab: 'projects' as const },
  { href: '#projects', label: 'Certificates', id: 'projects', tab: 'certificates' as const },
  { href: '#projects', label: 'Skills', id: 'projects', tab: 'skills' as const },
  { href: '#experience', label: 'Experience', id: 'experience' },
  { href: '#contact', label: 'Contact', id: 'contact' },
]

export default function Nav({ name }: { name: string }) {
  const [open, setOpen] = useState(false)
  const [activeId, setActiveId] = useState('about')
  const [activeTab, setActiveTab] = useState('projects')

  // بيتابع أنهي تاب (Projects/Certificates/Skills) شغال دلوقتي جوه قسم الـ Portfolio
  // عشان الرابط الصح يهايلايت، سواء التاب اتغير من هنا أو من الأزرار جوه الصفحة نفسها
  useEffect(() => {
    function handleTabChanged(event: Event) {
      const tab = (event as CustomEvent<string>).detail
      if (tab) setActiveTab(tab)
    }

    window.addEventListener('portfolio-tab-changed', handleTabChanged)
    return () => window.removeEventListener('portfolio-tab-changed', handleTabChanged)
  }, [])

  function handleLinkClick(link: (typeof links)[number]) {
    setOpen(false)

    if (link.tab) {
      window.dispatchEvent(new CustomEvent('portfolio-tab-select', { detail: link.tab }))
    }
  }

  // Scroll-spy: بيحدد آلياً أنهي قسم ظاهر دلوقتي عشان يهايلايت الرابط بتاعه
  // بيقارن موقع كل قسم بالنسبة لأعلى الشاشة بدل الاعتماد على منطقة كشف ضيقة
  // (الطريقة القديمة كانت بتفوّت الأقسام القصيرة زي Education لو السكرول كان سريع)
  useEffect(() => {
    const sectionIds = links.map((link) => link.id)
    const offset = 160 // تقريباً ارتفاع الـ nav + هامش بسيط

    function updateActiveSection() {
      // لو وصلنا لآخر نقطة ممكنة في الصفحة، خلي الهايلايت على آخر قسم (Contact) على طول
      // ده بيحل مشكلة إن آخر قسم لو كان قصير، المتصفح مش بيقدر يكمل سكرول لحد ما يوصل للـ offset المحسوب
      const distanceToBottom =
        document.documentElement.scrollHeight - (window.scrollY + window.innerHeight)

      if (distanceToBottom < 4) {
        setActiveId(sectionIds[sectionIds.length - 1])
        return
      }

      let current = sectionIds[0]

      for (const id of sectionIds) {
        const el = document.getElementById(id)
        if (!el) continue

        const top = el.getBoundingClientRect().top

        if (top - offset <= 0) {
          current = id
        }
      }

      setActiveId(current)
    }

    updateActiveSection()

    window.addEventListener('scroll', updateActiveSection, { passive: true })
    window.addEventListener('resize', updateActiveSection)

    return () => {
      window.removeEventListener('scroll', updateActiveSection)
      window.removeEventListener('resize', updateActiveSection)
    }
  }, [])

  const pillSurface = {
    borderColor: 'var(--border)',
    backgroundColor: 'color-mix(in srgb, var(--surface) 75%, transparent)',
    boxShadow: 'var(--shadow)',
  }

  return (
    <header className="sticky top-0 z-40 px-4 pb-2 pt-4 sm:px-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        {/* LOGO */}
        <a
          href="#about"
          className="font-display shrink-0 rounded-full border px-4 py-2.5 text-base font-semibold tracking-tight backdrop-blur-md sm:text-lg"
          style={{ ...pillSurface, color: 'var(--accent)' }}
        >
          {name}
        </a>

        {/* DESKTOP PILL NAV */}
        <nav
          className="hidden items-center gap-1 rounded-full border p-1.5 backdrop-blur-md md:flex"
          style={pillSurface}
        >
          {links.map((link) => {
            const isActive = link.tab
              ? activeId === link.id && activeTab === link.tab
              : activeId === link.id

            return (
              <a
                key={`${link.href}-${link.label}`}
                href={link.href}
                onClick={() => handleLinkClick(link)}
                className="rounded-full px-4 py-2 text-sm font-medium transition-all duration-200"
                style={
                  isActive
                    ? { backgroundColor: 'var(--accent)', color: '#fff' }
                    : { color: 'var(--text-muted)' }
                }
              >
                {link.label}
              </a>
            )
          })}
        </nav>

        {/* RIGHT SIDE: THEME TOGGLE + MOBILE BUTTON */}
        <div className="flex shrink-0 items-center gap-2">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-md"
            style={pillSurface}
          >
            <ThemeToggle />
          </div>

          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-md md:hidden"
            style={{ ...pillSurface, color: 'var(--text)' }}
            onClick={() => setOpen((value) => !value)}
            aria-label="Open menu"
            aria-expanded={open}
          >
            {open ? '×' : '☰'}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <nav
          className="mx-auto mt-3 flex max-w-6xl flex-col gap-1 rounded-3xl border p-3 backdrop-blur-md md:hidden"
          style={pillSurface}
        >
          {links.map((link) => {
            const isActive = link.tab
              ? activeId === link.id && activeTab === link.tab
              : activeId === link.id

            return (
              <a
                key={`${link.href}-${link.label}`}
                href={link.href}
                onClick={() => handleLinkClick(link)}
                className="rounded-2xl px-4 py-2.5 text-sm font-medium"
                style={
                  isActive
                    ? { backgroundColor: 'var(--accent)', color: '#fff' }
                    : { color: 'var(--text)' }
                }
              >
                {link.label}
              </a>
            )
          })}
        </nav>
      )}
    </header>
  )
}