-- AlterTable
ALTER TABLE "public"."Message" ADD COLUMN     "files" TEXT[] DEFAULT ARRAY[]::TEXT[];
