# Warren's Lab: GitHub Sync Guide

This guide details the steps to synchronize your local Mac development environment with your GitHub repository using the GitHub Desktop app.

---

## 🚀 The Daily Workflow (3 Easy Steps)

### 1. Make Your Changes
Modify your code, create new files, or move folders (like moving a project from `kids/` to `sports/`) directly in your Mac's Finder or Code Editor.

### 2. Commit Your Changes (The "Local Save")
- Open **GitHub Desktop**.
- You will see a list of your changes on the left.
- In the bottom-left corner, enter a **Summary** (e.g., "Updated the NBA dashboard").
- Click the blue **Commit to main** button.
- *This saves a snapshot of your work on your Mac.*

### 3. Push to GitHub (The "Cloud Sync")
- Click the **Push origin** button at the top of the app.
- *This sends your local snapshots up to GitHub and triggers Netlify to go live.*

---

## 🛠️ Troubleshooting & Advanced Tips

### The "Forwarding Address" Rule
If you move a folder that is already linked to a live URL (e.g., `burnmarkproductions.com/iq`), you must update the `_redirects` file in the root directory **before** you Push.
- Format: `/old-link/*  /new-folder/project/:splat  200`

### If GitHub Desktop Gets Stuck (The Terminal Way)
If the app gives you a "Safety Warning" or authentication error:
1. Go to **Repository > Open in Terminal**.
2. Type: `git push origin main` (or `git push -f origin main` for a Clean Sweep).
3. Use your **GitHub Username** and your **Personal Access Token** as the password.

### Keeping Things Local
Any folder listed in your `.gitignore` file (like `intelligence/`) will **never** be sent to GitHub. This protects your heavy data and private keys.

---

**Source of Truth**: [wkonigsmark/warrens-lab](https://github.com/wkonigsmark/warrens-lab)
