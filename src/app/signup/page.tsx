"use client";
import { useRouter } from 'next/navigation';
import AuthForm from '../../components/AuthForm';
import { setToken } from '../../utils/auth';

export default function SignupPage() {
  const router = useRouter();
  async function handleSignup(email: string, password: string) {
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (res.ok) {
      const data = await res.json();
      setToken(data.token);
      router.push('/');
    } else {
      alert('Signup failed');
    }
  }
  return <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-100 to-green-100"><AuthForm onSubmit={handleSignup} type="signup" /></div>;
} 