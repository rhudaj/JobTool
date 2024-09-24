<!-- ABOUT THE PROJECT -->
## About The Project

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
3. Install NPM packages
   ```sh
   cd frontend
   npm install
   cd ..
   cd backend-api
   npm install
   ```
4. Create a symbolic link from the package in ```/shared```
   ```sh
   cd /shared
   npm link
   ```
5. Link the frontend & backend to this 'shared' package
   ```sh
   cd frontend
   npm link shared
   cd ..
   cd backend-api
   npm link shared
   ```
7. Create and fill a .env in ```/backend-api```
   ```env
   PORT=<some port #> # example: 8080
   API_KEY=<your openai API key>
   ```
8. Change git remote url to avoid accidental pushes to base project
   ```sh
   git remote set-url origin github_username/repo_name
   git remote -v # confirm the changes
   ```

<!-- USAGE EXAMPLES -->
## Usage

1. Launch the backend
   ```sh
   cd backend-api
   npm run start
   # you should see something along the lines of 'started on local-host://8080'
   ```
2. Launch the frontend
 ```sh
   cd frontend
   npm run start
   # the react-app should start in your web-browser
   ```



<!-- ROADMAP -->
## Roadmap
- [ ] Improve training for cover-letter & resume text generation. 
- [ ] Deploy the frontend to a domain.
- [ ] Improve UI for keyword detection. 

<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

<!-- CONTACT -->
## Contact

Roman Hudaj - rhudaj@uwaterloo.ca

Project Link: [https://github.com/rhudaj/JobTool](https://github.com/rhudaj/JobTool)

<p align="right">(<a href="#readme-top">back to top</a>)</p>
