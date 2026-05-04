# SprintMaster - Full-Stack Scrum Management

A premium Project Management application designed for high-performance teams to manage the Scrum lifecycle—from backlog grooming to sprint finalization.

## ✨ Core Features

###  Intelligence Dashboard
- **Active Cycle Insight**: Live tracking of current sprint progress with real-time velocity calculations based on story points.
- **Strategic Roadmap**: Visual progress indicators for Planned, Active, and Completed cycles using a glassmorphism design.
- **Team Collaborators**: Sidebar with user role indicators, profile presence, and dynamic avatar generation.
- **Quick Stats**: At-a-glance metrics for Total Backlog, Burned Points, and Total Cycles.

###  Identity & Security
- **Visual Profiles**: Support for custom profile photo uploads with 2MB size validation and real-time previews.
- **Identity Sync**: Dynamic updates for usernames and email addresses with immediate local storage synchronization.
- **Role-Based UI**: Displays specific user permissions (e.g., ScrumMaster, Developer) throughout the interface.
- **Danger Zone**: Secure account deletion logic that triggers a full session termination and local storage wipe.

---

##  Getting Started

### Prerequisites
- **Node.js**: v16.x or higher
- **MongoDB**: Local Community Server instance or MongoDB Atlas URI
- **Git**: For version control and backdating commits

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Raisback/SprintMaster.git
   cd SprintMaster 

2. **Frontend Setup Navigate to the client directory and install dependencies:**
   ```bash
    cd client
    npm install

### Running the Application

- You can run both the server and the client concurrently from the root directory:-

 **Terminal 1 (Backend):**
    bash

        node server/index.js

 **Terminal 2 (Frontend):**
    bash

        cd client
        npm run dev

- Backend API: http://localhost:5000

- Frontend App: http://localhost:5173 (Vite default)

##  Technical Stack

- **Frontend:** React.js, Tailwind CSS, Lucide-React.

- **Backend:** Node.js, Express.js.

- **Database:** MongoDB with Mongoose ODM.

- **Authentication:** JSON Web Tokens (JWT) and Bcrypt encryption.

## 📄 License

This project is licensed under the [MIT License](LICENSE). See the file for details.





