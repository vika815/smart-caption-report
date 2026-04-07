@echo off
git checkout main > git_log.txt 2>&1
git pull origin main --rebase >> git_log.txt 2>&1
git merge test >> git_log.txt 2>&1
git push origin main >> git_log.txt 2>&1
echo DONE >> git_log.txt
