import { getDatabase, ref, set } from 'firebase/database';
import { initializeApp } from 'firebase/app';
import { Group, GroupTheme, GroupVisibility } from '../types/group';

const firebaseConfig = {
  apiKey: "AIzaSyBUSeB59sbXrpfqNCKghgJMSZv5hjH57h0",
  authDomain: "boardgameshare-001.firebaseapp.com",
  databaseURL: "https://boardgameshare-001-default-rtdb.firebaseio.com",
  projectId: "boardgameshare-001",
  storageBucket: "boardgameshare-001.appspot.com",
  messagingSenderId: "1078704487346",
  appId: "1:1078704487346:web:e620e65a73920c9a96c2ab"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

interface SampleGroup extends Omit<Group, 'id'> {
  ownerEmail: string;
}

const sampleGroups: SampleGroup[] = [
  {
    name: "Seattle Board Game Club",
    description: "A friendly community of board game enthusiasts in the Seattle area. We meet weekly for game nights and welcome players of all skill levels!",
    visibility: "public" as GroupVisibility,
    theme: "general" as GroupTheme,
    coverImage: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&q=80&w=800&h=400",
    ownerEmail: "kenny.allen93@gmail.com",
    members: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: "Strategy Masters",
    description: "Dedicated to complex strategy games like Twilight Imperium, Terra Mystica, and Through the Ages. Join us for epic gaming sessions!",
    visibility: "public" as GroupVisibility,
    theme: "strategy" as GroupTheme,
    coverImage: "https://images.unsplash.com/photo-1606503153255-59d5e417dbf0?auto=format&fit=crop&q=80&w=800&h=400",
    ownerEmail: "kenny.allen93@gmail.com",
    members: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: "Family Game Night",
    description: "A welcoming group for families who love playing board games together. We focus on games that are fun for all ages!",
    visibility: "private" as GroupVisibility,
    theme: "family" as GroupTheme,
    coverImage: "https://images.unsplash.com/photo-1632501641765-e568d28b0015?auto=format&fit=crop&q=80&w=800&h=400",
    ownerEmail: "kenny@springwavestudios.com",
    members: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: "Party Game Pros",
    description: "Love social deduction games, trivia, and party games? This is your group! Join us for laughter-filled game nights.",
    visibility: "private" as GroupVisibility,
    theme: "party" as GroupTheme,
    coverImage: "https://images.unsplash.com/photo-1611371805429-8b5c1b2c34ba?auto=format&fit=crop&q=80&w=800&h=400",
    ownerEmail: "kenny@springwavestudios.com",
    members: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

async function addSampleGroups() {
  try {
    // First, clear existing groups
    await set(ref(db, 'groups'), null);
    console.log('Cleared existing groups');
    
    for (const group of sampleGroups) {
      const newGroupRef = ref(db, `groups/${Date.now()}`);
      
      // Set up members object with owner
      const ownerKey = group.ownerEmail.replace(/\./g, ',');
      const groupData: Omit<Group, 'id'> = {
        ...group,
        members: {
          [ownerKey]: {
            role: 'owner',
            joinedAt: group.createdAt,
            name: group.ownerEmail.split('@')[0],
            canInviteOthers: true
          }
        }
      };

      // Remove ownerEmail before saving
      delete (groupData as any).ownerEmail;
      
      await set(newGroupRef, groupData);
      console.log(`Added group: ${group.name} (Owner: ${group.ownerEmail})`);
      
      // Add small delay between groups to ensure unique timestamps
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('Successfully added all sample groups');
    process.exit(0);
  } catch (error) {
    console.error('Error adding sample groups:', error);
    process.exit(1);
  }
}

addSampleGroups();