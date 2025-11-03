'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Edit, Copy, Printer, Download } from 'lucide-react';
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
  sizeCode: string;
  textureCode: string;
  colorCode: string;
  materialCode: string;
  clientId?: string;
  clientDescription?: string;
  collectDate?: string;
  techDraw?: string;
  photo1?: string;
  photo2?: string;
  photo3?: string;
  photo4?: string;
  refId?: string;
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
  lustreNote?: string;
  lustreTemp?: number;
  lustreTempNote?: string;
  glaze1?: string;
  glaze2?: string;
  glaze3?: string;
  glaze4?: string;
  glazeDensity1?: string;
  glazeDensity2?: string;
  glazeDensity3?: string;
  glazeDensity4?: string;
  glazeTechnique?: string;
  glazeNote?: string;
  glazeTemp?: number;
  glazeTempNote?: string;
  firing?: string;
  firingNote?: string;
  width?: number;
  height?: number;
  length?: number;
  diameter?: number;
  finalSizeNote?: string;
  collectionType: 'EXCLUSIVE' | 'EXCLUSIVE_GROUP' | 'GENERAL';
  createdAt: string;
  updatedAt: string;
  client?: {
    id: string;
    code: string;
    name: string;
    regions: string[];
    departments: string[];
  };
}

export default function CollectionDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [collection, setCollection] = useState<ProductCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    fetchCollection();
  }, [session, status, params.id]);

  const fetchCollection = async () => {
    try {
      const response = await fetch(`/api/collections/${params.id}`);
      const data = await response.json();

      if (response.ok) {
        setCollection(data.data);
      } else {
        setError(data.error || 'Failed to fetch collection');
      }
    } catch (error) {
      console.error('Error fetching collection:', error);
      setError('An error occurred while fetching the collection');
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async () => {
    if (!collection) return;

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
        const data = await response.json();
        router.push(`/collections/${data.data.id}`);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to duplicate collection');
      }
    } catch (error) {
      console.error('Error duplicating collection:', error);
      alert('An error occurred while duplicating the collection');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading collection details...</p>
        </div>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600 mb-4">{error || 'Collection not found'}</p>
            <Link href="/collections">
              <Button>Back to Collections</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canEdit = session?.user && ['COLLECTION', 'ADMIN'].includes((session.user as any).role || '');
  const canDuplicate = canEdit;

  const renderField = (label: string, value: any, unit?: string) => {
    if (!value) return null;
    return (
      <div className="flex justify-between py-2">
        <span className="font-medium text-gray-600">{label}:</span>
        <span className="text-gray-900">
          {value}
          {unit && <span className="text-gray-500 ml-1">{unit}</span>}
        </span>
      </div>
    );
  };

  const renderSection = (title: string, fields: Array<{ label: string; value: any; unit?: string }>) => {
    const validFields = fields.filter(field => field.value);
    if (validFields.length === 0) return null;

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          {validFields.map((field, index) => (
            <div key={index}>
              {renderField(field.label, field.value, field.unit)}
              {index < validFields.length - 1 && <Separator className="my-2" />}
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/collections">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Collections
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{collection.collectCode}</h1>
                <p className="text-gray-600">{collection.nameCode}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getCollectionTypeBadge(collection.collectionType)}
              {canEdit && (
                <Link href={`/collections/${collection.id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </Link>
              )}
              {canDuplicate && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicate
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
                      <AlertDialogAction onClick={handleDuplicate}>
                        Duplicate Collection
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('Collection Code', collection.collectCode)}
              {renderField('Design Code', collection.designCode)}
              {renderField('Name Code', collection.nameCode)}
              {renderField('Category Code', collection.categoryCode)}
              {renderField('Size Code', collection.sizeCode)}
              {renderField('Texture Code', collection.textureCode)}
              {renderField('Color Code', collection.colorCode)}
              {renderField('Material Code', collection.materialCode)}
              {collection.client && (
                <>
                  {renderField('Client', collection.client.name)}
                  {renderField('Client Code', collection.client.code)}
                  {renderField('Regions', collection.client.regions.join(', '))}
                  {renderField('Departments', collection.client.departments.join(', '))}
                </>
              )}
              {renderField('Collection Type', collection.collectionType.replace('_', ' '))}
              {renderField('Collection Date', collection.collectDate ? new Date(collection.collectDate).toLocaleDateString() : null)}
              {renderField('Reference ID', collection.refId)}
            </div>
          </CardContent>
        </Card>

        {/* Dimensions */}
        {renderSection('Dimensions', [
          { label: 'Width', value: collection.width, unit: 'mm' },
          { label: 'Height', value: collection.height, unit: 'mm' },
          { label: 'Length', value: collection.length, unit: 'mm' },
          { label: 'Diameter', value: collection.diameter, unit: 'mm' },
          { label: 'Size Notes', value: collection.finalSizeNote },
        ])}

        {/* Clay & Build */}
        {renderSection('Clay & Build', [
          { label: 'Clay Type', value: collection.clay },
          { label: 'Clay Quantity', value: collection.clayKG, unit: 'kg' },
          { label: 'Clay Notes', value: collection.clayNote },
          { label: 'Build Technique', value: collection.buildTech },
          { label: 'Build Notes', value: collection.buildTechNote },
          { label: 'Rim', value: collection.rim },
          { label: 'Feet', value: collection.feet },
        ])}

        {/* Casting */}
        {renderSection('Casting', [
          { label: 'Casting 1', value: collection.casting1 },
          { label: 'Casting 2', value: collection.casting2 },
          { label: 'Casting 3', value: collection.casting3 },
          { label: 'Casting 4', value: collection.casting4 },
          { label: 'Casting Notes', value: collection.castingNote },
        ])}

        {/* Extruder */}
        {renderSection('Extruder', [
          { label: 'Extruder 1', value: collection.extruder1 },
          { label: 'Extruder 2', value: collection.extruder2 },
          { label: 'Extruder 3', value: collection.extruder3 },
          { label: 'Extruder 4', value: collection.extruder4 },
          { label: 'Extruder Notes', value: collection.extruderNote },
        ])}

        {/* Texture */}
        {renderSection('Texture', [
          { label: 'Texture 1', value: collection.texture1 },
          { label: 'Texture 2', value: collection.texture2 },
          { label: 'Texture 3', value: collection.texture3 },
          { label: 'Texture 4', value: collection.texture4 },
          { label: 'Texture Notes', value: collection.textureNote },
        ])}

        {/* Tools */}
        {renderSection('Tools', [
          { label: 'Tools 1', value: collection.tools1 },
          { label: 'Tools 2', value: collection.tools2 },
          { label: 'Tools 3', value: collection.tools3 },
          { label: 'Tools 4', value: collection.tools4 },
          { label: 'Tools Notes', value: collection.toolsNote },
        ])}

        {/* Engobe */}
        {renderSection('Engobe', [
          { label: 'Engobe 1', value: collection.engobe1 },
          { label: 'Engobe 2', value: collection.engobe2 },
          { label: 'Engobe 3', value: collection.engobe3 },
          { label: 'Engobe 4', value: collection.engobe4 },
          { label: 'Engobe Notes', value: collection.engobeNote },
        ])}

        {/* Bisque */}
        {renderSection('Bisque Firing', [
          { label: 'Temperature', value: collection.bisqueTemp, unit: '°C' },
          { label: 'Notes', value: collection.bisqueTempNote },
        ])}

        {/* Stain & Oxide */}
        {renderSection('Stain & Oxide', [
          { label: 'Stain/Oxide 1', value: collection.stainOxide1 },
          { label: 'Stain/Oxide 2', value: collection.stainOxide2 },
          { label: 'Stain/Oxide 3', value: collection.stainOxide3 },
          { label: 'Stain/Oxide 4', value: collection.stainOxide4 },
          { label: 'Notes', value: collection.stainOxideNote },
        ])}

        {/* Lustre */}
        {renderSection('Lustre', [
          { label: 'Lustre 1', value: collection.lustre1 },
          { label: 'Lustre 2', value: collection.lustre2 },
          { label: 'Lustre 3', value: collection.lustre3 },
          { label: 'Lustre 4', value: collection.lustre4 },
          { label: 'Temperature', value: collection.lustreTemp, unit: '°C' },
          { label: 'Notes', value: collection.lustreNote },
          { label: 'Temperature Notes', value: collection.lustreTempNote },
        ])}

        {/* Glaze */}
        {renderSection('Glaze', [
          { label: 'Glaze 1', value: collection.glaze1 },
          { label: 'Glaze 2', value: collection.glaze2 },
          { label: 'Glaze 3', value: collection.glaze3 },
          { label: 'Glaze 4', value: collection.glaze4 },
          { label: 'Density 1', value: collection.glazeDensity1 },
          { label: 'Density 2', value: collection.glazeDensity2 },
          { label: 'Density 3', value: collection.glazeDensity3 },
          { label: 'Density 4', value: collection.glazeDensity4 },
          { label: 'Technique', value: collection.glazeTechnique },
          { label: 'Temperature', value: collection.glazeTemp, unit: '°C' },
          { label: 'Notes', value: collection.glazeNote },
          { label: 'Temperature Notes', value: collection.glazeTempNote },
        ])}

        {/* Final Firing */}
        {renderSection('Final Firing', [
          { label: 'Firing Type', value: collection.firing },
          { label: 'Notes', value: collection.firingNote },
        ])}

        {/* Photos */}
        {(collection.photo1 || collection.photo2 || collection.photo3 || collection.photo4) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[collection.photo1, collection.photo2, collection.photo3, collection.photo4]
                  .filter(Boolean)
                  .map((photo, index) => (
                    <div key={index} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500 text-sm">Photo {index + 1}</span>
                      {/* TODO: Implement actual image display */}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Metadata */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('Created', new Date(collection.createdAt).toLocaleString())}
              {renderField('Last Updated', new Date(collection.updatedAt).toLocaleString())}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getCollectionTypeBadge(type: string) {
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
}