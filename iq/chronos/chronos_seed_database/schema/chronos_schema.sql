
CREATE TABLE chronos_events (
    id INTEGER PRIMARY KEY,
    event_name TEXT,
    category TEXT,
    subcategory TEXT,
    era TEXT,
    region TEXT,
    location TEXT,
    start_date BIGINT,
    end_date BIGINT,
    year_numeric BIGINT,
    description TEXT,
    significance TEXT
);
