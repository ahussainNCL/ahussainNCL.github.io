# Now Playing Portfolio 🎵

A Spotify-inspired portfolio that presents GitHub repositories as music tracks in a beautiful, interactive interface.

## Features

### 🎨 **Spotify-Dark UI**
- Dark theme with Spotify's signature green accents
- Professional, modern design with consistent colors
- Mobile-first responsive layout

### 📱 **Album Grid Layout**
- 3xN grid of repository "albums" 
- Each repo displays as an album cover with social preview images
- Hover effects with play button overlay
- Star and fork counts displayed on covers

### 🎵 **Interactive Music Player**
- Bottom-sheet player that slides up from the bottom
- Real-time progress bar with elapsed/total time
- Play/Pause, Next/Previous controls
- Auto-advance to next repository when track ends

### 📖 **Lyrics Mode**
- README content scrolls in sync with progress bar
- Simulated "lyrics" scrolling effect
- Word-by-word synchronization with track progress

### 🔍 **Search & Filter**
- Real-time search through repository names and descriptions
- Filter by programming language
- Dynamic language filter buttons

### ⚡ **Modern Tech Stack**
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Jotai** for state management
- **shadcn/ui** components
- **GitHub REST API** integration

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ahussainNCL/ahussainNCL.github.io.git
   cd ahussainNCL.github.io
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (optional)
   Create a `.env.local` file:
   ```env
   GITHUB_TOKEN=your_github_token_here
   ```
   *Note: GitHub token is optional but recommended for higher API rate limits*

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### 🎵 **Playing Tracks**
- Click on any album cover to start "playing" that repository
- The bottom-sheet player will slide up with project details
- Use the controls to play/pause, skip tracks, or open GitHub

### 🔍 **Searching & Filtering**
- Use the search bar to find specific repositories
- Click language filter buttons to show only repos in that language
- Click "All" to reset filters

### 📱 **Mobile Experience**
- Fully responsive design
- Touch-friendly controls
- Swipe gestures for player interaction

## Architecture

### State Management
- **Jotai** atoms for global state
- Repository data, player state, search/filter state
- Reactive updates across components

### Data Fetching
- GitHub REST API integration
- Fetches repositories, READMEs, and topics at build time
- Social preview images for album covers

### Components
- **AlbumGrid**: 3xN grid layout with hover effects
- **MusicPlayer**: Bottom-sheet player with controls
- **SearchFilter**: Search and language filtering
- **UI Components**: shadcn/ui Button and Sheet components

## Customization

### Adding Your Repositories
Update the GitHub username in `lib/github.ts`:
```typescript
const USERNAME = 'your-github-username'
```

### Styling
- Colors defined in `tailwind.config.js`
- CSS variables in `app/globals.css`
- Component-specific styles in Tailwind classes

### Player Behavior
- Track duration: 3 minutes (configurable in `lib/store.ts`)
- Auto-advance: enabled by default
- Lyrics sync: word-based synchronization

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables if needed
3. Deploy automatically on push

### Other Platforms
```bash
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Inspired by Spotify's beautiful music player interface
- Built with modern React and Next.js best practices
- Uses shadcn/ui for consistent component design
- Powered by GitHub's REST API

---

**Made with ❤️ and lots of 🎵** 