# trading-game

## stop docker containers:
docker compose down

## build and run docker containers:
docker-compose up --build -d

## run docker containers
docker-compose up -d


## make migrations with docker:
docker compose exec web python manage.py makemigrations
docker compose exec web python manage.py migrate



## delete all data using pgadmin
DO
$$
DECLARE
    tabname TEXT;
BEGIN
    FOR tabname IN
        SELECT quote_ident(tablename)
        FROM pg_tables
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('TRUNCATE TABLE public.%s CASCADE;', tabname);
    END LOOP;
END
$$;
