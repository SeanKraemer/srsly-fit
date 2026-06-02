import type { RowDataPacket } from 'mysql2/promise'
import { isDemoMode } from '@/src/env'
import { getPool } from '@/src/database/pool'

import {
  demoExercises,
  demoMuscles,
  demoUser,
  demoWorkoutDetails,
  demoWorkoutTemplates,
  toExerciseSummary,
} from './demoData'

export interface MuscleData {
  muscleId: number
  name: string
}

export interface ExerciseSummary {
  exerciseId: number
  name: string
  ownerId: number | null
  muscles: string[]
}

export interface ExerciseDetails {
  exerciseId: number
  name: string
  description: string
  ownerId: number | null
  muscles: string[]
}

export interface ExerciseDataForEditForm {
  exerciseId: number
  name: string
  description: string
  ownerId: number
  muscleIds: number[]
}

export interface WorkoutTemplateData {
  workoutId: number
  lastDate: Date | string
  name: string
  lastDuration: number
}

export interface WorkoutData {
  lastDate: Date | string
  name: string
  lastDuration: number
}

export interface SetData {
  id: string
  dbSetId?: number
  order: number
  lbs: number
  reps: number
}

export interface EditableExercise {
  id: string
  exerciseId: number
  name: string
  like: boolean | null
  order: number
  sets: SetData[]
}

export interface DashboardData {
  workoutTemplates: WorkoutTemplateData[]
  totalExercisesCompleted: number
}

interface WorkoutExerciseRow {
  exerciseId: number
  name: string
  exerciseOrder: number
  like: boolean | null
  setId: number | null
  setOrder: number | null
  lbs: number | null
  reps: number | null
}

interface WorkoutDetailRow extends RowDataPacket {
  name: string
  lastDate: Date | string
  lastDuration: number | null
}

interface SuggestedExerciseRow extends RowDataPacket {
  exerciseId: number
  name: string
}

export function parseMuscleIds(muscleIds: string): number[] {
  return muscleIds
    .split(',')
    .map((id) => Number(id))
    .filter((id) => Number.isInteger(id) && id > 0)
}

function demoExerciseMatches(exercise: ExerciseDetails, keywords: string, muscleIds: string) {
  const lowerKeywords = keywords.trim().toLowerCase()
  const selectedMuscleIds = parseMuscleIds(muscleIds)
  const selectedMuscleNames = selectedMuscleIds
    .map((id) => demoMuscles.find((muscle) => muscle.muscleId === id)?.name)
    .filter(Boolean)

  const matchesKeyword = !lowerKeywords ||
    exercise.name.toLowerCase().includes(lowerKeywords) ||
    exercise.description.toLowerCase().includes(lowerKeywords)

  const matchesMuscle = selectedMuscleNames.length === 0 ||
    selectedMuscleNames.some((muscleName) => exercise.muscles.includes(String(muscleName)))

  return matchesKeyword && matchesMuscle
}

export function filterDemoExerciseDetails(ownerId: string, keywords: string, muscleIds: string): ExerciseDetails[] {
  return demoExercises.filter((exercise) =>
    (exercise.ownerId === null || exercise.ownerId === Number(ownerId)) &&
    demoExerciseMatches(exercise, keywords, muscleIds)
  )
}

function getDemoEditableExerciseIds(workoutId: string) {
  return new Set(demoWorkoutDetails[workoutId]?.exercises.map((exercise) => exercise.exerciseId) ?? [])
}

export function aggregateWorkoutExerciseRows(rows: WorkoutExerciseRow[]): EditableExercise[] {
  const exercisesMap = new Map<number, EditableExercise>()

  for (const row of rows) {
    if (!exercisesMap.has(row.exerciseId)) {
      exercisesMap.set(row.exerciseId, {
        id: `client-exercise-${row.exerciseId}`,
        exerciseId: row.exerciseId,
        name: row.name,
        like: row.like,
        order: row.exerciseOrder,
        sets: [],
      })
    }

    if (row.setId) {
      exercisesMap.get(row.exerciseId)?.sets.push({
        id: `client-set-${row.setId}`,
        dbSetId: row.setId,
        order: row.setOrder ?? 0,
        lbs: row.lbs ?? 0,
        reps: row.reps ?? 0,
      })
    }
  }

  return Array.from(exercisesMap.values())
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  if (isDemoMode) {
    return {
      workoutTemplates: demoWorkoutTemplates.slice(0, 3),
      totalExercisesCompleted: 28,
    }
  }

  const pool = getPool()
  const [workoutTemplates] = await pool.execute<WorkoutTemplateData[] & RowDataPacket[]>(
    'SELECT workoutId, lastDate, name, lastDuration FROM WorkoutTemplates WHERE userId = ? ORDER BY lastDate DESC LIMIT 3',
    [userId],
  )
  const [totalExercisesRows] = await pool.execute<RowDataPacket[]>(
    'SELECT SUM(timesCompleted) as total FROM ExerciseLog WHERE userId = ?',
    [userId],
  )

  return {
    workoutTemplates,
    totalExercisesCompleted: totalExercisesRows[0]?.total || 0,
  }
}

export async function getWorkoutTemplates(userId: string, searchTerm: string): Promise<WorkoutTemplateData[]> {
  if (isDemoMode) {
    const lowerSearch = searchTerm.trim().toLowerCase()
    return demoWorkoutTemplates.filter((workout) => !lowerSearch || workout.name.toLowerCase().includes(lowerSearch))
  }

  const pool = getPool()
  let query = `
    SELECT workoutId, lastDate, name, lastDuration
    FROM WorkoutTemplates
    WHERE userId = ?
  `
  const queryParams: (string | number)[] = [userId]

  if (searchTerm) {
    query += ' AND name LIKE ?'
    queryParams.push(`%${searchTerm}%`)
  }

  query += ' ORDER BY lastDate DESC'

  const [workoutTemplates] = await pool.execute<WorkoutTemplateData[] & RowDataPacket[]>(query, queryParams)
  return workoutTemplates
}

export async function getWorkoutDetail(workoutId: string, userId: string): Promise<{ workoutData: WorkoutData | null, exercises: EditableExercise[] }> {
  if (isDemoMode) {
    return demoWorkoutDetails[workoutId] ?? { workoutData: null, exercises: [] }
  }

  const pool = getPool()
  const [workoutRows] = await pool.query<WorkoutDetailRow[]>(
    'SELECT name, lastDate, lastDuration FROM WorkoutTemplates WHERE workoutId = ? AND userId = ?',
    [workoutId, userId],
  )

  if (workoutRows.length === 0) {
    return { workoutData: null, exercises: [] }
  }

  const workoutData: WorkoutData = {
    name: workoutRows[0].name,
    lastDate: workoutRows[0].lastDate,
    lastDuration: workoutRows[0].lastDuration || 0,
  }

  const [exerciseRows] = await pool.query<Array<WorkoutExerciseRow & RowDataPacket>>(
    `SELECT
        wc.exerciseId,
        e.name,
        wc.\`order\` AS exerciseOrder,
        el.like,
        s.setId,
        s.\`order\` AS setOrder,
        s.lbs,
        s.reps
      FROM WorkoutContents wc
      JOIN Exercises e ON wc.exerciseId = e.exerciseId
      LEFT JOIN ExerciseLog el ON wc.exerciseId = el.exerciseId AND wc.userId = el.userId
      LEFT JOIN \`Sets\` s ON wc.exerciseId = s.exerciseId AND wc.userId = s.userId
      WHERE wc.workoutId = ? AND wc.userId = ?
      ORDER BY exerciseOrder, setOrder`,
    [workoutId, userId],
  )

  return { workoutData, exercises: aggregateWorkoutExerciseRows(exerciseRows) }
}

export async function getMuscles(): Promise<MuscleData[]> {
  if (isDemoMode) {
    return demoMuscles
  }

  const pool = getPool()
  const [muscles] = await pool.execute<MuscleData[] & RowDataPacket[]>('SELECT muscleId, name FROM Muscles ORDER BY name ASC')
  return muscles
}

export async function getExercises(ownerId: string, keywords: string, muscleIds: string): Promise<ExerciseSummary[]> {
  if (isDemoMode) {
    return filterDemoExerciseDetails(ownerId, keywords, muscleIds).map(toExerciseSummary)
  }

  const pool = getPool()
  const query = `
    SELECT
      exers.exerciseId, exers.name, exers.ownerId,
      JSON_ARRAYAGG(musc.name) AS muscles
    FROM Exercises exers
    JOIN ExercisesMuscles ems ON ems.exerciseId = exers.exerciseId
    JOIN Muscles musc ON ems.muscleId = musc.muscleId
    WHERE
      (exers.ownerId IS NULL OR exers.ownerId = ?)
      AND (? = '' OR FIND_IN_SET(musc.muscleId, ?))
      AND (? = '' OR MATCH(exers.name, exers.description) AGAINST(? IN NATURAL LANGUAGE MODE))
    GROUP BY exers.exerciseId, exers.name, exers.ownerId
    ORDER BY
      CASE WHEN ? != '' THEN MATCH(exers.name, exers.description) AGAINST(?) ELSE 0 END DESC,
      exers.exerciseId ASC
  `

  const queryParams = [ownerId, muscleIds, muscleIds, keywords, keywords, keywords, keywords]
  const [exercises] = await pool.execute<ExerciseSummary[] & RowDataPacket[]>(query, queryParams)
  return exercises
}

export async function getExerciseOptions(ownerId?: string): Promise<Array<{ exerciseId: number, name: string }>> {
  if (isDemoMode) {
    return demoExercises
      .filter((exercise) => exercise.ownerId === null || exercise.ownerId === Number(ownerId ?? demoUser.id))
      .map(({ exerciseId, name }) => ({ exerciseId, name }))
  }

  const pool = getPool()
  const [rows] = await pool.query<Array<{ exerciseId: number, name: string } & RowDataPacket>>(
    'SELECT exerciseId, name FROM Exercises WHERE ownerId IS NULL OR ownerId = ? ORDER BY name ASC',
    [ownerId],
  )
  return rows
}

export async function getExerciseDetail(exerciseId: number, currentUserId: string): Promise<ExerciseDetails | null> {
  if (isDemoMode) {
    return demoExercises.find((exercise) =>
      exercise.exerciseId === exerciseId &&
      (exercise.ownerId === null || exercise.ownerId === Number(currentUserId))
    ) ?? null
  }

  const pool = getPool()
  const [rows] = await pool.execute<ExerciseDetails[] & RowDataPacket[]>(
    `SELECT exers.exerciseId, exers.name, exers.description, exers.ownerId, JSON_ARRAYAGG(musc.name) AS muscles
     FROM Exercises exers
     LEFT JOIN ExercisesMuscles ems ON ems.exerciseId = exers.exerciseId
     LEFT JOIN Muscles musc ON ems.muscleId = musc.muscleId
     WHERE exers.exerciseId = ? AND (exers.ownerId = ? OR exers.ownerId IS NULL)
     GROUP BY exers.exerciseId, exers.name, exers.description, exers.ownerId`,
    [exerciseId, currentUserId],
  )

  return rows[0] ?? null
}

export async function getExerciseForEdit(exerciseId: number, userId: string): Promise<{ exercise: ExerciseDataForEditForm | null, allMuscles: MuscleData[] }> {
  if (isDemoMode) {
    const exercise = demoExercises.find((candidate) => candidate.exerciseId === exerciseId && candidate.ownerId === Number(userId))
    if (!exercise) {
      return { exercise: null, allMuscles: demoMuscles }
    }

    const muscleIds = exercise.muscles
      .map((name) => demoMuscles.find((muscle) => muscle.name === name)?.muscleId)
      .filter((id): id is number => Boolean(id))

    return {
      exercise: {
        exerciseId: exercise.exerciseId,
        name: exercise.name,
        description: exercise.description,
        ownerId: Number(userId),
        muscleIds,
      } as ExerciseDataForEditForm,
      allMuscles: demoMuscles,
    }
  }

  const pool = getPool()
  const [exerciseRows] = await pool.execute<ExerciseDataForEditForm[] & RowDataPacket[]>(
    `SELECT e.exerciseId, e.name, e.description, e.ownerId,
      (SELECT JSON_ARRAYAGG(em.muscleId) FROM ExercisesMuscles em WHERE em.exerciseId = e.exerciseId) as muscleIds
     FROM Exercises e
     WHERE e.exerciseId = ? AND e.ownerId = ?`,
    [exerciseId, userId],
  )
  const [allMuscles] = await pool.execute<MuscleData[] & RowDataPacket[]>('SELECT muscleId, name FROM Muscles ORDER BY name ASC')

  const exercise = exerciseRows[0] ?? null
  if (exercise && !exercise.muscleIds) {
    exercise.muscleIds = []
  }

  return { exercise, allMuscles }
}

export async function getSuggestedExercise(userId: string, workoutId: string): Promise<{ exerciseId: number, name: string } | null> {
  if (isDemoMode) {
    const existingExerciseIds = getDemoEditableExerciseIds(workoutId)
    const suggestion = demoExercises.find((exercise) =>
      (exercise.ownerId === null || exercise.ownerId === Number(userId)) &&
      !existingExerciseIds.has(exercise.exerciseId)
    )

    return suggestion ? { exerciseId: suggestion.exerciseId, name: suggestion.name } : null
  }

  const pool = getPool()
  const query = `
    SELECT
      exers.exerciseId,
      exers.name,
      COALESCE(eLog.timesCompleted, 0) AS completed_count
    FROM Exercises AS exers
    LEFT JOIN ExerciseLog AS eLog ON exers.exerciseId = eLog.exerciseId AND eLog.userId = ?
    WHERE
      (exers.ownerId IS NULL OR exers.ownerId = ?)
      AND exers.exerciseId NOT IN (
        SELECT exerciseId
        FROM WorkoutContents
        WHERE userId = ? AND workoutId = ?
      )
    GROUP BY exers.exerciseId, exers.name, completed_count
    HAVING completed_count <= COALESCE((
      SELECT AVG(timesCompleted)
      FROM ExerciseLog
      WHERE userId = ?
    ), 0)
    ORDER BY RAND()
    LIMIT 1
  `

  const [rows] = await pool.query<SuggestedExerciseRow[]>(query, [userId, userId, userId, workoutId, userId])
  return rows[0] ?? null
}
