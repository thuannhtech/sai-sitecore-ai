import Link from 'next/link';
import { activateAccountFromToken } from 'src/lib/auth/activation';

type ActivationPageProps = {
  searchParams: Promise<{ token?: string }>;
};

const cardStyle = {
  maxWidth: '640px',
  margin: '64px auto',
  padding: '32px',
  borderRadius: '16px',
  border: '1px solid #d9e2ec',
  background: '#ffffff',
  boxShadow: '0 20px 60px rgba(15, 23, 42, 0.08)',
  fontFamily: 'var(--font-roboto), Arial, sans-serif',
};

const titleStyle = {
  margin: '0 0 16px',
  fontSize: '28px',
  lineHeight: '34px',
  color: '#102a43',
};

const bodyStyle = {
  margin: '0 0 16px',
  fontSize: '16px',
  lineHeight: '24px',
  color: '#334e68',
};

const linkStyle = {
  color: '#1965e1',
  fontWeight: 700,
  textDecoration: 'none',
};

export default async function ActivationPage({ searchParams }: ActivationPageProps) {
  const resolvedSearchParams = await searchParams;
  const token = resolvedSearchParams.token || '';

  if (!token) {
    return (
      <main style={cardStyle}>
        <h1 style={titleStyle}>Invalid activation link</h1>
        <p style={bodyStyle}>The activation token is missing.</p>
      </main>
    );
  }

  try {
    const result = await activateAccountFromToken(token);
    const message = result.alreadyActive
      ? 'This account was already active. You can sign in now.'
      : 'Your account has been activated successfully. You can sign in now.';

    return (
      <main style={cardStyle}>
        <h1 style={titleStyle}>Account activated</h1>
        <p style={bodyStyle}>{message}</p>
        <p style={bodyStyle}>
          Account: <strong>{result.email}</strong>
        </p>
        <Link href="/" style={linkStyle}>
          Go to homepage
        </Link>
      </main>
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error && error.message ? error.message : 'Failed to activate account';

    return (
      <main style={cardStyle}>
        <h1 style={titleStyle}>Activation failed</h1>
        <p style={bodyStyle}>{message}</p>
      </main>
    );
  }
}
