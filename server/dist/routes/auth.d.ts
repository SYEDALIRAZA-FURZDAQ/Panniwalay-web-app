export declare const authRouter: import("express-serve-static-core").Router;
export interface AppUserRecord {
    id: number;
    email: string;
    fullName: string;
    plantName: string;
    tenantId: string;
    role: string;
    phone?: string;
    passwordHash: string;
    isActive: boolean;
    createdAt: string;
}
//# sourceMappingURL=auth.d.ts.map