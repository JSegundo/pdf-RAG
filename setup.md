# rabbitmq:
    docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:management

# client:
    npm run dev

# server:
    npm run dev

# processing-service:
    python src/main.py

# db:
  //  run pgvector image
    docker run -d --name pgvector-db-auto   -e POSTGRES_PASSWORD=yourpassword   -P   -v pgvector-data:/var/lib/postgresql/data   ankane/pgvector

// connect yo postgresql with pgvector:
    psql -h localhost -p 55000 -U postgres -d postgres
    Password for user postgres: yourpassword
    psql (17.0 (Ubuntu 17.0-1.pgdg20.04+1), server 15.4 (Debian 15.4-2.pgdg120+1))
    Type "help" for help.
    postgres=# 

# pgadmin:
    ragdb

#  check db from terminal
    // Connect to the container
        docker exec -it pdf_chat_rag-postgres-1 bash

    // Inside the container, connect to the database
        psql -U postgres -d ragdb

    // In psql, check if the vector extension is enabled
        \dx

    // List all tables
        \dt

    // Query data (once you have some)
        SELECT * FROM document_embeddings LIMIT 10;


# Exit psql
\q

# Caching DOCLING!! 6.5GB
docker tag 9d07cc4a2ff1 processing-service:cached
This created a new tag/reference to your existing image. It's like creating an alias - the same image now has two names:

pdf_chat_rag-processing-service:latest
processing-service:cached

Don't run docker system prune -a (would remove all images)
Don't manually remove the processing-service:cached image
Don't use --no-cache in your build commands unless necessary

# TODO
# TODO
# TODO
