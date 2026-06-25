-- CreateTable
CREATE TABLE "songs" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "key" TEXT,
    "time_signature" TEXT,
    "pdf_path" TEXT,
    "worship_types" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "memo" TEXT,
    "last_used_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "songs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contis" (
    "id" SERIAL NOT NULL,
    "date" TEXT NOT NULL,
    "worship_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conti_songs" (
    "id" SERIAL NOT NULL,
    "conti_id" INTEGER NOT NULL,
    "song_id" INTEGER NOT NULL,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "memo" TEXT,

    CONSTRAINT "conti_songs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "conti_songs" ADD CONSTRAINT "conti_songs_conti_id_fkey" FOREIGN KEY ("conti_id") REFERENCES "contis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conti_songs" ADD CONSTRAINT "conti_songs_song_id_fkey" FOREIGN KEY ("song_id") REFERENCES "songs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
