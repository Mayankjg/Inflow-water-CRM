ALTER TABLE "FollowUp" ADD COLUMN "result" TEXT;

ALTER TABLE "Reminder" ADD COLUMN "description" TEXT;
ALTER TABLE "Reminder" ADD COLUMN "leadId" TEXT;

ALTER TABLE "Notification" ADD COLUMN "leadId" TEXT;
ALTER TABLE "Notification" ADD COLUMN "leadName" TEXT;

CREATE TABLE "LeadActivity" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LeadActivity_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LeadActivity_leadId_createdAt_idx" ON "LeadActivity"("leadId", "createdAt");
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "LeadActivity" ADD CONSTRAINT "LeadActivity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
