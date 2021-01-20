docker run -d \
--name=pg \
-p 5432:5432 \
-e POSTGRES_PASSWORD=secretUflo2244 \
-e PGDATA=/pgdata \
-v /pgdata:/pgdata \
postgres