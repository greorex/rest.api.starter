mkdir bin
babel src/index.js -o bin/index.js
babel config.js -o bin/config.js
babel routes -d bin/routes
babel controllers -d bin/controllers
babel models -d bin/models
cp package.json bin/package.json
cp package-lock.json bin/package-lock.json