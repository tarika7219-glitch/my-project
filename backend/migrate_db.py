#!/usr/bin/env python3
"""
Database migration script to add gamification fields to existing User table.
Run this once to update the database schema.
"""

import sqlite3
import json
from pathlib import Path

def migrate_database():
    """Add new columns for gamification features to the User table."""
    
    db_path = Path(__file__).parent / 'instance' / 'resumeai.db'
    
    if not db_path.exists():
        print(f"Database not found at {db_path}")
        print("It will be created automatically on first run.")
        return
    
    conn = None
    try:
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        
        # Check which columns already exist
        cursor.execute("PRAGMA table_info(users)")
        existing_columns = {row[1] for row in cursor.fetchall()}
        
        migrations = [
            # Profile fields
            ("country", "TEXT", "country"),
            ("learning_interests", "TEXT", "learning_interests"),  # JSON as TEXT
            ("bio", "TEXT", "bio"),
            # Gamification fields
            ("interview_streak", "INTEGER DEFAULT 0", "interview_streak"),
            ("last_interview_date", "DATETIME", "last_interview_date"),
            ("total_interviews", "INTEGER DEFAULT 0", "total_interviews"),
            ("total_score", "FLOAT DEFAULT 0.0", "total_score"),
            ("confidence_level", "INTEGER DEFAULT 5", "confidence_level"),
            ("badges", "TEXT DEFAULT '[]'", "badges"),  # JSON as TEXT
        ]
        
        for col_name, col_type, check_name in migrations:
            if check_name not in existing_columns:
                print(f"Adding column: {col_name}")
                cursor.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}")
                print(f"  ✓ Column {col_name} added successfully")
            else:
                print(f"  ✓ Column {col_name} already exists")
        
        # Check for confidence_level in interview_session table
        cursor.execute("PRAGMA table_info(interview_sessions)")
        session_columns = {row[1] for row in cursor.fetchall()}
        
        session_migrations = [
            ("confidence_level", "INTEGER DEFAULT 1", "confidence_level"),
            ("recorded_answers", "INTEGER DEFAULT 0", "recorded_answers"),
            ("avg_response_time", "FLOAT", "avg_response_time"),
            ("filler_word_count", "INTEGER DEFAULT 0", "filler_word_count"),
            ("clarity_score", "FLOAT", "clarity_score"),
        ]
        
        for col_name, col_type, check_name in session_migrations:
            if check_name not in session_columns:
                print(f"Adding column: {col_name} to interview_sessions")
                cursor.execute(f"ALTER TABLE interview_sessions ADD COLUMN {col_name} {col_type}")
                print(f"  ✓ Column {col_name} added to interview_sessions")
            else:
                print(f"  ✓ Column {col_name} already exists in interview_sessions")
        
        conn.commit()
        print("\n✓ Database migration completed successfully!")
        print(f"Database path: {db_path}")
        
    except sqlite3.OperationalError as e:
        print(f"Migration error: {e}")
        print("This might be expected if the table structure differs.")
    except Exception as e:
        print(f"Unexpected error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    migrate_database()
