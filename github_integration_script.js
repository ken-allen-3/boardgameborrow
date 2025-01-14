import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
    auth: process.env.ACCESS_TOKEN
});

const owner = "ken-allen-3";
const repo = "boardgameborrow";

async function testGitHubAccess() {
    try {
        const response = await octokit.repos.get({ owner, repo });
        console.log("Repository access verified:", response.data.full_name);

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