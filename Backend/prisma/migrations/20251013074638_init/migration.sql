-- CreateTable
CREATE TABLE `User` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `firstname` VARCHAR(191) NOT NULL,
    `lastname` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NULL,
    `password` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `role` ENUM('ADMIN', 'ASSET_STAFF', 'OWNER') NOT NULL DEFAULT 'OWNER',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `isAccountVerified` BOOLEAN NOT NULL DEFAULT false,
    `verifyOtp` VARCHAR(191) NULL,
    `verifyOtpExpireAt` DATETIME(3) NULL,
    `resetOtp` VARCHAR(191) NULL,
    `resetOtpExpireAt` DATETIME(3) NULL,
    `firstlogin_at` DATETIME(3) NULL,
    `lastlogin_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Category` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Category_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Room` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Room_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Asset` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `serial_number` VARCHAR(191) NULL,
    `categoryId` BIGINT NULL,
    `roomId` BIGINT NULL,
    `ownerId` BIGINT NULL,
    `status` ENUM('AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'RETIRED') NOT NULL DEFAULT 'AVAILABLE',
    `purchase_at` DATETIME(3) NULL,
    `value` DOUBLE NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` BIGINT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Asset_code_key`(`code`),
    UNIQUE INDEX `Asset_serial_number_key`(`serial_number`),
    INDEX `Asset_categoryId_idx`(`categoryId`),
    INDEX `Asset_roomId_idx`(`roomId`),
    INDEX `Asset_ownerId_idx`(`ownerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AssetPhoto` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `assetId` BIGINT NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `uploadedBy` BIGINT NULL,
    `note` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AssetPhoto_assetId_idx`(`assetId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AssetAudit` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `assetId` BIGINT NOT NULL,
    `auditorId` BIGINT NULL,
    `auditYear` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'OK', 'DAMAGED', 'MISSING') NOT NULL DEFAULT 'PENDING',
    `note` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `AssetAudit_assetId_idx`(`assetId`),
    INDEX `AssetAudit_auditorId_idx`(`auditorId`),
    INDEX `AssetAudit_auditYear_idx`(`auditYear`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AssetAuditPhoto` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `auditId` BIGINT NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `uploadedBy` BIGINT NULL,
    `note` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AssetAuditPhoto_auditId_idx`(`auditId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AssetLog` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `assetId` BIGINT NULL,
    `userId` BIGINT NULL,
    `action` VARCHAR(191) NOT NULL,
    `detail` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AssetLog_assetId_idx`(`assetId`),
    INDEX `AssetLog_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ExcelImport` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `filename` VARCHAR(191) NOT NULL,
    `importedBy` BIGINT NULL,
    `totalRows` INTEGER NULL,
    `successRows` INTEGER NULL,
    `failedRows` INTEGER NULL,
    `errorLogUrl` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ExcelImport_importedBy_idx`(`importedBy`),
    INDEX `ExcelImport_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Asset` ADD CONSTRAINT `Asset_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Asset` ADD CONSTRAINT `Asset_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Asset` ADD CONSTRAINT `Asset_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AssetPhoto` ADD CONSTRAINT `AssetPhoto_assetId_fkey` FOREIGN KEY (`assetId`) REFERENCES `Asset`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AssetPhoto` ADD CONSTRAINT `AssetPhoto_uploadedBy_fkey` FOREIGN KEY (`uploadedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AssetAudit` ADD CONSTRAINT `AssetAudit_assetId_fkey` FOREIGN KEY (`assetId`) REFERENCES `Asset`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AssetAudit` ADD CONSTRAINT `AssetAudit_auditorId_fkey` FOREIGN KEY (`auditorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AssetAuditPhoto` ADD CONSTRAINT `AssetAuditPhoto_auditId_fkey` FOREIGN KEY (`auditId`) REFERENCES `AssetAudit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AssetAuditPhoto` ADD CONSTRAINT `AssetAuditPhoto_uploadedBy_fkey` FOREIGN KEY (`uploadedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AssetLog` ADD CONSTRAINT `AssetLog_assetId_fkey` FOREIGN KEY (`assetId`) REFERENCES `Asset`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AssetLog` ADD CONSTRAINT `AssetLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExcelImport` ADD CONSTRAINT `ExcelImport_importedBy_fkey` FOREIGN KEY (`importedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
