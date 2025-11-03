import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createSuccessResponse, handleApiError } from '@/lib/api-response';
import { productCollectionSchema, validateCollectionExclusivity } from '@/lib/validations';
import { withErrorHandler } from '@/lib/api-response';

export const GET = withErrorHandler(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error('Unauthorized');
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const search = searchParams.get('search') || '';
  const clientId = searchParams.get('clientId') || '';
  const categoryCode = searchParams.get('categoryCode') || '';
  const collectionType = searchParams.get('collectionType') || '';

  const skip = (page - 1) * limit;

  const where: any = {};

  // Add search functionality
  if (search) {
    where.OR = [
      { collectCode: { contains: search, mode: 'insensitive' } },
      { nameCode: { contains: search, mode: 'insensitive' } },
      { designCode: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Add filters
  if (clientId) {
    where.clientId = clientId;
  }

  if (categoryCode) {
    where.categoryCode = categoryCode;
  }

  if (collectionType) {
    where.collectionType = collectionType;
  }

  // Role-based access control
  if (session.user && ((session.user as any).role === 'COLLECTION' || (session.user as any).role === 'PRODUCTION')) {
    // Allow access to all collections for these roles
  } else if (session.user && (session.user as any).role === 'PUBLIC') {
    // Public users can only see GENERAL collections
    where.collectionType = 'GENERAL';
  }

  const [collections, total] = await Promise.all([
    prisma.productCollection.findMany({
      where,
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
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.productCollection.count({ where }),
  ]);

  return createSuccessResponse({
    collections,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !['COLLECTION', 'ADMIN'].includes((session.user as any).role || '')) {
    throw new Error('Unauthorized - Collection or Admin role required');
  }

  const body = await request.json();
  const validatedData = productCollectionSchema.parse(body);

  // Validate exclusivity rules
  validateCollectionExclusivity(validatedData.collectionType, validatedData.clientId);

  const collection = await prisma.productCollection.create({
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

  return createSuccessResponse(collection, 'Collection created successfully', 201);
});