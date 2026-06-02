USE `srsly_fit`;

-- Sample query for displaying a user's workout templates.
SELECT workoutId, lastDate, name
FROM WorkoutTemplates
WHERE userId = 1;

-- Sample query for keyword and muscle-filtered exercise search.
SELECT exers.exerciseId, exers.name, JSON_ARRAYAGG(musc.name) AS muscles
FROM Exercises exers
JOIN ExercisesMuscles ems ON ems.exerciseId = exers.exerciseId 
JOIN Muscles musc ON ems.muscleId = musc.muscleId
WHERE (exers.ownerId IS NULL OR exers.ownerId = 1)
	AND exers.name LIKE '%push%' 
    AND musc.muscleId = 1
GROUP BY exers.exerciseId, exers.name;
