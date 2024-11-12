# Gift App Backend

Tech stack:

- Fastify
- Vitest
- MongoDB + mongoose
- grammy

## Install & run

To install run `npm install`

To run locally:

- `npm run start:integration-db` - this will start mongodb in Docker (run `stop:integration-db` to stop later, or just spin it down manually via docker cli)
- `npm run start:dev` to run local backend, pointing to local mongodb.

The production setup (`npm run start`) is practically the same, just points to a different database.

## MongoDB setup

To use transactions in mongodb you NEED to use replica set MongoDB, not a single instance.
`docker-compose.yaml` and `Dockerfile` handles the local replica set.
In production you need to set up replica set depending on your cloud provider.

## Integration tests

⚠️ Intergration tests were written at the start of the project and are outdated. ⚠️

`npm run test:integration` runs integration tests, using real MongoDB (locally).
When tests are finished - MongoDB container spins down automatically. Each test run (and individual test suite) start with a fresh MongoDB.

Unfortunately most tests were written before I made bunch of refactorings, so big chunk of tests are not representative of the production codebase anymore.
If I will have time I will fix the intergration test, but I would do it in a separate branch just for fun.

### Notes

Overall the code is quite meh, I didn't have much time to refactor backend, so most of it "works" but it's not beautiful.
