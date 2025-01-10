# Installing Heroku CLI on Windows

1. **Download the Installer**
   - Visit: https://devcenter.heroku.com/articles/heroku-cli
   - Click the Windows installer button
   - Run the downloaded .exe file

2. **Verify Installation**
   Open a new Command Prompt or PowerShell window and run:
   ```bash
   heroku --version
   ```
   You should see something like `heroku/x.x.x win32-x64 node-v...`

3. **Login to Heroku**
   ```bash
   heroku login
   ```
   This will open your browser for authentication.

4. **After Installation**
   Once logged in, return to DEPLOY.md for the next steps in deploying your server.

Note: You may need to close and reopen your terminal after installation for the `heroku` command to be recognized.
