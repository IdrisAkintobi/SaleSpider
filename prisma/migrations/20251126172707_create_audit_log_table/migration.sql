-- CreateTable: AuditLog
-- Tracks all changes to entities for compliance and debugging

CREATE TABLE "public"."audit_logs" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "changes" JSONB,
    "oldValues" JSONB,
    "newValues" JSONB,
    "userId" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "public"."audit_logs"("entityType", "entityId");

CREATE INDEX "audit_logs_userId_idx" ON "public"."audit_logs"("userId");

CREATE INDEX "audit_logs_timestamp_idx" ON "public"."audit_logs"("timestamp");

CREATE INDEX "audit_logs_action_idx" ON "public"."audit_logs"("action");
