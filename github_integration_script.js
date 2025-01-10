// Node.js script to interact with GitHub API using a Personal Access Token
// Ensure you have stored the token in the GitHub Actions secrets under 'ACCESS_TOKEN'

const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({
    auth: process.env.ACCESS_TOKEN
});

const owner = "ken-allen-3";
const repo = "boardgameborrow";

async function testGitHubAccess() {
    try {
        // Fetch repository details as a test
        const response = await octokit.repos.get({ owner, repo });
        console.log("Repository access verified:", response.data.full_name);

        // Example: Create a new file in the repo
        const path = "test-file.txt";
        const content = Buffer.from("Hello from the GitHub Integration Script!").toString('base64');

        await octokit.repos.createOrUpdateFileContents({
            owner,
            repo,
            path,
            message: "Adding a test file via GitHub Action",
            content,
            branch: "main"
        });

        console.log(`File '${path}' created successfully.`);
    } catch (error) {
        console.error("Error accessing the repository:", error);
        process.exit(1);
    }
}

testGitHubAccess();