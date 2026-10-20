export declare const invitesRouter: import("express-serve-static-core").Router;
export interface StoredInvite {
    id: number;
    token: string;
    tokenHash: string;
    tenantId: string;
    createdById: number;
    adminName?: string;
    preassignedZoneId: number;
    preassignedCategory: 'residential' | 'corporate';
    preassignedJarQuota: number;
    expiresAt: Date;
    usedAt?: Date;
    createdAt: Date;
}
export declare const inMemoryInvites: Map<string, StoredInvite>;
//# sourceMappingURL=invites.d.ts.map