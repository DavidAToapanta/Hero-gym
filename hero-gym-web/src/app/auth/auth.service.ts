import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, finalize, map, of, tap } from 'rxjs';

import { environment } from '../../environments/environment';
import { AsistenciaService } from '../core/services/asistencia.service';

export type AuthAccessMode = 'PLATFORM' | 'ASISTENCIA';
export type AuthContextType = 'CLIENTE' | 'STAFF';
export type AuthContextId = string | number;

export interface AuthTokenPayload {
  sub: number | null;
  rol: string | null;
  tenantId: number | null;
  tenantRole: string | null;
  clienteId: number | null;
  accessMode: AuthAccessMode | null;
  cedula: string | null;
  userName: string | null;
}

export interface AuthContext {
  contextId: AuthContextId;
  type: AuthContextType;
  tenantId: number;
  tenantNombre: string | null;
  clienteId: number | null;
  tenantRole: string | null;
  allowedModes: AuthAccessMode[];
}

export interface LoginDirectResponse {
  access_token: string;
}

export interface LoginContextSelectionResponse {
  requiresContextSelection: true;
  selectionToken: string;
  requestedAccessMode: AuthAccessMode;
  contexts: AuthContext[];
}

export type LoginResponse = LoginDirectResponse | LoginContextSelectionResponse;

export interface SelectContextPayload {
  selectionToken: string;
  type: AuthContextType;
  tenantId: number;
  clienteId?: number;
  tenantRole?: string;
  accessMode: AuthAccessMode;
}

export interface RegisterOwnerDto {
  cedula: string;
  password: string;
  nombres: string;
  apellidos: string;
  email: string;
  tenantNombre: string;
  userName?: string;
  tenantSlug?: string;
  tenantEmail?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  pais?: string;
  logoUrl?: string;
  descripcion?: string;
}

interface StoredTenantIdentity {
  tenantId: number | null;
  tenantNombre: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly accessTokenKey = 'access_token';
  private readonly pendingContextSelectionKey = 'pending_context_selection';
  private readonly tenantIdentityKey = 'tenant_identity';
  private readonly loginUrl = `${environment.apiUrl}/auth/login`;
  private readonly selectContextUrl = `${environment.apiUrl}/auth/select-context`;
  private readonly registerOwnerUrl = `${environment.apiUrl}/auth/register-owner`;
  private readonly tokenSubject = new BehaviorSubject<string | null>(this.readStoredToken());

  readonly tokenChanges$ = this.tokenSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private asistenciaService: AsistenciaService,
  ) {}

  login(
    cedula: string,
    password: string,
    accessMode?: AuthAccessMode,
  ): Observable<LoginResponse> {
    const payload = {
      cedula,
      password,
      ...(accessMode ? { accessMode } : {}),
    };

    this.clearPendingContextSelection();

    return this.http.post<unknown>(this.loginUrl, payload).pipe(
      map((response) => this.normalizeLoginResponse(response)),
      tap((response) => {
        if (this.isContextSelectionResponse(response)) {
          this.setPendingContextSelection(response);
          return;
        }

        this.handleLoginSuccess(response);
      }),
    );
  }

  selectContext(
    selectionToken: string,
    context: AuthContext,
    accessMode: AuthAccessMode,
  ): Observable<LoginDirectResponse> {
    return this.http
      .post<unknown>(
        this.selectContextUrl,
        this.buildSelectContextPayload(selectionToken, context, accessMode),
      )
      .pipe(
        map((response) => this.normalizeDirectLoginResponse(response)),
        tap((response) => this.handleLoginSuccess(response, context)),
      );
  }

  registerOwner(dto: RegisterOwnerDto): Observable<LoginDirectResponse> {
    return this.http
      .post<unknown>(this.registerOwnerUrl, this.normalizeRegisterOwnerDto(dto))
      .pipe(
        map((response) => this.normalizeDirectLoginResponse(response)),
        tap((response) => this.handleLoginSuccess(response, {
          tenantId: null,
          tenantNombre: dto.tenantNombre,
        })),
      );
  }

  handleLoginSuccess(
    response: LoginDirectResponse,
    tenantContext?: { tenantId: number | null; tenantNombre: string | null },
  ): void {
    this.clearPendingContextSelection();
    this.setToken(response.access_token);
    this.persistTenantIdentity(tenantContext);
    localStorage.setItem('ultimoAcceso', new Date().toISOString());

    if (this.shouldAutoRegisterAttendance()) {
      const usuarioId = this.getDecodedToken()?.sub;

      if (!usuarioId) {
        this.router.navigate([this.getPostLoginRoute()], { replaceUrl: true });
        return;
      }

      this.asistenciaService
        .marcarMiAsistencia(usuarioId)
        .pipe(
          catchError((error) => {
            console.error('No se pudo registrar la asistencia automática:', error);
            return of(null);
          }),
          finalize(() => {
            this.router.navigate([this.getPostLoginRoute()], { replaceUrl: true });
          }),
        )
        .subscribe();

      return;
    }

    this.router.navigate([this.getPostLoginRoute()], { replaceUrl: true });
  }

  logout(): void {
    this.clearPendingContextSelection();
    this.clearToken();
    this.clearTenantIdentity();
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getDecodedToken();
  }

  isContextSelectionResponse(response: LoginResponse): response is LoginContextSelectionResponse {
    return 'requiresContextSelection' in response && response.requiresContextSelection === true;
  }

  getPendingContextSelection(): LoginContextSelectionResponse | null {
    return this.readPendingContextSelection();
  }

  setPendingContextSelection(selection: LoginContextSelectionResponse): void {
    sessionStorage.setItem(this.pendingContextSelectionKey, JSON.stringify(selection));
  }

  clearPendingContextSelection(): void {
    sessionStorage.removeItem(this.pendingContextSelectionKey);
  }

  getDecodedToken(): AuthTokenPayload | null {
    const token = this.getToken();

    if (!token) {
      return null;
    }

    const decodedToken = this.decodeToken(token);

    if (!decodedToken) {
      this.clearToken();
    }

    return decodedToken;
  }

  getTenantId(): number | null {
    return this.getDecodedToken()?.tenantId ?? null;
  }

  getTenantRole(): string | null {
    return this.getDecodedToken()?.tenantRole ?? null;
  }

  getClienteId(): number | null {
    return this.getDecodedToken()?.clienteId ?? null;
  }

  getAccessMode(): AuthAccessMode | null {
    return this.getDecodedToken()?.accessMode ?? null;
  }

  getTenantDisplayName(): string | null {
    const decodedToken = this.getDecodedToken();
    if (!decodedToken) {
      return null;
    }

    const storedIdentity = this.readTenantIdentity();
    if (!storedIdentity) {
      return null;
    }

    if (
      storedIdentity.tenantId !== null &&
      decodedToken.tenantId !== null &&
      storedIdentity.tenantId !== decodedToken.tenantId
    ) {
      return null;
    }

    return storedIdentity.tenantNombre;
  }

  isClientePortalUser(): boolean {
    const decodedToken = this.getDecodedToken();

    if (!decodedToken) {
      return false;
    }

    if (decodedToken.clienteId !== null && decodedToken.tenantRole === null) {
      return true;
    }

    return decodedToken.tenantRole === null && decodedToken.rol === 'CLIENTE';
  }

  isStaffUser(): boolean {
    return this.getTenantRole() !== null;
  }

  isOwner(): boolean {
    return this.getTenantRole() === 'OWNER';
  }

  isAdminTenant(): boolean {
    return this.getTenantRole() === 'ADMIN';
  }

  isRecepcionista(): boolean {
    return this.getTenantRole() === 'RECEPCIONISTA';
  }

  isEntrenador(): boolean {
    return this.getTenantRole() === 'ENTRENADOR';
  }

  getUserRole(): string | null {
    return this.getDecodedToken()?.rol ?? null;
  }

  getPostLoginRoute(): string {
    if (this.isClientePortalUser()) {
      return '/cliente';
    }

    if (this.isStaffUser()) {
      return '/dashboard';
    }

    const legacyRole = this.getUserRole();

    if (legacyRole === 'CLIENTE') {
      return '/cliente';
    }

    return legacyRole ? '/dashboard' : '/login';
  }

  hasTenantRole(allowedRoles: string[]): boolean {
    const tenantRole = this.getTenantRole();

    if (tenantRole) {
      return allowedRoles.includes(tenantRole);
    }

    const legacyRole = this.getUserRole();
    return legacyRole ? allowedRoles.includes(legacyRole) : false;
  }

  hasRole(allowedRoles: string[]): boolean {
    const userRole = this.getUserRole();
    return userRole ? allowedRoles.includes(userRole) : false;
  }

  private setToken(token: string): void {
    localStorage.setItem(this.accessTokenKey, token);
    this.tokenSubject.next(token);
  }

  private shouldAutoRegisterAttendance(): boolean {
    return this.isClientePortalUser() && this.getAccessMode() === 'ASISTENCIA';
  }

  private clearToken(): void {
    localStorage.removeItem(this.accessTokenKey);
    this.tokenSubject.next(null);
  }

  private persistTenantIdentity(
    tenantContext?: { tenantId: number | null; tenantNombre: string | null },
  ): void {
    const tenantNombre = tenantContext?.tenantNombre?.trim();
    const tenantId = this.getTenantId();

    if (tenantNombre) {
      const payload: StoredTenantIdentity = {
        tenantId,
        tenantNombre,
      };
      sessionStorage.setItem(this.tenantIdentityKey, JSON.stringify(payload));
      return;
    }

    const storedIdentity = this.readTenantIdentity();
    if (!storedIdentity) {
      return;
    }

    if (
      storedIdentity.tenantId !== null &&
      tenantId !== null &&
      storedIdentity.tenantId !== tenantId
    ) {
      this.clearTenantIdentity();
    }
  }

  private readTenantIdentity(): StoredTenantIdentity | null {
    const raw = sessionStorage.getItem(this.tenantIdentityKey);
    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<StoredTenantIdentity>;
      if (typeof parsed.tenantNombre !== 'string' || !parsed.tenantNombre.trim()) {
        this.clearTenantIdentity();
        return null;
      }

      return {
        tenantId: typeof parsed.tenantId === 'number' ? parsed.tenantId : null,
        tenantNombre: parsed.tenantNombre.trim(),
      };
    } catch {
      this.clearTenantIdentity();
      return null;
    }
  }

  private clearTenantIdentity(): void {
    sessionStorage.removeItem(this.tenantIdentityKey);
  }

  private readStoredToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  private readPendingContextSelection(): LoginContextSelectionResponse | null {
    const storedValue = sessionStorage.getItem(this.pendingContextSelectionKey);

    if (!storedValue) {
      return null;
    }

    try {
      const normalizedSelection = this.normalizeContextSelectionResponse(JSON.parse(storedValue));

      if (!normalizedSelection) {
        this.clearPendingContextSelection();
      }

      return normalizedSelection;
    } catch (error) {
      console.warn('[AuthService] No se pudo recuperar la selección de contexto.', error);
      this.clearPendingContextSelection();
      return null;
    }
  }

  private normalizeRegisterOwnerDto(dto: RegisterOwnerDto): RegisterOwnerDto {
    const normalizedDto: RegisterOwnerDto = {
      cedula: dto.cedula.trim(),
      password: dto.password,
      nombres: dto.nombres.trim(),
      apellidos: dto.apellidos.trim(),
      email: dto.email.trim(),
      tenantNombre: dto.tenantNombre.trim(),
    };

    this.assignOptionalValue(normalizedDto, 'userName', dto.userName);
    this.assignOptionalValue(normalizedDto, 'tenantSlug', dto.tenantSlug);
    this.assignOptionalValue(normalizedDto, 'tenantEmail', dto.tenantEmail);
    this.assignOptionalValue(normalizedDto, 'telefono', dto.telefono);
    this.assignOptionalValue(normalizedDto, 'direccion', dto.direccion);
    this.assignOptionalValue(normalizedDto, 'ciudad', dto.ciudad);
    this.assignOptionalValue(normalizedDto, 'pais', dto.pais);
    this.assignOptionalValue(normalizedDto, 'logoUrl', dto.logoUrl);
    this.assignOptionalValue(normalizedDto, 'descripcion', dto.descripcion);

    return normalizedDto;
  }

  private normalizeLoginResponse(response: unknown): LoginResponse {
    const directResponse = this.tryNormalizeDirectLoginResponse(response);

    if (directResponse) {
      return directResponse;
    }

    const contextSelectionResponse = this.normalizeContextSelectionResponse(response);

    if (contextSelectionResponse) {
      return contextSelectionResponse;
    }

    throw new Error('La respuesta de autenticación no tiene un formato válido.');
  }

  private normalizeDirectLoginResponse(response: unknown): LoginDirectResponse {
    const normalizedResponse = this.tryNormalizeDirectLoginResponse(response);

    if (!normalizedResponse) {
      throw new Error('La respuesta de autenticación no incluye access_token.');
    }

    return normalizedResponse;
  }

  private tryNormalizeDirectLoginResponse(response: unknown): LoginDirectResponse | null {
    if (!this.isRecord(response)) {
      return null;
    }

    const accessToken = this.parseStringClaim(response['access_token']);

    return accessToken ? { access_token: accessToken } : null;
  }

  private normalizeContextSelectionResponse(
    response: unknown,
  ): LoginContextSelectionResponse | null {
    if (!this.isRecord(response) || response['requiresContextSelection'] !== true) {
      return null;
    }

    const selectionToken = this.parseStringClaim(response['selectionToken']);
    const requestedAccessMode = this.parseAccessModeClaim(response['requestedAccessMode']);
    const contexts = Array.isArray(response['contexts']) ? response['contexts'] : [];

    if (!selectionToken || !requestedAccessMode) {
      return null;
    }

    const normalizedContexts = contexts
      .map((context) => this.normalizeAuthContext(context, requestedAccessMode))
      .filter((context): context is AuthContext => !!context);

    if (normalizedContexts.length === 0) {
      return null;
    }

    return {
      requiresContextSelection: true,
      selectionToken,
      requestedAccessMode,
      contexts: normalizedContexts,
    };
  }

  private normalizeAuthContext(
    value: unknown,
    requestedAccessMode: AuthAccessMode,
  ): AuthContext | null {
    if (!this.isRecord(value)) {
      return null;
    }

    const type = this.parseContextType(value['type'], value['tenantRole'], value['clienteId']);
    const tenantId = this.parseNumberClaim(value['tenantId']);

    if (!type || tenantId === null) {
      return null;
    }

    const clienteId = this.parseNumberClaim(value['clienteId']);
    const tenantRole = this.parseStringClaim(value['tenantRole']);
    const explicitContextId = this.parseContextId(value['contextId'] ?? value['id']);

    if ((type === 'CLIENTE' && clienteId === null) || (type === 'STAFF' && !tenantRole)) {
      return null;
    }

    return {
      contextId: explicitContextId ?? this.buildContextId(type, tenantId, clienteId, tenantRole),
      type,
      tenantId,
      tenantNombre: this.parseStringClaim(value['tenantNombre']),
      clienteId,
      tenantRole,
      allowedModes: this.parseAccessModes(value['allowedModes'], requestedAccessMode),
    };
  }

  private buildSelectContextPayload(
    selectionToken: string,
    context: AuthContext,
    accessMode: AuthAccessMode,
  ): SelectContextPayload {
    const payload: SelectContextPayload = {
      selectionToken,
      type: context.type,
      tenantId: context.tenantId,
      accessMode,
    };

    if (context.type === 'CLIENTE' && context.clienteId !== null) {
      payload.clienteId = context.clienteId;
    }

    if (context.type === 'STAFF' && context.tenantRole) {
      payload.tenantRole = context.tenantRole;
    }

    return payload;
  }

  private decodeToken(token: string): AuthTokenPayload | null {
    const tokenParts = token.split('.');

    if (tokenParts.length < 2) {
      return null;
    }

    try {
      const payload = JSON.parse(this.decodeBase64Url(tokenParts[1])) as Record<string, unknown>;

      return {
        sub: this.parseNumberClaim(payload['sub']),
        rol: this.parseStringClaim(payload['rol']),
        tenantId: this.parseNumberClaim(payload['tenantId']),
        tenantRole: this.parseStringClaim(payload['tenantRole']),
        clienteId: this.parseNumberClaim(payload['clienteId']),
        accessMode: this.parseAccessModeClaim(payload['accessMode']),
        cedula: this.parseStringClaim(payload['cedula']),
        userName: this.parseStringClaim(payload['userName']),
      };
    } catch (error) {
      console.warn('[AuthService] No se pudo decodificar el token.', error);
      return null;
    }
  }

  private decodeBase64Url(value: string): string {
    const normalizedValue = value.replace(/-/g, '+').replace(/_/g, '/');
    const paddingLength = (4 - (normalizedValue.length % 4)) % 4;
    const paddedValue = normalizedValue.padEnd(normalizedValue.length + paddingLength, '=');

    return atob(paddedValue);
  }

  private parseNumberClaim(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string' && value.trim() !== '') {
      const parsedValue = Number(value);
      return Number.isNaN(parsedValue) ? null : parsedValue;
    }

    return null;
  }

  private parseStringClaim(value: unknown): string | null {
    return typeof value === 'string' && value.trim() !== '' ? value : null;
  }

  private parseContextId(value: unknown): AuthContextId | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string' && value.trim() !== '') {
      return value;
    }

    return null;
  }

  private parseContextType(
    value: unknown,
    tenantRole: unknown,
    clienteId: unknown,
  ): AuthContextType | null {
    if (value === 'CLIENTE' || value === 'STAFF') {
      return value;
    }

    if (this.parseStringClaim(tenantRole)) {
      return 'STAFF';
    }

    if (this.parseNumberClaim(clienteId) !== null) {
      return 'CLIENTE';
    }

    return null;
  }

  private buildContextId(
    type: AuthContextType,
    tenantId: number,
    clienteId: number | null,
    tenantRole: string | null,
  ): string {
    return `${type}:${tenantId}:${clienteId ?? tenantRole ?? 'default'}`;
  }

  private parseAccessModeClaim(value: unknown): AuthAccessMode | null {
    return value === 'PLATFORM' || value === 'ASISTENCIA' ? value : null;
  }

  private parseAccessModes(
    value: unknown,
    fallbackMode: AuthAccessMode,
  ): AuthAccessMode[] {
    if (!Array.isArray(value)) {
      return [fallbackMode];
    }

    const modes = value
      .map((mode) => this.parseAccessModeClaim(mode))
      .filter((mode): mode is AuthAccessMode => !!mode);

    return modes.length > 0 ? Array.from(new Set(modes)) : [fallbackMode];
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  private assignOptionalValue(
    target: RegisterOwnerDto,
    key: keyof Omit<
      RegisterOwnerDto,
      'cedula' | 'password' | 'nombres' | 'apellidos' | 'email' | 'tenantNombre'
    >,
    value: string | undefined,
  ): void {
    if (typeof value === 'string') {
      const normalizedValue = value.trim();

      if (normalizedValue !== '') {
        target[key] = normalizedValue;
      }
    }
  }
}
