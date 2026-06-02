USE `srsly_fit`;

-- Sample query for loading an exercise visible to a specific user.
SELECT exers.exerciseId, exers.name, exers.description, JSON_ARRAYAGG(musc.name) AS muscles
FROM Exercises exers
JOIN ExercisesMuscles ems ON ems.exerciseId = exers.exerciseId 
JOIN Muscles musc ON ems.muscleId = musc.muscleId
WHERE (exers.ownerId IS NULL OR exers.ownerId = 1)
	AND exers.exerciseId = 1 
GROUP BY exers.exerciseId, exers.name, exers.description;

-- Alternate filtered exercise lookup.
SELECT exers.exerciseId, exers.name
FROM Exercises exers
JOIN ExercisesMuscles ems ON ems.exerciseId = exers.exerciseId
JOIN Muscles musc ON ems.muscleId = musc.muscleId
WHERE (exers.ownerId IS NULL OR exers.ownerId = 1)
	AND exers.exerciseId = 1 
	AND musc.muscleId = 1
GROUP BY exers.exerciseId, exers.name;
