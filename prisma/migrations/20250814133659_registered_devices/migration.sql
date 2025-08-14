-- CreateTable
CREATE TABLE "DeviceRegistered" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastTime" TIMESTAMP(3) NOT NULL,
    "trabajadorId" INTEGER NOT NULL,

    CONSTRAINT "DeviceRegistered_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeviceRegistered_token_key" ON "DeviceRegistered"("token");

-- AddForeignKey
ALTER TABLE "DeviceRegistered" ADD CONSTRAINT "DeviceRegistered_trabajadorId_fkey" FOREIGN KEY ("trabajadorId") REFERENCES "Trabajador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
