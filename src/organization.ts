import { TursoClient, type TursoConfig } from "./client";

export interface Organization {
  name: string;
  slug: string;
  type: "personal" | "team";
  overages: boolean;
  blocked_reads: boolean;
  blocked_writes: boolean;
}

export type OrganizationMemberRole = "admin" | "member";

export interface OrganizationMember {
  role: "owner" | OrganizationMemberRole;
  username: string;
  email: string;
}

export interface OrganizationInvite {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string;
  Role: "admin" | "member";
  Email: string;
  OrganizationID: number;
  Organization: Organization;
  Accepted: boolean;
}

export interface Invoice {
  invoice_number: string;
  amount_due: string;
  due_date: string;
  paid_at: string;
  payment_failed_at: string;
  invoice_pdf: string;
}

export interface OrganizationAddedMember {
  member: string;
  role: OrganizationMemberRole;
}

export interface OrganizationRemovedMember {
  member: string;
}

export class OrganizationClient {
  constructor(private config: TursoConfig) {}

  async list(): Promise<Organization[]> {
    const response = await TursoClient.request<{
      organizations: Organization[];
    }>(``, this.config);

    return response.organizations ?? [];
  }

  async update(options: { overages: boolean }): Promise<Organization> {
    const response = await TursoClient.request<{
      organization: Organization;
    }>(``, this.config, {
      method: "PATCH",
      body: JSON.stringify(options),
    });

    return response.organization ?? null;
  }

  async delete(): Promise<void> {
    return TursoClient.request(``, this.config, {
      method: "DELETE",
    });
  }

  async members(): Promise<OrganizationMember[]> {
    const response = await TursoClient.request<{
      members: OrganizationMember[];
    }>(`members`, this.config);

    return response.members ?? [];
  }

  async addMember(
    username: string,
    role?: "admin" | "member"
  ): Promise<OrganizationAddedMember> {
    return TursoClient.request(`members/${username}`, this.config, {
      method: "POST",
      body: JSON.stringify({
        member: username,
        role: role ? role : "member",
      }),
    });
  }

  async removeMember(username: string): Promise<OrganizationRemovedMember> {
    return TursoClient.request(`members/${username}`, this.config, {
      method: "DELETE",
    });
  }

  async inviteUser(
    email: string,
    role?: OrganizationMemberRole
  ): Promise<OrganizationInvite> {
    const response = await TursoClient.request<{ invited: OrganizationInvite }>(
      `invites`,
      this.config,
      {
        method: "POST",
        body: JSON.stringify({ email, role: role ? role : "member" }),
      }
    );

    return response.invited;
  }

  async deleteInvite(email: string): Promise<OrganizationInvite> {
    return TursoClient.request(`invites/${email}`, this.config, {
      method: "DELETE",
    });
  }

  async invoices(): Promise<Invoice[]> {
    const response = await TursoClient.request<{
      invoices: Invoice[];
    }>(`invoices`, this.config);

    return response.invoices ?? [];
  }
}
