-- CreateEnum
CREATE TYPE "public"."MessageRole" AS ENUM ('user', 'agent');

-- AlterTable
ALTER TABLE "public"."Message" ADD COLUMN     "role" "public"."MessageRole" NOT NULL DEFAULT 'user';
