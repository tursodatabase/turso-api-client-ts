import { TursoConfig } from "./config";
import { TursoClient } from "./client";

export interface Organization {
  name: string;
  slug: string;
  type: "personal" | "team";
  overages: boolean;
  blocked_reads: boolean;
  blocked_writes: boolean;
}

export interface OrganizationMember {
  role: "owner" | "admin" | "member";
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

export class OrganizationClient {
  constructor(private config: TursoConfig) {}

  async list(): Promise<Organization[]> {
    const response = await TursoClient.request<{
      organizations: Organization[];
    }>("organizations", this.config);

    return response.organizations ?? [];
  }

  async update(options: { overages: boolean }): Promise<Organization> {
    const response = await TursoClient.request<{
      organization: Organization;
    }>("", this.config, {
      method: "POST",
      body: JSON.stringify(options),
    });

    return response.organization ?? null;
  }

  async delete(): Promise<void> {
    return TursoClient.request("", this.config, {
      method: "DELETE",
    });
  }

  async members(): Promise<OrganizationMember[]> {
    const response = await TursoClient.request<{
      members: OrganizationMember[];
    }>(`organisations/${this.config.org}/members`, this.config);

    return response.members ?? [];
  }

  async addMember(
    username: string,
    role?: "admin" | "member"
  ): Promise<{ member: string; role: "admin" | "member" }> {
    return TursoClient.request(`members/${username}`, this.config, {
      method: "POST",
      body: JSON.stringify({ member: username, role: role ? role : "member" }),
    });
  }

  async removeMember(username: string): Promise<{ member: string }> {
    return TursoClient.request(`members/${username}`, this.config, {
      method: "DELETE",
    });
  }

  async inviteUser(
    email: string,
    role?: "admin" | "member"
  ): Promise<OrganizationInvite> {
    const response = await TursoClient.request<{ invited: OrganizationInvite }>(
      "invites",
      this.config,
      {
        method: "POST",
        body: JSON.stringify({ email, role: role ? role : "member" }),
      }
    );

    return response.invited;
  }
}
