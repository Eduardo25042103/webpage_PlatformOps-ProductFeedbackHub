export type UserRole =
  | 'ADMIN'
  | 'AGENTE_SOPORTE'
  | 'DEV_INGENIERO'
  | 'EJECUTIVO_VENTAS'
  | 'MARKETING_LEAD';

export type UserDepartment =
  | 'TI_DESARROLLO'
  | 'SOPORTE'
  | 'VENTAS'
  | 'MARKETING'
  | 'OPS'
  | 'OPERACIONES';

export interface UserDto {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  departamentoId: number;
  departamentoCodigo: string;
  departamentoNombre: string;
  rolId: number;
  rolCodigo: UserRole;
  rolNombre: string;
  cognitoSub?: string;
  isActive: boolean;
  ultimoLogin?: string;
  permisos: string[];
}

export interface AuthResponseDto {
  token: string;
  user: UserDto;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface LoginRequest {
  email: string;
  password: string;
  recordar?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  departamentoId: number;
  rolId?: number;
}

export interface CatalogDepartmentDto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
}
