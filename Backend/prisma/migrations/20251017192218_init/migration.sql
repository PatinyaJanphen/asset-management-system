-- AlterTable
ALTER TABLE `ExcelImport` ADD COLUMN `importType` VARCHAR(191) NOT NULL DEFAULT 'ASSET';

-- CreateIndex
CREATE INDEX `ExcelImport_importType_idx` ON `ExcelImport`(`importType`);
