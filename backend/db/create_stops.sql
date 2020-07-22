-- Table: public.stops

-- DROP TABLE public.stops;

CREATE TABLE public.stops
(
    stop_id character varying(12) COLLATE pg_catalog."default" NOT NULL,
    name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    lat double precision,
    lon double precision,
    CONSTRAINT stops_pkey PRIMARY KEY (stop_id)
)

TABLESPACE pg_default;

ALTER TABLE public.stops
    OWNER to postgres;