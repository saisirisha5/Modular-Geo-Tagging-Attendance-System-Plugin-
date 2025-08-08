//Standalone script to create or repair missing worker profile
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import all models to register them
import User from './models/userSchema.js';
import WorkerProfile from './models/workerProfile.js';

dotenv.config();

const MONGODB_URI = process.env.DB_URI;

async function fixWorkerProfiles() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all users with worker role
    const workers = await User.find({ role: 'worker' }).populate('profile');
    
    console.log(`Found ${workers.length} workers`);

    for (const worker of workers) {
      console.log(`Processing worker: ${worker.email}`);
      
      if (worker.profile) {
        // Check if profile has name
        if (!worker.profile.name) {
          console.log(`  - Profile missing name, updating...`);
          worker.profile.name = worker.name || 'Unknown Worker';
          await worker.profile.save();
          console.log(`  - Updated profile name to: ${worker.profile.name}`);
        } else {
          console.log(`  - Profile name exists: ${worker.profile.name}`);
        }
      } else {
        console.log(`  - No profile found, creating one...`);
        const newProfile = await WorkerProfile.create({
          name: worker.name || 'Unknown Worker',
          email: worker.email
        });
        
        worker.profile = newProfile._id;
        await worker.save();
        console.log(`  - Created new profile with name: ${newProfile.name}`);
      }
    }

    console.log('Worker profiles fixed successfully!');
  } catch (error) {
    console.error('Error fixing worker profiles:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
fixWorkerProfiles(); 