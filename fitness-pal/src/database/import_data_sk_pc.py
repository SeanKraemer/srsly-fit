# SCRIPT VERSION: 2.4 - Windows Path Fix
# This version corrects Windows file paths to prevent syntax errors.

import csv
import mysql.connector
from mysql.connector import errorcode

# --- DATABASE CONNECTION CONFIGURATION ---
# Replace these values with your actual database credentials.
DB_CONFIG = {
    "user": "root",
    "password": "1234",  # <-- Make sure this is your correct password
    "host": "127.0.0.1",
    "database": "srsl-fit",
}

# --- CSV AND TABLE CONFIGURATION ---
# FIX: Added 'r' before each string to create "raw" strings.
# This tells Python to treat backslashes as normal characters on Windows.
TABLE_IMPORT_CONFIG = [
    {
        "filepath": r"C:\Users\seanm\My Drive (seanmk2@illinois.edu)\iCAN\CS 411\data\Users.csv",
        "table_name": "Users",
        "auto_increment_col": "userId",
    },
    {
        "filepath": r"C:\Users\seanm\My Drive (seanmk2@illinois.edu)\iCAN\CS 411\data\Muscles.csv",
        "table_name": "Muscles",
        "auto_increment_col": "muscleId",
    },
    {
        "filepath": r"C:\Users\seanm\My Drive (seanmk2@illinois.edu)\iCAN\CS 411\data\Exercises.csv",
        "table_name": "Exercises",
        "auto_increment_col": "exerciseId",
    },
    {
        "filepath": r"C:\Users\seanm\My Drive (seanmk2@illinois.edu)\iCAN\CS 411\data\ExercisesMuscles.csv",
        "table_name": "ExercisesMuscles",
        "auto_increment_col": None,
    },
    {
        "filepath": r"C:\Users\seanm\My Drive (seanmk2@illinois.edu)\iCAN\CS 411\data\ExerciseLog.csv",
        "table_name": "ExerciseLog",
        "auto_increment_col": None,
    },
    {
        "filepath": r"C:\Users\seanm\My Drive (seanmk2@illinois.edu)\iCAN\CS 411\data\Sets.csv",
        "table_name": "Sets",
        "auto_increment_col": "setId",
    },
    {
        "filepath": r"C:\Users\seanm\My Drive (seanmk2@illinois.edu)\iCAN\CS 411\data\WorkoutTemplates.csv",
        "table_name": "WorkoutTemplates",
        "auto_increment_col": "workoutId",
    },
    {
        "filepath": r"C:\Users\seanm\My Drive (seanmk2@illinois.edu)\iCAN\CS 411\data\WorkoutContents.csv",
        "table_name": "WorkoutContents",
        "auto_increment_col": None,
    },
]


def import_csv_to_table(cnx, cursor, config):
    """
    Reads a CSV file and inserts its data into a database table based on the provided config.
    """
    filepath = config["filepath"]
    table_name = config["table_name"]
    auto_increment_col = config.get("auto_increment_col")

    print(f"--- Starting import for table: `{table_name}` from `{filepath}` ---")

    try:
        with open(filepath, mode="r", encoding="utf-8") as csv_file:
            csv_reader = csv.reader(csv_file)
            headers = next(csv_reader)

            if auto_increment_col:
                db_columns = [h for h in headers if h != auto_increment_col]
            else:
                db_columns = headers

            query_columns = ", ".join([f"`{col}`" for col in db_columns])
            value_placeholders = ", ".join(["%s"] * len(db_columns))

            insert_query = f"INSERT INTO `{table_name}` ({query_columns}) VALUES ({value_placeholders})"

            rows_imported = 0
            for i, row in enumerate(csv_reader):
                try:
                    if len(row) != len(headers):
                        print(
                            f"  [Warning] Skipping row {i+2}: Expected {len(headers)} columns, but found {len(row)}. Data: {row}"
                        )
                        continue

                    row_data_dict = {
                        header: value for header, value in zip(headers, row)
                    }

                    data_values = [row_data_dict[col] for col in db_columns]
                    data_to_insert = tuple(
                        None if val.upper() == "NULL" else val for val in data_values
                    )

                    cursor.execute(insert_query, data_to_insert)
                    rows_imported += 1
                except mysql.connector.Error as err:
                    print(f"  [Error] Could not import row {i+2}. MySQL Error: {err}")
                    print(f"  Query being run: {cursor.statement}")
                    print(f"  Data for this row: {data_to_insert}")
                except Exception as e:
                    print(f"  [Error] An unexpected error occurred on row {i+2}: {e}")

            cnx.commit()
            print(
                f"--- Successfully imported {rows_imported} rows into `{table_name}`. ---\n"
            )

    except FileNotFoundError:
        print(f"[Critical Error] File not found: {filepath}\n")
    except Exception as e:
        print(
            f"[Critical Error] An unexpected error occurred while processing `{filepath}`: {e}\n"
        )


def main():
    """Main function to connect to the DB and orchestrate the imports."""
    try:
        cnx = mysql.connector.connect(**DB_CONFIG)
        cursor = cnx.cursor()
        print("Successfully connected to the database.")
        print("Clearing existing data from tables for a fresh import...")

        for table_config in reversed(TABLE_IMPORT_CONFIG):
            table_name = table_config["table_name"]
            print(f"  Clearing table `{table_name}`...")
            cursor.execute(f"DELETE FROM `{table_name}`")
        cnx.commit()
        print("All tables cleared.\n")

        for table_config in TABLE_IMPORT_CONFIG:
            import_csv_to_table(cnx, cursor, table_config)

    except mysql.connector.Error as err:
        if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
            print("Something is wrong with your user name or password")
        elif err.errno == errorcode.ER_BAD_DB_ERROR:
            print("Database does not exist")
        else:
            print(err)
    else:
        cursor.close()
        cnx.close()
        print("All tasks complete. Database connection closed.")


if __name__ == "__main__":
    main()
