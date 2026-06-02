-- Local MySQL schema for Srsly Fit.
DROP DATABASE IF EXISTS `srsly_fit`;

CREATE DATABASE `srsly_fit`;

USE `srsly_fit`;

-- Drop tables in dependency order.
DROP TABLE IF EXISTS `Sets`;
DROP TABLE IF EXISTS `ExerciseLog`;
DROP TABLE IF EXISTS `WorkoutContents`;
DROP TABLE IF EXISTS `ExercisesMuscles`;
DROP TABLE IF EXISTS `Exercises`;
DROP TABLE IF EXISTS `WorkoutTemplates`;
DROP TABLE IF EXISTS `Muscles`;
DROP TABLE IF EXISTS `Users`;

-- Users table is created first because other tables reference it.
CREATE TABLE `Users` (
    `userId` INT PRIMARY KEY AUTO_INCREMENT,
    `username` VARCHAR(30) UNIQUE NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `firstName` VARCHAR(30) NOT NULL,
    `lastName` VARCHAR(30) NULL
);

CREATE TABLE `Muscles` (
    `muscleId` INT PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(255) UNIQUE NOT NULL
);

-- WorkoutTemplates depends on Users.
CREATE TABLE `WorkoutTemplates` (
    `workoutId` INT AUTO_INCREMENT,
    `userId` INT,
    `lastDate` DATETIME NULL,
    `name` VARCHAR(255),
    `lastDuration` INT DEFAULT NULL,
    PRIMARY KEY(workoutId, userId),
    FOREIGN KEY (`userId`) REFERENCES `Users`(`userId`) ON DELETE CASCADE
);

-- Exercises depends on Users.
CREATE TABLE `Exercises` (
    `exerciseId` INT PRIMARY KEY AUTO_INCREMENT,
    `ownerId` INT DEFAULT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `video` VARCHAR(255) NULL,
    FULLTEXT KEY `ft_exercises_name_description` (`name`, `description`),
    FOREIGN KEY (`ownerId`) REFERENCES `Users`(`userId`) ON DELETE CASCADE
);

-- Join table between exercises and target muscles.
CREATE TABLE `ExercisesMuscles` (
    `exerciseId` INT,
    `muscleId` INT,
    PRIMARY KEY (`exerciseId`, `muscleId`),
    FOREIGN KEY (`exerciseId`) REFERENCES `Exercises`(`exerciseId`) ON DELETE CASCADE,
    FOREIGN KEY (`muscleId`) REFERENCES `Muscles`(`muscleId`) ON DELETE CASCADE
);

-- Depends on WorkoutTemplates and Exercises.
CREATE TABLE `WorkoutContents` (
    `workoutId` INT,
    `userId` INT,
    `exerciseId` INT,
    `order` INT NOT NULL,
    PRIMARY KEY (`workoutId`, `userId`, `exerciseId`),
    FOREIGN KEY (`workoutId`, `userId`) REFERENCES `WorkoutTemplates`(`workoutId`, `userId`) ON DELETE CASCADE,
    FOREIGN KEY (`exerciseId`) REFERENCES `Exercises`(`exerciseId`) ON DELETE CASCADE
);

-- Depends on Users and Exercises.
CREATE TABLE `ExerciseLog` (
    `userId` INT,
    `exerciseId` INT,
    `like` BOOL NULL,
    `timesCompleted` INT DEFAULT 0,
    PRIMARY KEY (`userId`, `exerciseId`),
    FOREIGN KEY (`userId`) REFERENCES `Users`(`userId`) ON DELETE CASCADE,
    FOREIGN KEY (`exerciseId`) REFERENCES `Exercises`(`exerciseId`) ON DELETE CASCADE
);

-- Depends on ExerciseLog.
CREATE TABLE `Sets` (
    `setId` INT AUTO_INCREMENT,
    `userId` INT,
    `exerciseId` INT,
    `order` INT NOT NULL,
    `lbs` REAL NOT NULL,
    `reps` INT NOT NULL,
    PRIMARY KEY(setId, userId, exerciseId),
    FOREIGN KEY (`userId`, `exerciseId`) REFERENCES `ExerciseLog`(`userId`, `exerciseId`) ON DELETE CASCADE
);
