# 🤝 Git Collaboration Workflow for MRhappy Project

## Basic Workflow
1. **Pull latest changes** before starting work
   ```bash
   git pull origin main
   ```

2. **Create a feature branch** (recommended)
   ```bash
   git checkout -b feature/task-name
   # Example: git checkout -b feature/backend-api
   ```

3. **Make your changes** in VS Code
   - Edit files
   - Save changes
   - Test your code

4. **Stage and commit changes**
   ```bash
   git add .
   git commit -m "Add backend API endpoints for restaurants"
   ```

5. **Push to GitHub**
   ```bash
   git push origin feature/task-name
   ```

6. **Create Pull Request** on GitHub
   - Go to GitHub repository
   - Create Pull Request
   - Request code review
   - Merge after approval

## Branch Strategy
- `main` - Production ready code
- `feature/backend-api` - Backend development
- `feature/testing-setup` - Testing infrastructure
- `feature/payment-integration` - Payment system

## Daily Sync Routine
```bash
# Start of day
git checkout main
git pull origin main
git checkout your-feature-branch
git merge main  # Get latest changes

# End of day
git add .
git commit -m "Progress on [task name]"
git push origin your-feature-branch
```

## Conflict Resolution
If you both edit the same file:
1. Git will warn about conflicts
2. Manually resolve conflicts in VS Code
3. Commit the resolution
4. Push the changes

## Communication
- Use descriptive commit messages
- Comment on Pull Requests
- Use GitHub Issues for task tracking
