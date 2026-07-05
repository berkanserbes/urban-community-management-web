import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { unwrapApiResult } from '@/lib/api/result'
import {
  createOrganization,
  createOrganizationDepartment,
  deleteOrganization,
  deleteOrganizationDepartment,
  getOrganizationDepartments,
  getOrganizations,
  setOrganizationActive,
  setOrganizationDepartmentActive,
  setOrganizationDepartmentCategories,
  updateOrganization,
  updateOrganizationDepartment,
  type OrganizationDepartmentPayload,
  type OrganizationPayload,
} from '@/features/organizations/api/organizationsApi'

const organizationsKey = ['organizations']
const departmentsKey = (organizationId: string) => ['organizations', organizationId, 'departments']

export function useOrganizationsQuery(activeOnly = false) {
  return useQuery({
    queryKey: [...organizationsKey, { activeOnly }],
    queryFn: async () => unwrapApiResult(await getOrganizations(activeOnly)),
  })
}

export function useOrganizationDepartmentsQuery(
  organizationId: string | null,
  activeOnly = false,
) {
  return useQuery({
    queryKey: organizationId ? [...departmentsKey(organizationId), { activeOnly }] : ['organizations', 'none'],
    queryFn: async () => unwrapApiResult(await getOrganizationDepartments(organizationId!, activeOnly)),
    enabled: Boolean(organizationId),
  })
}

export function useOrganizationMutations() {
  const client = useQueryClient()
  const invalidate = () => client.invalidateQueries({ queryKey: organizationsKey })

  return {
    create: useMutation({
      mutationFn: async (payload: OrganizationPayload) => unwrapApiResult(await createOrganization(payload)),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: async ({ id, ...payload }: OrganizationPayload & { id: string }) =>
        unwrapApiResult(await updateOrganization(id, payload)),
      onSuccess: invalidate,
    }),
    setActive: useMutation({
      mutationFn: async ({ id, active }: { id: string; active: boolean }) =>
        unwrapApiResult(await setOrganizationActive(id, active)),
      onSuccess: invalidate,
    }),
    delete: useMutation({
      mutationFn: async (id: string) => unwrapApiResult(await deleteOrganization(id)),
      onSuccess: invalidate,
    }),
  }
}

export function useOrganizationDepartmentMutations(organizationId: string | null) {
  const client = useQueryClient()
  const invalidate = async () => {
    await client.invalidateQueries({ queryKey: organizationsKey })
    if (organizationId) await client.invalidateQueries({ queryKey: departmentsKey(organizationId) })
  }

  return {
    create: useMutation({
      mutationFn: async (payload: OrganizationDepartmentPayload) =>
        unwrapApiResult(await createOrganizationDepartment(organizationId!, payload)),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: async ({ id, ...payload }: Omit<OrganizationDepartmentPayload, 'departmentId'> & { id: string }) =>
        unwrapApiResult(await updateOrganizationDepartment(id, payload)),
      onSuccess: invalidate,
    }),
    setActive: useMutation({
      mutationFn: async ({ id, active }: { id: string; active: boolean }) =>
        unwrapApiResult(await setOrganizationDepartmentActive(id, active)),
      onSuccess: invalidate,
    }),
    delete: useMutation({
      mutationFn: async (id: string) =>
        unwrapApiResult(await deleteOrganizationDepartment(id)),
      onSuccess: invalidate,
    }),
    setCategories: useMutation({
      mutationFn: async ({ id, categoryIds }: { id: string; categoryIds: string[] }) =>
        unwrapApiResult(await setOrganizationDepartmentCategories(id, categoryIds)),
      onSuccess: invalidate,
    }),
  }
}
