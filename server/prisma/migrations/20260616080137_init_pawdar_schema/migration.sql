-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone_number" TEXT,
    "avatar_url" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_pets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "breed_id" TEXT,
    "pet_type" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "age_months" INTEGER,
    "weight_kg" DOUBLE PRECISION,
    "description" TEXT,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "encyclopedia_favorites" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "breed_id" TEXT NOT NULL,
    "pet_type" TEXT NOT NULL DEFAULT 'cat',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "encyclopedia_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lost_reports" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "pet_id" TEXT,
    "pet_name" TEXT,
    "pet_type" TEXT,
    "breed_name" TEXT,
    "reward_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "distinctive_features" TEXT,
    "contact_phone" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "lost_address" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'lost',
    "lost_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lost_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lost_report_images" (
    "id" TEXT NOT NULL,
    "report_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lost_report_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "user_pets" ADD CONSTRAINT "user_pets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encyclopedia_favorites" ADD CONSTRAINT "encyclopedia_favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lost_reports" ADD CONSTRAINT "lost_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lost_reports" ADD CONSTRAINT "lost_reports_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "user_pets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lost_report_images" ADD CONSTRAINT "lost_report_images_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "lost_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
