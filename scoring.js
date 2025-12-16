// =====================================================
// TauriPets - Scoring & Personal Best Functions
// =====================================================

/**
 * Load personal best from localStorage
 */
function loadPersonalBest() {
    try {
        const s = localStorage.getItem('tauripets_personal_best');
        return s ? JSON.parse(s) : null;
    } catch (e) {
        return null;
    }
}

/**
 * Save personal best to localStorage
 */
function savePersonalBest(scoreData, playerName, realmName) {
    try {
        const current = loadPersonalBest();
        const newEntry = {
            player: playerName,
            realm: realmName,
            score: scoreData.total,
            pets: scoreData.stats.uniqueCount,
            level25: scoreData.stats.level25Count,
            rare: scoreData.stats.rareCount,
            epic: scoreData.stats.epicCount,
            date: new Date().toISOString().split('T')[0],
            timestamp: Date.now()
        };

        if (!current || newEntry.score > current.score) {
            localStorage.setItem('tauripets_personal_best', JSON.stringify(newEntry));
            return { saved: true, isNewBest: true, entry: newEntry };
        }

        return { saved: false, isNewBest: false, entry: current };
    } catch (e) {
        return { saved: false, isNewBest: false, entry: null };
    }
}

/**
 * Calculate score from pets array
 */
function calculateScore(pets) {
    if (!pets || pets.length === 0) return null;

    const uniquePets = {};
    let level25Count = 0;
    const familiesOwned = new Set();
    let rareCount = 0, epicCount = 0;

    for (const pet of pets) {
        const speciesID = pet.speciesID;
        const quality = typeof pet.quality === 'number' ? pet.quality : (pet.qualityID || 0);
        const level = pet.level || 1;
        const family = pet.petType || pet.familyID || 0;

        // Keep best version of each species
        if (!uniquePets[speciesID] ||
            quality > uniquePets[speciesID].quality ||
            (quality === uniquePets[speciesID].quality && level > uniquePets[speciesID].level)) {
            uniquePets[speciesID] = { quality, level, family };
        }

        if (level === 25) level25Count++;
        if (family) familiesOwned.add(family);
        if (quality >= 3) rareCount++;
        if (quality >= 4) epicCount++;
    }

    // Calculate quality and level scores
    let qualityScore = 0, levelScore = 0, totalLevels = 0;

    for (const speciesID in uniquePets) {
        const pet = uniquePets[speciesID];
        qualityScore += QUALITY_POINTS[pet.quality] || 2;
        levelScore += pet.level * 0.12;
        totalLevels += pet.level;
    }

    // Build stats object
    const stats = {
        uniqueCount: Object.keys(uniquePets).length,
        level25Count,
        familyCount: familiesOwned.size,
        rareCount,
        epicCount,
        totalLevels
    };

    // Calculate achievement bonuses
    let bonusScore = 0;
    const unlockedAchievements = [];

    for (const ach of ACHIEVEMENTS) {
        if (ach.check(stats)) {
            bonusScore += ach.bonus;
            unlockedAchievements.push(ach);
        }
    }

    return {
        total: Math.floor(qualityScore + levelScore + bonusScore),
        qualityScore: Math.floor(qualityScore),
        levelScore: Math.floor(levelScore),
        bonusScore,
        stats,
        unlockedAchievements
    };
}

/**
 * Display score in UI
 */
function displayScore(scoreData) {
    if (!scoreData) return;

    currentScoreData = scoreData;

    document.getElementById('scoreDisplay').classList.add('visible');
    document.getElementById('scoreValue').textContent = scoreData.total.toLocaleString();
    document.getElementById('scoreQuality').textContent = scoreData.qualityScore.toLocaleString();
    document.getElementById('scoreLevels').textContent = scoreData.levelScore.toLocaleString();
    document.getElementById('scoreBonuses').textContent = '+' + scoreData.bonusScore.toLocaleString();

    // Display achievements
    if (scoreData.unlockedAchievements.length > 0) {
        document.getElementById('achievementsSection').classList.add('visible');
        document.getElementById('achievementList').innerHTML = scoreData.unlockedAchievements
            .map(ach => '<div class="achievement" title="' + ach.desc + ': +' + ach.bonus + '">' + ach.name + '</div>')
            .join('');
    }

    // Save personal best
    const result = savePersonalBest(scoreData, playerData.playerName, playerData.realmName);
    renderPersonalBest();
}
