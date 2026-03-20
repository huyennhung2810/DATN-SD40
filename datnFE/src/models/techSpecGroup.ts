import type { CommonStatus } from "./base";

export type TechSpecDataType = "TEXT" | "NUMBER" | "BOOLEAN" | "ENUM" | "RANGE";

export interface TechSpecGroupResponse {
  id: string;
  code?: string;
  name: string;
  description?: string;
  displayOrder?: number;
  status: CommonStatus;
  createdAt: number;
  updatedAt: number;
}

export interface TechSpecDefinitionResponse {
  id: string;
  code?: string;
  name: string;
  description?: string;
  groupId: string;
  groupName?: string;
  dataType: TechSpecDataType;
  unit?: string;
  isFilterable: boolean;
  isRequired: boolean;
  displayOrder?: number;
  status: CommonStatus;
  createdAt: number;
  updatedAt: number;
}

export interface TechSpecGroupSearchParams {
  page?: number;
  size?: number;
  keyword?: string;
  status?: CommonStatus;
}

export interface TechSpecDefinitionSearchParams {
  page?: number;
  size?: number;
  keyword?: string;
  groupId?: string;
  status?: CommonStatus;
  dataType?: TechSpecDataType;
}

export interface TechSpecGroupRequest {
  id?: string;
  name: string;
  code?: string;
  description?: string;
  displayOrder?: number;
  status?: CommonStatus;
}

export interface TechSpecDefinitionRequest {
  id?: string;
  name: string;
  code?: string;
  groupId: string;
  description?: string;
  dataType: TechSpecDataType;
  unit?: string;
  isFilterable?: boolean;
  isRequired?: boolean;
  displayOrder?: number;
  status?: CommonStatus;
}

export interface TechSpecDefinitionItemResponse {
  id: string;
  definitionId: string;
  definitionCode?: string;
  definitionName?: string;
  name: string;
  code?: string;
  value?: string;
  displayOrder?: number;
  status: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface TechSpecDefinitionItemRequest {
  id?: string;
  definitionId: string;
  name: string;
  code?: string;
  value?: string;
  displayOrder?: number;
  status?: string;
}
