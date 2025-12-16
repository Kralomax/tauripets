// =====================================================
// TauriPets - Supabase Database Functions
// =====================================================

/**
 * Save collection to Supabase
 */
async function saveCollectionToSupabase(playerName, realmName, pets, score) {
    try {
        const { error } = await supabaseClient
            .from('collections')
            .upsert({
                player: playerName,
                realm: realmName,
                pets_data: JSON.stringify(pets),
                score: score,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'player,realm'
            });

        if (error) {
            console.error('Save error:', error);
            return false;
        }
        console.log('Collection saved to Supabase');
        return true;
    } catch (err) {
        console.error('Save exception:', err);
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

        if (error) {
            console.log('No saved collection found');
            return null;
        }
        return data;
    } catch (err) {
        console.error('Load exception:', err);
        return null;
    }
}

/**
 * Fetch leaderboard data
 */
async function fetchLeaderboard() {
    try {
        const { data, error } = await supabaseClient
            .from('leaderboard')
            .select('*')
            .order('score', { ascending: false })
            .limit(50);

        if (error) {
            console.error('Leaderboard fetch error:', error);
            return [];
        }
        return data || [];
    } catch (err) {
        console.error('Leaderboard exception:', err);
        return [];
    }
}

/**
 * Submit score to leaderboard
 */
async function submitScore() {
    if (!currentScoreData || !playerData) {
        alert('Please load your collection first!');
        return;
    }

    const playerName = playerData.playerName;
    const realmName = playerData.realmName;
    const score = currentScoreData.total;
    const pets = currentScoreData.stats.uniqueCount;
    const level25 = currentScoreData.stats.level25Count;
    const rareCount = currentScoreData.stats.rareCount || 0;

    // Generate fingerprint from pet data
    const petList = playerData.pets || [];
    const sortedPets = petList
        .map(p => `${p.speciesID || 0}-${p.level || 1}-${p.quality || p.qualityID || 0}`)
        .sort()
        .join(',');
    const fingerprint = btoa(sortedPets).substring(0, 64);

    try {
        const { data, error } = await supabaseClient
            .from('leaderboard')
            .upsert({
                player: playerName,
                realm: realmName,
                score: score,
                pets: pets,
                level25: level25,
                rare_count: rareCount,
                fingerprint: fingerprint,
                created_at: new Date().toISOString()
            }, {
                onConflict: 'player,realm'
            });

        if (error) {
            console.error('Submit error:', error);
            alert('Error submitting score: ' + error.message);
            return;
        }

        alert('🏆 Score submitted successfully!');
        renderLeaderboard();
    } catch (err) {
        console.error('Submit exception:', err);
        alert('Error submitting score');
    }
}

/**
 * View another player's collection
 */
async function viewPlayerCollection(playerName, realmName) {
    const modal = document.getElementById('collectionModal');
    const title = document.getElementById('modalTitle');
    const body = document.getElementById('modalBody');

    title.textContent = playerName + ' - ' + realmName;
    body.innerHTML = '<p style="text-align:center;color:#888;">Loading collection...</p>';
    modal.classList.add('active');

    try {
        const { data, error } = await supabaseClient
            .from('collections')
            .select('*')
            .eq('player', playerName)
            .eq('realm', realmName)
            .single();

        if (error || !data) {
            body.innerHTML = '<p style="text-align:center;color:#ff6b6b;">Collection not found. Player may not have uploaded their data.</p>';
            return;
        }

        const pets = JSON.parse(data.pets_data || '[]');
        
        if (pets.length === 0) {
            body.innerHTML = '<p style="text-align:center;color:#888;">No pets in collection.</p>';
            return;
        }

        // Render pets
        body.innerHTML = '<div class="modal-pet-grid">' +
            pets.slice(0, 50).map(pet => {
                const familyId = pet.petType || pet.familyID || 0;
                const family = families[familyId] || { name: 'Unknown', icon: '❓' };
                const qualityNum = typeof pet.quality === 'number' ? pet.quality : (pet.qualityID || 0);
                
                return '<div class="modal-pet quality-' + qualityNum + '">' +
                    '<span class="pet-icon">' + family.icon + '</span>' +
                    '<span class="pet-name">' + (pet.speciesName || 'Unknown') + '</span>' +
                    '<span class="pet-level">Lv.' + (pet.level || 1) + '</span>' +
                    '</div>';
            }).join('') +
            '</div>' +
            (pets.length > 50 ? '<p style="text-align:center;color:#888;margin-top:15px;">Showing 50 of ' + pets.length + ' pets</p>' : '');

    } catch (err) {
        console.error('View collection error:', err);
        body.innerHTML = '<p style="text-align:center;color:#ff6b6b;">Error loading collection.</p>';
    }
}

/**
 * Close modal
 */
function closeModal() {
    document.getElementById('collectionModal').classList.remove('active');
}
