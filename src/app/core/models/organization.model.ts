import { UserDepartment, UserRole } from './auth.model';

export interface InternalUser {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  departamentoId: number;
  departamentoCodigo: string;
  departamentoNombre: string;
  rolId: number;
  rolCodigo: string;
  rolNombre: string;
  cognitoSub?: string;
  isActive: boolean;
  ultimoLogin?: string;
  createdAt?: string;
  permisos: string[];
}

export interface CreateInternalUserRequest {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  password?: string;
  departamentoId: number;
  rolId: number;
}

export interface DepartmentSummary {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  isActive: boolean;
  totalUsuarios: number;
  createdAt?: string;
}

export interface CreateDepartmentRequest {
  codigo: string;
  nombre: string;
  descripcion?: string;
}

export interface PermissionItem {
  id: number;
  codigo: string;
  modulo: string;
  descripcion: string;
}

export interface RoleWithPermissions {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  isActive: boolean;
  totalUsuarios: number;
  permisos: PermissionItem[];
}
