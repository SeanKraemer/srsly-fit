-- Specify which database to use
USE `prod`;

-- With this query we should be able to build a Workout Page (the page they view as 
-- they are working out) from an already created template.
-- It's assumed that the front end will already have the name of the workout because 
-- the user would've selected that before entering this page.
-- We'll pass in ”uId” for WorkoutContents userId, “woId” for Workoutcontents workoutId instead of the 1's
-- THIS QUERY MEETS THE CRITERIA FOR STAGE 3:
SELECT exers.exerciseId, exers.name, eLog.`like`, conts.`order`,
	JSON_ARRAYAGG(
		JSON_OBJECT('setId', s.setId, 'order', s.`order`, 'lbs', s.lbs, 'reps', s.reps)
	) AS sets
FROM WorkoutContents conts
LEFT JOIN Exercises exers ON exers.exerciseId = conts.exerciseId
LEFT JOIN ExerciseLog eLog ON eLog.userId = conts.userId AND eLog.exerciseId = exers.exerciseId
LEFT JOIN (SELECT setId, userId, exerciseId, `order`, lbs, reps 
		   FROM Sets 
           ORDER BY `order`) s 
	ON s.userId = eLog.userId AND s.exerciseId = eLog.exerciseId
WHERE conts.userId = 1 AND conts.workoutId = 1
GROUP BY exers.exerciseId, exers.name, eLog.`like`, conts.`order`
ORDER BY conts.`order`;

-- We're going to assume that a user just clicked the "Finish Workout" button.
-- So we need to update the template and the counters which track how
-- often the user has performed an exercise.
-- The stored procedure uses the assumption that the "order" parameters
-- are wrong in the exercises and sets arrays and instead goes off of the
-- literal order of the contents (reordering is much easier to do in next.js)

USE `prod`;

DROP PROCEDURE IF EXISTS UpdateInsertCompletedWorkout;

DELIMITER //

CREATE PROCEDURE UpdateInsertCompletedWorkout(
	IN in_workoutId INT,
    IN in_userId INT,
	IN in_workoutJson JSON,
    IN in_exercisesJson JSON
)
BEGIN
	DECLARE varName VARCHAR(255);
	DECLARE varLastDate DATETIME DEFAULT NULL;
    DECLARE varLastDuration INT DEFAULT NULL;
    DECLARE varLbs REAL DEFAULT 0;
    DECLARE varReps INT DEFAULT 0;
    DECLARE varExerciseId INT;
    DECLARE varLike BOOL;
    DECLARE varSetId INT DEFAULT NULL;
    
    DECLARE varNumExercises INT DEFAULT 0;
    DECLARE varExerciseIdx INT DEFAULT 0;
    DECLARE varNumSets INT DEFAULT 0;
    DECLARE varSetIdx INT DEFAULT 0;
    
    -- Putting everything into a transaction just incase something breaks so it can be rolled back.
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
	BEGIN
		ROLLBACK;
        SIGNAL SQLSTATE '45000'
		SET MESSAGE_TEXT = 'Stored Procedure failed internally and was rolled back';
	END;
    
    -- Set the transaction as repeatable read because it may read the same row more than once
    -- and I believe the deletion of old rows requires the reading of the table contents to 
    -- be consistent because of how the WHERE is structured.
    SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
    
    START TRANSACTION;

	SET varName = JSON_UNQUOTE(JSON_UNQUOTE(JSON_EXTRACT(in_workoutJson, '$.name')));    

	SET varLastDate = STR_TO_DATE(
		SUBSTRING(JSON_UNQUOTE(JSON_EXTRACT(in_workoutJson, '$.lastDate')), 1, 19),
		'%Y-%m-%dT%H:%i:%s'
	);
    
    SET @lastDurationUnprocessed = JSON_EXTRACT(in_workoutJson, CONCAT('$.lastDuration'));
	IF @lastDurationUnprocessed IS NULL THEN
		SET varLastDuration = NULL;
    ELSE
		SET varLastDuration = CAST(@lastDurationUnprocessed as SIGNED);
    END IF;

	-- Update the workout template with the new data
	UPDATE WorkoutTemplates 
	SET lastDate = varLastDate, name = varName, lastDuration = varLastDuration
	WHERE userId = in_userId AND workoutId = in_workoutId;

	-- First we'll delete the unneeded joins
	-- Delete unneded sets joins (if user removed some sets)
    -- (Cross join was explictly chosen because of how the data is structured)
	DELETE s FROM Sets s
	INNER JOIN WorkoutContents wc ON s.userId = wc.userId AND s.exerciseId = wc.exerciseId
	WHERE wc.workoutId = in_workoutId AND wc.userId = in_userId
	AND NOT EXISTS (
		SELECT 1 
		FROM JSON_TABLE(
			in_exercisesJson,
			'$[*]' COLUMNS (
				exerciseId INT PATH '$.exerciseId',
				sets JSON PATH '$.sets'
			)
		) AS exercise,
		JSON_TABLE(
			exercise.sets,
			'$[*]' COLUMNS (
				setId INT PATH '$.setId'
			)
		) AS setData
		WHERE exercise.exerciseId = s.exerciseId 
		AND setData.setId = s.setId
		AND setData.setId IS NOT NULL
	);
    
    -- Delete unnneded WorkoutContents joins (if user removed exercises)
    -- DELETE FROM WorkoutContents
	-- WHERE (workoutId, userId, exerciseId) NOT IN (
	-- 	SELECT in_workoutId, in_userId, e.exerciseId
	-- 	FROM JSON_TABLE (
	-- 		in_exercisesJson,
    --         '$[*]' COLUMNS (
	-- 			exerciseIdx FOR ORDINALITY,
    --             exerciseId INT PATH '$.exerciseId'
    --         )
	-- 	) as e

	-- Modifying delete logic to make sure it will keep other workouts not associated with the current workoutid and userid
	DELETE FROM WorkoutContents
	WHERE 
	workoutId = in_workoutId AND userId = in_userId
	AND exerciseId NOT IN (
		SELECT e.exerciseId
		FROM JSON_TABLE (
			in_exercisesJson,
			'$[*]' COLUMNS (
				exerciseId INT PATH '$.exerciseId'
			)
		) as e
	);

	-- We should only need to update and insert from here on out
	SET varNumExercises = JSON_LENGTH(in_exercisesJson);
    WHILE varExerciseIdx < varNumExercises DO
    
		SET varExerciseId = CAST(JSON_EXTRACT(in_exercisesJson, CONCAT('$[', varExerciseIdx, '].exerciseId')) AS SIGNED);
        SET @likeUnprocessed = JSON_EXTRACT(in_exercisesJson, CONCAT('$[', varExerciseIdx, '].like'));
        SET varLike = CASE
			WHEN @likeUnprocessed IS NULL THEN NULL
			WHEN CAST(@likeUnprocessed AS CHAR) = 'true' THEN 1
			WHEN CAST(@likeUnprocessed AS CHAR) = '1' THEN 1
			WHEN CAST(@likeUnprocessed AS CHAR) = 'false' THEN 0
			WHEN CAST(@likeUnprocessed AS CHAR) = '0' THEN 0
			ELSE NULL
		END;
        
		-- WorkoutContents update/insert
        INSERT INTO WorkoutContents (workoutId, userId, exerciseId, `order`)
		VALUES (in_workoutId, in_userId, varExerciseId, varExerciseIdx)
		ON DUPLICATE KEY UPDATE
			`order` = varExerciseIdx;
          
		-- ExerciseLog update/insert (assuming the exercise was completed)
        INSERT INTO ExerciseLog (userId, exerciseId, `like`, timesCompleted)
        VALUES (in_userId, varExerciseId, varLike, 0)
        ON DUPLICATE KEY UPDATE
			`like` = varLike,
			`timesCompleted` = `timesCompleted` + 1;
    
		-- Insert/Update sets
		SET varNumSets = JSON_LENGTH(JSON_EXTRACT(in_exercisesJson, CONCAT('$[', varExerciseIdx, '].sets')));
		WHILE varSetIdx < varNumSets DO
            
            -- setId can be null if the set row hasn't been created yet (user added it on the front-end side)
            SET @setIdUnprocessed = JSON_EXTRACT(in_exercisesJson, CONCAT('$[', varExerciseIdx, '].sets[', varSetIdx, '].setId'));
			IF @setIdUnprocessed IS NULL OR JSON_UNQUOTE(@setIdUnprocessed) = 'null' THEN
				SET varSetId = NULL;
			ELSE
				SET varSetId = CAST(JSON_UNQUOTE(@setIdUnprocessed) AS SIGNED);
			END IF;
            
            SET varLbs = CAST(JSON_EXTRACT(in_exercisesJson, CONCAT('$[', varExerciseIdx, '].sets[', varSetIdx, '].lbs')) AS DECIMAL(10,2));
            SET varReps = CAST(JSON_EXTRACT(in_exercisesJson, CONCAT('$[', varExerciseIdx, '].sets[', varSetIdx, '].reps')) as SIGNED);
            
            IF varSetId IS NULL OR varSetId <= 0 THEN
				INSERT INTO Sets(userId, exerciseId, `order`, lbs, reps)
                VALUES (in_userId, varExerciseId, varSetIdx, varLbs, varReps);
			ELSE
				UPDATE Sets
                SET `order` = varSetIdx, lbs = varLbs, reps = varReps
                WHERE setId = varSetId AND userId = in_userId;
            END IF;
            
            -- Increment loop variable
            SET varSetIdx = varSetIdx + 1;
        END WHILE;
		
        -- Reset/Increment loop variables
        SET varSetIdx = 0;
		SET varExerciseIdx = varExerciseIdx + 1;
    END WHILE;
    COMMIT;
END //

DELIMITER ;


-- With this stored procedure the user has the option to save the
-- workout template without updating the exercise counters
-- The stored procedure uses the assumption that the "order" parameters
-- are wrong in the exercises and sets arrays and instead goes off of the
-- literal order of the contents (reordering is much easier to do in next.js)
-- There's only a one line difference from the stored procedure above
-- since we still need to ensure the ExerciseLog connections exist

USE `prod`;

DROP PROCEDURE IF EXISTS UpdateInsertTemplateOnly;

DELIMITER //

CREATE PROCEDURE UpdateInsertTemplateOnly(
	IN in_workoutId INT,
    IN in_userId INT,
	IN in_workoutJson JSON,
    IN in_exercisesJson JSON
)
BEGIN
	DECLARE varName VARCHAR(255);
	DECLARE varLastDate DATETIME DEFAULT NULL;
    DECLARE varLbs REAL DEFAULT 0;
    DECLARE varReps INT DEFAULT 0;
    DECLARE varExerciseId INT;
    DECLARE varLike BOOL;
    DECLARE varSetId INT DEFAULT NULL;
    
    DECLARE varNumExercises INT DEFAULT 0;
    DECLARE varExerciseIdx INT DEFAULT 0;
    DECLARE varNumSets INT DEFAULT 0;
    DECLARE varSetIdx INT DEFAULT 0;
    
    -- Putting everything into a transaction just incase something breaks so it can be rolled back.
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
	BEGIN
		ROLLBACK;
        SIGNAL SQLSTATE '45000'
		SET MESSAGE_TEXT = 'Stored Procedure failed internally and was rolled back';
	END;
    
    -- Set the transaction as repeatable read because it may read the same row more than once
    -- and I believe the deletion of old rows requires the reading of the table contents to 
    -- be consistent because of how the WHERE is structured.
    SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
    
    START TRANSACTION;

	SET varName = JSON_UNQUOTE(JSON_UNQUOTE(JSON_EXTRACT(in_workoutJson, '$.name')));    

	SET varLastDate = STR_TO_DATE(
		SUBSTRING(JSON_UNQUOTE(JSON_EXTRACT(in_workoutJson, '$.lastDate')), 1, 19),
		'%Y-%m-%dT%H:%i:%s'
	);

	-- Update the workout template with the new data
	UPDATE WorkoutTemplates 
	SET lastDate = varLastDate, name = varName 
	WHERE userId = in_userId AND workoutId = in_workoutId;

	-- First we'll delete the unneeded joins
	-- Delete unneded sets joins (if user removed some sets)
	DELETE s FROM Sets s
	INNER JOIN WorkoutContents wc ON s.userId = wc.userId AND s.exerciseId = wc.exerciseId
	WHERE wc.workoutId = in_workoutId AND wc.userId = in_userId
	AND NOT EXISTS (
		SELECT 1 
		FROM JSON_TABLE(
			in_exercisesJson,
			'$[*]' COLUMNS (
				exerciseId INT PATH '$.exerciseId',
				sets JSON PATH '$.sets'
			)
		) AS exercise,
		JSON_TABLE(
			exercise.sets,
			'$[*]' COLUMNS (
				setId INT PATH '$.setId'
			)
		) AS setData
		WHERE exercise.exerciseId = s.exerciseId 
		AND setData.setId = s.setId
		AND setData.setId IS NOT NULL
	);
    
    -- Delete unnneded WorkoutContents joins (if user removed exercises)
    -- DELETE FROM WorkoutContents
	-- WHERE (workoutId, userId, exerciseId) NOT IN (
	-- 	SELECT in_workoutId, in_userId, e.exerciseId
	-- 	FROM JSON_TABLE (
	-- 		in_exercisesJson,
    --         '$[*]' COLUMNS (
	-- 			exerciseIdx FOR ORDINALITY,
    --             exerciseId INT PATH '$.exerciseId'
    --         )
	-- 	) as e

	-- Modifying delete logic to make sure it will keep other workouts not associated with the current workoutid and userid
	DELETE FROM WorkoutContents
	WHERE 
	workoutId = in_workoutId AND userId = in_userId
	AND exerciseId NOT IN (
		SELECT e.exerciseId
		FROM JSON_TABLE (
			in_exercisesJson,
			'$[*]' COLUMNS (
				exerciseId INT PATH '$.exerciseId'
			)
		) as e
	);

	-- We should only need to update and insert from here on out
	SET varNumExercises = JSON_LENGTH(in_exercisesJson);
    WHILE varExerciseIdx < varNumExercises DO
    
		SET varExerciseId = CAST(JSON_EXTRACT(in_exercisesJson, CONCAT('$[', varExerciseIdx, '].exerciseId')) AS SIGNED);
        SET @likeUnprocessed = JSON_EXTRACT(in_exercisesJson, CONCAT('$[', varExerciseIdx, '].like'));
        SET varLike = CASE
			WHEN @likeUnprocessed IS NULL THEN NULL
			WHEN CAST(@likeUnprocessed AS CHAR) = 'true' THEN 1
			WHEN CAST(@likeUnprocessed AS CHAR) = '1' THEN 1
			WHEN CAST(@likeUnprocessed AS CHAR) = 'false' THEN 0
			WHEN CAST(@likeUnprocessed AS CHAR) = '0' THEN 0
			ELSE NULL
		END;
        
		-- WorkoutContents update/insert
        INSERT INTO WorkoutContents (workoutId, userId, exerciseId, `order`)
		VALUES (in_workoutId, in_userId, varExerciseId, varExerciseIdx)
		ON DUPLICATE KEY UPDATE
			`order` = varExerciseIdx;
          
		-- ExerciseLog update/insert (assuming the exercise was completed)
        INSERT INTO ExerciseLog (userId, exerciseId, `like`, timesCompleted)
        VALUES (in_userId, varExerciseId, varLike, 0)
        ON DUPLICATE KEY UPDATE
			`like` = varLike;
    
		-- Insert/Update sets
		SET varNumSets = JSON_LENGTH(JSON_EXTRACT(in_exercisesJson, CONCAT('$[', varExerciseIdx, '].sets')));
		WHILE varSetIdx < varNumSets DO
            
            -- setId can be null if the set row hasn't been created yet (user added it on the front-end side)
            SET @setIdUnprocessed = JSON_EXTRACT(in_exercisesJson, CONCAT('$[', varExerciseIdx, '].sets[', varSetIdx, '].setId'));
			IF @setIdUnprocessed IS NULL OR JSON_UNQUOTE(@setIdUnprocessed) = 'null' THEN
				SET varSetId = NULL;
			ELSE
				SET varSetId = CAST(JSON_UNQUOTE(@setIdUnprocessed) AS SIGNED);
			END IF;
            
            SET varLbs = CAST(JSON_EXTRACT(in_exercisesJson, CONCAT('$[', varExerciseIdx, '].sets[', varSetIdx, '].lbs')) AS DECIMAL(10,2));
            SET varReps = CAST(JSON_EXTRACT(in_exercisesJson, CONCAT('$[', varExerciseIdx, '].sets[', varSetIdx, '].reps')) as SIGNED);
            
            IF varSetId IS NULL OR varSetId <= 0 THEN
				INSERT INTO Sets(userId, exerciseId, `order`, lbs, reps)
                VALUES (in_userId, varExerciseId, varSetIdx, varLbs, varReps);
			ELSE
				UPDATE Sets
                SET `order` = varSetIdx, lbs = varLbs, reps = varReps
                WHERE setId = varSetId AND userId = in_userId;
            END IF;
            
            -- Increment loop variable
            SET varSetIdx = varSetIdx + 1;
        END WHILE;
		
        -- Reset/Increment loop variables
        SET varSetIdx = 0;
		SET varExerciseIdx = varExerciseIdx + 1;
    END WHILE;
    COMMIT;
END //

DELIMITER ;


-- Query to view what has been stored in the database after the stored procedures
-- (replace userId and workoutId)
SELECT * 
FROM WorkoutTemplates
LEFT JOIN WorkoutContents ON WorkoutContents.workoutId = WorkoutTemplates.workoutId
LEFT JOIN Exercises ON WorkoutContents.exerciseId = Exercises.exerciseId
LEFT JOIN ExerciseLog ON Exercises.exerciseId = ExerciseLog.exerciseId AND ExerciseLog.userId = WorkoutTemplates.userId
LEFT JOIN Sets ON Sets.userId = ExerciseLog.userId AND Sets.exerciseId = ExerciseLog.exerciseId
WHERE WorkoutTemplates.userId = 1 AND WorkoutTemplates.workoutId = 20;