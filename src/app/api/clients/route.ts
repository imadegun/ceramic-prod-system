import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createSuccessResponse, handleApiError } from '@/lib/api-response';
import { clientSchema } from '@/lib/validations';
import { withErrorHandler } from '@/lib/api-response';

export const GET = withErrorHandler(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error('Unauthorized');
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';

  const where: any = {};

  // Add search functionality
  if (search) {
    where.OR = [
      { code: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } },
    ];
  }

  const clients = await prisma.client.findMany({
    where,
    orderBy: { name: 'asc' },
  });

  return createSuccessResponse({ clients });
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
    throw new Error('Unauthorized - Admin role required');
  }

  const body = await request.json();
  const validatedData = clientSchema.parse(body);

  const client = await prisma.client.create({
    data: validatedData,
  });

  return createSuccessResponse(client, 'Client created successfully', 201);
});