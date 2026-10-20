CREATE TABLE IF NOT EXISTS students (
                                        id BIGSERIAL PRIMARY KEY,
                                        full_name VARCHAR(255) NOT NULL,
    student_group VARCHAR(10) NOT NULL,
    isu_id BIGINT NOT NULL UNIQUE,
    dormitory VARCHAR(255) NOT NULL,
    room INTEGER NOT NULL CHECK (room > 0),
    move_in_date DATE NOT NULL,
    foreigner BOOLEAN NOT NULL,
    notes TEXT
    );

CREATE TABLE IF NOT EXISTS app_users (
                                         id BIGSERIAL PRIMARY KEY,

                                         username VARCHAR(100) NOT NULL UNIQUE,

    email VARCHAR(255) NOT NULL UNIQUE,

    password_hash VARCHAR(255) NOT NULL,

    role VARCHAR(20) NOT NULL
    CHECK (role IN ('ADMIN', 'USER'))
    );