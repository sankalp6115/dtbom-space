# ==============================
# Auto Git Push Script
# ==============================

# Go to repo folder
Set-Location "D:\dtbom-space\dtbom-space-github"

# Stage all changes
git add .

# Check if there are any changes
$changes = git status --porcelain

if ($changes) {
    # If there are changes, commit with timestamp
    $commitMessage = "Auto commit: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    git commit -m "$commitMessage"
} else {
    # If no changes, update streak file
    $logFile = "streak_log.txt"
    Add-Content $logFile "Streak commit on $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    git add $logFile
    $commitMessage = "Streak commit: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    git commit -m "$commitMessage"
}

# Push to main branch
git push origin main
