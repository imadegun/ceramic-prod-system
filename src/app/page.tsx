import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSession } from 'next-auth/react';
import { SignOutButton } from '@/components/auth/SignOutButton';
import {
  Package,
  Users,
  Factory,
  BarChart3,
  FileText,
  Settings,
  Shield,
  Database
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Ceramic Product Collections & Production Tracking System
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A comprehensive system for managing ceramic product collections, production tracking,
            and quality control with role-based access control.
          </p>
        </div>

        {/* System Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <Database className="h-4 w-4 text-green-600" />
              <CardTitle className="text-sm font-medium ml-2">Database</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Connected</div>
              <p className="text-xs text-muted-foreground">PostgreSQL + Prisma ORM</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-sm font-medium ml-2">Authentication</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">Active</div>
              <p className="text-xs text-muted-foreground">NextAuth.js + Role-based</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <Settings className="h-4 w-4 text-purple-600" />
              <CardTitle className="text-sm font-medium ml-2">API Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">Ready</div>
              <p className="text-xs text-muted-foreground">RESTful API with validation</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Package className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Product Collections</CardTitle>
              <CardDescription>
                Manage ceramic product collections with detailed specifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="secondary">60+ Fields</Badge>
                <Badge variant="secondary">Client Association</Badge>
                <Badge variant="secondary">Photo Support</Badge>
              </div>
              <div className="mt-4 space-y-2">
                <Link href="/collections">
                  <Button className="w-full">Browse Collections</Button>
                </Link>
                <Link href="/collections/new">
                  <Button variant="outline" className="w-full">Create Collection</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Factory className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Production Tracking</CardTitle>
              <CardDescription>
                Track production orders, stages, and quality control
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="secondary">POL Management</Badge>
                <Badge variant="secondary">Stage Tracking</Badge>
                <Badge variant="secondary">Quality Control</Badge>
              </div>
              <div className="mt-4">
                <Link href="/production">
                  <Button className="w-full" disabled>Coming Soon</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle>Dashboard & Reporting</CardTitle>
              <CardDescription>
                Real-time production dashboards and comprehensive reporting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="secondary">Real-time Data</Badge>
                <Badge variant="secondary">Analytics</Badge>
                <Badge variant="secondary">Export Reports</Badge>
              </div>
              <div className="mt-4">
                <Link href="/dashboard">
                  <Button className="w-full" disabled>Coming Soon</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-8 w-8 text-orange-600 mb-2" />
              <CardTitle>Client Management</CardTitle>
              <CardDescription>
                Manage clients, regions, and exclusivity settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="secondary">Region Management</Badge>
                <Badge variant="secondary">Exclusivity Types</Badge>
                <Badge variant="secondary">Department Tracking</Badge>
              </div>
              <div className="mt-4">
                <Link href="/clients">
                  <Button className="w-full" disabled>Coming Soon</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <FileText className="h-8 w-8 text-red-600 mb-2" />
              <CardTitle>Print & Documentation</CardTitle>
              <CardDescription>
                Generate product reference documents and reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="secondary">PDF Generation</Badge>
                <Badge variant="secondary">Batch Printing</Badge>
                <Badge variant="secondary">Photo Inclusion</Badge>
              </div>
              <div className="mt-4">
                <Button className="w-full" disabled>Coming Soon</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Settings className="h-8 w-8 text-gray-600 mb-2" />
              <CardTitle>System Administration</CardTitle>
              <CardDescription>
                User management, system configuration, and maintenance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="secondary">User Management</Badge>
                <Badge variant="secondary">Role Configuration</Badge>
                <Badge variant="secondary">System Settings</Badge>
              </div>
              <div className="mt-4">
                <Link href="/admin">
                  <Button className="w-full" disabled>Coming Soon</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Actions */}
        <div className="text-center">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Get Started</h2>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/auth/signin">
                <Button size="lg">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="outline" size="lg">Create Account</Button>
              </Link>
              <Link href="/collections">
                <Button variant="secondary" size="lg">Browse Public Collections</Button>
              </Link>
            </div>
          </div>

          {/* System Info */}
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-lg">System Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Framework:</span> Next.js 15 + TypeScript
                </div>
                <div>
                  <span className="font-medium">Database:</span> PostgreSQL + Prisma
                </div>
                <div>
                  <span className="font-medium">Authentication:</span> NextAuth.js
                </div>
                <div>
                  <span className="font-medium">UI:</span> Tailwind CSS + shadcn/ui
                </div>
                <div>
                  <span className="font-medium">Validation:</span> Zod schemas
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <Badge variant="default" className="ml-2">Phase 2 Complete</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
