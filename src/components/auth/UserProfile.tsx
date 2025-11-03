'use client';

import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SignOutButton } from './SignOutButton';

export function UserProfile() {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'destructive';
      case 'COLLECTION':
        return 'default';
      case 'PRODUCTION':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Full system access and user management';
      case 'COLLECTION':
        return 'Product collection management and client relations';
      case 'PRODUCTION':
        return 'Production tracking and manufacturing oversight';
      default:
        return 'Public access to collections';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src={session.user.image || ''} alt={session.user.name || ''} />
            <AvatarFallback className="text-lg">
              {session.user.name ? getInitials(session.user.name) : 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
        <CardTitle className="text-xl">{session.user.name}</CardTitle>
        <CardDescription>{session.user.email}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center">
          <Badge variant={getRoleBadgeVariant((session.user as any).role || 'PUBLIC')}>
            {(session.user as any).role || 'PUBLIC'}
          </Badge>
        </div>
        <p className="text-sm text-gray-600 text-center">
          {getRoleDescription((session.user as any).role || 'PUBLIC')}
        </p>
        <div className="flex justify-center pt-4">
          <SignOutButton />
        </div>
      </CardContent>
    </Card>
  );
}