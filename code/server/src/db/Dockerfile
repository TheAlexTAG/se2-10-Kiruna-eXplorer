# Usa l'immagine ufficiale di MariaDB come base
FROM mariadb:latest

# Copia gli script SQL nel container
COPY ./db_scripts/kiruna.sql /docker-entrypoint-initdb.d/init.sql
COPY ./db_scripts/kiruna_test.sql /docker-entrypoint-initdb.d/second_script.sql

# Esponi la porta 3306
EXPOSE 3306

