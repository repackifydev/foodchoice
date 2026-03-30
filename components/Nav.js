'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const routes = [
  { href: '/', name: 'Home' },
  { href: '/spin', name: 'Spin the Wheel' },
  { href: '/swipe', name: 'Swipe Right' },
  { href: '/bracket', name: 'Tournament' },
  { href: '/slots', name: 'Slot Machine' },
  { href: '/quiz', name: 'Personality Quiz' },
  { href: '/mood', name: 'Mood Picker' },
  { href: '/budget', name: 'Budget Slider' },
  { href: '/vote', name: 'Team Vote' },
  { href: '/8ball', name: 'Magic 8-Ball' },
  { href: '/dice', name: 'Dice Roll' },
  { href: '/random', name: 'Quick Random' },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <nav className="nav">
      <Link className="nav-logo" href="/" onClick={() => setOpen(false)}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <defs>
            <linearGradient id="lg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ff6b35"/><stop offset="1" stopColor="#f7c948"/>
            </linearGradient>
          </defs>
          <rect width="32" height="32" rx="8" fill="url(#lg)"/>
          <path d="M11 8v16M16 8v11a5 5 0 0010 0V8M21 8v11" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        </svg>
        <span>Repackify Lunch</span>
      </Link>

      <div ref={menuRef} style={{ position: 'relative' }}>
        <button
          className="nav-menu-toggle"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
        >
          <span>{open ? 'Close' : 'Menu'}</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: '0.2s' }}>
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {open && (
          <div className="nav-dropdown">
            {routes.map(r => (
              <Link
                key={r.href}
                href={r.href}
                className={`nav-dropdown-item${pathname === r.href ? ' active' : ''}`}
                onClick={() => setOpen(false)}
              >
                {r.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
