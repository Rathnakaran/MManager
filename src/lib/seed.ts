
/**
 * To run this script:
 * 1. Manually create an admin user in the Firebase console (e.g., 'Rathnakaran').
 * 2. Get the user ID of that admin user.
 * 3. Open a terminal and run `npx tsx src/lib/seed.ts`
 * This will populate the initial data for the 'Rathnakaran' user.
 */
import { getUserByUsername, seedInitialData } from './actions';

async function main() {
  console.log('This script is intended for initial development seeding.');
  console.log('As the app is now live, this script no longer seeds data to avoid overwriting user information.');
}

main();
