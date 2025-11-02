'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface SignOutButtonProps {
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export function SignOutButton({ className, variant = 'outline' }: SignOutButtonProps) {
  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' });
  };

  return (
    <Button
      variant={variant}
      onClick={handleSignOut}
      className={className}
    >
      <LogOut className="w-4 h-4 mr-2" />
      Sign Out
    </Button>
  );
}