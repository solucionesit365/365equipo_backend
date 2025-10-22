-- DropForeignKey
ALTER TABLE "public"."NotificationDevice" DROP CONSTRAINT "NotificationDevice_trabajadorId_fkey";

-- AddForeignKey
ALTER TABLE "NotificationDevice" ADD CONSTRAINT "NotificationDevice_trabajadorId_fkey" FOREIGN KEY ("trabajadorId") REFERENCES "Trabajador"("id") ON DELETE CASCADE ON UPDATE CASCADE;
