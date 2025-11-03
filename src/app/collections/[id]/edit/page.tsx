'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClientSelector } from '@/components/ClientSelector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';

interface Client {
  id: string;
  code: string;
  name: string;
  regions: string[];
  departments: string[];
}

interface ProductCollection {
  id: string;
  collectCode: string;
  designCode: string;
  nameCode: string;
  categoryCode: string;
  sizeCode: string;
  textureCode: string;
  colorCode: string;
  materialCode: string;
  clientId?: string;
  clientDescription?: string;
  collectDate?: string;
  techDraw?: string;
  refId?: string;
  collectionType: 'EXCLUSIVE' | 'EXCLUSIVE_GROUP' | 'GENERAL';
  clay?: string;
  clayKG?: number;
  clayNote?: string;
  buildTech?: string;
  buildTechNote?: string;
  rim?: string;
  feet?: string;
  casting1?: string;
  casting2?: string;
  casting3?: string;
  casting4?: string;
  castingNote?: string;
  extruder1?: string;
  extruder2?: string;
  extruder3?: string;
  extruder4?: string;
  extruderNote?: string;
  texture1?: string;
  texture2?: string;
  texture3?: string;
  texture4?: string;
  textureNote?: string;
  tools1?: string;
  tools2?: string;
  tools3?: string;
  tools4?: string;
  toolsNote?: string;
  engobe1?: string;
  engobe2?: string;
  engobe3?: string;
  engobe4?: string;
  engobeNote?: string;
  bisqueTemp?: number;
  bisqueTempNote?: string;
  stainOxide1?: string;
  stainOxide2?: string;
  stainOxide3?: string;
  stainOxide4?: string;
  stainOxideNote?: string;
  lustre1?: string;
  lustre2?: string;
  lustre3?: string;
  lustre4?: string;
  lustreTemp?: number;
  lustreTempNote?: string;
  lustreNote?: string;
  glaze1?: string;
  glaze2?: string;
  glaze3?: string;
  glaze4?: string;
  glazeDensity1?: string;
  glazeDensity2?: string;
  glazeDensity3?: string;
  glazeDensity4?: string;
  glazeTechnique?: string;
  glazeTemp?: number;
  glazeTempNote?: string;
  glazeNote?: string;
  firing?: string;
  firingNote?: string;
  width?: number;
  height?: number;
  length?: number;
  diameter?: number;
  finalSizeNote?: string;
}

export default function EditCollectionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [clients, setClients] = useState<Client[]>([]);
  const [collection, setCollection] = useState<ProductCollection | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingClients, setFetchingClients] = useState(true);
  const [fetchingCollection, setFetchingCollection] = useState(true);

  const [formData, setFormData] = useState({
    // Basic Information
    collectCode: '',
    designCode: '',
    nameCode: '',
    categoryCode: '',
    sizeCode: '',
    textureCode: '',
    colorCode: '',
    materialCode: '',
    clientId: '',
    clientDescription: '',
    collectDate: '',
    techDraw: '',
    refId: '',
    collectionType: 'GENERAL',

    // Clay & Build
    clay: '',
    clayKG: '',
    clayNote: '',
    buildTech: '',
    buildTechNote: '',
    rim: '',
    feet: '',

    // Casting
    casting1: '',
    casting2: '',
    casting3: '',
    casting4: '',
    castingNote: '',

    // Extruder
    extruder1: '',
    extruder2: '',
    extruder3: '',
    extruder4: '',
    extruderNote: '',

    // Texture
    texture1: '',
    texture2: '',
    texture3: '',
    texture4: '',
    textureNote: '',

    // Tools
    tools1: '',
    tools2: '',
    tools3: '',
    tools4: '',
    toolsNote: '',

    // Engobe
    engobe1: '',
    engobe2: '',
    engobe3: '',
    engobe4: '',
    engobeNote: '',

    // Bisque
    bisqueTemp: '900',
    bisqueTempNote: '',

    // Stain & Oxide
    stainOxide1: '',
    stainOxide2: '',
    stainOxide3: '',
    stainOxide4: '',
    stainOxideNote: '',

    // Lustre
    lustre1: '',
    lustre2: '',
    lustre3: '',
    lustre4: '',
    lustreTemp: '',
    lustreTempNote: '',
    lustreNote: '',

    // Glaze
    glaze1: '',
    glaze2: '',
    glaze3: '',
    glaze4: '',
    glazeDensity1: '',
    glazeDensity2: '',
    glazeDensity3: '',
    glazeDensity4: '',
    glazeTechnique: '',
    glazeTemp: '',
    glazeTempNote: '',
    glazeNote: '',

    // Firing
    firing: '',
    firingNote: '',

    // Dimensions
    width: '',
    height: '',
    length: '',
    diameter: '',
    finalSizeNote: '',
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (!session.user || !['COLLECTION', 'ADMIN'].includes((session.user as any).role || '')) {
      router.push('/collections');
      return;
    }

    fetchClients();
    fetchCollection();
  }, [session, status, params.id]);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setFetchingClients(false);
    }
  };

  const fetchCollection = async () => {
    try {
      const response = await fetch(`/api/collections/${params.id}`);
      const data = await response.json();

      if (response.ok) {
        const collectionData = data.data;
        setCollection(collectionData);

        // Populate form with existing data
        setFormData({
          collectCode: collectionData.collectCode || '',
          designCode: collectionData.designCode || '',
          nameCode: collectionData.nameCode || '',
          categoryCode: collectionData.categoryCode || '',
          sizeCode: collectionData.sizeCode || '',
          textureCode: collectionData.textureCode || '',
          colorCode: collectionData.colorCode || '',
          materialCode: collectionData.materialCode || '',
          clientId: collectionData.clientId || '',
          clientDescription: collectionData.clientDescription || '',
          collectDate: collectionData.collectDate ? collectionData.collectDate.split('T')[0] : '',
          techDraw: collectionData.techDraw || '',
          refId: collectionData.refId || '',
          collectionType: collectionData.collectionType || 'GENERAL',
          clay: collectionData.clay || '',
          clayKG: collectionData.clayKG?.toString() || '',
          clayNote: collectionData.clayNote || '',
          buildTech: collectionData.buildTech || '',
          buildTechNote: collectionData.buildTechNote || '',
          rim: collectionData.rim || '',
          feet: collectionData.feet || '',
          casting1: collectionData.casting1 || '',
          casting2: collectionData.casting2 || '',
          casting3: collectionData.casting3 || '',
          casting4: collectionData.casting4 || '',
          castingNote: collectionData.castingNote || '',
          extruder1: collectionData.extruder1 || '',
          extruder2: collectionData.extruder2 || '',
          extruder3: collectionData.extruder3 || '',
          extruder4: collectionData.extruder4 || '',
          extruderNote: collectionData.extruderNote || '',
          texture1: collectionData.texture1 || '',
          texture2: collectionData.texture2 || '',
          texture3: collectionData.texture3 || '',
          texture4: collectionData.texture4 || '',
          textureNote: collectionData.textureNote || '',
          tools1: collectionData.tools1 || '',
          tools2: collectionData.tools2 || '',
          tools3: collectionData.tools3 || '',
          tools4: collectionData.tools4 || '',
          toolsNote: collectionData.toolsNote || '',
          engobe1: collectionData.engobe1 || '',
          engobe2: collectionData.engobe2 || '',
          engobe3: collectionData.engobe3 || '',
          engobe4: collectionData.engobe4 || '',
          engobeNote: collectionData.engobeNote || '',
          bisqueTemp: collectionData.bisqueTemp?.toString() || '900',
          bisqueTempNote: collectionData.bisqueTempNote || '',
          stainOxide1: collectionData.stainOxide1 || '',
          stainOxide2: collectionData.stainOxide2 || '',
          stainOxide3: collectionData.stainOxide3 || '',
          stainOxide4: collectionData.stainOxide4 || '',
          stainOxideNote: collectionData.stainOxideNote || '',
          lustre1: collectionData.lustre1 || '',
          lustre2: collectionData.lustre2 || '',
          lustre3: collectionData.lustre3 || '',
          lustre4: collectionData.lustre4 || '',
          lustreTemp: collectionData.lustreTemp?.toString() || '',
          lustreTempNote: collectionData.lustreTempNote || '',
          lustreNote: collectionData.lustreNote || '',
          glaze1: collectionData.glaze1 || '',
          glaze2: collectionData.glaze2 || '',
          glaze3: collectionData.glaze3 || '',
          glaze4: collectionData.glaze4 || '',
          glazeDensity1: collectionData.glazeDensity1 || '',
          glazeDensity2: collectionData.glazeDensity2 || '',
          glazeDensity3: collectionData.glazeDensity3 || '',
          glazeDensity4: collectionData.glazeDensity4 || '',
          glazeTechnique: collectionData.glazeTechnique || '',
          glazeTemp: collectionData.glazeTemp?.toString() || '',
          glazeTempNote: collectionData.glazeTempNote || '',
          glazeNote: collectionData.glazeNote || '',
          firing: collectionData.firing || '',
          firingNote: collectionData.firingNote || '',
          width: collectionData.width?.toString() || '',
          height: collectionData.height?.toString() || '',
          length: collectionData.length?.toString() || '',
          diameter: collectionData.diameter?.toString() || '',
          finalSizeNote: collectionData.finalSizeNote || '',
        });
      } else {
        setError(data.error || 'Failed to fetch collection');
      }
    } catch (error) {
      console.error('Error fetching collection:', error);
      setError('An error occurred while fetching the collection');
    } finally {
      setFetchingCollection(false);
    }
  };

  const [error, setError] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Convert string values to appropriate types
      const submitData = {
        ...formData,
        clayKG: formData.clayKG ? parseFloat(formData.clayKG) : undefined,
        bisqueTemp: formData.bisqueTemp ? parseInt(formData.bisqueTemp) : undefined,
        lustreTemp: formData.lustreTemp ? parseInt(formData.lustreTemp) : undefined,
        glazeTemp: formData.glazeTemp ? parseInt(formData.glazeTemp) : undefined,
        width: formData.width ? parseFloat(formData.width) : undefined,
        height: formData.height ? parseFloat(formData.height) : undefined,
        length: formData.length ? parseFloat(formData.length) : undefined,
        diameter: formData.diameter ? parseFloat(formData.diameter) : undefined,
        collectDate: formData.collectDate ? new Date(formData.collectDate) : undefined,
        clientId: formData.clientId || undefined,
      };

      const response = await fetch(`/api/collections/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        router.push(`/collections/${params.id}`);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update collection');
      }
    } catch (error) {
      console.error('Error updating collection:', error);
      setError('An error occurred while updating the collection');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || fetchingClients || fetchingCollection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !collection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Link href="/collections">
              <Button>Back to Collections</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={`/collections/${params.id}`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Collection
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Collection</h1>
                <p className="text-gray-600">Update collection details</p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Essential collection details</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="collectCode">Collection Code *</Label>
                <Input
                  id="collectCode"
                  value={formData.collectCode}
                  onChange={(e) => handleInputChange('collectCode', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="designCode">Design Code *</Label>
                <Input
                  id="designCode"
                  value={formData.designCode}
                  onChange={(e) => handleInputChange('designCode', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameCode">Name Code *</Label>
                <Input
                  id="nameCode"
                  value={formData.nameCode}
                  onChange={(e) => handleInputChange('nameCode', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryCode">Category Code *</Label>
                <Input
                  id="categoryCode"
                  value={formData.categoryCode}
                  onChange={(e) => handleInputChange('categoryCode', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sizeCode">Size Code *</Label>
                <Input
                  id="sizeCode"
                  value={formData.sizeCode}
                  onChange={(e) => handleInputChange('sizeCode', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="textureCode">Texture Code *</Label>
                <Input
                  id="textureCode"
                  value={formData.textureCode}
                  onChange={(e) => handleInputChange('textureCode', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="colorCode">Color Code *</Label>
                <Input
                  id="colorCode"
                  value={formData.colorCode}
                  onChange={(e) => handleInputChange('colorCode', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="materialCode">Material Code *</Label>
                <Input
                  id="materialCode"
                  value={formData.materialCode}
                  onChange={(e) => handleInputChange('materialCode', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientId">Client</Label>
                <ClientSelector
                  value={formData.clientId}
                  onChange={(value) => handleInputChange('clientId', value)}
                  placeholder="Select a client (optional)"
                  allowCreate={true}
                  onCreateNew={() => {
                    // TODO: Implement client creation modal
                    alert('Client creation feature coming soon!');
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="collectionType">Collection Type</Label>
                <Select value={formData.collectionType} onValueChange={(value) => handleInputChange('collectionType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GENERAL">General</SelectItem>
                    <SelectItem value="EXCLUSIVE">Exclusive</SelectItem>
                    <SelectItem value="EXCLUSIVE_GROUP">Exclusive Group</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="collectDate">Collection Date</Label>
                <Input
                  id="collectDate"
                  type="date"
                  value={formData.collectDate}
                  onChange={(e) => handleInputChange('collectDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="refId">Reference ID</Label>
                <Input
                  id="refId"
                  value={formData.refId}
                  onChange={(e) => handleInputChange('refId', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Clay & Build */}
          <Card>
            <CardHeader>
              <CardTitle>Clay & Build</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clay">Clay Type</Label>
                <Input
                  id="clay"
                  value={formData.clay}
                  onChange={(e) => handleInputChange('clay', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clayKG">Clay Quantity (kg)</Label>
                <Input
                  id="clayKG"
                  type="number"
                  step="0.01"
                  value={formData.clayKG}
                  onChange={(e) => handleInputChange('clayKG', e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="clayNote">Clay Notes</Label>
                <Textarea
                  id="clayNote"
                  value={formData.clayNote}
                  onChange={(e) => handleInputChange('clayNote', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buildTech">Build Technique</Label>
                <Input
                  id="buildTech"
                  value={formData.buildTech}
                  onChange={(e) => handleInputChange('buildTech', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rim">Rim</Label>
                <Input
                  id="rim"
                  value={formData.rim}
                  onChange={(e) => handleInputChange('rim', e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="buildTechNote">Build Technique Notes</Label>
                <Textarea
                  id="buildTechNote"
                  value={formData.buildTechNote}
                  onChange={(e) => handleInputChange('buildTechNote', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Dimensions */}
          <Card>
            <CardHeader>
              <CardTitle>Dimensions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="width">Width (mm)</Label>
                <Input
                  id="width"
                  type="number"
                  step="0.01"
                  value={formData.width}
                  onChange={(e) => handleInputChange('width', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (mm)</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.01"
                  value={formData.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="length">Length (mm)</Label>
                <Input
                  id="length"
                  type="number"
                  step="0.01"
                  value={formData.length}
                  onChange={(e) => handleInputChange('length', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="diameter">Diameter (mm)</Label>
                <Input
                  id="diameter"
                  type="number"
                  step="0.01"
                  value={formData.diameter}
                  onChange={(e) => handleInputChange('diameter', e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="finalSizeNote">Size Notes</Label>
                <Textarea
                  id="finalSizeNote"
                  value={formData.finalSizeNote}
                  onChange={(e) => handleInputChange('finalSizeNote', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link href={`/collections/${params.id}`}>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Updating...' : 'Update Collection'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}