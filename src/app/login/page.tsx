"use client";
import { useRouter } from 'next/navigation';
import AuthForm from '../../components/AuthForm';
import { setToken } from '../../utils/auth';

export default function LoginPage() {
  const router = useRouter();
  async function handleLogin(email: string, password: string) {
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (res.ok) {
      const data = await res.json();
      setToken(data.token);
      router.push('/');
    } else {
      alert('Invalid credentials');
    }
  }
  return <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-100 to-green-100"><AuthForm onSubmit={handleLogin} type="login" /></div>;
} 