-- Specify which database to use
USE `srsl-fit`;

-- With this query we should be able to build an individual Exercise page when a user wants to
-- learn more about it. Note: We filter by the owner of the page because they may somehow
-- request for a page that they don't have access to so this would prevent them from seeing it
-- We'll pass in "exId" for Exercises exerciseId and "ownId" for Exercises.ownerId instead of 1
-- THIS QUERY MEETS THE CRITERIA FOR STAGE 3:
SELECT exers.exerciseId, exers.name, exers.description, JSON_ARRAYAGG(musc.name) AS muscles
FROM Exercises exers
JOIN ExercisesMuscles ems ON ems.exerciseId = exers.exerciseId 
JOIN Muscles musc ON ems.muscleId = musc.muscleId
WHERE (exers.ownerId IS NULL OR exers.ownerId = 1)
	AND exers.exerciseId = 1 
GROUP BY exers.exerciseId, exers.name, exers.description;

--Used instead of previours query 
SELECT exers.exerciseId, exers.name
FROM Exercises exers
JOIN ExercisesMuscles ems ON ems.exerciseId = exers.exerciseId
JOIN Muscles musc ON ems.muscleId = musc.muscleId
WHERE (exers.ownerId IS NULL OR exers.ownerId = 1)
	AND exers.exerciseId = 1 
	AND musc.muscleId = 1
GROUP BY exers.exerciseId, exers.lastName;
