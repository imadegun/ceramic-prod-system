'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Eye, Edit, Trash2, Copy } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ProductCollection {
  id: string;
  collectCode: string;
  designCode: string;
  nameCode: string;
  categoryCode: string;
  collectionType: 'EXCLUSIVE' | 'EXCLUSIVE_GROUP' | 'GENERAL';
  createdAt: string;
  client?: {
    id: string;
    code: string;
    name: string;
  };
}

interface CollectionsResponse {
  collections: ProductCollection[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function CollectionsPageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [collections, setCollections] = useState<ProductCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    fetchCollections();
  }, [session, status, search, clientFilter, typeFilter, currentPage]);

  const fetchCollections = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search,
        clientId: clientFilter,
        collectionType: typeFilter,
      });

      const response = await fetch(`/api/collections?${params}`);
      const data: CollectionsResponse = await response.json();

      if (response.ok) {
        setCollections(data.collections);
        setTotalPages(data.pagination.totalPages);
      } else {
        console.error('Failed to fetch collections:', data);
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this collection?')) return;

    try {
      const response = await fetch(`/api/collections/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchCollections(); // Refresh the list
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete collection');
      }
    } catch (error) {
      console.error('Error deleting collection:', error);
      alert('An error occurred while deleting the collection');
    }
  };

  const handleDuplicate = async (collection: ProductCollection) => {
    try {
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...collection,
          id: undefined,
          collectCode: `${collection.collectCode}_COPY`,
          createdAt: undefined,
          updatedAt: undefined,
        }),
      });

      if (response.ok) {
        fetchCollections(); // Refresh the list
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to duplicate collection');
      }
    } catch (error) {
      console.error('Error duplicating collection:', error);
      alert('An error occurred while duplicating the collection');
    }
  };

  const getCollectionTypeBadge = (type: string) => {
    const variants = {
      EXCLUSIVE: 'destructive',
      EXCLUSIVE_GROUP: 'secondary',
      GENERAL: 'default',
    } as const;

    return (
      <Badge variant={variants[type as keyof typeof variants] || 'outline'}>
        {type.replace('_', ' ')}
      </Badge>
    );
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading collections...</p>
        </div>
      </div>
    );
  }

  const canCreate = session?.user && ['COLLECTION', 'ADMIN'].includes((session.user as any).role || '');
  const canEdit = session?.user && ['COLLECTION', 'ADMIN'].includes((session.user as any).role || '');
  const canDelete = session?.user && ['COLLECTION', 'ADMIN'].includes((session.user as any).role || '');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Product Collections</h1>
              <p className="mt-2 text-gray-600">
                Manage and browse ceramic product collections
              </p>
            </div>
            {canCreate && (
              <Link href="/collections/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Collection
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search collections..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={clientFilter} onValueChange={setClientFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Clients</SelectItem>
                  {/* TODO: Populate with actual clients */}
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="EXCLUSIVE">Exclusive</SelectItem>
                  <SelectItem value="EXCLUSIVE_GROUP">Exclusive Group</SelectItem>
                  <SelectItem value="GENERAL">General</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => {
                  setSearch('');
                  setClientFilter('');
                  setTypeFilter('');
                  setCurrentPage(1);
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <Card key={collection.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{collection.collectCode}</CardTitle>
                    <CardDescription>{collection.nameCode}</CardDescription>
                  </div>
                  {getCollectionTypeBadge(collection.collectionType)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Design:</span> {collection.designCode}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Category:</span> {collection.categoryCode}
                  </p>
                  {collection.client && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Client:</span> {collection.client.name}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Created: {new Date(collection.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <div className="flex space-x-2">
                    <Link href={`/collections/${collection.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                    {canEdit && (
                      <Link href={`/collections/${collection.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                    )}
                    {canEdit && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Copy className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Duplicate Collection</AlertDialogTitle>
                            <AlertDialogDescription>
                              Create a copy of collection "{collection.collectCode}"?
                              The new collection will have "_COPY" appended to the code.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDuplicate(collection)}>
                              Duplicate Collection
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                  {canDelete && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Collection</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete the collection "{collection.collectCode}"?
                            This action cannot be undone and will permanently remove the collection
                            and all its associated data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(collection.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete Collection
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {collections.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-gray-500">No collections found.</p>
              {canCreate && (
                <Link href="/collections/new" className="mt-4 inline-block">
                  <Button>Create your first collection</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </Button>
            <span className="flex items-center px-4">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CollectionsPage() {
  return (
    <SessionProvider>
      <CollectionsPageContent />
    </SessionProvider>
  );
}