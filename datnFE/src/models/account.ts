import type { BaseEntity, CommonStatus, UserRole } from "./base";

export interface AccountResponse extends BaseEntity{
  code: string;
  username: string | null;
  status: CommonStatus;
  role: UserRole;
}