<!-- ABOUT THE PROJECT -->
## About The Project

Interact with the testing version [here](https://rhudaj.github.io/JobTool-Frontend/)

The purpose of this project is to streamline the job application process. From finding jobs, to extracting usefull information, to writing a cover letter and tailored resume.

The project features a frontend implementing the core features and a frontend for interactive UI.

### Built With

* [![React](https://img.shields.io/badge/React-%2320232a.svg?logo=react&logoColor=%2361DAFB)](#)
* [![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff)](#)
* [![Express.js](https://img.shields.io/badge/Express.js-%23404d59.svg?logo=express&logoColor=%2361DAFB)](#)
* [![HTML](https://img.shields.io/badge/HTML-%23E34F26.svg?logo=html5&logoColor=white)](#)
* [![CSS](https://img.shields.io/badge/CSS-1572B6?logo=css3&logoColor=fff)](#)

<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running follow these simple example steps.

### Prerequisites

* npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/rhudaj/JobTool.git
   ```
2. Navigate to the new directory
   ```sh
   cd JobTool
   ```
3. Run the setup script (installs all packages and links the shared package)
   ```sh
   npm run setup
   ```
7. Create and fill a .env in the root directory:
   ```env
   PORT=<PORT> # example: 8080
   API_KEY=<your openai API key>
   ```
8. Change git remote url to avoid accidental pushes to base project
   ```sh
   git remote set-url origin github_username/repo_name
   git remote -v # confirm the changes
   ```

<!-- USAGE EXAMPLES -->
## Usage

To start the project, run the following command in the root directory:
```sh
npm run start
```

This will start the frontend and backend servers. The frontend will be available at `localhost:3000` and the backend at `localhost:<PORT>`.

<!-- ROADMAP -->
## Roadmap

- [ ] Improve training for cover-letter & resume text generation.
- [ ] Deploy the frontend to a domain.
- [ ] Improve UI for keyword detection.

## Code Structure

The repo is split into frontend, backend and a Shared folder.

[Frontend Repo](https://github.com/rhudaj/JobTool-Frontend)

The frontend is a React app that is served by the backend.

[Backend Repo](https://github.com/rhudaj/JobTool-Backend)

The backend is an Express.js server that serves the frontend and provides an API for the frontend to interact with.

[Shared Repo](https://github.com/rhudaj/JobTool-Shared)

The shared package contains code (specifically interfaces) that is used by both the frontend and the backend.

### Frontend

The frontend is located in the `frontend` directory. The frontend is split into components that are located in the `src/components` directory.

### Backend

The backend is located in the `backend` directory. The backend is split into routes that are located in the `src/routes` directory. The backend serves the frontend and provides an API for the frontend to interact with.

<!-- CONTACT -->
## Contact

Roman Hudaj - rhudaj@uwaterloo.ca

Project Link: [https://github.com/rhudaj/JobTool](https://github.com/rhudaj/JobTool)

<p align="right">(<a href="#readme-top">back to top</a>)</p>