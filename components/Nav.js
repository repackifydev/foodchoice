'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const routes = [
  { href: '/', name: 'Home' },
  { href: '/spin', name: 'Wheel' },
  { href: '/swipe', name: 'Swipe' },
  { href: '/bracket', name: 'Bracket' },
  { href: '/slots', name: 'Slots' },
  { href: '/quiz', name: 'Quiz' },
  { href: '/mood', name: 'Mood' },
  { href: '/budget', name: 'Budget' },
  { href: '/vote', name: 'Vote' },
  { href: '/8ball', name: '8-Ball' },
  { href: '/dice', name: 'Dice' },
  { href: '/random', name: 'Random' },
  { href: '/map', name: 'Map' },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="nav">
      <Link className="nav-logo" href="/">
        <svg className="logo-icon" width="32" height="32" viewBox="0 0 32 32" fill="none">
          <defs>
            <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ff6b35"/>
              <stop offset="1" stopColor="#f7c948"/>
            </linearGradient>
          </defs>
          <rect width="32" height="32" rx="8" fill="url(#logo-grad)"/>
          <path d="M11 8v16M16 8v11a5 5 0 0010 0V8M21 8v11" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        </svg>
        <span>Repackify Lunch</span>
      </Link>
      <button className="nav-menu-btn" onClick={() => setOpen(!open)}>Menu</button>
      <div className={`nav-links${open ? ' open' : ''}`}>
        {routes.map(r => (
          <Link
            key={r.href}
            href={r.href}
            className={`nav-link${pathname === r.href ? ' active' : ''}`}
            onClick={() => setOpen(false)}
          >
            {r.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}
