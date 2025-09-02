# 🧠 BrainPatch

A developer-focused memo app built with Expo and TypeScript, designed specifically for capturing and organizing development-related notes, ideas, and documentation.

## Features

### 📝 Core Functionality
- **Create, Read, Update, Delete** memos with rich text support
- **Categorization** system (Bug, Feature, Idea, Note, Todo)
- **Priority levels** (Low, Medium, High) with visual indicators
- **Tagging system** for better organization
- **Search functionality** across all memo content
- **Category filtering** for focused viewing

### 🛠 Developer-Specific Features
- **Pre-built templates** for common development scenarios:
  - 🐛 Bug Report Template
  - ✨ Feature Request Template
  - 👀 Code Review Notes Template
  - 📚 Learning Note Template
  - 🤝 Meeting Notes Template
  - 🔧 Troubleshooting Log Template
- **Code snippet support** with syntax highlighting
- **Markdown-style formatting** in content areas
- **Development workflow integration**

### 💾 Data Management
- **SQLite local storage** for offline access
- **Automatic timestamps** for creation and updates
- **Data persistence** across app sessions
- **Search indexing** for fast content discovery

## Installation

### Prerequisites
- Node.js (version 18 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)

### Setup
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd BrainPatch
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Run on your preferred platform:
   - **iOS**: `npm run ios`
   - **Android**: `npm run android`
   - **Web**: `npm run web`

## Usage

### Creating Memos
1. **From Template**: Tap the template icon (📚) to choose from developer-focused templates
2. **Blank Memo**: Tap the + button to create a memo from scratch
3. Fill in the title, content, select category and priority
4. Add relevant tags for better organization

### Organizing Memos
- **Categories**: Use the category filter bar to view specific types of memos
- **Search**: Use the search bar to find memos by title, content, or tags
- **Priority**: Visual priority indicators help identify urgent items

### Templates
The app includes several pre-built templates designed for development workflows:

- **Bug Report**: Structured template for documenting bugs with reproduction steps
- **Feature Request**: Template for capturing new feature ideas with user stories
- **Code Review**: Template for organizing code review feedback and action items
- **Learning Notes**: Template for documenting new technologies and concepts
- **Meeting Notes**: Template for capturing meeting discussions and action items
- **Troubleshooting**: Template for logging problem-solving processes

## Project Structure

```
BrainPatch/
├── App.tsx                 # Main application component
├── types/
│   └── index.ts           # TypeScript type definitions
├── services/
│   ├── database.ts        # SQLite database operations
│   └── templates.ts       # Developer template definitions
├── components/
│   └── TemplateSelector.tsx # Template selection modal
├── package.json
├── app.json              # Expo configuration
└── README.md
```

## Technical Stack

- **Framework**: Expo SDK 50
- **Language**: TypeScript
- **Database**: SQLite (expo-sqlite)
- **Storage**: Async Storage for preferences
- **UI Components**: React Native built-in components
- **Icons**: @expo/vector-icons (Ionicons)
- **Navigation**: Built-in modal system

## Development

### Adding New Templates
1. Edit `services/templates.ts`
2. Add new template object to `developmentTemplates` array
3. Follow existing template structure with proper categorization

### Database Schema
The app uses a simple SQLite schema:
- **id**: Primary key (auto-increment)
- **title**: Memo title (TEXT)
- **content**: Memo content (TEXT)
- **category**: Memo category (TEXT)
- **priority**: Priority level (TEXT)
- **tags**: JSON array of tags (TEXT)
- **created_at**: Creation timestamp (DATETIME)
- **updated_at**: Last update timestamp (DATETIME)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Roadmap

### Planned Features
- [ ] Export memos to various formats (Markdown, PDF, etc.)
- [ ] Sync across devices via cloud storage
- [ ] Code syntax highlighting in memo content
- [ ] Integration with GitHub/GitLab for issue tracking
- [ ] Dark mode support
- [ ] Advanced search with filters
- [ ] Memo sharing capabilities
- [ ] Custom template creation
- [ ] Voice-to-text memo creation
- [ ] Reminder and notification system

### Known Issues
- Template modal may need scrolling on smaller devices
- Search performance could be optimized for large datasets
- Code formatting in templates needs improvement

## Support

For issues, questions, or contributions, please open an issue on GitHub or contact the development team.

---

Built with ❤️ for developers by developers