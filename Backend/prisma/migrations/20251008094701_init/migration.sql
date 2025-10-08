-- AlterTable
ALTER TABLE `User` MODIFY `phone` VARCHAR(191) NULL,
    MODIFY `firstlogin_at` DATETIME(3) NULL,
    MODIFY `lastlogin_at` DATETIME(3) NULL,
    MODIFY `update_at` DATETIME(3) NULL;
