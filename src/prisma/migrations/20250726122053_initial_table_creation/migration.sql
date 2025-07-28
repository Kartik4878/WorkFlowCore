-- CreateTable
CREATE TABLE `cases` (
    `caseId` VARCHAR(191) NOT NULL,
    `caseTypeId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `updatedBy` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` VARCHAR(191) NOT NULL,
    `currentAssignmentId` VARCHAR(191) NULL,
    `metadata` JSON NOT NULL,

    PRIMARY KEY (`caseId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `assignments` (
    `assignmentId` VARCHAR(191) NOT NULL,
    `caseId` VARCHAR(191) NOT NULL,
    `processId` VARCHAR(191) NOT NULL,
    `assignmentKey` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` VARCHAR(191) NOT NULL,
    `assignedTo` VARCHAR(191) NOT NULL,
    `assignedToType` VARCHAR(191) NOT NULL,
    `metadata` JSON NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `caseType` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`assignmentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `histories` (
    `historyId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `caseId` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `createdBy` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`historyId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessions` (
    `sessionId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `caseId` VARCHAR(191) NOT NULL,
    `createdBy` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`sessionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `assignments` ADD CONSTRAINT `assignments_caseId_fkey` FOREIGN KEY (`caseId`) REFERENCES `cases`(`caseId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `histories` ADD CONSTRAINT `histories_caseId_fkey` FOREIGN KEY (`caseId`) REFERENCES `cases`(`caseId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_caseId_fkey` FOREIGN KEY (`caseId`) REFERENCES `cases`(`caseId`) ON DELETE CASCADE ON UPDATE CASCADE;
