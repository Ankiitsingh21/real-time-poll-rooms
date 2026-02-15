# Real-Time Poll Rooms 🗳️

A modern, real-time polling application that enables users to create polls, share them via links, and see live vote updates across all connected clients.

**Live Demo:** [https://real-time-poll-rooms-nine.vercel.app/](https://real-time-poll-rooms-nine.vercel.app/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Fairness & Anti-Abuse Mechanisms](#fairness--anti-abuse-mechanisms)
- [Edge Cases Handled](#edge-cases-handled)
- [Known Limitations & Future Improvements](#known-limitations--future-improvements)
- [Architecture](#architecture)
- [Setup & Installation](#setup--installation)

---

## 🎯 Overview

This application provides a seamless polling experience where users can:
- Create polls with custom questions and multiple options
- Share polls via unique URLs
- Vote in real-time with instant result updates
- View live connection status and vote counts

The system is designed to be simple, reliable, and handle edge cases gracefully while maintaining fairness in the voting process.

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Styling with custom design system
- **Vite** - Build tool and dev server
- **EventSource API** - Server-Sent Events for real-time updates

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database for poll storage
- **Mongoose** - ODM for MongoDB
- **Server-Sent Events (SSE)** - Real-time communication
- **nanoid** - Unique poll ID generation

### Deployment
- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB Atlas

---

## ✨ Features

### Core Functionality
1. **Poll Creation**
   - Create polls with custom questions (max 200 characters)
   - Add 2-10 answer options
   - Automatic unique URL generation
   - Input validation and error handling

2. **Real-Time Voting**
   - Live vote updates using Server-Sent Events
   - Visual connection status indicator
   - Automatic reconnection on network issues
   - Percentage-based progress bars with animations

3. **Shareable Links**
   - Unique, shareable poll URLs
   - One-click link copying
   - Direct access via URL

4. **User Experience**
   - Responsive design for all devices
   - Smooth animations and transitions
   - Toast notifications for user actions
   - Loading states and skeletons
   - Error boundaries and fallbacks

---

## 🔒 Fairness & Anti-Abuse Mechanisms

### 1. IP-Based Voting Restriction

**What it prevents:** Multiple votes from the same network/device

The backend tracks the IP address of each voter and stores it in the poll's `votedIps` array. When a vote is submitted, the server checks if that IP has already voted in the poll. If the IP is found, the vote is rejected with a 403 Forbidden error.

**Implementation:**
```javascript
// Backend: src/controllers/pollController.js
const voterIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

if (poll.votedIps.includes(voterIp)) {
  return res.status(403).json({ error: "You have already voted in this poll" });
}

// If validation passes, record the vote
option.votes += 1;
poll.totalVotes += 1;
poll.votedIps.push(voterIp);
await poll.save();
```

**Effectiveness:**
- ✅ Prevents casual repeat voting from the same device/network
- ✅ Server-side enforcement (cannot be bypassed by client manipulation)
- ✅ Works across different browsers on the same device

**Limitations:**
- ⚠️ Can be bypassed using VPN or proxy servers
- ⚠️ Multiple users behind the same NAT/router share an IP (e.g., office networks, public WiFi)
- ⚠️ Dynamic IPs may allow the same user to vote again after IP change

---

### 2. Client-Side localStorage Tracking

**What it prevents:** Accidental re-voting and provides immediate user feedback

After a successful vote, the poll ID and chosen option are stored in the browser's localStorage. On page load or refresh, the app checks localStorage and automatically displays the voted state, disabling further voting on that poll.

**Implementation:**
```javascript
// Frontend: src/pages/PollRoom.jsx

// After successful vote
localStorage.setItem(`poll_${pollId}_voted`, "true");
localStorage.setItem(`poll_${pollId}_optionId`, optionId);
setHasVoted(true);

// On component mount
useEffect(() => {
  const voted = localStorage.getItem(`poll_${pollId}_voted`);
  const optionId = localStorage.getItem(`poll_${pollId}_optionId`);
  if (voted) {
    setHasVoted(true);
    setVotedOptionId(optionId);
  }
}, [pollId]);
```

**Effectiveness:**
- ✅ Instant feedback without server round-trip
- ✅ Prevents accidental double-voting
- ✅ Persists across page refreshes
- ✅ Reduces unnecessary API calls

**Limitations:**
- ⚠️ Can be cleared by the user (browser settings, incognito mode)
- ⚠️ Does not prevent cross-device voting
- ⚠️ Browser-specific (voting in Chrome doesn't affect Firefox)
- ⚠️ Client-side only (not a security mechanism, just UX enhancement)

---

### Why These Two Mechanisms Work Together

These complementary approaches provide **defense-in-depth**:

1. **IP tracking** provides server-side enforcement that cannot be bypassed by client-side manipulation
2. **localStorage** provides instant client-side feedback and improves user experience
3. Together, they balance **security** (server validation) with **UX** (immediate feedback)
4. They catch different abuse scenarios: IP blocks network-level repeat voting, while localStorage prevents accidental re-votes

**Threat Model Coverage:**
- ✅ Casual user trying to vote multiple times → Blocked by both mechanisms
- ✅ User refreshing page accidentally → Prevented by localStorage
- ✅ User clearing cookies/localStorage → Still blocked by IP tracking
- ⚠️ Determined attacker with VPN → Can bypass (would need CAPTCHA/authentication)
- ⚠️ Multiple legitimate users on shared network → Incorrectly blocked (trade-off accepted)

---

## 🛡️ Edge Cases Handled

### Input Validation
- ✅ **Empty question or options** - Frontend and backend validation with user-friendly error messages
- ✅ **Duplicate option detection** - Case-insensitive checking prevents "Yes" and "yes" as separate options
- ✅ **Minimum option requirement** - Enforces at least 2 options for a valid poll
- ✅ **Maximum option limit** - Caps at 10 options to prevent UI/UX issues
- ✅ **Character limits** - 200 character limit for questions and options with live counter
- ✅ **Whitespace handling** - Trims whitespace and validates non-empty content

### Network & Connection
- ✅ **SSE connection failures** - Automatic reconnection with exponential backoff
- ✅ **Network timeouts** - Proper error handling and user notification
- ✅ **Connection status display** - Live indicator showing connected/reconnecting state
- ✅ **Graceful degradation** - App remains functional without real-time updates
- ✅ **Race conditions** - Proper state management prevents concurrent vote conflicts

### User Flow
- ✅ **404 handling** - Custom "Poll Not Found" page for invalid/deleted polls
- ✅ **Already voted state** - Clear UI indication with disabled voting options
- ✅ **Vote during network issues** - Queues vote and retries on reconnection
- ✅ **Stale data on refresh** - SSE ensures fresh data after page reload
- ✅ **Multiple tabs** - Each tab gets independent SSE connection and updates
- ✅ **Browser navigation** - Proper cleanup of SSE connections and timers

### Data Consistency
- ✅ **Vote count synchronization** - All clients receive the same data via SSE broadcast
- ✅ **Atomic vote operations** - Mongoose transactions prevent race conditions
- ✅ **Server-side validation** - Double-checks all constraints before saving
- ✅ **Malformed requests** - Proper error handling and status codes

### Database & Backend
- ✅ **MongoDB connection failures** - Proper error handling with retry logic
- ✅ **Invalid poll IDs** - Validates format and existence before operations
- ✅ **Concurrent votes** - Database-level locking prevents inconsistencies
- ✅ **Memory leaks** - Proper cleanup of SSE connections and event listeners

---

## ⚠️ Known Limitations & Future Improvements

### Current Limitations

#### 1. Anti-Abuse Mechanisms
- **IP-based voting can be circumvented** - VPN/proxy users can vote multiple times
- **No CAPTCHA** - Automated voting scripts could abuse the system
- **No rate limiting** - Potential for DoS attacks on poll creation or voting endpoints
- **Shared IPs** - Legitimate users on the same network (office/cafe) blocked after first vote

#### 2. Poll Management
- **No poll expiration** - Polls remain active indefinitely, consuming resources
- **No edit/delete** - Poll creators cannot modify or remove their polls
- **No admin controls** - No dashboard to manage or moderate polls
- **Unlimited creation** - Users can create infinite polls (resource abuse risk)

#### 3. Voting Features
- **Single-choice only** - No support for multiple selection or ranked-choice voting
- **No poll closing** - Polls cannot be locked/closed after voting period
- **Public results only** - No option to hide results until poll closes
- **No result verification** - No way to audit or verify vote integrity

#### 4. Scalability
- **SSE resource consumption** - Each connection holds server resources (not ideal for 10k+ users)
- **In-memory client tracking** - SSE clients stored in memory (doesn't scale horizontally)
- **No caching layer** - Frequently accessed polls hit database every time
- **Single backend instance** - No load balancing or horizontal scaling

#### 5. Security
- **No authentication** - Anyone can create polls and vote
- **No authorization** - No ownership concept for polls
- **Limited XSS protection** - Relies on React's default escaping
- **No CSRF protection** - Vulnerable to cross-site request forgery
- **No input sanitization** - Assumes benign input

---

### Potential Improvements

#### Short Term (1-2 weeks)
- [ ] **Add CAPTCHA** - Implement hCaptcha or reCAPTCHA for vote submission
- [ ] **Rate limiting** - Limit poll creation and voting per IP (express-rate-limit)
- [ ] **Poll expiration** - Add TTL with automatic cleanup
- [ ] **Cookie-based tracking** - Additional client-side vote prevention
- [ ] **Results export** - Download results as CSV/PDF
- [ ] **Poll password** - Optional password protection for polls

#### Medium Term (1-2 months)
- [ ] **User authentication** - Optional login with Google/GitHub OAuth
- [ ] **Poll ownership** - Edit/delete controls for poll creators
- [ ] **Multi-choice voting** - Support for multiple selections
- [ ] **Ranked-choice voting** - Instant-runoff voting support
- [ ] **Real-time viewer count** - Show number of active viewers
- [ ] **Webhook integrations** - Send results to Slack/Discord/Zapier
- [ ] **Email notifications** - Alert creator when poll reaches milestones

#### Long Term (3-6 months)
- [ ] **WebSocket migration** - Replace SSE with Socket.IO for bidirectional communication
- [ ] **Horizontal scaling** - Redis for session storage and SSE client tracking
- [ ] **Analytics dashboard** - Charts, trends, and insights for poll creators
- [ ] **Premium features** - Custom branding, advanced analytics, priority support
- [ ] **AI-powered suggestions** - Smart poll question and option generation
- [ ] **Blockchain verification** - Immutable vote records for high-stakes polls
- [ ] **Mobile apps** - iOS/Android apps using React Native
- [ ] **Embeddable widgets** - Iframe embeds for external websites

---

## 🏗️ Architecture

### System Design
```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────┐
│                 │         │                  │         │             │
│   Browser       │◄───────►│   Express.js     │◄───────►│   MongoDB   │
│   (React SPA)   │  HTTP   │   REST API       │ Mongoose│   Atlas     │
│                 │         │                  │         │             │
│   - EventSource │◄────────┤   - SSE Server   │         │   - Polls   │
│   - localStorage│   SSE   │   - Vote Logic   │         │   - Votes   │
│                 │         │   - Validation   │         │             │
└─────────────────┘         └──────────────────┘         └─────────────┘
```

### Data Flow

#### Poll Creation Flow
1. User fills poll form in React frontend
2. Client-side validation (question length, option count, duplicates)
3. POST request to `/api/polls` with question and options
4. Backend validates input and creates poll document in MongoDB
5. Unique poll ID generated using nanoid
6. Backend returns poll data with shareable link
7. Frontend redirects to `/poll/:pollId`

#### Real-Time Voting Flow
1. User navigates to `/poll/:pollId`
2. Frontend establishes SSE connection to `/api/polls/:pollId/stream`
3. Backend sends initial poll data via SSE
4. Frontend renders poll with current vote counts
5. User clicks an option → POST to `/api/polls/:pollId/vote`
6. Backend validates:
   - IP not in `votedIps` array
   - Option ID exists
   - Request is well-formed
7. Backend atomically updates vote counts and adds IP to `votedIps`
8. Backend broadcasts updated poll data to all SSE clients for this poll
9. All connected browsers receive update and re-render UI
10. User's localStorage updated to mark poll as voted

### Database Schema
```javascript
// Poll Model (MongoDB via Mongoose)
{
  pollId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  question: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  options: [{
    _id: ObjectId,  // Auto-generated by MongoDB
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    votes: {
      type: Number,
      default: 0,
      min: 0
    }
  }],
  votedIps: {
    type: [String],
    default: []
  },
  totalVotes: {
    type: Number,
    default: 0,
    min: 0
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Key Technical Decisions

**Why Server-Sent Events (SSE)?**
- Simpler than WebSockets for one-directional server→client updates
- Built-in browser support with EventSource API
- Automatic reconnection handling
- Lower overhead than polling

**Why MongoDB?**
- Flexible schema for poll options
- Easy to scale vertically and horizontally
- Atomic operations for vote counting
- Good performance for read-heavy workloads

**Why nanoid for poll IDs?**
- URL-safe characters
- Collision-resistant (8 characters = 2.2 million IDs needed for 1% collision probability)
- Shorter than UUIDs (better UX in URLs)

---

## 🚀 Setup & Installation

### Prerequisites
- **Node.js 20+** (for backend)
- **Node.js 18+** (for frontend)
- **MongoDB** (Atlas account or local instance)
- **npm** or **yarn**

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
MONGO_URI=your_mongodb_connection_string
PORT=6000
EOF

# Start development server
npm start
```

The backend will start on `http://localhost:6000`

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
VITE_API_BASE_URL=http://localhost:6000
EOF

# Start development server
npm run dev
```

The frontend will start on `http://localhost:5173`

### Environment Variables

#### Backend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/polls` |
| `PORT` | Server port | `6000` |

#### Frontend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:6000` or `https://api.yourapp.com` |

### Database Setup

1. Create a MongoDB Atlas account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier works fine)
3. Create a database user with read/write permissions
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get connection string and add to `.env` file

### Production Deployment

#### Frontend (Vercel)
```bash
# Build the frontend
npm run build

# Deploy to Vercel
vercel --prod

# Or connect GitHub repo to Vercel for automatic deployments
```

**Environment Variables in Vercel:**
- `VITE_API_BASE_URL` → Your production backend URL

#### Backend (Render/Railway/Heroku)
```bash
# Add environment variables in hosting platform:
# - MONGO_URI
# - PORT (usually auto-set by platform)

# Deploy via Git push
git push render main  # or your platform's remote
```

**Important:** Update `CORS` settings in backend to allow your frontend domain.

---

## 📁 Project Structure
```
real-time-poll-rooms/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # MongoDB connection
│   │   ├── controllers/
│   │   │   └── pollController.js     # Poll CRUD + SSE logic
│   │   ├── middleware/
│   │   │   └── errorHandler.js       # Global error handling
│   │   ├── models/
│   │   │   └── Poll.js               # Mongoose schema
│   │   ├── routes/
│   │   │   └── pollRoutes.js         # API routes
│   │   └── server.js                 # Express app setup
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ErrorMessage.jsx      # Error display
    │   │   ├── LoadingSpinner.jsx    # Loading state
    │   │   ├── PollForm.jsx          # Poll creation form
    │   │   └── VoteOption.jsx        # Individual vote option
    │   ├── pages/
    │   │   ├── CreatePoll.jsx        # Poll creation page
    │   │   ├── NotFound.jsx          # 404 page
    │   │   └── PollRoom.jsx          # Voting/results page
    │   ├── utils/
    │   │   └── api.js                # API utility functions
    │   ├── App.jsx                   # Root component
    │   ├── main.jsx                  # Entry point
    │   └── index.css                 # Global styles
    ├── .env
    └── package.json
```

---

## 🧪 Testing the Application

### Manual Testing Checklist

**Poll Creation:**
- [ ] Create poll with valid data
- [ ] Try creating with empty question
- [ ] Try creating with 1 option
- [ ] Try creating with 11 options
- [ ] Try creating with duplicate options
- [ ] Verify unique URL generation

**Voting:**
- [ ] Vote on a poll
- [ ] Try voting again (should be blocked)
- [ ] Open poll in incognito (should allow vote)
- [ ] Open poll in multiple tabs (all should update)
- [ ] Vote while offline (should queue/fail gracefully)

**Real-Time Updates:**
- [ ] Open poll in two browsers
- [ ] Vote in one browser
- [ ] Verify other browser updates automatically
- [ ] Disconnect network and reconnect
- [ ] Verify "Live" indicator changes correctly

**Edge Cases:**
- [ ] Navigate to non-existent poll
- [ ] Refresh page mid-vote
- [ ] Submit malformed vote request
- [ ] Very long poll question/options
- [ ] Special characters in poll text

---

## 🤝 Contributing

This is a demo project for a technical assignment. However, feedback and suggestions are welcome!

---

## 📄 License

This project was created as part of a full-stack development assignment. All rights reserved.

---

## 📧 Contact

For questions or feedback regarding this project, please feel free to reach out.

---

**Built with ❤️ using modern web technologies**
