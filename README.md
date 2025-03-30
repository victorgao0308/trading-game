# trading-game

## stop docker containers:
docker compose down

## build and run docker containers:
docker-compose up --build -d

## run docker containers
docker-compose up --build -d


## make migrations with docker:
docker compose exec web python manage.py makemigrations
docker compose exec web python manage.py migrate

