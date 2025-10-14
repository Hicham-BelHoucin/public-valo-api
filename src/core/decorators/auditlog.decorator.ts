import { SetMetadata } from '@nestjs/common';

export interface AuditLogConfig {
  action: string;
  resource: string;
  resourceId?: string;
  description?: string;
}

export const AUDIT_LOG_KEY = 'auditLog';

export const AuditLog = (options: AuditLogConfig) =>
  SetMetadata(AUDIT_LOG_KEY, options);
