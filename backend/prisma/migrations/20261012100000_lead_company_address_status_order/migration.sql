ALTER TABLE "Lead"
ADD COLUMN "company" TEXT,
ADD COLUMN "address" TEXT;

ALTER TABLE "Lead" ALTER COLUMN "status" DROP DEFAULT;
ALTER TYPE "LeadStatus" RENAME TO "LeadStatus_old";
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'INTERESTED', 'CONTACTED', 'CONVERTED', 'LOST');
ALTER TABLE "Lead"
  ALTER COLUMN "status" TYPE "LeadStatus"
  USING ("status"::text::"LeadStatus");
ALTER TABLE "Lead" ALTER COLUMN "status" SET DEFAULT 'NEW';
DROP TYPE "LeadStatus_old";
