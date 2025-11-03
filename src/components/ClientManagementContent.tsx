'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Edit, Trash2, Users, MapPin, Building } from 'lucide-react';
import { ClientRelationshipManager } from '@/components/ClientRelationshipManager';

interface Client {
  id: string;
  code: string;
  name: string;
  regions: string[];
  departments: string[];
  createdAt: string;
  _count?: {
    collections: number;
  };
}

export default function ClientManagementContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || (session.user as any)?.role !== 'ADMIN') {
      router.push('/auth/signin');
      return;
    }

    fetchClients();
  }, [session, status, router]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/clients');
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async (formData: FormData) => {
    try {
      const clientData = {
        code: formData.get('code') as string,
        name: formData.get('name') as string,
        regions: (formData.get('regions') as string)?.split(',').map(r => r.trim()) || [],
        departments: (formData.get('departments') as string)?.split(',').map(d => d.trim()) || [],
      };

      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData),
      });

      if (response.ok) {
        await fetchClients();
        setIsCreateDialogOpen(false);
        alert('Client created successfully');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to create client'}`);
      }
    } catch (error) {
      console.error('Error creating client:', error);
      alert('Failed to create client');
    }
  };

  const handleUpdateClient = async (formData: FormData) => {
    if (!selectedClient) return;

    try {
      const clientData = {
        code: formData.get('code') as string,
        name: formData.get('name') as string,
        regions: (formData.get('regions') as string)?.split(',').map(r => r.trim()) || [],
        departments: (formData.get('departments') as string)?.split(',').map(d => d.trim()) || [],
      };

      const response = await fetch(`/api/clients/${selectedClient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData),
      });

      if (response.ok) {
        await fetchClients();
        setIsEditDialogOpen(false);
        setSelectedClient(null);
        alert('Client updated successfully');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to update client'}`);
      }
    } catch (error) {
      console.error('Error updating client:', error);
      alert('Failed to update client');
    }
  };

  const handleDeleteClient = async () => {
    if (!selectedClient) return;

    try {
      const response = await fetch(`/api/clients/${selectedClient.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchClients();
        setIsDeleteDialogOpen(false);
        setSelectedClient(null);
        alert('Client deleted successfully');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to delete client'}`);
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Failed to delete client');
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading clients...</p>
        </div>
      </div>
    );
  }

  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Access denied. Admin role required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Client Management</h1>
          <p className="text-muted-foreground">
            Manage clients, their regions, departments, and relationships
          </p>
        </div>
      </div>

      <Tabs defaultValue="clients" className="space-y-4">
        <TabsList>
          <TabsTrigger value="clients">Client Management</TabsTrigger>
          <TabsTrigger value="relationships">Relationships</TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="space-y-4">
          {/* Search and Actions */}
          <div className="flex items-center justify-between">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search clients by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Client
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Client</DialogTitle>
                  <DialogDescription>
                    Add a new client with their regions and departments.
                  </DialogDescription>
                </DialogHeader>
                <ClientForm onSubmit={handleCreateClient} />
              </DialogContent>
            </Dialog>
          </div>

          {/* Clients Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client) => (
              <Card key={client.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{client.name}</CardTitle>
                    <Badge variant="outline">{client.code}</Badge>
                  </div>
                  <CardDescription>
                    Created {new Date(client.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Regions</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {client.regions.map((region) => (
                        <Badge key={region} variant="secondary" className="text-xs">
                          <MapPin className="w-3 h-3 mr-1" />
                          {region}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Departments</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {client.departments.map((department) => (
                        <Badge key={department} variant="outline" className="text-xs">
                          <Building className="w-3 h-3 mr-1" />
                          {department}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-sm text-muted-foreground">
                      {client._count?.collections || 0} collections
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedClient(client);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedClient(client);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredClients.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No clients found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first client.'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Client
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="relationships">
          <ClientRelationshipManager />
        </TabsContent>
      </Tabs>

      {/* Edit Client Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
            <DialogDescription>
              Update client information, regions, and departments.
            </DialogDescription>
          </DialogHeader>
          {selectedClient && (
            <ClientForm
              client={selectedClient}
              onSubmit={handleUpdateClient}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Client</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedClient?.name}"? This action cannot be undone.
              {(selectedClient?._count?.collections ?? 0) > 0 && selectedClient && (
                <span className="block text-destructive font-medium mt-2">
                  Warning: This client has {selectedClient._count?.collections ?? 0} associated collections.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteClient}>
              Delete Client
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ClientFormProps {
  client?: Client;
  onSubmit: (formData: FormData) => void;
}

function ClientForm({ client, onSubmit }: ClientFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="code">Client Code</Label>
          <Input
            id="code"
            name="code"
            defaultValue={client?.code}
            placeholder="e.g., BVL"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Client Name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={client?.name}
            placeholder="e.g., Bulgari"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="regions">Regions (comma-separated)</Label>
        <Input
          id="regions"
          name="regions"
          defaultValue={client?.regions.join(', ')}
          placeholder="e.g., Tokyo, Paris, Milan"
          required
        />
        <p className="text-xs text-muted-foreground">
          Enter regions separated by commas
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="departments">Departments (comma-separated)</Label>
        <Input
          id="departments"
          name="departments"
          defaultValue={client?.departments.join(', ')}
          placeholder="e.g., Spa, Restaurant, Bathroom"
          required
        />
        <p className="text-xs text-muted-foreground">
          Enter departments separated by commas
        </p>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={() => {}}>
          Cancel
        </Button>
        <Button type="submit">
          {client ? 'Update Client' : 'Create Client'}
        </Button>
      </div>
    </form>
  );
}