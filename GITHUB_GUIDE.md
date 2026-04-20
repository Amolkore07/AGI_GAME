# GitHub Push Guide & Security Checklist

This document will help you safely push your AGI Robot Warfare game to GitHub.

## 1. Security Concerns & Pre-Push Checklist

Before pushing any code to a public or private GitHub repository, you should always check for the following. For this specific project, the risks are low since it is predominantly a frontend static application, but keep this in mind:

*   **No API Keys embedded:** Ensure you haven't hardcoded any personal API keys, database credentials, or secret tokens inside your JavaScript code. (For this Three.js game, you seem to have none, which is great).
*   **No Personal Information:** Be careful not to include actual passwords, personal emails, or sensitive local paths if you add backend integrations in the future.
*   **`.gitignore` File:** Although you don't have large dependencies right now, if you ever use Node.js (`npm install`), you should create a `.gitignore` file and add `node_modules/` to it so you don't upload thousands of dependency files.

Currently, your project is safe to push as is, but it's good practice to create a `.gitignore` just in case.

## 2. Steps to Push to GitHub

Since you already have a `.git` folder in your directory (meaning Git is initialized), you can follow these steps in your terminal (using PowerShell, Git Bash, or Command Prompt):

### Step A: Stage and Commit your Files
Open your terminal in `c:\Users\amol kore\OneDrive\agi-robot-warfare` and run:

```bash
# Add all new features and modified files
git add .

# Save them into a new commit
git commit -m "Added Day/Night toggle, Drivable Plane, and realistic Car Physics"
```

### Step B: Create a Repository on GitHub
1. Go to [GitHub.com](https://github.com/) and log in.
2. Click the `+` icon in the top right corner and select **New repository**.
3. Name your repository (e.g., `agi-robot-warfare`).
4. Choose whether to make it Public or Private.
5. Do **not** initialize it with a README, .gitignore, or license (since you already have local files).
6. Click **Create repository**.

### Step C: Link Local Repository to GitHub and Push
Once the repo is created, GitHub will show you some commands. Run these in your terminal (replace `YOUR-USERNAME` with your actual GitHub username):

```bash
# Rename the primary branch to 'main' (if it's not already)
git branch -M main

# Link your local folder to the GitHub repository
git remote add origin https://github.com/YOUR-USERNAME/agi-robot-warfare.git

# Push your code to GitHub
git push -u origin main
```

**Note:** If Git prompts you to log in, enter your GitHub credentials or authorize via the browser popup.

## 3. Hosting your Game (Optional)
Since this is a totally static website (HTML/CSS/JS), you can host it for **free** on GitHub Pages!
1. Go to your new repository on GitHub.
2. Click **Settings** > **Pages** (on the left sidebar).
3. Under "Build and deployment", set the **Source** to `Deploy from a branch`.
4. Select the `main` branch and `/ (root)` folder and click **Save**.
5. After a few minutes, your game will be live at `https://YOUR-USERNAME.github.io/agi-robot-warfare/`!
