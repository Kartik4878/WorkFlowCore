/*
  Warnings:

  - You are about to drop the column `path` on the `attachments` table. All the data in the column will be lost.
  - Added the required column `base64Data` to the `attachments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `attachments` DROP COLUMN `path`,
    ADD COLUMN `base64Data` LONGTEXT NOT NULL;
