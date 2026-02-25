
"use client";

import { useMemo } from 'react';
import { useFirestore, useDoc, useUser, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

/**
 * @fileOverview Strategic Workflow Access Hook.
 * Determines if the current user has permission to perform specific actions
 * or view specific modules based on the active workflow configuration.
 */

export function useWorkflowAccess(moduleType?: string, projectId?: string) {
  const db = useFirestore();
  const { user } = useUser();

  // 1. Fetch User Record to get Role
  const memberRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, "teamMembers", user.uid);
  }, [db, user]);
  const { data: member } = useDoc(memberRef);

  // 2. Fetch Workflow Config
  const workflowRef = useMemoFirebase(() => doc(db, "workflowSettings", "defaultWorkflow"), [db]);
  const { data: workflow } = useDoc(workflowRef);

  // 3. Fetch Project if ID provided (to get current stage)
  const projectRef = useMemoFirebase(() => {
    if (!projectId) return null;
    return doc(db, "projects", projectId);
  }, [db, projectId]);
  const { data: project } = useDoc(projectRef);

  return useMemo(() => {
    if (!member || !workflow) return { canView: false, permissions: null, isLoading: true };

    const userRole = member.roleId; // This is the role NAME or ID
    const nodes = workflow.nodes || [];

    // Global Module Check (if no project context)
    if (moduleType && !projectId) {
      const moduleNodes = nodes.filter((n: any) => n.data.moduleType === moduleType);
      const hasAccess = moduleNodes.some((n: any) => 
        (n.data.allowedRoles || []).includes(userRole) || userRole === 'Super Admin'
      );
      
      return {
        canView: hasAccess || userRole === 'Super Admin',
        permissions: null,
        isLoading: false
      };
    }

    // Project-Specific Stage Check
    if (projectId && project) {
      const currentNode = nodes.find((n: any) => n.data.stage === project.status && n.data.moduleType === moduleType);
      
      if (!currentNode) return { canView: true, permissions: null, isLoading: false }; // Fallback

      const isAllowedRole = (currentNode.data.allowedRoles || []).includes(userRole) || userRole === 'Super Admin';
      
      return {
        canView: isAllowedRole,
        permissions: currentNode.data.permissions || null,
        isLoading: false
      };
    }

    return { canView: true, permissions: null, isLoading: false };
  }, [member, workflow, project, moduleType, projectId]);
}
