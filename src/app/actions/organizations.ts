
'use server';

import { db } from '@/lib/firebase/config';
import { doc, setDoc, serverTimestamp, collection } from 'firebase/firestore';
import { type Organization, type OrganizationMemberRole } from '@/types';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as clientApp } from '@/lib/firebase/config';

// Helper to get client functions instance
const getClientFunctions = () => getFunctions(clientApp, 'us-central1'); // Specify region if not default

export async function createOrganization(
  creatorUserId: string,
  organizationName: string
): Promise<{ success: boolean; orgId?: string; error?: string }> {
  console.log(`[SERVER ACTION] createOrganization: Initiated by creatorUserId: '${creatorUserId}', Org Name: '${organizationName}'`);

  if (!creatorUserId) {
    const errorMsg = "[SERVER ACTION] createOrganization: Creator User ID is required.";
    console.error(errorMsg);
    return { success: false, error: errorMsg };
  }
  if (!organizationName || !organizationName.trim()) {
    const errorMsg = "[SERVER ACTION] createOrganization: Organization name is required.";
    console.error(errorMsg);
    return { success: false, error: errorMsg };
  }
  if (!db) {
    const errorMsg = "[SERVER ACTION] createOrganization: Firestore database instance (db) is not initialized. Check Firebase config.";
    console.error(errorMsg);
    return { success: false, error: errorMsg };
  }

  const newOrgRef = doc(collection(db, 'organizations'));
  const orgId = newOrgRef.id;

  const newOrganizationData: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'> & { createdAt: any, updatedAt: any } = {
    name: organizationName.trim(),
    ownerId: creatorUserId, // This is critical for the security rule
    members: [creatorUserId],
    memberRoles: {
      [creatorUserId]: 'owner' as OrganizationMemberRole,
    },
    plan: 'free',
    features: {
        dashboard: true,
        analytics: false,
        customModules: false,
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    settings: {},
  };

  console.log(`[SERVER ACTION] createOrganization: Attempting to write org doc for orgId '${orgId}' with data:`, JSON.stringify(newOrganizationData));

  try {
    await setDoc(newOrgRef, newOrganizationData);
    console.log(`[SERVER ACTION] createOrganization: Successfully created organization Firestore doc "${orgId}" for user "${creatorUserId}"`);

    // After creating the organization, set custom claims for the creator
    try {
      const functions = getClientFunctions();
      const setClaimsCallable = httpsCallable(functions, 'setOrganizationClaims');
      console.log(`[SERVER ACTION] createOrganization: Calling setOrganizationClaims Cloud Function for userId: ${creatorUserId}, orgId: ${orgId}, role: owner`);
      
      const claimsResult = await setClaimsCallable({ userId: creatorUserId, orgId: orgId, role: 'owner' });
      
      // @ts-ignore - data property exists on HttpsCallableResult
      if (claimsResult.data && (claimsResult.data as any).success) {
        console.log('[SERVER ACTION] createOrganization: Custom claims set successfully:', claimsResult.data);
      } else {
        // @ts-ignore
        const claimsError = (claimsResult.data as any)?.error || 'Failed to set custom claims, unknown error from function.';
        console.warn(`[SERVER ACTION] createOrganization: Org doc created but failed to set custom claims for ${creatorUserId} on org ${orgId}: ${claimsError}`);
        // Org creation in Firestore succeeded, but claims failed.
        // We will still return success for org creation, but the client might need to re-auth to see claims.
      }
    } catch (claimsError: any) {
      console.error(`[SERVER ACTION] createOrganization: Error calling setOrganizationClaims Cloud Function for ${creatorUserId} on org ${orgId}:`, claimsError.message, claimsError.details);
      // Log error, but org creation in Firestore itself was successful before this point.
    }

    return { success: true, orgId };
  } catch (error: any) {
    console.error(`[SERVER ACTION] createOrganization: Firestore error writing organization document for orgId '${orgId}', user '${creatorUserId}':`, error);
    const specificErrorMessage = error.message || String(error);
    if (specificErrorMessage.toLowerCase().includes("permission_denied") || specificErrorMessage.toLowerCase().includes("permission denied")) {
        return { 
            success: false, 
            error: `Could not create organization due to Firestore permissions. Original error: ${specificErrorMessage}. Please check Firestore security rules for the 'organizations' collection. Ensure the 'create' rule (if request.auth.uid == request.resource.data.ownerId) is met.` 
        };
    }
    return { success: false, error: `Could not create organization. Firestore error: ${specificErrorMessage}` };
  }
}

// Placeholder for getOrganizationDetails - will be implemented in Phase 2
export async function getOrganizationDetails(orgId: string): Promise<{ success: boolean; data?: Organization; error?: string }> {
    if (!orgId) {
        console.error("[SERVER ACTION] getOrganizationDetails: Organization ID is required.");
        return { success: false, error: "Organization ID is required."};
    }
    // Implementation in Phase 2
    console.warn("[SERVER ACTION] getOrganizationDetails: Not yet implemented.");
    return { success: false, error: "getOrganizationDetails not yet implemented"};
}

// Placeholder for addMemberToOrganization - will be implemented in Phase 2
export async function addMemberToOrganization(orgId: string, userEmail: string, role: string): Promise<{ success: boolean; error?: string }> {
    if (!orgId || !userEmail || !role) {
        console.error("[SERVER ACTION] addMemberToOrganization: Organization ID, User Email, and Role are required.");
        return { success: false, error: "Organization ID, User Email, and Role are required."};
    }
    // Implementation in Phase 2
    console.warn("[SERVER ACTION] addMemberToOrganization: Not yet implemented.");
    return { success: false, error: "addMemberToOrganization not yet implemented"};
}
