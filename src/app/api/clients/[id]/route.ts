import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createSuccessResponse, handleApiError } from '@/lib/api-response';
import { clientSchema } from '@/lib/validations';
import { withErrorHandler } from '@/lib/api-response';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: RouteParams
) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error('Unauthorized');
  }

  const { id } = await params;

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      collections: {
        select: {
          id: true,
          collectCode: true,
          nameCode: true,
          collectionType: true,
        },
      },
      pols: {
        select: {
          id: true,
          polNumber: true,
          status: true,
          orderDate: true,
        },
      },
      _count: {
        select: {
          collections: true,
          pols: true,
        },
      },
    },
  });

  if (!client) {
    throw new Error('Client not found');
  }

  return createSuccessResponse(client);
});

export const PUT = withErrorHandler(async (
  request: NextRequest,
  { params }: RouteParams
) => {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
    throw new Error('Unauthorized - Admin role required');
  }

  const { id } = await params;
  const body = await request.json();
  const validatedData = clientSchema.parse(body);

  const client = await prisma.client.update({
    where: { id },
    data: validatedData,
    include: {
      _count: {
        select: {
          collections: true,
          pols: true,
        },
      },
    },
  });

  return createSuccessResponse(client, 'Client updated successfully');
});

export const DELETE = withErrorHandler(async (
  request: NextRequest,
  { params }: RouteParams
) => {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
    throw new Error('Unauthorized - Admin role required');
  }

  const { id } = await params;

  // Check if client has associated collections or POLs
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          collections: true,
          pols: true,
        },
      },
    },
  });

  if (!client) {
    throw new Error('Client not found');
  }

  if (client._count.collections > 0 || client._count.pols > 0) {
    throw new Error(
      `Cannot delete client with ${client._count.collections} collections and ${client._count.pols} purchase orders. Please reassign or delete associated records first.`
    );
  }

  await prisma.client.delete({
    where: { id },
  });

  return createSuccessResponse({ id }, 'Client deleted successfully');
});