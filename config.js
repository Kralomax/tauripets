// =====================================================
// TauriPets - Configuration & Constants
// =====================================================

// Supabase Configuration
const SUPABASE_URL = 'https://yxendhrzacondoyzfzlf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4ZW5kaHJ6YWNvbmRveXpmemxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0OTM2OTcsImV4cCI6MjA4MTA2OTY5N30.Pa2CA_AaB2GPAgKWmuUVyB7be1xTLUxqriy1iSO8b4g';

// Only create supabase client if it doesn't exist
let supabaseClient;
if (typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} else if (typeof window.supabase !== 'undefined') {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

// Pet Family Data
const families = {
    1: { name: 'Humanoid', icon: '👤' },
    2: { name: 'Dragonkin', icon: '🐉' },
    3: { name: 'Flying', icon: '🦅' },
    4: { name: 'Undead', icon: '💀' },
    5: { name: 'Critter', icon: '🐰' },
    6: { name: 'Magic', icon: '✨' },
    7: { name: 'Elemental', icon: '🔥' },
    8: { name: 'Beast', icon: '🐾' },
    9: { name: 'Aquatic', icon: '🐟' },
    10: { name: 'Mechanical', icon: '⚙️' }
};

// Quality Names
const qualities = {
    0: 'Poor',
    1: 'Common',
    2: 'Uncommon',
    3: 'Rare',
    4: 'Epic',
    5: 'Legendary'
};

// Source Labels
const sourceLabels = {
    wild: 'Wild',
    vendor: 'Vendor',
    drop: 'Drop',
    quest: 'Quest',
    achievement: 'Achievement',
    profession: 'Profession',
    promotion: 'Promo',
    event: 'Event',
    tcg: 'TCG',
    unknown: 'Other'
};

// Quality Points for Scoring
const QUALITY_POINTS = {
    0: 2,   // Poor
    1: 3,   // Common
    2: 4,   // Uncommon
    3: 5,   // Rare
    4: 7,   // Epic
    5: 12   // Legendary
};

// Achievements
const ACHIEVEMENTS = [
    { id: 'collect50', name: '📦 Collector', desc: '50+ unique pets', check: (s) => s.uniqueCount >= 50, bonus: 100 },
    { id: 'collect100', name: '📦 Dedicated', desc: '100+ unique pets', check: (s) => s.uniqueCount >= 100, bonus: 150 },
    { id: 'collect250', name: '📦 Obsessed', desc: '250+ unique pets', check: (s) => s.uniqueCount >= 250, bonus: 250 },
    { id: 'collect500', name: '📦 Insane', desc: '500+ unique pets', check: (s) => s.uniqueCount >= 500, bonus: 500 },
    { id: 'train10', name: '⭐ Trainer', desc: '10+ level 25 pets', check: (s) => s.level25Count >= 10, bonus: 200 },
    { id: 'train25', name: '⭐ Pro Trainer', desc: '25+ level 25 pets', check: (s) => s.level25Count >= 25, bonus: 300 },
    { id: 'train50', name: '⭐ Elite Trainer', desc: '50+ level 25 pets', check: (s) => s.level25Count >= 50, bonus: 500 },
    { id: 'families', name: '🌍 Zoologist', desc: 'All 10 families', check: (s) => s.familyCount >= 10, bonus: 100 },
    { id: 'rare25', name: '💎 Quality Hunter', desc: '25+ rare or better', check: (s) => s.rareCount >= 25, bonus: 150 },
    { id: 'epic10', name: '💜 Epic Collector', desc: '10+ epic or better', check: (s) => s.epicCount >= 10, bonus: 200 },
];

// Global State Variables
let LEADERBOARD_DATA = [];
let playerData = null;
let ownedSpeciesIDs = new Set();
let currentScoreData = null;
