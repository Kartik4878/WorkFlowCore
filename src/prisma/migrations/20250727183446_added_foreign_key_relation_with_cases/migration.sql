/*
  Warnings:

  - Made the column `caseId` on table `attachments` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `attachments` MODIFY `caseId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `attachments` ADD CONSTRAINT `attachments_caseId_fkey` FOREIGN KEY (`caseId`) REFERENCES `cases`(`caseId`) ON DELETE CASCADE ON UPDATE CASCADE;
