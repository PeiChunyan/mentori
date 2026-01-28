// frontend/src/app/auth/page.tsx
import LoginPage from '@/components/auth/LoginPage';

export const metadata = {
  title: 'Login | Mentori',
  description: 'Sign in to Mentori with email, Google, or Apple',
};

export default function AuthPage() {
  return <LoginPage />;
}
