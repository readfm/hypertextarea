git pull https://github.com/readfm/hypertextarea.git
if not exist node_modules (mkdir node_modules & npm install)
electron --version || npm i -D electron@beta
electron .