import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject, map, tap } from 'rxjs';

import { environment } from '../../../environments/environment';

export type StaffRole = 'ADMIN' | 'RECEPCIONISTA' | 'ENTRENADOR';
export type StaffEstado = 'ACTIVO' | 'INACTIVO' | 'PENDIENTE';

export const STAFF_ROLES: StaffRole[] = ['ADMIN', 'RECEPCIONISTA', 'ENTRENADOR'];
export const STAFF_ESTADOS: StaffEstado[] = ['ACTIVO', 'INACTIVO', 'PENDIENTE'];

export interface StaffUsuario {
  id: number;
  userName: string;
  email: string | null;
  estado: StaffEstado;
}

export interface StaffItem {
  usuarioId: number;
  tenantId: number | null;
  nombres: string;
  apellidos: string;
  cedula: string;
  fechaNacimiento: string | null;
  tenantRole: StaffRole;
  horario: string | null;
  sueldo: number | null;
  estado: StaffEstado;
  usuario: StaffUsuario;
  userName: string;
  email: string | null;
}

export interface StaffFilters {
  role?: StaffRole;
  estado?: StaffEstado;
}

export interface CreateStaffDto {
  nombres: string;
  apellidos: string;
  cedula: string;
  fechaNacimiento: string;
  userName: string;
  email?: string;
  password: string;
  tenantRole: StaffRole;
  horario?: string;
  sueldo?: number;
}

export interface UpdateStaffDto {
  nombres?: string;
  apellidos?: string;
  cedula?: string;
  fechaNacimiento?: string;
  userName?: string;
  email?: string;
  password?: string;
  tenantRole?: StaffRole;
  horario?: string;
  sueldo?: number;
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly baseUrl = `${environment.apiUrl}/staff`;
  private readonly staffChangedSubject = new Subject<void>();

  readonly staffChanged$ = this.staffChangedSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  getStaff(filters?: StaffFilters): Observable<StaffItem[]> {
    let params = new HttpParams();

    if (filters?.role) {
      params = params.set('role', filters.role);
    }

    if (filters?.estado) {
      params = params.set('estado', filters.estado);
    }

    return this.http
      .get<unknown>(this.baseUrl, { params })
      .pipe(map((response) => this.normalizeStaffListResponse(response)));
  }

  getStaffById(usuarioId: number): Observable<StaffItem> {
    return this.http
      .get<unknown>(`${this.baseUrl}/${usuarioId}`)
      .pipe(map((response) => this.normalizeRequiredStaffResponse(response)));
  }

  createStaff(dto: CreateStaffDto): Observable<StaffItem> {
    return this.http.post<unknown>(this.baseUrl, dto).pipe(
      map((response) => this.normalizeRequiredStaffResponse(response)),
      tap(() => this.notifyStaffChanged()),
    );
  }

  updateStaff(usuarioId: number, dto: UpdateStaffDto): Observable<StaffItem> {
    return this.http.patch<unknown>(`${this.baseUrl}/${usuarioId}`, dto).pipe(
      map((response) => this.normalizeRequiredStaffResponse(response)),
      tap(() => this.notifyStaffChanged()),
    );
  }

  inactivarStaff(usuarioId: number): Observable<StaffItem | null> {
    return this.http.patch<unknown>(`${this.baseUrl}/${usuarioId}/inactivar`, {}).pipe(
      map((response) => this.normalizeOptionalStaffResponse(response)),
      tap(() => this.notifyStaffChanged()),
    );
  }

  reactivarStaff(usuarioId: number): Observable<StaffItem | null> {
    return this.http.patch<unknown>(`${this.baseUrl}/${usuarioId}/reactivar`, {}).pipe(
      map((response) => this.normalizeOptionalStaffResponse(response)),
      tap(() => this.notifyStaffChanged()),
    );
  }

  notifyStaffChanged(): void {
    this.staffChangedSubject.next();
  }

  private normalizeStaffListResponse(response: unknown): StaffItem[] {
    const items = this.unwrapListResponse(response);

    return items
      .map((item) => this.normalizeStaffItem(item))
      .filter((item): item is StaffItem => item !== null);
  }

  private normalizeRequiredStaffResponse(response: unknown): StaffItem {
    const staff = this.normalizeOptionalStaffResponse(response);

    if (!staff) {
      throw new Error('No se pudo interpretar la respuesta del staff');
    }

    return staff;
  }

  private normalizeOptionalStaffResponse(response: unknown): StaffItem | null {
    if (response === null || response === undefined) {
      return null;
    }

    return this.normalizeStaffItem(this.unwrapItemResponse(response));
  }

  private normalizeStaffItem(value: unknown): StaffItem | null {
    const record = this.asRecord(value);
    if (!record) {
      return null;
    }

    const usuarioRecord =
      this.asRecord(record['usuario']) ??
      this.asRecord(record['user']) ??
      this.asRecord(record['usuarioInfo']);

    const usuarioId = this.parseNumber(
      record['usuarioId'] ?? record['id'] ?? record['userId'] ?? usuarioRecord?.['id'],
    );
    const tenantRole = this.parseStaffRole(
      record['tenantRole'] ?? record['role'] ?? record['rol'] ?? usuarioRecord?.['tenantRole'],
    );
    const estado = this.parseStaffEstado(
      record['estado'] ?? record['status'] ?? record['activo'] ?? usuarioRecord?.['estado'],
    );

    if (usuarioId === null || tenantRole === null) {
      return null;
    }

    const userName =
      this.parseString(
        record['userName'] ??
          record['username'] ??
          usuarioRecord?.['userName'] ??
          usuarioRecord?.['username'],
      ) ?? '';
    const email =
      this.parseString(record['email'] ?? usuarioRecord?.['email'] ?? usuarioRecord?.['correo']) ??
      null;

    return {
      usuarioId,
      tenantId: this.parseNumber(record['tenantId'] ?? record['tenant'] ?? record['gimnasioId']),
      nombres:
        this.parseString(record['nombres'] ?? record['nombre'] ?? usuarioRecord?.['nombres']) ?? '',
      apellidos: this.parseString(record['apellidos'] ?? usuarioRecord?.['apellidos']) ?? '',
      cedula: this.parseString(record['cedula'] ?? usuarioRecord?.['cedula']) ?? '',
      fechaNacimiento: this.parseDateOnly(
        record['fechaNacimiento'] ?? record['birthDate'] ?? usuarioRecord?.['fechaNacimiento'],
      ),
      tenantRole,
      horario: this.parseString(record['horario']) ?? null,
      sueldo: this.parseNumber(record['sueldo']),
      estado,
      usuario: {
        id: usuarioId,
        userName,
        email,
        estado,
      },
      userName,
      email,
    };
  }

  private unwrapListResponse(response: unknown): unknown[] {
    if (Array.isArray(response)) {
      return response;
    }

    const record = this.asRecord(response);
    if (!record) {
      return [];
    }

    const listCandidates = [record['data'], record['items'], record['results']];
    for (const candidate of listCandidates) {
      if (Array.isArray(candidate)) {
        return candidate;
      }
    }

    return [];
  }

  private unwrapItemResponse(response: unknown): unknown {
    const record = this.asRecord(response);
    if (!record) {
      return response;
    }

    return record['data'] ?? record['item'] ?? response;
  }

  private asRecord(value: unknown): Record<string, unknown> | null {
    return value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : null;
  }

  private parseString(value: unknown): string | null {
    if (typeof value !== 'string') {
      return null;
    }

    const trimmedValue = value.trim();
    return trimmedValue.length > 0 ? trimmedValue : null;
  }

  private parseNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string' && value.trim().length > 0) {
      const parsedValue = Number(value);
      return Number.isFinite(parsedValue) ? parsedValue : null;
    }

    return null;
  }

  private parseDateOnly(value: unknown): string | null {
    const parsedDate = this.parseString(value);
    if (!parsedDate) {
      return null;
    }

    return parsedDate.includes('T') ? parsedDate.split('T')[0] ?? parsedDate : parsedDate;
  }

  private parseStaffRole(value: unknown): StaffRole | null {
    const parsedRole = this.parseString(value)?.toUpperCase();

    if (parsedRole === 'ADMIN' || parsedRole === 'RECEPCIONISTA' || parsedRole === 'ENTRENADOR') {
      return parsedRole;
    }

    return null;
  }

  private parseStaffEstado(value: unknown): StaffEstado {
    if (typeof value === 'boolean') {
      return value ? 'ACTIVO' : 'INACTIVO';
    }

    const parsedEstado = this.parseString(value)?.toUpperCase();
    if (parsedEstado === 'ACTIVO' || parsedEstado === 'INACTIVO' || parsedEstado === 'PENDIENTE') {
      return parsedEstado;
    }

    return 'ACTIVO';
  }
}
