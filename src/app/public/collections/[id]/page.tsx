'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Printer, Download, Eye, Calendar, Ruler, Weight } from 'lucide-react';
import { ImageGallery } from '@/components/ImageGallery';

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
  collectionType: 'EXCLUSIVE' | 'EXCLUSIVE_GROUP' | 'GENERAL';
  collectDate: string | null;
  techDraw: string | null;
  refId: string | null;
  clay: string | null;
  clayKG: number | null;
  clayNote: string | null;
  buildTech: string | null;
  buildTechNote: string | null;
  rim: string | null;
  feet: string | null;
  width: number | null;
  height: number | null;
  length: number | null;
  diameter: number | null;
  finalSizeNote: string | null;
  photo1: string | null;
  photo2: string | null;
  photo3: string | null;
  photo4: string | null;
  createdAt: string;
  client?: {
    id: string;
    code: string;
    name: string;
  };
}

export default function PublicCollectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [collection, setCollection] = useState<ProductCollection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchCollection(params.id as string);
    }
  }, [params.id]);

  const fetchCollection = async (id: string) => {
    try {
      const response = await fetch(`/api/collections/${id}?public=true`);
      if (response.ok) {
        const data = await response.json();
        setCollection(data.collection);
      } else {
        console.error('Failed to fetch collection');
        router.push('/public/collections');
      }
    } catch (error) {
      console.error('Error fetching collection:', error);
      router.push('/public/collections');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getCollectionTypeBadge = (type: string) => {
    const variants = {
      EXCLUSIVE: 'destructive',
      EXCLUSIVE_GROUP: 'secondary',
      GENERAL: 'default',
    } as const;

    return (
      <Badge variant={variants[type as keyof typeof variants] || 'outline'} className="text-sm">
        {type.replace('_', ' ')}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading collection details...</p>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Collection Not Found</h2>
          <p className="text-gray-600 mb-4">The collection you're looking for doesn't exist or is not publicly available.</p>
          <Link href="/public/collections">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Collections
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* Print Header */}
      <div className="print:block hidden print-header">
        <div className="print-title">Ceramic Collection Details</div>
        <div className="print-subtitle">{collection.collectCode} - {collection.nameCode}</div>
      </div>

      {/* Header */}
      <div className="bg-white shadow-sm print:shadow-none print:hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/public/collections">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Collections
              </Button>
            </Link>
            <div className="flex space-x-2 print:hidden">
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Images Gallery */}
        {(collection.photo1 || collection.photo2 || collection.photo3 || collection.photo4) && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageGallery
                images={[
                  collection.photo1,
                  collection.photo2,
                  collection.photo3,
                  collection.photo4,
                ].filter(Boolean) as string[]}
                alt={`${collection.collectCode} - ${collection.nameCode}`}
                className="max-w-2xl mx-auto"
              />
            </CardContent>
          </Card>
        )}

        {/* Collection Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{collection.collectCode}</h1>
              <p className="text-xl text-gray-600 mt-1">{collection.nameCode}</p>
            </div>
            {getCollectionTypeBadge(collection.collectionType)}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-gray-500 mb-1">Design Code</div>
              <div className="font-semibold">{collection.designCode}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-gray-500 mb-1">Category</div>
              <div className="font-semibold">{collection.categoryCode}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-gray-500 mb-1">Size Code</div>
              <div className="font-semibold">{collection.sizeCode}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-gray-500 mb-1">Material</div>
              <div className="font-semibold">{collection.materialCode}</div>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Collection Code</label>
                  <p className="text-lg font-semibold">{collection.collectCode}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Design Code</label>
                  <p>{collection.designCode}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Name Code</label>
                  <p>{collection.nameCode}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Category Code</label>
                  <p>{collection.categoryCode}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Size Code</label>
                  <p>{collection.sizeCode}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Texture Code</label>
                  <p>{collection.textureCode}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Color Code</label>
                  <p>{collection.colorCode}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Material Code</label>
                  <p>{collection.materialCode}</p>
                </div>
              </div>
            </div>

            {collection.client && (
              <>
                <Separator className="my-6" />
                <div>
                  <label className="text-sm font-medium text-gray-500">Client</label>
                  <p className="text-lg">{collection.client.name} ({collection.client.code})</p>
                </div>
              </>
            )}

            {(collection.collectDate || collection.refId) && (
              <>
                <Separator className="my-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {collection.collectDate && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Collection Date
                      </label>
                      <p>{new Date(collection.collectDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  {collection.refId && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Reference ID</label>
                      <p>{collection.refId}</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Clay & Build Information */}
        {(collection.clay || collection.buildTech || collection.clayKG) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Clay & Build</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {collection.clay && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Clay Type</label>
                    <p>{collection.clay}</p>
                  </div>
                )}
                {collection.clayKG && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center">
                      <Weight className="w-4 h-4 mr-1" />
                      Clay Quantity
                    </label>
                    <p>{collection.clayKG} kg</p>
                  </div>
                )}
                {collection.buildTech && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Build Technique</label>
                    <p>{collection.buildTech}</p>
                  </div>
                )}
                {collection.rim && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Rim</label>
                    <p>{collection.rim}</p>
                  </div>
                )}
              </div>

              {(collection.clayNote || collection.buildTechNote) && (
                <>
                  <Separator className="my-6" />
                  <div className="space-y-4">
                    {collection.clayNote && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Clay Notes</label>
                        <p className="whitespace-pre-wrap">{collection.clayNote}</p>
                      </div>
                    )}
                    {collection.buildTechNote && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Build Technique Notes</label>
                        <p className="whitespace-pre-wrap">{collection.buildTechNote}</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Dimensions */}
        {(collection.width || collection.height || collection.length || collection.diameter) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Ruler className="w-5 h-5 mr-2" />
                Dimensions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {collection.width && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{collection.width}</div>
                    <div className="text-sm text-gray-500">Width (mm)</div>
                  </div>
                )}
                {collection.height && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{collection.height}</div>
                    <div className="text-sm text-gray-500">Height (mm)</div>
                  </div>
                )}
                {collection.length && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{collection.length}</div>
                    <div className="text-sm text-gray-500">Length (mm)</div>
                  </div>
                )}
                {collection.diameter && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{collection.diameter}</div>
                    <div className="text-sm text-gray-500">Diameter (mm)</div>
                  </div>
                )}
              </div>

              {collection.finalSizeNote && (
                <>
                  <Separator className="my-6" />
                  <div>
                    <label className="text-sm font-medium text-gray-500">Size Notes</label>
                    <p className="whitespace-pre-wrap">{collection.finalSizeNote}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 print:hidden">
          <p>Collection created on {new Date(collection.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}