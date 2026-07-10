import { useEffect, useRef, useState } from 'react'
import { Camera, Menu, X } from 'lucide-react'
import emptyRoomImage from '../assets/room-empty.jpg'
import furnishedRoomImage from '../assets/room-furnished.jpg'

const SPOTLIGHT_R = 300
const BG_IMAGE_1 = emptyRoomImage
const BG_IMAGE_2 = furnishedRoomImage

type Point = { x: number; y: number }

type RevealLayerProps = {
  image: string
  cursorX: number
  cursorY: number
}

function RevealLayer({ image, cursorX, cursorY }: RevealLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const revealRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const reveal = revealRef.current
    if (!canvas || !reveal) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const reveal = revealRef.current
    if (!canvas || !reveal) return

    const context = canvas.getContext('2d')
    if (!context) return

    context.clearRect(0, 0, canvas.width, canvas.height)
    const gradient = context.createRadialGradient(
      cursorX,
      cursorY,
      0,
      cursorX,
      cursorY,
      SPOTLIGHT_R,
    )
    gradient.addColorStop(0, 'rgba(255,255,255,1)')
    gradient.addColorStop(0.4, 'rgba(255,255,255,1)')
    gradient.addColorStop(0.6, 'rgba(255,255,255,0.75)')
    gradient.addColorStop(0.75, 'rgba(255,255,255,0.4)')
    gradient.addColorStop(0.88, 'rgba(255,255,255,0.12)')
    gradient.addColorStop(1, 'rgba(255,255,255,0)')

    context.fillStyle = gradient
    context.beginPath()
    context.arc(cursorX, cursorY, SPOTLIGHT_R, 0, Math.PI * 2)
    context.fill()

    const mask = `url(${canvas.toDataURL()})`
    reveal.style.maskImage = mask
    reveal.style.webkitMaskImage = mask
  })

  return (
    <>
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0"
        style={{ display: 'none' }}
        aria-hidden="true"
      />
      <div
        ref={revealRef}
        className="pointer-events-none absolute inset-0 z-30 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${image})`,
          maskSize: '100% 100%',
          WebkitMaskSize: '100% 100%',
        }}
        aria-hidden="true"
      />
    </>
  )
}

function BrandIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <path
        fill="#ffffff"
        d="M4 13.2 13 4l9 9.2v8.3a.5.5 0 0 1-.5.5h-5.1v-6.7H9.6V22H4.5a.5.5 0 0 1-.5-.5v-8.3Zm6.5-5.1h5v4.4h-5V8.1Z"
      />
    </svg>
  )
}

type NavigationProps = {
  onOpenContact: () => void
}

function Navigation({ onOpenContact }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="fixed left-0 right-0 top-0 z-[100] flex items-center justify-between p-4 sm:p-5" aria-label="Основная навигация">
      <a href="#top" className="flex items-center rounded-full border border-white/20 bg-black/65 px-3.5 py-2 shadow-lg backdrop-blur-md" aria-label="Komod Pavlodar — главная">
        <BrandIcon />
        <span className="ml-2 text-base font-bold uppercase tracking-[-0.025em] text-white drop-shadow-sm sm:text-xl">Komod <span className="font-playfair ml-0.5 font-medium normal-case italic text-white">Pavlodar</span></span>
      </a>

      <div className="ml-auto hidden items-center gap-2 md:flex">
        <a href="https://www.instagram.com/komod_pavlodar/" target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full border border-white/20 bg-black/35 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-md transition-colors hover:bg-white/15" aria-label="Instagram Komod Pavlodar">
          <Camera size={17} />
          <span>@komod_pavlodar</span>
        </a>
        <button
          type="button"
          onClick={onOpenContact}
          className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-neutral-900 transition-all hover:scale-[1.02] hover:bg-neutral-200 active:scale-95"
        >
          Оставить заявку
        </button>
      </div>
      <button onClick={() => setIsMenuOpen((open) => !open)} type="button" className="rounded-full border border-white/25 bg-black/50 p-2 text-white backdrop-blur-md md:hidden" aria-expanded={isMenuOpen} aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}>
        {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>
      {isMenuOpen ? (
        <div className="nav-menu-in absolute left-4 right-4 top-[72px] flex flex-col gap-2 rounded-2xl border border-white/15 bg-neutral-950/95 p-3 shadow-2xl backdrop-blur-xl md:hidden">
          <a href="https://www.instagram.com/komod_pavlodar/" target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white hover:bg-white/10"><Camera size={18} />@komod_pavlodar</a>
          <button type="button" onClick={() => { onOpenContact(); setIsMenuOpen(false) }} className="rounded-xl bg-[#8B7355] px-4 py-3 text-left text-sm font-semibold text-white">Оставить заявку</button>
        </div>
      ) : null}
    </nav>
  )
}

export default function App() {
  const mouse = useRef<Point>({ x: -999, y: -999 })
  const smooth = useRef<Point>({ x: -999, y: -999 })
  const rafRef = useRef<number | undefined>(undefined)
  const [cursorPos, setCursorPos] = useState<Point>({ x: -999, y: -999 })
  const [dialog, setDialog] = useState<'contact' | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const openContact = () => {
    setIsSubmitted(false)
    setDialog('contact')
  }

  const closeDialog = () => setDialog(null)

  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      mouse.current.x = event.clientX
      mouse.current.y = event.clientY
    }

    const animate = () => {
      const nextX = smooth.current.x + (mouse.current.x - smooth.current.x) * 0.1
      const nextY = smooth.current.y + (mouse.current.y - smooth.current.y) * 0.1
      smooth.current.x = nextX
      smooth.current.y = nextY
      setCursorPos((previous) => {
        if (Math.abs(previous.x - nextX) < 0.05 && Math.abs(previous.y - nextY) < 0.05) return previous
        return { x: nextX, y: nextY }
      })
      rafRef.current = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  useEffect(() => {
    if (!dialog) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeDialog()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [dialog])

  return (
    <main
      className="min-h-screen bg-neutral-900 tracking-[-0.02em]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <Navigation onOpenContact={openContact} />
      <section
        id="top"
        className="relative h-screen w-full overflow-hidden bg-black"
        style={{ height: '100dvh' }}
      >
        <div
          className="hero-zoom absolute inset-0 z-10 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${BG_IMAGE_1})` }}
          aria-hidden="true"
        />

        <RevealLayer image={BG_IMAGE_2} cursorX={cursorPos.x} cursorY={cursorPos.y} />

        <div className="pointer-events-none absolute left-0 right-0 top-[14%] z-50 flex flex-col items-center px-5 text-center">
          <h1 className="leading-[0.95] text-white">
            <span
              className="hero-anim hero-reveal font-playfair block text-5xl font-normal italic drop-shadow-lg sm:text-7xl md:text-8xl"
              style={{ letterSpacing: '-0.05em', animationDelay: '0.25s' }}
            >
              Раскройте
            </span>
            <span
              className="hero-anim hero-reveal -mt-1 block text-5xl font-normal drop-shadow-lg sm:text-7xl md:text-8xl"
              style={{ letterSpacing: '-0.08em', animationDelay: '0.42s' }}
            >
              потенциал
            </span>
          </h1>
        </div>

        <div
          className="hero-anim hero-fade absolute bottom-10 left-5 right-5 z-50 flex max-w-full flex-col items-start gap-4 drop-shadow-md sm:bottom-24 sm:left-auto sm:right-10 sm:max-w-[280px] sm:gap-5 md:right-14"
          style={{ animationDelay: '0.85s' }}
        >
          <p className="text-xs leading-relaxed text-white/90 sm:text-sm">
            Проектируем и производим кухни, шкафы и мебель для всего дома в Павлодаре. Покажем будущий интерьер, подберём материалы и рассчитаем стоимость.
          </p>
          <button
            type="button"
            onClick={openContact}
            className="rounded-full bg-[#8B7355] px-7 py-3 text-sm font-medium text-white transition-all hover:scale-[1.03] hover:bg-[#705c44] hover:shadow-lg hover:shadow-[#8B7355]/40 active:scale-95"
          >
            Оставить заявку
          </button>
        </div>
      </section>

      {dialog ? (
        <div className="modal-backdrop fixed inset-0 z-[200] flex items-center justify-center bg-[#171410]/65 p-5 backdrop-blur-md" role="presentation" onMouseDown={closeDialog}>
          <div className="modal-card relative w-full max-w-[460px] overflow-hidden rounded-[2rem] border border-[#d8cbb9] bg-[#f3eee6] p-7 text-[#29251f] shadow-[0_30px_100px_rgba(0,0,0,.35)] sm:p-10" role="dialog" aria-modal="true" aria-labelledby="dialog-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-[#c7ad87]/30 blur-3xl" />
            <button type="button" onClick={closeDialog} className="absolute right-5 top-5 rounded-full border border-[#d8cbb9] bg-white/50 p-2 text-[#635c52] transition-all hover:rotate-90 hover:bg-white hover:text-[#29251f]" aria-label="Закрыть окно"><X size={19} /></button>
            {isSubmitted ? (
              <div className="success-in py-8 text-center">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#8B7355] text-2xl text-white">✓</div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8B7355]">Заявка отправлена</p>
                <h2 id="dialog-title" className="font-playfair mb-3 text-4xl italic tracking-[-0.04em]">Спасибо!</h2>
                <p className="mx-auto max-w-xs text-sm leading-relaxed text-[#6f675c]">Мы свяжемся с вами в ближайшее время и обсудим будущий проект.</p>
                <button type="button" onClick={closeDialog} className="mt-7 rounded-full bg-[#29251f] px-7 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-95">Хорошо</button>
              </div>
            ) : (
              <>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#8B7355]">Komod Pavlodar · мебель на заказ</p>
                <h2 id="dialog-title" className="font-playfair mb-3 max-w-sm text-4xl italic leading-[1.05] tracking-[-0.04em] sm:text-5xl">Давайте создадим ваш интерьер</h2>
                <p className="mb-7 max-w-sm text-sm leading-relaxed text-[#6f675c]">Расскажите, как к вам обращаться и оставьте номер. Мы зададим несколько вопросов и подготовим предварительный расчёт.</p>
                <form onSubmit={(event) => { event.preventDefault(); setIsSubmitted(true) }} className="space-y-3">
                  <label className="block"><span className="mb-1.5 block text-xs font-semibold text-[#595247]">Ваше имя</span><input autoFocus required name="name" autoComplete="name" placeholder="Например, Алия" className="w-full rounded-2xl border border-[#d8cbb9] bg-white/65 px-4 py-3.5 text-[#29251f] outline-none transition-all placeholder:text-[#9e9588] focus:border-[#8B7355] focus:bg-white focus:ring-4 focus:ring-[#8B7355]/10" /></label>
                  <label className="block"><span className="mb-1.5 block text-xs font-semibold text-[#595247]">Номер телефона</span><input required name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="+7 (___) ___-__-__" className="w-full rounded-2xl border border-[#d8cbb9] bg-white/65 px-4 py-3.5 text-[#29251f] outline-none transition-all placeholder:text-[#9e9588] focus:border-[#8B7355] focus:bg-white focus:ring-4 focus:ring-[#8B7355]/10" /></label>
                  <button type="submit" className="mt-2 w-full rounded-2xl bg-[#8B7355] px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-[#8B7355]/20 transition-all hover:-translate-y-0.5 hover:bg-[#705c44] hover:shadow-xl active:translate-y-0">Отправить заявку</button>
                </form>
                <div className="mt-5 flex items-center justify-center gap-2 text-xs text-[#7c7469]">
                  <span>или напишите нам</span>
                  <a href="https://www.instagram.com/komod_pavlodar/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-[#8B7355] hover:text-[#705c44]"><Camera size={14} />@komod_pavlodar</a>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </main>
  )
}
