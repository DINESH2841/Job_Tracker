# 📋 Job Application Tracker

A simple, elegant web application to track your job applications. Built with vanilla HTML, CSS, and JavaScript - no frameworks required!

## 🚀 Live Demo

This application is hosted on GitHub Pages: [View Live Demo](https://dinesh2841.github.io/Job_Tracker/)

## ✨ Features

- **Add Job Applications**: Easily add new job applications with company name, position, status, date, and notes
- **Track Status**: Monitor applications through different stages (Applied, Phone Screen, Interview, Offer, Rejected)
- **Statistics Dashboard**: View quick stats of your total applications, pending, interviews, and offers
- **Filter Applications**: Filter your applications by status to focus on what matters
- **Edit & Delete**: Update or remove applications as needed
- **Local Storage**: All data is saved in your browser - no server required
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices

## 🎯 Usage

1. **Add a New Application**:
   - Fill in the company name, position, status, and date
   - Optionally add notes about the application
   - Click "Add Application"

2. **View Your Applications**:
   - All applications are displayed below the form
   - Use the filter dropdown to view specific statuses

3. **Edit an Application**:
   - Click the "Edit" button on any job card
   - Update the information in the form
   - Click "Add Application" to save changes

4. **Delete an Application**:
   - Click the "Delete" button on any job card
   - Confirm the deletion

## 💻 Local Development

To run this project locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/DINESH2841/Job_Tracker.git
   cd Job_Tracker
   ```

2. Open `index.html` in your web browser:
   - Double-click the file, or
   - Use a local server (recommended):
     ```bash
     python -m http.server 8000
     # or
     npx serve
     ```

3. Navigate to `http://localhost:8000` in your browser

## 📁 Project Structure

```
Job_Tracker/
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── script.js           # JavaScript functionality
├── .github/
│   └── workflows/
│       └── deploy.yml  # GitHub Pages deployment workflow
└── README.md          # This file
```

## 🛠️ Technologies Used

- HTML5
- CSS3 (with Grid and Flexbox)
- Vanilla JavaScript (ES6+)
- LocalStorage API
- GitHub Pages for hosting

## 🌐 GitHub Pages Setup

This project is automatically deployed to GitHub Pages using GitHub Actions. The workflow:

1. Triggers on pushes to `main` or `copilot/host-on-github-pages` branches
2. Sets up GitHub Pages
3. Uploads the project files
4. Deploys to GitHub Pages

To enable GitHub Pages for your fork:
1. Go to repository Settings
2. Navigate to Pages section
3. Under "Build and deployment", select "GitHub Actions" as the source
4. Push changes to trigger the deployment

## 🔒 Privacy

All data is stored locally in your browser using LocalStorage. No data is sent to any server or third party.

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 👤 Author

**DINESH2841**

- GitHub: [@DINESH2841](https://github.com/DINESH2841)

---

Made with ❤️ for job seekers everywhere!
