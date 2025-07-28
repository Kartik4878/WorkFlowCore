/*
  Warnings:

  - The primary key for the `schemas` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `key` on the `schemas` table. All the data in the column will be lost.
  - Added the required column `id` to the `schemas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `schemas` DROP PRIMARY KEY,
    DROP COLUMN `key`,
    ADD COLUMN `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);
