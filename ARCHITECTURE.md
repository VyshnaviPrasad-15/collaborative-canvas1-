# Architecture Documentation

## Data Flow Diagram

```
User Action (Drawing)
    ↓
Client: Capture pointer events
    ↓
Client: Create segment object
    ↓
Client: Local prediction (immediate visual feedback)
    ↓
WebSocket: Emit "draw_segment" event
    ↓
Server: Receive segment
    ↓
Server: Add to drawing state
    ↓
Server: Broadcast to all other clients
    ↓
Other Clients: Receive segment
    ↓
Other Clients: Add to local state
    ↓
Other Clients: Redraw canvas
```

### Undo/Redo Flow

```
User clicks Undo/Redo
    ↓
Client: Emit "undo" or "redo" event
    ↓
Server: Execute undo/redo on shared state
    ↓
Server: Get updated state
    ↓
Server: Broadcast "state_update" to ALL clients (including sender)
    ↓
All Clients: Replace local state with new state
    ↓
All Clients: Redraw canvas
```

## WebSocket Protocol

### Client → Server Events

#### `draw_segment`
Sent when user draws a line segment.

```javascript
{
  strokeId: string,      // UUID of the stroke
  userId: string,        // ID of the user drawing
  from: { x: number, y: number },
  to: { x: number, y: number },
  color: string,         // Hex color or "eraser"
  width: number          // Stroke width
}
```

#### `stroke_complete`
Sent when user finishes a stroke (pointer up).

```javascript
{
  id: string,            // Stroke ID
  userId: string,
  color: string,
  width: number,
  segments: Array        // All segments in the stroke
}
```

#### `cursor_move`
Sent continuously as user moves cursor.

```javascript
{
  x: number,             // Page X coordinate
  y: number              // Page Y coordinate
}
```

#### `undo`
Request to undo the last action globally.

#### `redo`
Request to redo the last undone action globally.

### Server → Client Events

#### `init`
Sent when client first connects.

```javascript
{
  strokes: Array,        // Current canvas state
  userId: string,        // Assigned user ID
  userColor: string,     // Assigned color
  users: Array           // List of online users
}
```

#### `draw_segment`
Broadcasted segment from another user.

```javascript
{
  strokeId: string,
  userId: string,
  from: { x: number, y: number },
  to: { x: number, y: number },
  color: string,
  width: number
}
```

#### `stroke_complete`
Broadcasted completed stroke from another user.

#### `state_update`
Sent after undo/redo operations.

```javascript
Array  // Complete strokes array
```

#### `user_joined`
New user connected.

```javascript
{
  id: string,
  color: string,
  name: string
}
```

#### `user_left`
User disconnected.

```javascript
string  // User ID
```

#### `user_cursor`
Another user's cursor position.

```javascript
{
  userId: string,
  position: { x: number, y: number },
  color: string
}
```

## Undo/Redo Strategy

### Implementation Approach

The undo/redo system uses a **history array** that stores snapshots of the entire canvas state. This approach ensures:

1. **Global consistency**: All users see the same state after undo/redo
2. **Cross-user undo**: One user can undo another user's drawing
3. **State synchronization**: The server maintains the single source of truth

### How It Works

1. **History Storage**: 
   - Each state change creates a deep copy of the strokes array
   - History is stored as an array of snapshots
   - Current position tracked by `historyIndex`

2. **Undo Operation**:
   - Decrement `historyIndex`
   - Restore strokes from history at that index
   - Broadcast new state to all clients

3. **Redo Operation**:
   - Increment `historyIndex`
   - Restore strokes from history at that index
   - Broadcast new state to all clients

4. **History Management**:
   - When new action occurs after undo, future history is discarded
   - History limited to 100 snapshots to prevent memory issues
   - Each stroke completion triggers a history save

### Conflict Resolution

When multiple users perform actions simultaneously:

- **Drawing conflicts**: Handled by stroke IDs - each stroke has unique ID, segments are appended
- **Undo conflicts**: Last undo/redo wins - server processes requests sequentially
- **State synchronization**: All clients receive state updates, ensuring eventual consistency

## Performance Decisions

### 1. Client-Side Prediction

**Decision**: Draw immediately on local canvas before server confirmation.

**Rationale**: 
- Eliminates perceived latency
- Drawing feels instant and responsive
- Server broadcast ensures eventual consistency

### 2. Segment-Based Drawing

**Decision**: Send individual line segments, not entire strokes.

**Rationale**:
- Real-time feedback while drawing (not just after completion)
- Smaller message size
- Better for high-frequency pointer events
- Allows smooth drawing experience

### 3. Optimized Canvas Redraw

**Decision**: Clear and redraw entire canvas on each update.

**Rationale**:
- Simpler implementation
- Ensures correct rendering order
- Canvas API is fast enough for typical use
- Handles eraser mode correctly (requires full redraw)

**Alternative Considered**: Incremental drawing
- More complex
- Harder to handle undo/redo
- Eraser mode complications

### 4. History Limiting

**Decision**: Limit history to 100 snapshots.

**Rationale**:
- Prevents unbounded memory growth
- 100 operations is sufficient for most use cases
- Can be adjusted based on needs

### 5. Cursor Position Updates

**Decision**: Send cursor position on every pointer move.

**Rationale**:
- Low bandwidth cost (small messages)
- Provides real-time user presence
- Auto-hide after 2 seconds of inactivity

## Conflict Handling

### Simultaneous Drawing

**Problem**: Multiple users draw at the same time.

**Solution**: 
- Each stroke has unique ID (UUID)
- Segments are appended to strokes by ID
- No conflicts - strokes are independent

### Overlapping Strokes

**Problem**: Users draw over each other's work.

**Solution**:
- Canvas rendering order (array order) determines visual layering
- Last stroke drawn appears on top
- This is expected behavior for collaborative drawing

### Undo/Redo Conflicts

**Problem**: Multiple users undo/redo simultaneously.

**Solution**:
- Server processes requests sequentially
- Last operation wins
- All clients receive state update
- Eventual consistency guaranteed

### Network Delays

**Problem**: Network latency causes out-of-order messages.

**Solution**:
- Client-side prediction for immediate feedback
- Server maintains authoritative state
- State updates overwrite local state when received
- Segments are idempotent (can be applied multiple times safely)

## State Management

### Server State

- **strokes**: Array of all strokes on canvas
- **history**: Array of state snapshots for undo/redo
- **historyIndex**: Current position in history
- **users**: Map of connected users

### Client State

- **strokes**: Local copy of canvas state
- **users**: Map of other users
- **userId**: Current user's ID
- **userColor**: Current user's assigned color

### Synchronization Strategy

1. **Initial Sync**: Client receives full state on connection
2. **Incremental Updates**: New segments/strokes are added incrementally
3. **Full Sync**: Undo/redo triggers full state replacement
4. **Conflict Resolution**: Server state is authoritative

## Scalability Considerations

### Current Limitations

- Single server instance (no horizontal scaling)
- In-memory state (lost on server restart)
- No persistence layer

### Potential Improvements

1. **Redis for State**: Store state in Redis for persistence and scaling
2. **Room System**: Implement rooms.js for multiple canvases
3. **Message Batching**: Batch segments to reduce message frequency
4. **Compression**: Compress state updates for large canvases
5. **WebSocket Scaling**: Use Redis adapter for Socket.io across instances

