# ORY Starter

Starter Template for the ORY Stack, with [ORY Kratos](https://www.ory.com/kratos) and [ORY Hydra](https://www.ory.com/hydra) set up with docker localy.

## Key Implementations

- postgres database
- [ORY Kratos](https://www.ory.com/kratos)
- [ORY Hydra](https://www.ory.com/hydra) (WIP)
- mailslurper for development
- nextjs example implementation for the kratos flow with custom UI (shadcn) (WIP)

## Starter

1. clone repository `git@github.com:Samuelk0nrad/docker-ory.git`
2. copy example.env file `cp .env.example .env`
3. generate random secrets for kratos and hydra: `openssl rand -hex 32`, and add them to the .env file
4. run `docker compose up`

## [ORY Kratos](https://www.ory.com/kratos)

config file: [config.yaml](./kratos-config/config.yaml)
identity schema: [identity.schema.json](./kratos-config/identity.schema.json)

## [ORY Hydra](https://www.ory.com/hydra)

(WIP)
