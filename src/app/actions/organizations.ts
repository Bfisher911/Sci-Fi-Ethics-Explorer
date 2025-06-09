
'use server';

import { db } from '@/lib/firebase/config';
import { doc, setDoc, serverTimestamp, collection } from 'firebase/firestore';
import { type Organization, type OrganizationMemberRole } from '@/types';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as clientApp } from '@/lib/firebase/config';

const getClientFunctions = () => getFunctions(clientApp);

export async function createOrganization(
  creatorUserId: string,
  organizationName: string
): Promise<{ success: boolean; orgId?: string; error?: string }> {
  if (!creatorUserId) {
    console.error("[SERVER ACTION] createOrganization: Creator User ID is required.");
    return { success: false, error: 'Creator User ID is required.' };
  }
  if (!organizationName || !organizationName.trim()) {
    console.error("[SERVER ACTION] createOrganization: Organization name is required.");
    return { success: false, error: 'Organization name is required.' };
  }
  if (!db) {
    console.error("[SERVER ACTION] createOrganization: Firestore database instance (db) is not initialized.");
    return { success: false, error: "Firestore database instance (db) is not initialized. Check Firebase config." };
  }

  const newOrgRef = doc(collection(db, 'organizations'));
  const orgId = newOrgRef.id;

  const newOrganizationData: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'> & { createdAt: any, updatedAt: any } = {
    name: organizationName.trim(),
    ownerId: creatorUserId,
    members: [creatorUserId], // Add creator as the first member
    memberRoles: {
      [creatorUserId]: 'owner' as OrganizationMemberRole,
    },
    plan: 'free', // Default plan
    features: { // Default features for a free plan
        dashboard: true, // Example feature
        analytics: false,  // Example premium feature
        customModules: false,
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    settings: {}, // Initialize with empty settings
  };

  try {
    await setDoc(newOrgRef, newOrganizationData);
    console.log(`[SERVER ACTION] createOrganization: Successfully created organization "${orgId}" for user "${creatorUserId}"`);

    // After creating the organization, set custom claims for the creator
    try {
      const functions = getClientFunctions();
      // Ensure your Cloud Function region is correct here if not 'us-central1'
      // e.g., httpsCallable(functions, 'setOrganizationClaims-europe-west1');
      const setClaimsCallable = httpsCallable(functions, 'setOrganizationClaims');
      console.log(`[SERVER ACTION] createOrganization: Calling setOrganizationClaims for userId: ${creatorUserId}, orgId: ${orgId}, role: owner`);
      const claimsResult = await setClaimsCallable({ userId: creatorUserId, orgId: orgId, role: 'owner' });
      
      // @ts-ignore - data property exists on HttpsCallableResult
      if (claimsResult.data && (claimsResult.data as any).success) {
        console.log('[SERVER ACTION] createOrganization: Custom claims set successfully:', claimsResult.data);
      } else {
        // @ts-ignore
        const claimsError = (claimsResult.data as any)?.error || 'Failed to set custom claims, unknown error from function.';
        console.warn(`[SERVER ACTION] createOrganization: Org created but failed to set custom claims for ${creatorUserId} on org ${orgId}: ${claimsError}`);
        // Potentially return a specific warning to client if claims setting is critical for immediate next steps.
        // For now, we'll consider org creation a success and log the claims issue.
      }
    } catch (claimsError: any) {
      console.error(`[SERVER ACTION] createOrganization: Error calling setOrganizationClaims Cloud Function for ${creatorUserId} on org ${orgId}:`, claimsError.message, claimsError.details);
      // Log error, but org creation itself was successful
    }

    return { success: true, orgId };
  } catch (error: any) {
    console.error(`[SERVER ACTION] createOrganization: Error writing organization document for user ${creatorUserId}:`, error);
    const specificErrorMessage = error.message || String(error);
    if (specificErrorMessage.toLowerCase().includes("permission") || specificErrorMessage.toLowerCase().includes("permission_denied")) {
        return { success: false, error: `Could not create organization due to Firestore permissions. Original error: ${specificErrorMessage}. Please check Firestore security rules.` };
    }
    return { success: false, error: `Could not create organization. Original error: ${specificErrorMessage}` };
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
