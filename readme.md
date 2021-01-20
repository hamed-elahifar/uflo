docker run -d \
--name=pg \
-p 5432:5432 \
-e POSTGRES_PASSWORD=jh23y6ni4jk4un7vLM89YN \
-e PGDATA=/pgdata \
-v /pgdata:/pgdata \
postgres
