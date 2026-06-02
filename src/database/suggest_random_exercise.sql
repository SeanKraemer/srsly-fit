USE `srsly_fit`;

-- Sample input parameters for the query.
SET @userId = 1;
SET @workoutId = 1;

SELECT
    exers.exerciseId,
    exers.name,
    COALESCE(eLog.timesCompleted, 0) AS completed_count,
    JSON_ARRAYAGG(musc.name) AS muscles
FROM
    Exercises AS exers
LEFT JOIN 
    ExerciseLog AS eLog ON exers.exerciseId = eLog.exerciseId AND eLog.userId = @userId
JOIN
    ExercisesMuscles AS ems ON exers.exerciseId = ems.exerciseId
JOIN
    Muscles AS musc ON ems.muscleId = musc.muscleId
WHERE
    (exers.ownerId IS NULL OR exers.ownerId = 1)
    AND exers.exerciseId NOT IN (
        SELECT exerciseId
        FROM WorkoutContents
        WHERE userId = @userId AND workoutId = @workoutId
    )
GROUP BY
    exers.exerciseId, exers.name, completed_count
HAVING
    completed_count <= COALESCE((
        SELECT AVG(timesCompleted)
        FROM ExerciseLog
        WHERE userId = @userId
    ), 0)
ORDER BY
    RAND()
LIMIT 1;
