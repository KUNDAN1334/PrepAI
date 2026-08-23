import io, os, sys

ROOT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def rd(p):
    with io.open(os.path.join(ROOT, p), encoding='utf-8') as f:
        return f.read()

def wr(p, s):
    with io.open(os.path.join(ROOT, p), 'w', encoding='utf-8', newline='\n') as f:
        f.write(s)

def sub(src, old, new, path, label):
    if old not in src:
        if new.strip() and new.strip() in src:
            print('  = %s / %s (already applied)' % (path, label)); return src
        print('  ! %s / %s NOT FOUND' % (path, label)); sys.exit(1)
    print('  + %s / %s' % (path, label))
    return src.replace(old, new, 1)

def slice_out(src, start, end, path, label):
    i = src.find(start)
    if i < 0:
        print('  = %s / %s (already applied)' % (path, label)); return src
    j = src.find(end, i)
    if j < 0:
        print('  ! %s / %s END NOT FOUND' % (path, label)); sys.exit(1)
    print('  + %s / %s' % (path, label))
    return src[:i] + src[j:]

# ---------------------------------------------------------------- Navigation
p = 'components/Navigation.tsx'; s = rd(p)
s = sub(s,
    "import MagneticLink from '@/components/landing/MagneticLink';\n",
    "import MagneticLink from '@/components/landing/MagneticLink';\n"
    "import { LogoMark, Wordmark } from '@/components/brand/Logo';\n",
    p, 'import Logo')
s = slice_out(s, '/** The PrepAI wordmark', 'export default function Navigation', p, 'drop old BrandMark')
s = sub(s,
    """        {/* Brand */}
        <Link href="/" className="group flex shrink-0 items-center gap-3 text-ink">
          <span className="transition-transform duration-300 group-hover:-rotate-6">
            <BrandMark />
          </span>
          <span className="text-[19px] font-extrabold tracking-[-0.01em]">PrepAI</span>
        </Link>""",
    """        {/* Brand */}
        <Link
          href="/"
          aria-label="PrepAI — home"
          className="group flex shrink-0 items-center gap-3 text-ink"
        >
          <span className="transition-transform duration-300 group-hover:-rotate-6">
            <LogoMark />
          </span>
          <Wordmark className="text-[19px]" />
        </Link>""",
    p, 'brand lockup')
wr(p, s)

# ----------------------------------------------------------------- AuthShell
p = 'components/auth/AuthShell.tsx'; s = rd(p)
s = sub(s, "import { BrandMark } from '@/components/Navigation';",
           "import Logo from '@/components/brand/Logo';", p, 'import Logo')
s = sub(s,
    """          <Link href="/" className="flex items-center gap-3 text-ink">
            <BrandMark />
            <span className="text-xl font-extrabold tracking-[-0.01em]">PrepAI</span>
          </Link>""",
    """          <Link href="/" aria-label="PrepAI — home" className="text-ink">
            <Logo size="lg" />
          </Link>""",
    p, 'auth lockup')
wr(p, s)

# ------------------------------------------------------------------- landing
p = 'app/page.tsx'; s = rd(p)
s = sub(s, "import Navigation, { BrandMark } from '@/components/Navigation';",
           "import Navigation from '@/components/Navigation';\n"
           "import Logo from '@/components/brand/Logo';", p, 'import Logo')
s = sub(s,
    """              <Link href="/" className="flex items-center gap-3 text-ink">
                <BrandMark />
                <span className="text-[19px] font-extrabold tracking-[-0.01em]">PrepAI</span>
              </Link>""",
    """              <Link href="/" aria-label="PrepAI — home" className="text-ink">
                <Logo />
              </Link>""",
    p, 'footer lockup')
s = sub(s, "Is Prep AI free to start?", "Is PrepAI free to start?", p, 'faq wording')
s = sub(s, "{new Date().getFullYear()} Prep AI. All rights reserved.",
           "{new Date().getFullYear()} PrepAI. All rights reserved.", p, 'copyright')
wr(p, s)

# ----------------------------------------------------------------- dashboard
p = 'app/dashboard/layout.tsx'; s = rd(p)
s = sub(s, "import Image from 'next/image';",
           "import Logo from '@/components/brand/Logo';", p, 'import Logo')
s = sub(s,
    """          <Image
              src="/logo.png"
              alt="Prep AI Logo"
              width={36}
              height={36}
              priority
              className="rounded-full"
            />
          <h1 className="text-xl font-extrabold tracking-[-0.01em]">Prep AI</h1>""",
    """          <Link href="/dashboard" aria-label="PrepAI — dashboard" className="text-ink">
            <Logo size="md" />
          </Link>""",
    p, 'topbar lockup')
s = sub(s,
    """          <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-6">
            <h1 className="text-xl font-extrabold tracking-[-0.01em]">Prep AI</h1>""",
    """          <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
            <Link
              href="/dashboard"
              aria-label="PrepAI — dashboard"
              onClick={() => setIsSidebarOpen(false)}
            >
              <Logo variant="onDark" wordmarkClassName="text-sidebar-foreground" />
            </Link>""",
    p, 'sidebar lockup')
wr(p, s)

print('patched ok')
