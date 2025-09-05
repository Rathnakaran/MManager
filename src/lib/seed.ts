
/**
 * To run this script:
 * 1. Manually create an admin user in the Firebase console (e.g., 'Rathnakaran').
 * 2. Get the user ID of that admin user.
 * 3. Open a terminal and run `npx tsx src/lib/seed.ts`
 * This will populate the initial data for the 'Rathnakaran' user.
 */
import { getUserByUsername, seedInitialData } from './actions';

async function main() {
  console.log('Starting to seed data for admin user...');
  try {
    const adminUser = await getUserByUsername('MahaRathna');
    if (!adminUser) {
        console.error("Admin user 'MahaRathna' not found. Please create this user manually in Firebase Authentication and Firestore `users` collection before seeding.");
        return;
    }
    
    await seedInitialData(adminUser.id);
    console.log(`Data seeding process completed for user: ${adminUser.username} (${adminUser.id})`);
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

main();
