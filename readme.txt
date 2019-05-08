README

Implementation.

Runned in Fedora 11

Postgres 11 - https://www.postgresql.org/download/linux/redhat/
Nodejs
npm
express
express-auth
express-postgres

pgi-bouncer


npm run dev

systemctl start postgresql-11.service

sudo -u postgres -i


postgres-# \conninfo
You are connected to database "postgres" as user "postgres" via socket in "/var/run/postgresql" at port "5432".
