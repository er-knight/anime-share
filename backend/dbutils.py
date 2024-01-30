import os

import psycopg


conninfo = f"host={os.environ['PG_HOST']} port={os.environ['PG_PORT']} dbname={os.environ['PG_DATABASE']} user={os.environ['PG_USERNAME']} password={os.environ['PG_PASSWORD']}"

def create_table():

    try:
        with psycopg.connect(conninfo) as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS mapping (
                    id SERIAL PRIMARY KEY,
                    hash varchar(64)
                    zip text
                )
                """
                )
        connection.commit()
    except Exception as e:
        print("[create_table]", e)           

def insert_mapping(hash: str, zip: str) -> bool:

    try:
        with psycopg.connect(conninfo) as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                """
                INSERT INTO mapping (hash, zip)
                VALUES (%s, %s)
                """, (hash, zip)
                )
                
            connection.commit()
        return True
    except Exception as e:
        print("[insert_mapping]", e)
        return False

def get_zip_from_hash(hash: str) -> str:

    try:
        with psycopg.connect(conninfo) as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                """
                SELECT zip from mapping
                WHERE hash = %s
                """, (hash, )
                )
        return cursor.fetchone()[0]
    except Exception as e:
        print("[get_zip_from_hash]", e)
        return None
