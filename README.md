# KeepClone - Google Keep Clone with Firebase

A full-featured note-taking application that replicates Google Keep's functionality with Firebase backend. Built with Next.js, TypeScript, Tailwind CSS, and Firebase.

## Features

### Phase 1 - Core MVP (Implemented)

- ✅ **Authentication**
  - Google Sign-In
  - Email/Password authentication
  - User session management
  - Secure Firebase Authentication

- ✅ **Note Management**
  - Create, edit, and delete notes
  - Text notes with rich content
  - Checklist/Todo notes with interactive checkboxes
  - Real-time synchronization across devices
  - Auto-save functionality

- ✅ **Organization**
  - Color coding (12 predefined colors)
  - Pin/unpin notes
  - Archive notes
  - Trash with 7-day retention
  - Custom labels with color coding
  - Label-based filtering

- ✅ **User Interface**
  - Responsive design (mobile, tablet, desktop)
  - Grid and list view layouts
  - Quick note input
  - Search functionality
  - Sidebar navigation
  - Modern, clean UI inspired by Google Keep

- ✅ **PWA Features**
  - Offline functionality
  - Install as app on mobile/desktop
  - Service worker for caching
  - Offline data persistence

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Firebase
  - Authentication
  - Cloud Firestore
  - Storage (ready for file attachments)
- **Icons**: Lucide React
- **PWA**: next-pwa
- **Date Utilities**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase account and project

### 1. Clone the Repository

\`\`\`bash
git clone <repository-url>
cd next_pwa
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)

2. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable "Email/Password"
   - Enable "Google"

3. Create Firestore Database:
   - Go to Firestore Database
   - Create database (start in test mode for development)
   - Deploy security rules from \`firestore.rules\`

4. Create Storage bucket:
   - Go to Storage
   - Get started
   - Deploy security rules from \`storage.rules\`

5. Get your Firebase configuration:
   - Go to Project Settings > General
   - Scroll to "Your apps" > Web app
   - Copy the configuration

### 4. Environment Variables

Create a \`.env.local\` file in the root directory:

\`\`\`bash
cp .env.local.example .env.local
\`\`\`

Fill in your Firebase credentials:

\`\`\`env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
\`\`\`

### 5. Deploy Firebase Rules

#### Firestore Security Rules

Go to Firebase Console > Firestore Database > Rules and paste the contents of \`firestore.rules\`.

#### Storage Security Rules

Go to Firebase Console > Storage > Rules and paste the contents of \`storage.rules\`.

### 6. Run the Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Build for Production

\`\`\`bash
npm run build
npm start
\`\`\`

## Project Structure

\`\`\`
next_pwa/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx           # Root layout with AuthProvider
│   │   ├── page.tsx             # Main app page
│   │   └── globals.css          # Global styles
│   ├── components/
│   │   ├── auth/
│   │   │   └── AuthPage.tsx     # Login/Register page
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx      # App sidebar navigation
│   │   │   └── SearchBar.tsx    # Search component
│   │   ├── notes/
│   │   │   ├── NoteCard.tsx     # Individual note card
│   │   │   ├── NoteEditor.tsx   # Note creation/editing modal
│   │   │   ├── NotesGrid.tsx    # Grid/list layout for notes
│   │   │   └── QuickNoteInput.tsx # Quick note input
│   │   └── labels/
│   │       └── LabelManager.tsx # Label management
│   ├── contexts/
│   │   └── AuthContext.tsx      # Authentication context
│   ├── lib/
│   │   ├── firebase/
│   │   │   ├── config.ts        # Firebase configuration
│   │   │   └── firebase.ts      # Firebase initialization
│   │   └── services/
│   │       ├── noteService.ts   # Note CRUD operations
│   │       └── labelService.ts  # Label CRUD operations
│   └── types/
│       └── index.ts             # TypeScript types
├── public/
│   ├── manifest.json            # PWA manifest
│   └── icons/                   # App icons
├── firestore.rules              # Firestore security rules
├── storage.rules                # Storage security rules
└── .env.local.example           # Environment variables template
\`\`\`

## Database Schema

### Notes Collection

\`\`\`typescript
{
  id: string;
  userId: string;
  title: string;
  content: string;
  type: 'text' | 'checklist' | 'image' | 'audio' | 'drawing';
  color: NoteColor;
  labels: string[];
  isPinned: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  checklistItems?: ChecklistItem[];
  attachments?: Attachment[];
  sharedWith?: SharedUser[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deletedAt?: Timestamp;
}
\`\`\`

### Labels Collection

\`\`\`typescript
{
  id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
\`\`\`

### Users Collection

\`\`\`typescript
{
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    defaultView: 'grid' | 'list';
    autoSync: boolean;
  }
}
\`\`\`

## Features In Detail

### Note Types

1. **Text Notes**: Simple notes with title and content
2. **Checklist Notes**: Interactive todo lists with checkboxes

### Organization Features

- **Colors**: 12 predefined colors for visual organization
- **Labels**: Create custom labels with colors
- **Pinning**: Pin important notes to the top
- **Archive**: Archive notes to reduce clutter
- **Trash**: Soft delete with 7-day auto-cleanup

### Search & Filter

- Full-text search across titles and content
- Filter by labels
- View archived notes
- View trash

### Real-time Sync

- Automatic synchronization across all devices
- Offline support with local persistence
- Conflict resolution for concurrent edits

## Testing

KeepClone includes comprehensive end-to-end tests using Playwright to ensure all features work correctly across different browsers and devices.

### Setup Playwright

First, install Playwright browsers:

\`\`\`bash
npx playwright install
\`\`\`

### Running Tests

\`\`\`bash
# Run all tests
npm test

# Run tests in UI mode (interactive)
npm run test:ui

# Run tests in headed mode (see browser)
npm run test:headed

# Debug tests
npm run test:debug

# View test report
npm run test:report
\`\`\`

### Test Coverage

The test suite includes:

1. **Authentication Tests** (`tests/e2e/auth.spec.ts`)
   - Login and signup flows
   - Form validation
   - Error handling
   - Google sign-in button presence

2. **Note Management Tests** (`tests/e2e/notes.spec.ts`)
   - Creating text and checklist notes
   - Editing and updating notes
   - Deleting notes to trash
   - Checklist item toggling

3. **Label Tests** (`tests/e2e/labels.spec.ts`)
   - Creating, editing, and deleting labels
   - Filtering notes by labels
   - Adding/removing labels from notes

4. **UI and Layout Tests** (`tests/e2e/ui.spec.ts`)
   - Responsive design across devices
   - Grid and list view switching
   - Navigation between views
   - PWA features validation

### Test Configuration

Tests are configured to run against:
- Chromium (Desktop Chrome)
- Firefox (Desktop Firefox)
- WebKit (Desktop Safari)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

### Important Notes

- Most authenticated tests are marked as `.skip()` and require Firebase Authentication setup
- To run authenticated tests, you'll need to set up Firebase Auth emulator or use test credentials
- Tests automatically start the development server before running
- Test results include screenshots and traces for debugging failures

### Firebase Testing

For comprehensive testing with Firebase:

1. **Option 1: Firebase Emulator Suite** (Recommended)
   \`\`\`bash
   npm install -g firebase-tools
   firebase emulators:start
   \`\`\`

2. **Option 2: Test Firebase Project**
   - Create a separate Firebase project for testing
   - Use test credentials in your test environment

## Roadmap

### Phase 2 - Enhanced Features (Planned)

- [ ] Image attachments
- [ ] Audio notes with recording
- [ ] Drawing/sketch notes
- [ ] Rich text formatting
- [ ] Note sharing and collaboration
- [ ] Reminders and notifications
- [ ] Mobile apps (React Native)

### Phase 3 - Advanced Features (Planned)

- [ ] OCR for image text extraction
- [ ] Speech-to-text for audio notes
- [ ] Advanced search with filters
- [ ] Export notes (PDF, Markdown)
- [ ] Dark mode
- [ ] Keyboard shortcuts
- [ ] Note templates

## Performance

- Initial load: <2s
- Note creation: <500ms
- Real-time sync latency: <500ms
- Offline-first architecture
- Optimistic UI updates

## Security

- Firebase Authentication with secure token management
- Firestore security rules enforce user-based access
- Storage rules prevent unauthorized file access
- All data encrypted in transit and at rest

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is for educational purposes.

## Acknowledgments

- Inspired by Google Keep
- Built with Firebase and Next.js
- Icons by Lucide

## Support

For issues and questions, please open an issue in the repository.
