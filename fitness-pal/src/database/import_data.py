import argparse
import csv
import os
from pathlib import Path

import mysql.connector
from mysql.connector import errorcode


TABLE_IMPORT_CONFIG = [
    ("Users.csv", "Users", "userId"),
    ("Muscles.csv", "Muscles", "muscleId"),
    ("Exercises.csv", "Exercises", "exerciseId"),
    ("ExercisesMuscles.csv", "ExercisesMuscles", None),
    ("ExerciseLog.csv", "ExerciseLog", None),
    ("Sets.csv", "Sets", "setId"),
    ("WorkoutTemplates.csv", "WorkoutTemplates", "workoutId"),
    ("WorkoutContents.csv", "WorkoutContents", None),
]


def get_db_config() -> dict[str, str]:
    return {
        "user": os.getenv("MYSQL_USER", "root"),
        "password": os.getenv("MYSQL_PASSWORD", ""),
        "host": os.getenv("MYSQL_HOST", "127.0.0.1"),
        "database": os.getenv("MYSQL_DATABASE", "srsly_fit"),
    }


def import_csv_to_table(cnx, cursor, data_dir: Path, csv_name: str, table_name: str, auto_increment_col: str | None):
    filepath = data_dir / csv_name
    print(f"--- Importing {filepath} into `{table_name}` ---")

    with filepath.open(mode="r", encoding="utf-8", newline="") as csv_file:
        csv_reader = csv.reader(csv_file)
        headers = next(csv_reader)
        db_columns = [h for h in headers if h != auto_increment_col] if auto_increment_col else headers
        query_columns = ", ".join([f"`{col}`" for col in db_columns])
        value_placeholders = ", ".join(["%s"] * len(db_columns))
        insert_query = f"INSERT INTO `{table_name}` ({query_columns}) VALUES ({value_placeholders})"

        rows_imported = 0
        for line_number, row in enumerate(csv_reader, start=2):
            if len(row) != len(headers):
                print(f"  [Warning] Skipping line {line_number}: expected {len(headers)} columns, found {len(row)}")
                continue

            row_data = dict(zip(headers, row))
            values = tuple(None if row_data[col].upper() == "NULL" else row_data[col] for col in db_columns)
            cursor.execute(insert_query, values)
            rows_imported += 1

        cnx.commit()
        print(f"--- Imported {rows_imported} rows into `{table_name}` ---")


def main():
    parser = argparse.ArgumentParser(description="Import Srsly Fit seed CSVs into MySQL.")
    parser.add_argument("--data-dir", required=True, type=Path, help="Directory containing the expected CSV files.")
    parser.add_argument("--truncate", action="store_true", help="Delete existing rows before importing.")
    args = parser.parse_args()

    try:
        cnx = mysql.connector.connect(**get_db_config())
        cursor = cnx.cursor()

        if args.truncate:
            for _, table_name, _ in reversed(TABLE_IMPORT_CONFIG):
                print(f"Clearing `{table_name}`...")
                cursor.execute(f"DELETE FROM `{table_name}`")
            cnx.commit()

        for csv_name, table_name, auto_increment_col in TABLE_IMPORT_CONFIG:
            import_csv_to_table(cnx, cursor, args.data_dir, csv_name, table_name, auto_increment_col)

    except mysql.connector.Error as err:
        if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
            print("Database authentication failed. Check MYSQL_USER and MYSQL_PASSWORD.")
        elif err.errno == errorcode.ER_BAD_DB_ERROR:
            print("Database does not exist. Check MYSQL_DATABASE.")
        else:
            print(err)
        raise SystemExit(1)
    finally:
        if "cursor" in locals():
            cursor.close()
        if "cnx" in locals() and cnx.is_connected():
            cnx.close()


if __name__ == "__main__":
    main()
