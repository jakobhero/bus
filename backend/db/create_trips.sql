-- Table: public.trips

-- DROP TABLE public.trips;

CREATE TABLE public.trips
(
    daystamp bigint NOT NULL,
    trip_id bigint NOT NULL,
    line_id character varying(5) COLLATE pg_catalog."default",
    route_id smallint,
    direction smallint,
    arrival_time_p bigint,
    departure_time_p bigint,
    arrival_time_a double precision,
    departure_time_a double precision,
    suppressed smallint,
    CONSTRAINT trips_pkey PRIMARY KEY (daystamp, trip_id)
)

TABLESPACE pg_default;

ALTER TABLE public.trips
    OWNER to postgres;