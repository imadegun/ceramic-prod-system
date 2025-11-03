'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, X, Users, MapPin, Building, BarChart3 } from 'lucide-react';

interface Client {
  id: string;
  code: string;
  name: string;
  regions: string[];
  departments: string[];
}

interface RelationshipStats {
  totalClients: number;
  totalRegions: number;
  totalDepartments: number;
  clientsByRegion: Record<string, number>;
  clientsByDepartment: Record<string, number>;
  collectionDistribution: {
    GENERAL: number;
    EXCLUSIVE: number;
    EXCLUSIVE_GROUP: number;
  };
}

interface RegionDepartmentMatrix {
  [region: string]: {
    [department: string]: string[];
  };
}

export function ClientRelationshipManager() {
  const { data: session } = useSession();
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<RelationshipStats | null>(null);
  const [matrix, setMatrix] = useState<RegionDepartmentMatrix | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  useEffect(() => {
    if (session?.user && (session.user as any).role === 'ADMIN') {
      fetchRelationshipData();
    }
  }, [session]);

  const fetchRelationshipData = async () => {
    try {
      setLoading(true);

      const [clientsRes, statsRes, matrixRes] = await Promise.all([
        fetch('/api/clients'),
        fetch('/api/clients/relationships?action=stats'),
        fetch('/api/clients/relationships?action=matrix'),
      ]);

      if (clientsRes.ok) {
        const clientsData = await clientsRes.json();
        setClients(clientsData.clients || []);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data);
      }

      if (matrixRes.ok) {
        const matrixData = await matrixRes.json();
        setMatrix(matrixData.data);
      }
    } catch (error) {
      console.error('Error fetching relationship data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClientRelationships = async (clientId: string, regions: string[], departments: string[]) => {
    try {
      const response = await fetch('/api/clients/relationships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, regions, departments }),
      });

      if (response.ok) {
        await fetchRelationshipData(); // Refresh data
        setEditingClient(null);
        alert('Client relationships updated successfully');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to update relationships'}`);
      }
    } catch (error) {
      console.error('Error updating client relationships:', error);
      alert('Failed to update client relationships');
    }
  };

  if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Access denied. Admin role required.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading relationship data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Client Relationship Management</h1>
          <p className="text-muted-foreground">
            Manage client regions, departments, and collection access relationships
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="clients">Client Management</TabsTrigger>
          <TabsTrigger value="matrix">Region-Department Matrix</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalClients}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Regions</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalRegions}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalDepartments}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Collection Distribution</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>General:</span>
                      <Badge variant="secondary">{stats.collectionDistribution.GENERAL}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Exclusive:</span>
                      <Badge variant="secondary">{stats.collectionDistribution.EXCLUSIVE}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Exclusive Group:</span>
                      <Badge variant="secondary">{stats.collectionDistribution.EXCLUSIVE_GROUP}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Clients by Region</CardTitle>
                <CardDescription>Distribution of clients across regions</CardDescription>
              </CardHeader>
              <CardContent>
                {stats && Object.entries(stats.clientsByRegion).map(([region, count]) => (
                  <div key={region} className="flex justify-between items-center py-1">
                    <span>{region}</span>
                    <Badge>{count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Clients by Department</CardTitle>
                <CardDescription>Distribution of clients across departments</CardDescription>
              </CardHeader>
              <CardContent>
                {stats && Object.entries(stats.clientsByDepartment).map(([department, count]) => (
                  <div key={department} className="flex justify-between items-center py-1">
                    <span>{department}</span>
                    <Badge>{count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((client) => (
              <Card key={client.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {client.name}
                    <Badge variant="outline">{client.code}</Badge>
                  </CardTitle>
                  <CardDescription>Client relationship details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs font-medium">Regions</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {client.regions.map((region) => (
                        <Badge key={region} variant="secondary" className="text-xs">
                          {region}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-medium">Departments</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {client.departments.map((department) => (
                        <Badge key={department} variant="outline" className="text-xs">
                          {department}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingClient(client)}
                    className="w-full"
                  >
                    Edit Relationships
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="matrix" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Region-Department Matrix</CardTitle>
              <CardDescription>
                Shows which clients are associated with each region-department combination
              </CardDescription>
            </CardHeader>
            <CardContent>
              {matrix && Object.keys(matrix).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(matrix).map(([region, departments]) => (
                    <div key={region}>
                      <h3 className="font-semibold text-lg mb-2">{region}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(departments).map(([department, clientNames]) => (
                          <Card key={`${region}-${department}`}>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">{department}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-1">
                                {clientNames.map((clientName) => (
                                  <div key={clientName} className="text-sm text-muted-foreground">
                                    {clientName}
                                  </div>
                                ))}
                                {clientNames.length === 0 && (
                                  <div className="text-sm text-muted-foreground italic">
                                    No clients
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No relationship data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Client Relationships Modal */}
      {editingClient && (
        <ClientRelationshipEditor
          client={editingClient}
          onSave={handleUpdateClientRelationships}
          onCancel={() => setEditingClient(null)}
        />
      )}
    </div>
  );
}

interface ClientRelationshipEditorProps {
  client: Client;
  onSave: (clientId: string, regions: string[], departments: string[]) => void;
  onCancel: () => void;
}

function ClientRelationshipEditor({ client, onSave, onCancel }: ClientRelationshipEditorProps) {
  const [regions, setRegions] = useState<string[]>(client.regions);
  const [departments, setDepartments] = useState<string[]>(client.departments);
  const [newRegion, setNewRegion] = useState('');
  const [newDepartment, setNewDepartment] = useState('');

  const addRegion = () => {
    if (newRegion.trim() && !regions.includes(newRegion.trim())) {
      setRegions([...regions, newRegion.trim()]);
      setNewRegion('');
    }
  };

  const removeRegion = (region: string) => {
    setRegions(regions.filter(r => r !== region));
  };

  const addDepartment = () => {
    if (newDepartment.trim() && !departments.includes(newDepartment.trim())) {
      setDepartments([...departments, newDepartment.trim()]);
      setNewDepartment('');
    }
  };

  const removeDepartment = (department: string) => {
    setDepartments(departments.filter(d => d !== department));
  };

  const handleSave = () => {
    if (regions.length === 0 || departments.length === 0) {
      alert('At least one region and one department must be specified');
      return;
    }
    onSave(client.id, regions, departments);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Edit Client Relationships</CardTitle>
          <CardDescription>
            Manage regions and departments for {client.name} ({client.code})
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Regions */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Regions</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add new region..."
                value={newRegion}
                onChange={(e) => setNewRegion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addRegion()}
              />
              <Button onClick={addRegion} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {regions.map((region) => (
                <Badge key={region} variant="secondary" className="px-3 py-1">
                  {region}
                  <button
                    onClick={() => removeRegion(region)}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Departments */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Departments</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add new department..."
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addDepartment()}
              />
              <Button onClick={addDepartment} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {departments.map((department) => (
                <Badge key={department} variant="outline" className="px-3 py-1">
                  {department}
                  <button
                    onClick={() => removeDepartment(department)}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Relationship Summary */}
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Relationship Summary</h4>
            <p className="text-sm text-muted-foreground">
              This client will have access to {regions.length} region(s) × {departments.length} department(s) = {regions.length * departments.length} region-department combinations.
            </p>
          </div>
        </CardContent>
        <div className="flex justify-end space-x-2 p-6 pt-0">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </Card>
    </div>
  );
}