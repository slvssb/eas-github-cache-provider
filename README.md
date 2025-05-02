# EAS Remote Build Cache Provider - GitHub

## 🚀 How to use

1. **Create a GitHub Personal Access Token** with **repo** permissions:

   - Go to [GitHub Settings › Developer settings › Personal access tokens](https://github.com/settings/tokens).
   - Click **Generate new token**, select the **repo** scope, and copy the token.
   - Set it in your shell:
     ```bash
     export GITHUB_TOKEN=YOUR_TOKEN_HERE
     ```

2. **To use the EAS remote build provider plugin, install the `@slvssb/eas-github-cache` package as a developer dependency:**

   ```bash
   npm install --save-dev @slvssb/eas-github-cache
   ```

3. **Configure your Expo project**:

   - Open `app.json`.
   - Update the `remoteBuildCache` block under the `expo` key:

   ```json
   {
     "expo": {
       ...
       "experiments": {
         "remoteBuildCache": {
           "provider": {
               "plugin": "@slvssb/eas-github-cache",
               "options": {
                 "owner": "<YOUR_GITHUB_USERNAME>",
                 "repo": "<YOUR_REPO_NAME>"
               }
            }
         }
       }
     }
   }
   ```

   - Replace `<YOUR_GITHUB_USERNAME>` and `<YOUR_REPO_NAME>` with your details.

> **Tip:** If you’d rather not create prereleases in your main repository, point `repo` to a separate GitHub project or private repo and update the `repo` option in `remoteBuildCache`.
