import Link from 'next/link';
import type { ReactNode } from 'react';
import { logoutAction } from '@/app/actions/auth';
import type { SupportUser } from '@/lib/support-auth';

const navigation = [
  { href: '/', key: 'overview', label: 'Overview', icon: '⌂' },
  { href: '/questions', key: 'questions', label: 'Question bank', icon: 'Q' },
  { href: '/reviews', key: 'reviews', label: 'Review queue', icon: '✓' },
  { href: '/publishing', key: 'publishing', label: 'Publishing', icon: '↗' },
  { href: '/discussions', key: 'discussions', label: 'Discussions', icon: '◌' },
  { href: '/analytics', key: 'analytics', label: 'Analytics', icon: '▥' },
  { href: '/system', key: 'system', label: 'System health', icon: '⚙' },
];

type Props = {
  active: string;
  title: string;
  subtitle: string;
  user: SupportUser;
  children: ReactNode;
  headerActions?: ReactNode;
};

export function AdminShell({ active, title, subtitle, user, children, headerActions }: Props) {
  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">EB</div>
          <div><strong>Exam Bank</strong><span>Admin Command Centre</span></div>
        </div>
        <nav className="side-nav" aria-label="Admin navigation">
          {navigation.map((item) => (
            <Link key={item.key} href={item.href} className={active === item.key ? 'nav-link active' : 'nav-link'}>
              <span className="nav-icon">{item.icon}</span><span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="admin-avatar">{user.display_name.slice(0, 1).toUpperCase()}</div>
          <div className="admin-identity"><strong>{user.display_name}</strong><span>{user.role}</span></div>
          <form action={logoutAction}><button className="icon-button" type="submit" title="Sign out">↪</button></form>
        </div>
      </aside>

      <main className="admin-main">
        <header className="page-header">
          <div><p className="eyebrow">Exam Platform V2 · Admin only</p><h1>{title}</h1><p>{subtitle}</p></div>
          <div className="header-actions"><span className="live-chip"><i /> Live Exam Bank</span>{headerActions}</div>
        </header>
        {user.must_change_password ? <div className="notice warning"><strong>Security action:</strong> this admin account is marked for a password change.</div> : null}
        {children}
      </main>
    </div>
  );
}

export function StatCard({ label, value, hint, tone = 'neutral' }: { label: string; value: number | string; hint?: string; tone?: 'neutral' | 'good' | 'warn' | 'danger' }) {
  return <article className={`stat-card tone-${tone}`}><span>{label}</span><strong>{typeof value === 'number' ? value.toLocaleString() : value}</strong>{hint ? <small>{hint}</small> : null}</article>;
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="empty-state">{children}</div>;
}
