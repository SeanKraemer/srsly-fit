-- Specify which database to use
USE `srsl-fit`;

-- With this query we should be able to display all of the WorkoutTemplates on the Home Page
-- We'll pass in "uId" for WorkoutTemplates userId instead of 1
SELECT workoutId, lastDate, name
FROM WorkoutTemplates
WHERE userId = 1;

-- I guess we could add a search bar on this page where you could search for more info on 
-- exercises to learn more about them?
-- Might look pretty complicated though?
-- Keyword search
-- single muscle filter
-- THIS QUERY MEETS THE CRITERIA FOR STAGE 3:
SELECT exers.exerciseId, exers.name, JSON_ARRAYAGG(musc.name) AS muscles
FROM Exercises exers
JOIN ExercisesMuscles ems ON ems.exerciseId = exers.exerciseId 
JOIN Muscles musc ON ems.muscleId = musc.muscleId
WHERE (exers.ownerId IS NULL OR exers.ownerId = 1)
	AND exers.name LIKE '%push%' 
    AND musc.muscleId = 1
GROUP BY exers.exerciseId, exers.name;
