-- CreateTable
CREATE TABLE `operators` (
    `operatorId` VARCHAR(191) NOT NULL,
    `userName` VARCHAR(191) NOT NULL,
    `workGroups` JSON NOT NULL,
    `workQueues` JSON NOT NULL,
    `role` VARCHAR(191) NOT NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedBy` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`operatorId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
