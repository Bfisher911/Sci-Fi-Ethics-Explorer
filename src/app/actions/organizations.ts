
'use server';

import { db } from '@/lib/firebase/config';
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteField,
  serverTimestamp,
  collection,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import {
  type Organization,
  type OrganizationMemberRole,
  type OrganizationInvite,
  type UserProfile,
} from '@/types';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as clientApp } from '@/lib/firebase/config';

// Helper to get client functions instance
const getClientFunctions = () => getFunctions(clientApp, 'us-central1');

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
      }
    } catch (claimsError: any) {
      console.error(`[SERVER ACTION] createOrganization: Error calling setOrganizationClaims Cloud Function for ${creatorUserId} on org ${orgId}:`, claimsError.message, claimsError.details);
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

/**
 * Fetch organization details by ID.
 */
export async function getOrganizationDetails(
  orgId: string
): Promise<{ success: boolean; data?: Organization; error?: string }> {
  if (!orgId) {
    console.error("[SERVER ACTION] getOrganizationDetails: Organization ID is required.");
    return { success: false, error: "Organization ID is required." };
  }
  if (!db) {
    return { success: false, error: "Firestore is not initialized." };
  }

  try {
    const orgRef = doc(db, 'organizations', orgId);
    const orgSnap = await getDoc(orgRef);

    if (!orgSnap.exists()) {
      return { success: false, error: "Organization not found." };
    }

    const data = orgSnap.data();
    const organization: Organization = {
      id: orgSnap.id,
      name: data.name,
      ownerId: data.ownerId,
      members: data.members || [],
      memberRoles: data.memberRoles || {},
      plan: data.plan || 'free',
      features: data.features || {},
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      settings: data.settings || {},
    };

    return { success: true, data: organization };
  } catch (error: any) {
    console.error(`[SERVER ACTION] getOrganizationDetails: Error fetching org '${orgId}':`, error);
    return { success: false, error: `Failed to fetch organization: ${error.message}` };
  }
}

/**
 * Create an invite in the organizations/{orgId}/invites subcollection.
 */
export async function addMemberToOrganization(
  orgId: string,
  userEmail: string,
  role: string,
  invitedBy?: string
): Promise<{ success: boolean; inviteId?: string; error?: string }> {
  if (!orgId || !userEmail || !role) {
    return { success: false, error: "Organization ID, User Email, and Role are required." };
  }
  if (!db) {
    return { success: false, error: "Firestore is not initialized." };
  }

  try {
    const inviteRef = doc(collection(db, 'organizations', orgId, 'invites'));
    const inviteData: Omit<OrganizationInvite, 'id'> = {
      organizationId: orgId,
      email: userEmail.trim().toLowerCase(),
      role: role as OrganizationMemberRole,
      status: 'pending',
      invitedBy: invitedBy || '',
      createdAt: serverTimestamp(),
    };

    await setDoc(inviteRef, inviteData);
    console.log(`[SERVER ACTION] addMemberToOrganization: Created invite '${inviteRef.id}' for '${userEmail}' in org '${orgId}'`);

    return { success: true, inviteId: inviteRef.id };
  } catch (error: any) {
    console.error(`[SERVER ACTION] addMemberToOrganization: Error creating invite:`, error);
    return { success: false, error: `Failed to create invite: ${error.message}` };
  }
}

/**
 * Remove a member from an organization. Only owner or leader can do this.
 */
export async function removeMember(
  orgId: string,
  memberId: string,
  requesterId: string
): Promise<{ success: boolean; error?: string }> {
  if (!orgId || !memberId || !requesterId) {
    return { success: false, error: "Organization ID, Member ID, and Requester ID are required." };
  }
  if (!db) {
    return { success: false, error: "Firestore is not initialized." };
  }

  try {
    const orgRef = doc(db, 'organizations', orgId);
    const orgSnap = await getDoc(orgRef);

    if (!orgSnap.exists()) {
      return { success: false, error: "Organization not found." };
    }

    const orgData = orgSnap.data();
    const requesterRole = orgData.memberRoles?.[requesterId] as OrganizationMemberRole | undefined;
    const targetRole = orgData.memberRoles?.[memberId] as OrganizationMemberRole | undefined;

    if (!requesterRole || (requesterRole !== 'owner' && requesterRole !== 'leader')) {
      return { success: false, error: "Only owners and leaders can remove members." };
    }

    if (targetRole === 'owner') {
      return { success: false, error: "Cannot remove the organization owner." };
    }

    if (requesterRole === 'leader' && targetRole === 'leader') {
      return { success: false, error: "Leaders cannot remove other leaders." };
    }

    await updateDoc(orgRef, {
      members: arrayRemove(memberId),
      [`memberRoles.${memberId}`]: deleteField(),
      updatedAt: serverTimestamp(),
    });

    console.log(`[SERVER ACTION] removeMember: Removed '${memberId}' from org '${orgId}' by '${requesterId}'`);
    return { success: true };
  } catch (error: any) {
    console.error(`[SERVER ACTION] removeMember: Error:`, error);
    return { success: false, error: `Failed to remove member: ${error.message}` };
  }
}

/**
 * Update a member's role. Only the owner can change roles.
 */
export async function updateMemberRole(
  orgId: string,
  memberId: string,
  newRole: OrganizationMemberRole,
  requesterId: string
): Promise<{ success: boolean; error?: string }> {
  if (!orgId || !memberId || !newRole || !requesterId) {
    return { success: false, error: "All parameters are required." };
  }
  if (!db) {
    return { success: false, error: "Firestore is not initialized." };
  }

  try {
    const orgRef = doc(db, 'organizations', orgId);
    const orgSnap = await getDoc(orgRef);

    if (!orgSnap.exists()) {
      return { success: false, error: "Organization not found." };
    }

    const orgData = orgSnap.data();
    const requesterRole = orgData.memberRoles?.[requesterId] as OrganizationMemberRole | undefined;

    if (requesterRole !== 'owner') {
      return { success: false, error: "Only the organization owner can change member roles." };
    }

    if (memberId === requesterId && newRole !== 'owner') {
      return { success: false, error: "The owner cannot demote themselves." };
    }

    if (!(orgData.members || []).includes(memberId)) {
      return { success: false, error: "User is not a member of this organization." };
    }

    await updateDoc(orgRef, {
      [`memberRoles.${memberId}`]: newRole,
      updatedAt: serverTimestamp(),
    });

    console.log(`[SERVER ACTION] updateMemberRole: Updated '${memberId}' to '${newRole}' in org '${orgId}'`);
    return { success: true };
  } catch (error: any) {
    console.error(`[SERVER ACTION] updateMemberRole: Error:`, error);
    return { success: false, error: `Failed to update role: ${error.message}` };
  }
}

/**
 * Fetch member details by reading user profiles for each member UID.
 */
export async function getOrganizationMembers(
  orgId: string
): Promise<{
  success: boolean;
  data?: { uid: string; name: string; email: string; role: OrganizationMemberRole }[];
  error?: string;
}> {
  if (!orgId) {
    return { success: false, error: "Organization ID is required." };
  }
  if (!db) {
    return { success: false, error: "Firestore is not initialized." };
  }

  try {
    const orgRef = doc(db, 'organizations', orgId);
    const orgSnap = await getDoc(orgRef);

    if (!orgSnap.exists()) {
      return { success: false, error: "Organization not found." };
    }

    const orgData = orgSnap.data();
    const memberUids: string[] = orgData.members || [];
    const memberRoles: Record<string, OrganizationMemberRole> = orgData.memberRoles || {};

    const members: { uid: string; name: string; email: string; role: OrganizationMemberRole }[] = [];

    for (const uid of memberUids) {
      try {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data() as UserProfile;
          members.push({
            uid,
            name: userData.displayName || userData.firstName || 'Unknown',
            email: userData.email || '',
            role: memberRoles[uid] || 'member',
          });
        } else {
          members.push({
            uid,
            name: 'Unknown User',
            email: '',
            role: memberRoles[uid] || 'member',
          });
        }
      } catch (userError) {
        console.warn(`[SERVER ACTION] getOrganizationMembers: Could not fetch profile for uid '${uid}'`);
        members.push({
          uid,
          name: 'Unknown User',
          email: '',
          role: memberRoles[uid] || 'member',
        });
      }
    }

    return { success: true, data: members };
  } catch (error: any) {
    console.error(`[SERVER ACTION] getOrganizationMembers: Error:`, error);
    return { success: false, error: `Failed to fetch members: ${error.message}` };
  }
}

/**
 * Fetch all invites from the organizations/{orgId}/invites subcollection.
 */
export async function getOrganizationInvites(
  orgId: string
): Promise<{ success: boolean; data?: OrganizationInvite[]; error?: string }> {
  if (!orgId) {
    return { success: false, error: "Organization ID is required." };
  }
  if (!db) {
    return { success: false, error: "Firestore is not initialized." };
  }

  try {
    const invitesRef = collection(db, 'organizations', orgId, 'invites');
    const invitesSnap = await getDocs(invitesRef);

    const invites: OrganizationInvite[] = invitesSnap.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as OrganizationInvite[];

    return { success: true, data: invites };
  } catch (error: any) {
    console.error(`[SERVER ACTION] getOrganizationInvites: Error:`, error);
    return { success: false, error: `Failed to fetch invites: ${error.message}` };
  }
}

/**
 * Accept an invite: update invite status, add user to members array and memberRoles.
 */
export async function acceptInvite(
  orgId: string,
  inviteId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  if (!orgId || !inviteId || !userId) {
    return { success: false, error: "Organization ID, Invite ID, and User ID are required." };
  }
  if (!db) {
    return { success: false, error: "Firestore is not initialized." };
  }

  try {
    const inviteRef = doc(db, 'organizations', orgId, 'invites', inviteId);
    const inviteSnap = await getDoc(inviteRef);

    if (!inviteSnap.exists()) {
      return { success: false, error: "Invite not found." };
    }

    const inviteData = inviteSnap.data() as OrganizationInvite;

    if (inviteData.status !== 'pending') {
      return { success: false, error: `Invite has already been ${inviteData.status}.` };
    }

    // Update invite status
    await updateDoc(inviteRef, {
      status: 'accepted',
    });

    // Add user to organization
    const orgRef = doc(db, 'organizations', orgId);
    await updateDoc(orgRef, {
      members: arrayUnion(userId),
      [`memberRoles.${userId}`]: inviteData.role || 'member',
      updatedAt: serverTimestamp(),
    });

    console.log(`[SERVER ACTION] acceptInvite: User '${userId}' accepted invite '${inviteId}' for org '${orgId}'`);
    return { success: true };
  } catch (error: any) {
    console.error(`[SERVER ACTION] acceptInvite: Error:`, error);
    return { success: false, error: `Failed to accept invite: ${error.message}` };
  }
}

/**
 * Update organization settings (name). Only the owner can do this.
 */
export async function updateOrganizationSettings(
  orgId: string,
  requesterId: string,
  updates: { name?: string }
): Promise<{ success: boolean; error?: string }> {
  if (!orgId || !requesterId) {
    return { success: false, error: "Organization ID and Requester ID are required." };
  }
  if (!db) {
    return { success: false, error: "Firestore is not initialized." };
  }

  try {
    const orgRef = doc(db, 'organizations', orgId);
    const orgSnap = await getDoc(orgRef);

    if (!orgSnap.exists()) {
      return { success: false, error: "Organization not found." };
    }

    const orgData = orgSnap.data();
    if (orgData.memberRoles?.[requesterId] !== 'owner') {
      return { success: false, error: "Only the organization owner can update settings." };
    }

    const updateData: Record<string, any> = {
      updatedAt: serverTimestamp(),
    };

    if (updates.name && updates.name.trim()) {
      updateData.name = updates.name.trim();
    }

    await updateDoc(orgRef, updateData);
    console.log(`[SERVER ACTION] updateOrganizationSettings: Updated org '${orgId}' by '${requesterId}'`);
    return { success: true };
  } catch (error: any) {
    console.error(`[SERVER ACTION] updateOrganizationSettings: Error:`, error);
    return { success: false, error: `Failed to update settings: ${error.message}` };
  }
}
