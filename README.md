
<img src="public/gitflow-banner.jpeg" width="100%" height="200px" style="border: 1px solid #4f4f4f; border-radius: 5px;"/>

<h1 style="text-align: center" width="100%"> A visual editor for GitLab Duo workflows </h1>
<br />

[![Watch the video](https://img.youtube.com/vi/WyO-LfOpDvU/0.jpg)](https://www.youtube.com/watch?v=WyO-LfOpDvU)

**Watch Me**

<br />

## Features

- 💯 Open Source
- All Gitlab flow tools (As of March 2026)
- Supports linear and conditional flow logic
- Yaml Importing and Exporting
- Zooming and Panning
- Just a cool project 🕶

<img src="public/gitflow-usage.png" width="100%" height="350px" style="border: 3px solid #4f4f4f; border-radius: 10px;"/>

### Prerequisites
- Nodejs (v16.8 or later)
- npm package manager
- A code editor or terminal.

<br />

## 1-step start
1. Visit [GitFlow](https://gitflow-dev.vercel.app/) to start creating your flow.

<br />

## 2-step start (local)

1. Clone and cd into the repo

2. Enter the command  below: (for errors see [Troubleshooting](https://github.com/GitDev-01/GitFlow?tab=readme-ov-file#troubleshooting))
    ```bash
    > npm run flow # installs dependencies -> builds project -> starts server.
    ```
Open [http://localhost:3000](http://localhost:3000) with your browser and your done!!

<br />

## Flow with Gitlab Agents
The GitFlow MCP Server allows Gitlab Agents - specifically the "GitFlow Yaml Agent" - to visualise flows
directly from the IDE.

To access the GitFlow Yaml Agent use the GitLab AI Catalog.

1. Enable the agent in your GitLab project
2. Open the project locally in your IDE/Code Editor (Not the Web IDE)
3. (ish) Place [flow-documentation.md](https://github.com/GitDev-01/GitFlow/blob/master/context/v1.md) in your root directory **(Recommeded for Agentic Context, but may not be needed)**
4. Add the MCP server **(see MCP Usage)**

**Note: If you can't setup the MCP server. Create a flow using the Agent, then copy and paste the text into the public [web app](https://gitflow-dev.vercel.app/)**

5. Start the Web App **(see 2-step start)**
6. Describe your Flow!!

<br />

## MCP Usage
**Note: MCP server only works locally and not in the Gitlab Web IDE (A public server is in the works) 🛠**

The MCP server starts automatically with the web app.

Follow the [Gitlab Duo MCP Client Guide](https://docs.gitlab.com/user/gitlab_duo/model_context_protocol/mcp_clients) 
to add the server config to your IDE/Code Editor

Server Configuration:
```json
{
  "mcpServers": {
    "flow-yaml-visualiser": {
      "type": "http",
      "url": "http://localhost:3000/api/gitflow/mcp",
      "approvedTools": true # Only 1 tool
    }
  }
}
```

<br />

## Troubleshooting
If `npm run flow` encounters an error, build the project manually.
```bash
npm install
npm run build
npm start
```

Thanks for stopping by!. Don't forget to like and subscribe. [Devpost](https://devpost.com/software/gitflow)
