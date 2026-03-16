'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRegister } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function RegisterForm() {
  const router = useRouter();
  const { mutate: register, loading } = useRegister();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirm?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string; confirm?: string } = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Enter a valid email address';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!confirmPassword) newErrors.confirm = 'Please confirm your password';
    else if (password !== confirmPassword) newErrors.confirm = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await register({ email, password });
      toast.success('Account created! Please sign in.');
      router.push('/login');
    } catch {
      toast.error('Registration failed. Email may already be taken.');
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Create Account</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Get started with HireMe in seconds
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="reg-email" className="text-sm font-medium text-foreground">
            Email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="reg-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors((prev) => ({ ...prev, email: undefined })); }}
              className={`h-12 pl-10 rounded-lg bg-muted/50 border-border/60 text-sm ${errors.email ? 'border-red-500' : ''}`}
            />
            {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reg-password" className="text-sm font-medium text-foreground">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors((prev) => ({ ...prev, password: undefined })); }}
              className={`h-12 pl-10 pr-10 rounded-lg bg-muted/50 border-border/60 text-sm ${errors.password ? 'border-red-500' : ''}`}
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            {errors.password && <p className="mt-1.5 text-xs text-red-500">{errors.password}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reg-confirm" className="text-sm font-medium text-foreground">
            Confirm Password
          </Label>
          <div className="relative">
            <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="reg-confirm"
              type={showPassword ? 'text' : 'password'}
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setErrors((prev) => ({ ...prev, confirm: undefined })); }}
              className={`h-12 pl-10 rounded-lg bg-muted/50 border-border/60 text-sm ${errors.confirm ? 'border-red-500' : ''}`}
              minLength={6}
            />
            {errors.confirm && <p className="mt-1.5 text-xs text-red-500">{errors.confirm}</p>}
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 btn-gradient rounded-lg text-sm font-medium"
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}


