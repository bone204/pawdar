-- CreateTable
CREATE TABLE "breeds" (
    "id" TEXT NOT NULL,
    "pet_type" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "description_en" TEXT,
    "temperament_en" TEXT,
    "origin_en" TEXT,
    "name_vi" TEXT,
    "description_vi" TEXT,
    "temperament_vi" TEXT,
    "origin_vi" TEXT,
    "life_span" TEXT,
    "weight_kg" TEXT,
    "image_url" TEXT,
    "wikipedia_url" TEXT,
    "is_translated" BOOLEAN NOT NULL DEFAULT false,
    "synced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "breeds_pkey" PRIMARY KEY ("id")
);
