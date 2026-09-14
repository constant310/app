import { redirect } from 'next/navigation';
import { loginAction } from '@/app/actions/auth';
import { getSupportSession } from '@/lib/support-auth';

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{ error?: string }>;
};

const errorMessages: Record<string, string> = {
  missing: 'Enter both your username and password.',
  invalid: 'The username or password is not correct.',
  rate: 'Too many failed attempts. Try again in about 10 minutes.',
};

export default async function LoginPage({ searchParams }: Props) {
  if (await getSupportSession()) redirect('/');
  const params = await searchParams;
  const message = params.error ? errorMessages[params.error] : '';

  return (
    <main className="login-shell">
      <section className="login-card">
        <p className="eyebrow">Exam Platform V2</p>
        <h1>Admin sign in</h1>
        <p className="login-copy">
          Use your existing Exam Bank support/admin account. Sessions are stored securely in an HTTP-only cookie.
        </p>

        {message ? <div className="login-error">{message}</div> : null}

        <form action={loginAction} className="login-form">
          <label>
            <span>Username</span>
            <input name="username" autoComplete="username" defaultValue="admin" required />
          </label>
          <label>
            <span>Password</span>
            <input name="password" type="password" autoComplete="current-password" required />
          </label>
          <button type="submit">Sign in</button>
        </form>
      </section>
    </main>
  );
}
