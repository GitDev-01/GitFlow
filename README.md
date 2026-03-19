
<img src="public/gitflow-banner.jpeg" width="100%" height="200px" style="border: 1px solid #4f4f4f; border-radius: 5px;"/>

<h1 style="text-align: center" width="100%"> A visual editor for GitLab Duo workflows </h1>
<br />

<img src="public/gitflow-usage.png" width="100%" height="350px" style="border: 3px solid #4f4f4f; border-radius: 10px;"/>

## Features

- 💯 Open Source
- All Gitlab flow tools (As of March 2026)
- Supports linear and conditional flow logic
- Yaml Importing and Exporting
- Zooming and Panning
- Just a cool project 🕶


### Prerequisites
- Nodejs (v16.8 or later)
- npm package manager
- A code editor or terminal.

## 1-step start
1. Visit [GitFlow](https://gitflow-dev.vercel.app/) to start creating your flow.

## 2-step start (local)

1. Clone and cd into the repo

2. Enter the command  below
    ```bash
    > npm run flow # installs dependencies -> builds project -> starts server.
    ```
Open [http://localhost:3000](http://localhost:3000) with your browser and your done!!

## MCP Support
The GitFlow MCP Server allows Gitlab Agents - specifically the "GitFlow Yaml Agent" - to visualise flows
directly from the IDE.

To access the GitFlow Yaml Agent use the GitLab AI Catalog.

**Note: This only works locally and not in the Gitlab Web IDE (A public server is in the works) 🛠**

### Usage

The MCP server starts automatically with the web app.

Follow the [Gitlab Duo MCP Client Guide](https://docs.gitlab.com/user/gitlab_duo/model_context_protocol/mcp_clients) 
to add the server to your IDE/Code Editor

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

## Troubleshooting
If `npm run flow` encounters an error, build the project manually.
```bash
npm install
npm run build
npm start
```

Thanks for stopping by!. Don't forget to like and subscribe. [Devpost](https://devpost.com/software/gitflow)
