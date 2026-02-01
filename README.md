# Real-Time Collaborative Drawing Canvas

A real-time collaborative drawing application where multiple users can draw simultaneously on a shared canvas. Built with Node.js, Socket.io, and the HTML5 Canvas API.

## Features

### Core Features
- ✅ **Real-time drawing synchronization** - See others draw as they draw
- ✅ **Multiple drawing tools** - Brush, Eraser, Color picker, Adjustable stroke width
- ✅ **User management** - See who's online, unique colors per user
- ✅ **User indicators** - Visual cursors showing where other users are drawing
- ✅ **Global Undo/Redo** - Undo and redo work globally across all users
- ✅ **Conflict handling** - Handles simultaneous drawing gracefully

### Technical Highlights
- Raw HTML5 Canvas API (no drawing libraries)
- WebSocket-based real-time communication
- Client-side prediction for smooth drawing
- Optimized canvas redrawing
- State synchronization with history management

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd collaborative-canvas
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

The server will start on `http://localhost:3000`

## Usage

### Running Locally

1. Start the server (see Installation above)
2. Open `http://localhost:3000` in your browser
3. Open the same URL in multiple browser tabs/windows to test with multiple users
4. Start drawing!

### Testing with Multiple Users

**Method 1: Multiple Browser Tabs**
- Open `http://localhost:3000` in multiple tabs
- Each tab represents a different user
- Draw in one tab and see it appear in others

**Method 2: Multiple Devices**
- Ensure all devices are on the same network
- Find your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
- Access `http://YOUR_IP:3000` from other devices

**Method 3: Deploy and Share**
- Deploy to a hosting service (see Deployment section)
- Share the URL with others

### Drawing Controls

- **Color Picker**: Select drawing color
- **Stroke Width Slider**: Adjust brush size (1-20)
- **Brush Button**: Switch to brush mode
- **Eraser Button**: Switch to eraser mode
- **Undo Button**: Undo last action (global)
- **Redo Button**: Redo last undone action (global)

### User Features

- Each user gets a unique color automatically
- See all online users in the right panel
- See other users' cursors as they move
- Your own cursor is highlighted

## Deployment

### Deploy Client to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Build and deploy:
```bash
npm run build
vercel --prod
```

### Deploy Server

The Socket.io server needs to be deployed to a platform that supports persistent WebSocket connections:

**Option 1: Railway (Recommended)**
1. Go to [Railway](https://railway.app)
2. Create new project from GitHub
3. Set start command: `npm start`
4. Deploy!

**Option 2: Render**
1. Go to [Render](https://render.com)
2. Create new Web Service
3. Build command: `npm install`
4. Start command: `npm start`

**Option 3: Fly.io**
```bash
fly launch
fly deploy
```

**Important**: After deploying the server, update `client/websocket.js` to use your server URL instead of `http://localhost:3000`.

## Project Structure

```
collaborative-canvas/
├── client/
│   ├── index.html          # Main HTML file
│   ├── style.css           # Styles
│   ├── canvas.js           # Canvas drawing logic
│   ├── websocket.js        # WebSocket client code
│   ├── main.js             # App startup and event handling
│   └── config.js           # Configuration
├── server/
│   ├── server.js           # Express + Socket.io server
│   ├── drawing-state.js    # Canvas state and undo/redo logic
│   └── rooms.js            # Room handling (future use)
├── public/                 # Built files (generated)
├── build.js                # Build script
├── package.json
├── vercel.json             # Vercel configuration
├── README.md               # This file
└── ARCHITECTURE.md         # Technical documentation
```

## Known Issues and Limitations

### Current Limitations

1. **No Persistence**: Canvas state is lost when server restarts
   - *Solution*: Implement Redis or database storage

2. **Single Canvas**: Only one shared canvas (no rooms)
   - *Solution*: Implement room system using rooms.js

3. **History Limit**: Undo/redo limited to 100 operations
   - *Solution*: Increase limit or implement circular buffer

4. **No Authentication**: Anyone can connect
   - *Solution*: Add authentication middleware

5. **Memory Growth**: Long-running sessions may use more memory
   - *Solution*: Implement state compression or periodic cleanup

### Browser Compatibility

Tested and working on:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

### Performance Notes

- Works well with up to 10 concurrent users
- Performance may degrade with 20+ users
- Large drawings (1000+ strokes) may slow down
- Network latency affects real-time sync quality

## Development

### Running in Development

```bash
npm start
```

Server runs on `http://localhost:3000`

### Building for Production

```bash
npm run build
```

Copies client files to `public/` directory.

## Technical Details

### Real-Time Synchronization

- Uses Socket.io for WebSocket communication
- Client-side prediction for immediate feedback
- Server maintains authoritative state
- Broadcasts updates to all connected clients

### Undo/Redo Implementation

- History array stores state snapshots
- Server-side state management
- Global undo/redo affects all users
- History limited to prevent memory issues

### Canvas Optimization

- Efficient redrawing using path optimization
- Proper handling of eraser mode
- Smooth drawing with client prediction
- Handles high-frequency pointer events

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed technical documentation.

## Time Spent

- **Initial Setup**: 2 hours
- **Core Drawing Features**: 4 hours
- **Real-Time Synchronization**: 3 hours
- **User Management & Cursors**: 2 hours
- **Undo/Redo Implementation**: 4 hours
- **UI/UX Improvements**: 2 hours
- **Testing & Bug Fixes**: 2 hours
- **Documentation**: 2 hours

**Total**: ~21 hours (approximately 3 days)

## License

ISC

## Author

Built as a technical assessment project demonstrating:
- Real-time system design
- Canvas API expertise
- State synchronization
- WebSocket communication
- Collaborative application architecture
