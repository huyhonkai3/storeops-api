-- CreateEnum
CREATE TYPE "StoreMemberRole" AS ENUM ('MANAGER', 'STAFF');

-- AlterTable
ALTER TABLE "StoreMember" ADD COLUMN     "role" "StoreMemberRole" NOT NULL DEFAULT 'STAFF';
