# Factory deployment map

This bundle is deliberately infrastructure-neutral. Configure your own
Postgres, Redis, Quack account, control-plane URL, Git host and Coolify (or
another container host) through environment variables. Never commit these
values.

The companion `control/` project receives product events at
`POST /api/v1/ingest`. Each generated SaaS sends `ship_completed` after a
successful smoke test.
