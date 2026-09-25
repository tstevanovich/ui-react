# Documentation

## I'm new here, how do I get started?

### Setting up your local environment

Check out the following guide to set up your local environment:
https://confluence.wellsfargo.net/display/OR/Configuring+your+Environment

### Component Identification Number (CIN)
CIN will only be provided when the component is being onboarded to CICD.
You will need to generate a github repo with Orchestra.
Once a repo is generated, you can retrieve this information from https://orchestra.cfapps.wellsfargo.net/#/developerdashboard/Components

### Brand new to Node.js

If you're brand new to Node, check out https://nodejs.org/en to learn about the overall concepts.

### Brand new to React

If you're brand new to React, check out https://react.dev/ to learn about the overall concepts and how to program in it.

### Running into Issues?

Engage with the Orchestra team by opening an Engagement Ticket at our [Service Project](https://wim-jira.wellsfargo.com/servicedesk/customer/portal/13104).

## Run in local
Access your application at http://localhost:8080 with one of the following commands:

### Live Reload (client + server)

```bash
npm run dev
```

Pre-builds the client, then starts three concurrent processes:
- **SERVER** — Node.js server via nodemon (auto-restarts on server source changes)
- **CLIENT** — webpack in watch mode (rebuilds client on source changes)
- **RELOAD** — LiveReload server on port 35729 (triggers browser refresh after each rebuild or server restart)

### Live Reload (client only, built server)

```bash
npm run dev:with:built:server
```

Builds the server bundle once, then runs it statically while webpack watches for client changes. Use this when you only need to iterate on the frontend and want a stable server.

### Live Reload (server only, built client)

```bash
npm run dev:with:built:client
```

Builds the client once, then runs the server via nodemon with LiveReload. Use this when you only need to iterate on the backend and don't need client rebuilds.

## Deployment

~
Here are some useful links on OpenShift(OCP) deployment.
- [What is OpenShift](https://confluence.wellsfargo.net/display/OCP/Home).
- [OpenShift Onboarding](https://confluence.wellsfargo.net/display/OCP/OpenShift+Onboarding)

~
~
### My Jenkins/Gitub SaaS job is failing, what do I do?
Raise an engagement request to the [DevOps Team](https://wim-jira.wellsfargo.com/servicedesk/customer/portal/12139/) to see if they can resolve it. If it works in local, there's probably an issue in Build Platform.
If that doesn't work, open an engagement ticket with the [Orchestra team](https://wim-jira.wellsfargo.com/servicedesk/customer/portal/13104).

### Threadfix and SWCA Onboarding

REQUIRED: As ELMA does not automatically setup Threadfix and Black Duck (SWCA), follow this guide to set them set up:
- [How to Onboard Repo to the ThreadFix and SWCA](https://confluence.wellsfargo.net/pages/viewpage.action?pageId=745664325)

## Library Source Code

Curious on how our libraries work? Check out our GitHub repos:

- [Node Microservice Library](https://github.wellsfargo.com/app-ebssh/ebssh-node-microservice-lib)
- [React Library](https://github.wellsfargo.com/app-ebssh/ebssh-react-library)
- [React Styleguide](https://github.wellsfargo.com/app-ebssh/ebssh-react-styleguide)

## Helpful Links/Tools

- [Orchestra React Web App User Guides](https://confluence.wellsfargo.net/display/OR/React+Web+App+User+Guides) - User Guides on React Web Application can be found in our Confluence space.
- [OCP Migration Guide](https://confluence.wellsfargo.net/pages/viewpage.action?pageId=3306581545) - Check confluence to see helpful OCP related resources
- [EPLX Migration Guide](https://confluence.wellsfargo.net/display/OR/EPLX+migration) - Check confluence to see helpful EPL-X related resources
- [Orchestra Blog](https://confluence.wellsfargo.net/pages/viewrecentblogposts.action?key=OR) - Watch our blog to stay up-to-dates with Framework Updates