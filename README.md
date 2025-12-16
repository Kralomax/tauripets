# TauriPets - Refactored

Battle Pet Collection Tracker for TauriWoW - Now with clean, organized code!

## 📁 File Structure

```
tauripets/
├── index.html          (~200 lines - HTML structure only)
├── styles.css          (~600 lines - All CSS styling)
├── js/
│   ├── pet-database.js (~930 pets - The big data file)
│   ├── config.js       (~80 lines - Constants & Supabase setup)
│   ├── supabase-functions.js (~150 lines - Database operations)
│   ├── scoring.js      (~100 lines - Score calculations)
│   ├── parsers.js      (~150 lines - Lua & copy format parsing)
│   ├── ui.js           (~300 lines - UI rendering functions)
│   └── app.js          (~50 lines - Initialization & events)
└── README.md           (This file)
```

## 🚀 Setup Instructions

### Step 1: Copy the Pet Database

The `js/pet-database.js` file contains only a SAMPLE of pets.

**To get the full 930-pet database:**

1. Open your original `index.html` file
2. Find the line that starts with `const ALL_PETS_DATABASE = [`
3. Copy the ENTIRE array (from `[` to `];`)
4. Open `js/pet-database.js`
5. Replace the sample array with your full array

### Step 2: Upload to GitHub

1. Create a new repository OR update your existing one
2. Upload all files maintaining this folder structure:
   ```
   tauripets/
   ├── index.html
   ├── styles.css
   ├── js/
   │   ├── pet-database.js
   │   ├── config.js
   │   ├── supabase-functions.js
   │   ├── scoring.js
   │   ├── parsers.js
   │   ├── ui.js
   │   └── app.js
   ```
3. Enable GitHub Pages in repository settings

### Step 3: Test Locally (Optional)

You can test locally by opening `index.html` in a browser.
Note: Some features (like Supabase) require a web server.

Simple local server options:
- Python: `python -m http.server 8000`
- Node: `npx serve`
- VS Code: Live Server extension

## 📝 What Each File Does

| File | Purpose |
|------|---------|
| `index.html` | Page structure, loads all JS files |
| `styles.css` | All visual styling |
| `pet-database.js` | 930 battle pets with stats |
| `config.js` | Supabase keys, constants, global state |
| `supabase-functions.js` | Save/load collections, leaderboard |
| `scoring.js` | Calculate scores, achievements |
| `parsers.js` | Parse Lua files and copy format |
| `ui.js` | Render grids, filters, modals |
| `app.js` | Initialize app, setup event handlers |

## 🔧 Making Changes

**Want to add a new pet?**
→ Edit `js/pet-database.js`

**Want to change styling?**
→ Edit `styles.css`

**Want to fix the leaderboard?**
→ Edit `js/supabase-functions.js` (around line 50)

**Want to change scoring formula?**
→ Edit `js/scoring.js`

**Want to change how files are parsed?**
→ Edit `js/parsers.js`

## ⚠️ Important Notes

1. **The pet database file is intentionally separate** - It's huge (930 pets!) and rarely changes
2. **Don't forget to copy the full pet array** - The sample only has ~30 pets
3. **Supabase keys are in config.js** - If you need to change them, that's where they live
4. **GitHub Pages works perfectly** - No backend needed, it's all client-side JS

## 🐛 Troubleshooting

**"No pets showing"**
- Make sure you copied the full pet database to `js/pet-database.js`

**"Leaderboard not loading"**
- Check browser console for errors
- Verify Supabase keys in `config.js`

**"File won't parse"**
- Check the console for specific error messages
- Make sure the Lua file format matches what the parser expects

---

Made with 💚 for the TauriWoW community
