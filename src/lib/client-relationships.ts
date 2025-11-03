import { prisma } from './db';

// Client-Region-Department relationship management utilities

export interface ClientRegionDepartment {
  clientId: string;
  region: string;
  department: string;
}

export interface ClientRelationshipData {
  clientId: string;
  regions: string[];
  departments: string[];
  regionDepartmentPairs: ClientRegionDepartment[];
}

/**
 * Get all unique regions across all clients
 */
export async function getAllRegions(): Promise<string[]> {
  const clients = await prisma.client.findMany({
    select: { regions: true },
  });

  const allRegions = new Set<string>();
  clients.forEach(client => {
    client.regions.forEach(region => allRegions.add(region));
  });

  return Array.from(allRegions).sort();
}

/**
 * Get all unique departments across all clients
 */
export async function getAllDepartments(): Promise<string[]> {
  const clients = await prisma.client.findMany({
    select: { departments: true },
  });

  const allDepartments = new Set<string>();
  clients.forEach(client => {
    client.departments.forEach(department => allDepartments.add(department));
  });

  return Array.from(allDepartments).sort();
}

/**
 * Get all region-department combinations for a specific client
 */
export async function getClientRegionDepartments(clientId: string): Promise<ClientRegionDepartment[]> {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { regions: true, departments: true },
  });

  if (!client) {
    throw new Error('Client not found');
  }

  const pairs: ClientRegionDepartment[] = [];
  client.regions.forEach(region => {
    client.departments.forEach(department => {
      pairs.push({
        clientId,
        region,
        department,
      });
    });
  });

  return pairs;
}

/**
 * Get all clients that have a specific region-department combination
 */
export async function getClientsByRegionDepartment(
  region: string,
  department: string
): Promise<Array<{ id: string; code: string; name: string }>> {
  const clients = await prisma.client.findMany({
    where: {
      AND: [
        { regions: { has: region } },
        { departments: { has: department } },
      ],
    },
    select: {
      id: true,
      code: true,
      name: true,
    },
  });

  return clients;
}

/**
 * Validate if a client has a specific region-department combination
 */
export async function validateClientRegionDepartment(
  clientId: string,
  region: string,
  department: string
): Promise<boolean> {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { regions: true, departments: true },
  });

  if (!client) {
    return false;
  }

  return client.regions.includes(region) && client.departments.includes(department);
}

/**
 * Get collections accessible to a client based on their region-department combinations
 */
export async function getCollectionsForClientRegionDepartment(
  clientId: string,
  region?: string,
  department?: string
) {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { regions: true, departments: true },
  });

  if (!client) {
    throw new Error('Client not found');
  }

  // If specific region/department provided, validate they belong to client
  if (region && !client.regions.includes(region)) {
    throw new Error(`Region "${region}" not associated with this client`);
  }

  if (department && !client.departments.includes(department)) {
    throw new Error(`Department "${department}" not associated with this client`);
  }

  // Get collections that match the client's exclusivity rules
  const collections = await prisma.productCollection.findMany({
    where: {
      OR: [
        // GENERAL collections (available to all)
        { collectionType: 'GENERAL' },
        // EXCLUSIVE collections for this client
        { collectionType: 'EXCLUSIVE', clientId },
        // EXCLUSIVE_GROUP collections for this client's region/department combinations
        {
          collectionType: 'EXCLUSIVE_GROUP',
          client: {
            regions: region ? { has: region } : { hasSome: client.regions },
            departments: department ? { has: department } : { hasSome: client.departments },
          },
        },
      ],
    },
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

  return collections;
}

/**
 * Get client relationship statistics
 */
export async function getClientRelationshipStats() {
  const clients = await prisma.client.findMany({
    select: {
      id: true,
      code: true,
      name: true,
      regions: true,
      departments: true,
      collections: {
        select: {
          id: true,
          collectionType: true,
        },
      },
    },
  });

  const stats = {
    totalClients: clients.length,
    totalRegions: new Set<string>(),
    totalDepartments: new Set<string>(),
    clientsByRegion: {} as Record<string, number>,
    clientsByDepartment: {} as Record<string, number>,
    collectionDistribution: {
      GENERAL: 0,
      EXCLUSIVE: 0,
      EXCLUSIVE_GROUP: 0,
    },
  };

  clients.forEach(client => {
    // Count regions and departments
    client.regions.forEach(region => {
      stats.totalRegions.add(region);
      stats.clientsByRegion[region] = (stats.clientsByRegion[region] || 0) + 1;
    });

    client.departments.forEach(department => {
      stats.totalDepartments.add(department);
      stats.clientsByDepartment[department] = (stats.clientsByDepartment[department] || 0) + 1;
    });

    // Count collection types
    client.collections.forEach(collection => {
      stats.collectionDistribution[collection.collectionType]++;
    });
  });

  return {
    ...stats,
    totalRegions: stats.totalRegions.size,
    totalDepartments: stats.totalDepartments.size,
  };
}

/**
 * Update client region-department relationships
 */
export async function updateClientRelationships(
  clientId: string,
  regions: string[],
  departments: string[]
) {
  // Validate that regions and departments are not empty
  if (regions.length === 0) {
    throw new Error('At least one region must be specified');
  }

  if (departments.length === 0) {
    throw new Error('At least one department must be specified');
  }

  // Update client
  const updatedClient = await prisma.client.update({
    where: { id: clientId },
    data: {
      regions,
      departments,
    },
    select: {
      id: true,
      code: true,
      name: true,
      regions: true,
      departments: true,
    },
  });

  return updatedClient;
}

/**
 * Get region-department matrix for all clients
 */
export async function getRegionDepartmentMatrix() {
  const clients = await prisma.client.findMany({
    select: {
      id: true,
      code: true,
      name: true,
      regions: true,
      departments: true,
    },
  });

  const matrix: Record<string, Record<string, string[]>> = {};

  clients.forEach(client => {
    client.regions.forEach(region => {
      client.departments.forEach(department => {
        if (!matrix[region]) {
          matrix[region] = {};
        }
        if (!matrix[region][department]) {
          matrix[region][department] = [];
        }
        matrix[region][department].push(`${client.name} (${client.code})`);
      });
    });
  });

  return matrix;
}