// =====================================================
// TauriPets - Supabase Database Functions
// =====================================================

/**
 * Save collection to Supabase
 */
async function saveCollectionToSupabase(playerName, realmName, pets, score) {
    try {
        const { data: existing } = await supabaseClient
            .from('collections')
            .select('id')
            .eq('player', playerName)
            .eq('realm', realmName)
            .single();

        const collectionData = {
            player: playerName,
            realm: realmName,
            pets: pets,
            score: score,
            updated_at: new Date().toISOString()
        };

        let result;
        if (existing) {
            result = await supabaseClient
                .from('collections')
                .update(collectionData)
                .eq('id', existing.id);
        } else {
            result = await supabaseClient
                .from('collections')
                .insert(collectionData);
        }

        return !result.error;
    } catch (err) {
        console.error('Failed to save collection:', err);
        return false;
    }
}

/**
 * Load collection from Supabase
 */
async function loadCollectionFromSupabase(playerName, realmName) {
    try {
        const { data, error } = await supabaseClient
            .from('collections')
            .select('*')
            .eq('player', playerName)
            .eq('realm', realmName)
            .single();

        return error ? null : data;
    } catch (err) {
        return null;
    }
}

/**
 * Fetch leaderboard data
 */
async function fetchLeaderboard() {
    try {
        const { data, error } = await supabaseClient
            .from('Leaderboard')
            .select('*')
            .order('score', { ascending: false })
            .limit(50);

        if (error) {
            console.error('Leaderboard fetch error:', error);
            return [];
        }
        
        console.log('Leaderboard data:', data);
        return data || [];
    } catch (err) {
        console.error('Leaderboard fetch exception:', err);
        return [];
    }
}

/**
 * Submit score to leaderboard
 */
async function submitScore() {
    const pb = loadPersonalBest();
    if (!pb) {
        alert('Load your collection first!');
        return;
    }

    const data = currentScoreData ? {
        player: playerData.playerName,
        realm: playerData.realmName,
        score: currentScoreData.total,
        pets: currentScoreData.stats.uniqueCount,
        level25: currentScoreData.stats.level25Count,
        rare: currentScoreData.stats.rareCount,
        epic: currentScoreData.stats.epicCount
    } : {
        player: pb.player,
        realm: pb.realm,
        score: pb.score,
        pets: pb.pets,
        level25: pb.level25,
        rare: pb.rare || 0,
        epic: pb.epic || 0
    };

    const collectionId = currentScoreData
        ? 'c' + Math.abs((data.pets + '-' + data.level25 + '-' + data.score + '-' + data.rare + '-' + data.epic)
            .split('')
            .reduce((h, c) => ((h << 5) - h) + c.charCodeAt(0), 0))
            .toString(36)
        : null;

    if (!collectionId) {
        alert('Please reload your collection first!');
        return;
    }

    if (!confirm('Submit your score?\n\nPlayer: ' + data.player + '-' + data.realm +
        '\nScore: ' + data.score.toLocaleString() +
        '\nPets: ' + data.pets +
        '\nLevel 25: ' + data.level25)) {
        return;
    }

    try {
        const { data: existing } = await supabaseClient
            .from('Leaderboard')
            .select('id, score, player, realm')
            .eq('player', data.player)
            .maybeSingle();

        if (existing && existing.score > data.score) {
            alert('Your current leaderboard score (' + existing.score.toLocaleString() + ') is higher or equal!' +
                (existing.player !== data.player ? '\n(Previously submitted as ' + existing.player + ')' : ''));
            return;
        }

        let result = await supabaseClient
            .from('Leaderboard')
            .upsert({
                player: data.player,
                realm: data.realm,
                score: data.score,
                pets: data.pets,
                level25: data.level25,
                rare: data.rare,
                epic: data.epic,
                created_at: new Date()
            }, {
                onConflict: 'player'
            });

        console.log('Upsert result:', result);

        if (result.error) {
            console.error('Upsert error:', result.error);
            alert('Error submitting: ' + result.error.message);
            return;
        }

        showCopyFeedback();
        document.getElementById('copyFeedback').textContent = '✓ Score submitted!';
        await renderLeaderboard();
    } catch (err) {
        console.error('Submit exception:', err);
        alert('Error submitting score: ' + (err.message || 'Unknown error'));
    }
}

/**
 * View player collection in modal
 */
async function viewPlayerCollection(playerName, realmName) {
    const modal = document.getElementById('collectionModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    modalTitle.textContent = playerName + '-' + realmName + "'s Collection";
    modalBody.innerHTML = '<div style="text-align:center;padding:40px;color:#888;">Loading collection...</div>';
    modal.style.display = 'flex';

    const collection = await loadCollectionFromSupabase(playerName, realmName);

    if (!collection || !collection.pets || collection.pets.length === 0) {
        modalBody.innerHTML = '<div style="text-align:center;padding:40px;">' +
            '<p style="color:#ff6b6b;font-size:1.2em;">❌ Collection not found</p>' +
            '<p style="color:#888;margin-top:10px;">This player hasn\'t uploaded their collection yet.</p></div>';
        return;
    }

    const pets = collection.pets;
    let level25 = 0, rareCount = 0, epicCount = 0;
    const familiesOwned = new Set();

    pets.forEach(pet => {
        if (pet.level === 25) level25++;
        if (pet.quality >= 3) rareCount++;
        if (pet.quality >= 4) epicCount++;
        if (pet.petType) familiesOwned.add(pet.petType);
    });

    pets.sort((a, b) => (b.level !== a.level) ? b.level - a.level : b.quality - a.quality);

    modalBody.innerHTML =
        '<div class="modal-stats">' +
        '<div class="modal-stat"><div class="value">' + pets.length + '</div><div class="label">Pets</div></div>' +
        '<div class="modal-stat"><div class="value">' + level25 + '</div><div class="label">Lv 25</div></div>' +
        '<div class="modal-stat"><div class="value">' + rareCount + '</div><div class="label">Rare+</div></div>' +
        '<div class="modal-stat"><div class="value">' + familiesOwned.size + '</div><div class="label">Families</div></div>' +
        '<div class="modal-stat score"><div class="value">' + (collection.score ? collection.score.toLocaleString() : 'N/A') + '</div><div class="label">Score</div></div>' +
        '</div>' +
        '<div class="modal-pets">' +
        pets.slice(0, 50).map(pet => {
            const qc = ['poor', 'common', 'uncommon', 'rare', 'epic', 'legendary'][pet.quality] || 'common';
            const fi = families[pet.petType]?.icon || '❓';
            return '<div class="modal-pet ' + qc + '">' +
                '<span class="pet-icon">' + fi + '</span>' +
                '<span class="pet-name">' + (pet.speciesName || 'Unknown') + '</span>' +
                '<span class="pet-level">Lv ' + pet.level + '</span></div>';
        }).join('') +
        (pets.length > 50 ? '<div class="modal-pet more">... and ' + (pets.length - 50) + ' more pets</div>' : '') +
        '</div>' +
        '<div class="modal-updated">Last updated: ' + (collection.updated_at ? new Date(collection.updated_at).toLocaleDateString() : 'Unknown') + '</div>';
}

function closeModal() {
    document.getElementById('collectionModal').style.display = 'none';
}
