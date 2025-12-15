# User Status Auditing Implementation

## Overview

This document describes the auditing implementation for cashier status updates and other user management operations.

## Audited Operations

### 1. User Status Updates (`PATCH /api/users/[id]`)

- **What**: Updates to user status (ACTIVE/INACTIVE)
- **Audit Data**:
  - Previous status
  - New status
  - Target user information (name, email)
  - Acting user information
  - IP address and user agent
- **Implementation**: Uses `AuditTrailService.logUserUpdate()`

### 2. General User Updates (`PATCH /api/users`)

- **What**: Updates to user profile (name, email, role, status, etc.)
- **Audit Data**: All changed fields with old and new values
- **Implementation**: Uses `AuditTrailService.logUserUpdate()`

### 3. User Creation (`POST /api/users`)

- **What**: Creation of new users by administrators
- **Audit Data**: All user fields (excluding password)
- **Implementation**: Uses `AuditTrailService.logUserChange()`

## Audit Trail Service

The `AuditTrailService` provides centralized logging for all audit operations:

- **Entity Types**: USER, PRODUCT, DESHELVING
- **Actions**: CREATE, UPDATE, DELETE, RESTORE, DESHELVE
- **Metadata**: IP address, user agent, custom fields
- **Storage**: PostgreSQL `auditLog` table via Prisma

## Security Features

1. **Immutable Logs**: Audit logs cannot be modified once created
2. **Complete Context**: Includes actor, target, timestamp, and metadata
3. **Failure Resilience**: Audit failures don't break main operations
4. **Retention**: Configurable cleanup of old logs (default: 365 days)

## Usage Examples

### Viewing Audit Logs

```typescript
// Get audit logs for a specific user
const logs = await AuditTrailService.getEntityAuditLogs("USER", userId);

// Get recent audit logs
const recentLogs = await AuditTrailService.getRecentAuditLogs(100);
```

### Manual Audit Logging

```typescript
await AuditTrailService.logUserUpdate(
  targetUserId,
  { status: "INACTIVE" },
  actorUserId,
  actorEmail,
  { reason: "Policy violation" }
);
```

## Compliance

This implementation supports:

- **SOX Compliance**: Complete audit trail for user access changes
- **GDPR**: Tracking of user data modifications
- **Security Audits**: Full accountability for administrative actions
- **Forensic Analysis**: Detailed logs for incident investigation
