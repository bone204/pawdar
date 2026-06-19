-- CreateTable
CREATE TABLE "pet_galleries" (
    "id" TEXT NOT NULL,
    "pet_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "description" TEXT,
    "captured_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pet_galleries_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pet_galleries" ADD CONSTRAINT "pet_galleries_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "user_pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
