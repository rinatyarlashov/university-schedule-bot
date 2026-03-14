CREATE TABLE IF NOT EXISTS faculties (
                                         id INTEGER PRIMARY KEY AUTOINCREMENT,
                                         name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS directions (
                                          id INTEGER PRIMARY KEY AUTOINCREMENT,
                                          faculty_id INTEGER NOT NULL,
                                          name TEXT NOT NULL,
                                          UNIQUE(faculty_id, name),
    FOREIGN KEY(faculty_id) REFERENCES faculties(id)
    );

CREATE TABLE IF NOT EXISTS groups (
                                      id INTEGER PRIMARY KEY AUTOINCREMENT,
                                      direction_id INTEGER NOT NULL,
                                      course INTEGER NOT NULL,
                                      group_name TEXT NOT NULL,
                                      UNIQUE(direction_id, course, group_name),
    FOREIGN KEY(direction_id) REFERENCES directions(id)
    );

CREATE TABLE IF NOT EXISTS teachers (
                                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                                        full_name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS schedules (
                                         id INTEGER PRIMARY KEY AUTOINCREMENT,
                                         group_id INTEGER NOT NULL,
                                         teacher_id INTEGER,
                                         day TEXT NOT NULL,
                                         lesson_number INTEGER NOT NULL,
                                         start_time TEXT NOT NULL,
                                         end_time TEXT NOT NULL,
                                         subject TEXT NOT NULL,
                                         room TEXT,
                                         building TEXT,
                                         week_type TEXT DEFAULT 'all',
                                         FOREIGN KEY(group_id) REFERENCES groups(id),
    FOREIGN KEY(teacher_id) REFERENCES teachers(id)
    );

CREATE TABLE IF NOT EXISTS users (
                                     id INTEGER PRIMARY KEY AUTOINCREMENT,
                                     telegram_id INTEGER UNIQUE NOT NULL,
                                     full_name TEXT,
                                     faculty_id INTEGER,
                                     direction_id INTEGER,
                                     course INTEGER,
                                     group_id INTEGER,
                                     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                     FOREIGN KEY(faculty_id) REFERENCES faculties(id),
    FOREIGN KEY(direction_id) REFERENCES directions(id),
    FOREIGN KEY(group_id) REFERENCES groups(id)
    );
CREATE TABLE IF NOT EXISTS roles (
                                     id INTEGER PRIMARY KEY AUTOINCREMENT,
                                     telegram_id INTEGER UNIQUE NOT NULL,
                                     role TEXT NOT NULL DEFAULT 'student'
);

CREATE TABLE IF NOT EXISTS admin_faculties (
                                               id INTEGER PRIMARY KEY AUTOINCREMENT,
                                               telegram_id INTEGER NOT NULL,
                                               faculty_id INTEGER NOT NULL,
                                               UNIQUE(telegram_id, faculty_id),
    FOREIGN KEY(faculty_id) REFERENCES faculties(id)
    );