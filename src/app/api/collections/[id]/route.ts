import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createSuccessResponse, handleApiError } from '@/lib/api-response';
import { productCollectionSchema, validateCollectionExclusivity } from '@/lib/validations';
import { withErrorHandler } from '@/lib/api-response';

export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error('Unauthorized');
  }

  const collection = await prisma.productCollection.findUnique({
    where: { id },
    include: {
      client: {
        select: {
          id: true,
          code: true,
          name: true,
          regions: true,
          departments: true,
        },
      },
    },
  });

  if (!collection) {
    throw new Error('Collection not found');
  }

  // Role-based access control
  if (session.user && (session.user as any).role === 'PUBLIC' && collection.collectionType !== 'GENERAL') {
    throw new Error('Access denied');
  }

  return createSuccessResponse(collection);
});

export const PUT = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !['COLLECTION', 'ADMIN'].includes((session.user as any).role || '')) {
    throw new Error('Unauthorized - Collection or Admin role required');
  }

  const body = await request.json();
  const validatedData = productCollectionSchema.parse(body);

  // Validate exclusivity rules
  validateCollectionExclusivity(validatedData.collectionType, validatedData.clientId);

  const collection = await prisma.productCollection.update({
    where: { id },
    data: validatedData,
    include: {
      client: {
        select: {
          id: true,
          code: true,
          name: true,
          regions: true,
          departments: true,
        },
      },
    },
  });

  return createSuccessResponse(collection, 'Collection updated successfully');
});

export const DELETE = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !['COLLECTION', 'ADMIN'].includes((session.user as any).role || '')) {
    throw new Error('Unauthorized - Collection or Admin role required');
  }

  await prisma.productCollection.delete({
    where: { id },
  });

  return createSuccessResponse({ id }, 'Collection deleted successfully');
});