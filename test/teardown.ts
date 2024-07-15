/* eslint-disable no-console */

// noinspection JSUnusedGlobalSymbols
export default async function teardown(): Promise<void> {
  if (globalThis.DOCKER) {
    console.info('Stopping docker compose');
    await globalThis.DOCKER.down({
      removeVolumes: true,
    });
  }
}
