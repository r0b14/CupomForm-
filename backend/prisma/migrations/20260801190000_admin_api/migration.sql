CREATE TABLE "AdminAuditLog" (
  "id" TEXT NOT NULL,
  "campaignId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AdminAuditLog_campaignId_createdAt_idx" ON "AdminAuditLog"("campaignId", "createdAt");
ALTER TABLE "AdminAuditLog" ADD CONSTRAINT "AdminAuditLog_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
