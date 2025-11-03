import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createSuccessResponse, handleApiError } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-response';
import {
  getAllRegions,
  getAllDepartments,
  getClientRegionDepartments,
  getClientsByRegionDepartment,
  getRegionDepartmentMatrix,
  getClientRelationshipStats,
  updateClientRelationships,
} from '@/lib/client-relationships';

// GET /api/clients/relationships - Get relationship data
export const GET = withErrorHandler(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !['COLLECTION', 'PRODUCTION', 'ADMIN'].includes((session.user as any).role || '')) {
    throw new Error('Unauthorized - Collection, Production, or Admin role required');
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  switch (action) {
    case 'regions':
      const regions = await getAllRegions();
      return createSuccessResponse({ regions });

    case 'departments':
      const departments = await getAllDepartments();
      return createSuccessResponse({ departments });

    case 'matrix':
      const matrix = await getRegionDepartmentMatrix();
      return createSuccessResponse({ matrix });

    case 'stats':
      const stats = await getClientRelationshipStats();
      return createSuccessResponse({ stats });

    case 'client':
      const clientId = searchParams.get('clientId');
      if (!clientId) {
        throw new Error('clientId parameter required');
      }
      const clientRelationships = await getClientRegionDepartments(clientId);
      return createSuccessResponse({ relationships: clientRelationships });

    case 'clients-by-region-dept':
      const region = searchParams.get('region');
      const department = searchParams.get('department');
      if (!region || !department) {
        throw new Error('region and department parameters required');
      }
      const clients = await getClientsByRegionDepartment(region, department);
      return createSuccessResponse({ clients });

    default:
      // Return comprehensive relationship data
      const [allRegions, allDepartments, matrixData, statsData] = await Promise.all([
        getAllRegions(),
        getAllDepartments(),
        getRegionDepartmentMatrix(),
        getClientRelationshipStats(),
      ]);

      return createSuccessResponse({
        regions: allRegions,
        departments: allDepartments,
        matrix: matrixData,
        stats: statsData,
      });
  }
});

// POST /api/clients/relationships - Update client relationships
export const POST = withErrorHandler(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
    throw new Error('Unauthorized - Admin role required');
  }

  const body = await request.json();
  const { clientId, regions, departments } = body;

  if (!clientId || !Array.isArray(regions) || !Array.isArray(departments)) {
    throw new Error('clientId, regions (array), and departments (array) are required');
  }

  const updatedClient = await updateClientRelationships(clientId, regions, departments);

  return createSuccessResponse(updatedClient, 'Client relationships updated successfully');
});