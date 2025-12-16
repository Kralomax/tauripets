// =====================================================
// TauriPets - Data Parsers (Lua & Copy Format)
// =====================================================

/**
 * Parse copy format (TAURIPETS:...)
 */
function parseCopyFormat(text) {
    const lines = text.trim().split('\n');
    if (lines.length < 1) throw new Error('Empty data');

    const header = lines[0].split(':');
    if (header[0] !== 'TAURIPETS') throw new Error('Invalid format');

    const data = {
        playerName: header[1] || 'Unknown',
        realmName: header[2] || 'TauriWoW',
        exportDate: header[3] || '',
        ownedPets: parseInt(header[4]) || 0,
        totalPets: parseInt(header[5]) || 0,
        addonScore: parseInt(header[6]) || 0,
        pets: []
    };

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = line.split('|');
        if (parts.length >= 8) {
            data.pets.push({
                speciesID: parseInt(parts[0]) || 0,
                speciesName: parts[1] || 'Unknown',
                petType: parseInt(parts[2]) || 0,
                level: parseInt(parts[3]) || 1,
                quality: parseInt(parts[4]) || 0,
                health: parseInt(parts[5]) || 0,
                power: parseInt(parts[6]) || 0,
                speed: parseInt(parts[7]) || 0,
                favorite: parts[8] === '1'
            });
        }
    }

    if (data.pets.length === 0) throw new Error('No pets found');
    return data;
}

/**
 * Parse Lua SavedVariables file
 */
function parseLuaFile(content) {
    let match = content.match(/TauriPetsGUI_Export\s*=\s*\{/);
    let varName = 'TauriPetsGUI_Export';

    if (!match) {
        match = content.match(/TauriPetsDB\s*=\s*\{/);
        varName = 'TauriPetsDB';
    }

    if (!match) throw new Error('Could not find pet data.');

    const data = {
        playerName: '',
        realmName: '',
        exportDate: '',
        totalPets: 0,
        ownedPets: 0,
        pets: []
    };

    // Parse player name
    const playerMatch = content.match(/\["player"\]\s*=\s*"([^"]+)"/);
    if (playerMatch) {
        const parts = playerMatch[1].split('-');
        data.playerName = parts[0] || 'Unknown';
        data.realmName = parts.slice(1).join('-') || 'TauriWoW';
    }

    // Parse export date
    const dateMatch = content.match(/\["exportDate"\]\s*=\s*"([^"]+)"/);
    if (dateMatch) data.exportDate = dateMatch[1];

    // Parse pet counts
    const totalMatch = content.match(/\["totalPets"\]\s*=\s*(\d+)/);
    const maxMatch = content.match(/\["maxPets"\]\s*=\s*(\d+)/);
    if (totalMatch) data.ownedPets = parseInt(totalMatch[1]);
    if (maxMatch) data.totalPets = parseInt(maxMatch[1]);

    // Parse pets section
    const petsSection = content.match(/\["pets"\]\s*=\s*\{([\s\S]*?)\},\s*\["player"\]/);

    if (!petsSection) {
        const altPetsSection = content.match(/\["pets"\]\s*=\s*\{([\s\S]+)\}\s*,?\s*\}/);
        if (altPetsSection) parsePetsFromSection(altPetsSection[1], data);
    } else {
        parsePetsFromSection(petsSection[1], data);
    }

    if (!data.ownedPets) data.ownedPets = data.pets.length;

    return data;
}

/**
 * Parse pets from a Lua table section
 */
function parsePetsFromSection(petsContent, data) {
    const petBlocks = petsContent.split(/\},\s*--\s*\[\d+\]/);

    for (const block of petBlocks) {
        if (!block.trim() || !block.includes('speciesID')) continue;

        const pet = {};

        // Parse string fields
        ['name', 'speciesName', 'customName', 'quality', 'family', 'petID', 'breed'].forEach(field => {
            const match = block.match(new RegExp('\\["' + field + '"\\]\\s*=\\s*"([^"]*)"'));
            if (match) pet[field] = match[1];
        });

        // Parse number fields
        ['speciesID', 'familyID', 'level', 'qualityID', 'health', 'power', 'speed', 'petType'].forEach(field => {
            const match = block.match(new RegExp('\\["' + field + '"\\]\\s*=\\s*(-?\\d+)'));
            if (match) pet[field] = parseInt(match[1]);
        });

        // Parse boolean fields
        ['favorite', 'canBattle', 'isTradeable', 'isUnique'].forEach(field => {
            const match = block.match(new RegExp('\\["' + field + '"\\]\\s*=\\s*(true|false)'));
            if (match) pet[field] = match[1] === 'true';
        });

        // Normalize field names
        if (!pet.speciesName && pet.name) pet.speciesName = pet.name;
        if (!pet.petType && pet.familyID) pet.petType = pet.familyID;
        if (pet.qualityID !== undefined) pet.quality = pet.qualityID;

        if (pet.speciesName || pet.name) data.pets.push(pet);
    }
}

/**
 * Process file upload
 */
function processFile(file) {
    const reader = new FileReader();

    reader.onload = (e) => {
        try {
            playerData = parseLuaFile(e.target.result);

            ownedSpeciesIDs.clear();
            if (playerData.pets) {
                playerData.pets.forEach(pet => {
                    if (pet.speciesID) ownedSpeciesIDs.add(pet.speciesID);
                });
            }

            displayMyCollection();
            renderAllPets();
        } catch (err) {
            alert('Error parsing file: ' + err.message);
        }
    };

    reader.readAsText(file);
}

/**
 * Process pasted data
 */
function processPastedData() {
    const text = document.getElementById('pasteInput').value.trim();

    if (!text) {
        alert('Please paste your TauriPets data first!');
        return;
    }

    try {
        if (text.startsWith('TAURIPETS:')) {
            playerData = parseCopyFormat(text);
        } else if (text.includes('TauriPetsDB') || text.includes('TauriPetsGUI_Export')) {
            playerData = parseLuaFile(text);
        } else {
            throw new Error('Unrecognized format.');
        }

        ownedSpeciesIDs.clear();
        if (playerData.pets) {
            playerData.pets.forEach(pet => {
                if (pet.speciesID) ownedSpeciesIDs.add(pet.speciesID);
            });
        }

        displayMyCollection();
        renderAllPets();

        // Save to Supabase
        if (playerData.playerName && playerData.pets.length > 0) {
            const score = currentScoreData ? currentScoreData.total : 0;
            saveCollectionToSupabase(playerData.playerName, playerData.realmName, playerData.pets, score);
        }

        document.getElementById('pasteInput').value = '';
    } catch (err) {
        alert('Error parsing data: ' + err.message);
    }
}
