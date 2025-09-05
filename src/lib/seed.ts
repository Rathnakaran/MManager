
/**
 * To run this script:
 * 1. Make sure your Firestore database is created and security rules allow writes.
 * 2. Manually create an admin user in the Firebase console.
 * 3. Get the user ID of that admin user.
 * 4. Open a terminal and run `npx tsx src/lib/seed.ts <YOUR_ADMIN_USER_ID>`
 */
import { db } from './firebase';
import { seedInitialData, getUserByUsername } from './actions';

async function main() {
  console.log('Starting to seed data...');
  try {
    const adminUser = await getUserByUsername('Rathnakaran');
    if (!adminUser) {
        console.error("Admin user 'Rathnakaran' not found. Please create this user manually in Firebase Authentication and Firestore `users` collection.");
        return;
    }
    
    await seedInitialData(adminUser.id);
    console.log(`Data seeding process completed for user: ${adminUser.username} (${adminUser.id})`);
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

main();
