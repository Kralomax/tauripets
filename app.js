// =====================================================
// TauriPets - Main Application (Initialization & Events)
// =====================================================

/**
 * Setup tab navigation
 */
function setupTabNavigation() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all tabs
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            // Add active to clicked tab
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.add('active');
        });
    });
}

/**
 * Setup file upload handlers
 */
function setupFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) processFile(file);
    });
}

/**
 * Initialize application
 */
function initApp() {
    console.log('🐉 TauriPets initializing...');

    // Setup UI
    setupTabNavigation();
    setupFileUpload();

    // Populate filters
    populateZoneFilter();
    setupAllFilters();

    // Initial renders
    renderAllPets();
    renderPersonalBest();
    renderLeaderboard();

    console.log('✅ TauriPets ready!');
}

// Run when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
