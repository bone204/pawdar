-- CreateTable
CREATE TABLE "sudoku_stages" (
    "id" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "stage_number" INTEGER NOT NULL,
    "board" JSONB NOT NULL,
    "solution" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sudoku_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sudoku_records" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "stage_id" TEXT NOT NULL,
    "time_taken" INTEGER NOT NULL,
    "mistakes" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sudoku_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sudoku_stages_difficulty_stage_number_key" ON "sudoku_stages"("difficulty", "stage_number");

-- AddForeignKey
ALTER TABLE "sudoku_records" ADD CONSTRAINT "sudoku_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sudoku_records" ADD CONSTRAINT "sudoku_records_stage_id_fkey" FOREIGN KEY ("stage_id") REFERENCES "sudoku_stages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
