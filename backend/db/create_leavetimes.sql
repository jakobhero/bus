-- Table: public.leavetimes

-- DROP TABLE public.leavetimes;

CREATE TABLE public.leavetimes
(
    daystamp bigint NOT NULL,
    trip_id bigint NOT NULL,
    progr_number bigint NOT NULL,
    stoppoint_id bigint,
    arrival_time_p bigint,
    departure_time_p bigint,
    arrival_time_a bigint,
    departure_time_a bigint,
    weather_id bigint,
    CONSTRAINT leavetimes_pkey PRIMARY KEY (daystamp, trip_id, progr_number)
)

TABLESPACE pg_default;

ALTER TABLE public.leavetimes
    OWNER to postgres;