import { useEffect, useRef, useState } from 'react'
import { Menu, X } from 'lucide-react'
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
  onOpenInfo: (section: string) => void
}

function Navigation({ onOpenContact, onOpenInfo }: NavigationProps) {
  const links = ['Проекты', 'Каталог', 'Дизайнерам', 'Цены', '3D-тур']
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="fixed left-0 right-0 top-0 z-[100] flex items-center justify-between p-4 sm:p-5" aria-label="Основная навигация">
      <a href="#top" className="flex items-center rounded-full border border-white/20 bg-black/65 px-3.5 py-2 shadow-lg backdrop-blur-md" aria-label="Komod Pavlodar — главная">
        <BrandIcon />
        <span className="ml-2 text-base font-bold uppercase tracking-[-0.025em] text-white drop-shadow-sm sm:text-xl">Komod <span className="font-playfair ml-0.5 font-medium normal-case italic text-white">Pavlodar</span></span>
      </a>

      <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2 py-2 backdrop-blur-md md:flex">
        {links.map((link, index) => (
          <button
            key={link}
            type="button"
            onClick={() => onOpenInfo(link)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              index === 0
                ? 'bg-white text-neutral-900'
                : 'text-white/80 hover:bg-white/20 hover:text-white'
            }`}
          >
            {link}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onOpenContact}
        className="hidden rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-200 md:block"
      >
        Рассчитать для нас
      </button>
      <button onClick={() => setIsMenuOpen((open) => !open)} type="button" className="rounded-full border border-white/25 bg-black/50 p-2 text-white backdrop-blur-md md:hidden" aria-expanded={isMenuOpen} aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}>
        {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>
      {isMenuOpen ? (
        <div className="absolute left-4 right-4 top-[72px] flex flex-col gap-1 rounded-2xl border border-white/15 bg-neutral-950/95 p-2 shadow-2xl backdrop-blur-xl md:hidden">
          {links.map((link) => (
            <button key={link} type="button" onClick={() => { onOpenInfo(link); setIsMenuOpen(false) }} className="rounded-xl px-4 py-3 text-left text-sm font-medium text-white hover:bg-white/10">{link}</button>
          ))}
          <button type="button" onClick={() => { onOpenContact(); setIsMenuOpen(false) }} className="mt-1 rounded-xl bg-[#8B7355] px-4 py-3 text-left text-sm font-semibold text-white">Рассчитать для нас</button>
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
  const [dialog, setDialog] = useState<'contact' | 'info' | null>(null)
  const [infoTitle, setInfoTitle] = useState('')

  const openInfo = (section: string) => {
    setInfoTitle(section)
    setDialog('info')
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

  return (
    <main
      className="min-h-screen bg-neutral-900 tracking-[-0.02em]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <Navigation onOpenContact={() => setDialog('contact')} onOpenInfo={openInfo} />
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
            onClick={() => setDialog('contact')}
            className="rounded-full bg-[#8B7355] px-7 py-3 text-sm font-medium text-white transition-all hover:scale-[1.03] hover:bg-[#705c44] hover:shadow-lg hover:shadow-[#8B7355]/40 active:scale-95"
          >
            Рассчитать для нас
          </button>
        </div>
      </section>

      {dialog ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm" role="presentation" onMouseDown={closeDialog}>
          <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-neutral-900 p-6 text-white shadow-2xl sm:p-8" role="dialog" aria-modal="true" aria-labelledby="dialog-title" onMouseDown={(event) => event.stopPropagation()}>
            <button type="button" onClick={closeDialog} className="absolute right-4 top-4 rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white" aria-label="Закрыть окно"><X size={20} /></button>
            {dialog === 'contact' ? (
              <>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#bca17d]">Komod Pavlodar</p>
                <h2 id="dialog-title" className="mb-3 text-3xl font-semibold tracking-[-0.04em]">Рассчитаем ваш проект</h2>
                <p className="mb-6 text-sm leading-relaxed text-white/65">Оставьте номер телефона — свяжемся с вами, уточним задачу и подготовим предварительный расчёт.</p>
                <form onSubmit={(event) => { event.preventDefault(); alert('Спасибо! Заявка принята.'); closeDialog() }} className="space-y-3">
                  <label className="block"><span className="sr-only">Ваше имя</span><input required name="name" placeholder="Ваше имя" className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 outline-none transition-colors placeholder:text-white/35 focus:border-[#bca17d]" /></label>
                  <label className="block"><span className="sr-only">Номер телефона</span><input required name="phone" type="tel" placeholder="+7 (___) ___-__-__" className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 outline-none transition-colors placeholder:text-white/35 focus:border-[#bca17d]" /></label>
                  <button type="submit" className="w-full rounded-xl bg-[#8B7355] px-5 py-3.5 text-sm font-semibold transition-colors hover:bg-[#705c44]">Получить расчёт</button>
                </form>
              </>
            ) : (
              <>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#bca17d]">Komod Pavlodar</p>
                <h2 id="dialog-title" className="mb-3 text-3xl font-semibold tracking-[-0.04em]">{infoTitle}</h2>
                <p className="text-sm leading-relaxed text-white/65">Раздел находится в разработке. Оставьте заявку — мы расскажем подробнее и подготовим информацию по вашему проекту.</p>
                <button type="button" onClick={() => setDialog('contact')} className="mt-6 w-full rounded-xl bg-[#8B7355] px-5 py-3.5 text-sm font-semibold transition-colors hover:bg-[#705c44]">Рассчитать для нас</button>
              </>
            )}
          </div>
        </div>
      ) : null}
    </main>
  )
}
