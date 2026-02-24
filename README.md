# Habit Tracker

A modern habit tracking web application built with React and Firebase, designed to help users build and maintain positive habits.

## Features

- **Habit Management**: Create, track, and manage daily habits
- **Goal Tracking**: Set and monitor progress toward your goals
- **Analytics**: Visualize your habit completion patterns with charts
- **User Profile**: Manage your account and personal settings
- **Firebase Integration**: Cloud-based data storage and authentication
- **Responsive Design**: Optimized for desktop and mobile devices

## Tech Stack

- **Frontend**: React 19 with Vite
- **Styling**: CSS with Lucide React icons
- **Backend**: Firebase (Authentication, Firestore Database)
- **Charts**: Recharts for data visualization
- **Routing**: React Router DOM
- **Date Handling**: date-fns
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
git clone https://github.com/G-Sham/Habit-Tracker.git

2. Install dependencies:

pm install

3. Set up Firebase configuration:
   - Update the Firebase configuration in src/services/firebase.js with your Firebase credentials

4. Start the development server:

pm run dev

The application will be available at http://localhost:5173

## Available Scripts

- npm run dev - Start the development server
- npm run build - Build for production
- npm run preview - Preview the production build locally
- npm run lint - Run ESLint to check code quality

## Project Structure

`
src/
 components/        # React components
    Analysis.jsx
    GoalSidebar.jsx
    HabitGrid.jsx
    Profile.jsx
 hooks/            # Custom React hooks
 services/         # Firebase and external services
 App.jsx           # Main application component
 main.jsx          # Application entry point
`

## Features in Detail

### Habit Grid
Track multiple habits with an intuitive grid interface showing completion status for each day.

### Goal Sidebar
Manage your goals and track progress toward achieving them.

### Analysis
View detailed analytics and visualizations of your habit completion patterns over time.

### Profile
Manage your user profile and account settings.

## Firebase Setup

The app uses Firebase for:
- User authentication
- Real-time database (Firestore)
- Cloud-hosted data

# website: https://lead-tracker-vbpoy.web.app/
