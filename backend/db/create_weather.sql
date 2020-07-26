-- Table: public.weather

-- DROP TABLE public.weather;

CREATE TABLE public.weather
(
    daytime bigint NOT NULL,
    temp double precision,
    feels_like double precision,
    temp_min double precision,
    temp_max double precision,
    pressure smallint,
    humidity smallint,
    wind_speed double precision,
    wind_deg smallint,
    clouds_all smallint,
    weather_id smallint,
    weather_main character varying COLLATE pg_catalog."default",
    weather_description character varying COLLATE pg_catalog."default",
    weather_icon character varying COLLATE pg_catalog."default",
    CONSTRAINT weather_pkey PRIMARY KEY (daytime)
)

TABLESPACE pg_default;

ALTER TABLE public.weather
    OWNER to postgres;