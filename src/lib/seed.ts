
/**
 * To run this script:
 * 1. Make sure your Firestore database is created and security rules allow writes.
 * 2. Open a terminal and run `npx tsx src/lib/seed.ts`
 * 3. This will create the admin user if it doesn't exist.
 */
import { db } from './firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { seedInitialData } from './actions';

async function main() {
  console.log('Starting to seed data...');
  try {
    const message = await seedInitialData();
    console.log(message);
    console.log('Seeding process completed.');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

main();
