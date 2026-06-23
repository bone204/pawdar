-- AlterTable
ALTER TABLE "post_comments" ADD COLUMN     "is_approved" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "moderation_label" TEXT,
ADD COLUMN     "moderation_reason" TEXT,
ADD COLUMN     "parent_id" TEXT;

-- AddForeignKey
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "post_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
