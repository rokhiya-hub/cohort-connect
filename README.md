# CohortConnect

##  Problem Statement

In today's digital age, students and faculty members face significant challenges in staying connected, sharing knowledge, and building meaningful academic relationships. Traditional social media platforms are not tailored for educational environments, leading to several issues:

- **Fragmented Communication**: Students struggle to find reliable sources for academic guidance, mentorship, and peer collaboration
- **Limited Content Discovery**: Educational content gets lost in generic social feeds, making it hard to find relevant study materials
- **Lack of Recognition**: Quality contributions from students and faculty go unnoticed, reducing motivation for knowledge sharing
- **Inefficient Networking**: Connecting with mentors, peers, and faculty members is difficult without a dedicated academic platform
- **Content Creation Barriers**: Creating professional educational content requires specialized skills and tools that many educators lack

##  Description

CohortConnect is a comprehensive social platform specifically designed for students and faculty members to foster academic collaboration, knowledge sharing, and community building. The platform combines social networking features with AI-powered content creation tools, creating an ecosystem where learning and teaching become more engaging and accessible.

### Key Features

- **Smart Feed**: Personalized content feed with posts from students, faculty, and admins
- **AI Studio**: Generate professional posters, videos, captions, and thumbnails using AI
- **Video Platform**: Upload and categorize educational videos with engagement features
- **Leaderboard System**: Gamification through points system for quality contributions
- **Discussion Threads**: Threaded comments and replies on all content
- **Role-Based Access**: Tailored experiences for Students, Faculty, and Admins
- **Mentorship Network**: Connect students with mentors and faculty
- **Content Moderation**: Safe platform with reporting and moderation tools

##  Proposed Solution

CohortConnect addresses the identified problems through:

1. **Unified Academic Platform**: A dedicated space for educational interactions
2. **AI-Powered Content Creation**: Democratizing professional content creation
3. **Gamification**: Encouraging quality contributions through recognition
4. **Structured Networking**: Facilitating meaningful academic connections
5. **Comprehensive Content Management**: Organizing educational materials effectively

##  Requirements

### Functional Requirements

#### User Management
- User registration and authentication with role-based access (Student, Faculty, Admin)
- Profile management with academic information
- Secure password handling and session management

#### Content Management
- Post creation with text, images, and videos
- Video upload and categorization system
- Content moderation and reporting system
- Saved posts functionality

#### Social Features
- Like, save, and share functionality
- Threaded commenting system on posts and videos
- User connections and networking
- Real-time messaging system

#### AI Features
- Poster generation using AI
- Video generation using Manim
- Caption and thumbnail generation
- Content categorization

#### Gamification
- Points system for user engagement
- Leaderboard with weekly/monthly rankings
- Achievement tracking

### Non-Functional Requirements

#### Performance
- Response time < 2 seconds for most operations
- Support for concurrent users
- Efficient media handling and streaming

#### Security
- JWT-based authentication
- Input validation and sanitization
- Role-based access control
- Content moderation

#### Usability
- Responsive design for mobile and desktop
- Intuitive user interface
- Accessibility compliance

## 🛠 Technologies Used

### Frontend
- **React 19.2.5**: Modern JavaScript library for building user interfaces
- **Vite 8.0.10**: Fast build tool and development server
- **React Router 7.15.0**: Declarative routing for React
- **Axios 1.16.0**: HTTP client for API requests
- **Tailwind CSS 4.2.4**: Utility-first CSS framework
- **React Context**: State management for authentication

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js 4.18.2**: Web application framework
- **MongoDB**: NoSQL database with Mongoose ODM
- **JWT 9.0.2**: JSON Web Tokens for authentication
- **bcryptjs 2.4.3**: Password hashing
- **Multer 1.4.5**: File upload handling
- **Express Validator 7.0.1**: Input validation

### AI/ML Services
- **Python Flask 3.0.3**: Micro web framework for AI services
- **Manim 0.20.1**: Mathematical animation engine for video generation
- **Pillow 11.0.0**: Image processing library
- **NumPy 2.1.0**: Numerical computing library

### Development Tools
- **ESLint**: Code linting and formatting
- **Nodemon**: Auto-restart for development
- **CORS**: Cross-origin resource sharing
- **Dotenv**: Environment variable management

## 🏗 System Architecture

### Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   AI Service    │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (Python)      │
│                 │    │                 │    │                 │
│ - Components    │    │ - API Routes    │    │ - Manim         │
│ - Pages         │    │ - Controllers   │    │ - Generators    │
│ - Context       │    │ - Models        │    │ - Flask API     │
│ - Utils         │    │ - Middleware    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Database      │
                    │   (MongoDB)     │
                    └─────────────────┘
```

### Component Breakdown

#### Frontend Architecture
- **Pages**: Route-based components (Feed, Profile, Leaderboard, etc.)
- **Components**: Reusable UI elements (PostCard, VideoCard, CommentSection, etc.)
- **Context**: Global state management (AuthContext)
- **Utils**: Helper functions and API client

#### Backend Architecture
- **Routes**: API endpoint definitions organized by feature
- **Models**: MongoDB schemas for data modeling
- **Middleware**: Authentication, validation, and error handling
- **Utils**: Business logic and helper functions

#### Database Schema
- **Users**: Profile information, roles, points, connections
- **Posts**: Content, media, engagement metrics
- **Videos**: Video metadata, categories, engagement
- **Comments**: Threaded discussions on posts and videos
- **Reports**: Content moderation system

##  In Scope

### Core Features
- User registration and authentication
- Post creation and interaction (like, save, comment)
- Video upload and management
- AI-powered content generation
- Leaderboard and points system
- User connections and messaging
- Content moderation and reporting

### User Roles
- **Students**: Create posts, upload videos, participate in discussions, earn points
- **Faculty**: All student features plus mentorship capabilities
- **Admins**: All features plus moderation and management tools

### Content Types
- Text posts with optional media
- Educational videos with categorization
- AI-generated posters and thumbnails
- Automated captions and descriptions

##  Out of Scope

### Current Limitations
- Real-time messaging (WebSocket implementation)
- Advanced video streaming (CDN integration)
- Mobile native apps (React Native/PWA only)
- Advanced analytics and insights
- Integration with external LMS systems
- Multi-language support
- Advanced AI features (voice cloning, advanced video editing)

### Future Considerations
- Third-party integrations (Google Classroom, Canvas, etc.)
- Advanced search and recommendation algorithms
- Live streaming capabilities
- Advanced moderation with AI content detection
- Monetization features for premium content

##  Future Enhancements

### Phase 2 Features
- **Real-time Chat**: WebSocket-based messaging system
- **Advanced AI**: Voice synthesis, advanced video editing
- **Analytics Dashboard**: User engagement and content performance metrics
- **Mobile Apps**: Native iOS and Android applications
- **Integration APIs**: Connect with external educational platforms

### Phase 3 Features
- **Virtual Classrooms**: Live video conferencing and screen sharing
- **Assignment Management**: Create and grade assignments
- **Certification System**: Issue certificates for completed courses
- **Marketplace**: Buy/sell educational content and services
- **Global Expansion**: Multi-language support and internationalization

### Technical Improvements
- **Performance Optimization**: CDN integration, caching strategies
- **Scalability**: Microservices architecture, container orchestration
- **Security Enhancements**: Advanced threat detection, encryption
- **Accessibility**: WCAG 2.1 AA compliance, screen reader support

##  Conclusion

CohortConnect represents a comprehensive solution to the challenges faced by modern educational communities. By combining social networking with AI-powered content creation tools, the platform creates an engaging environment where students and faculty can collaborate effectively.

### Key Achievements
- **Unified Platform**: Single destination for all academic interactions
- **AI Integration**: Democratizing professional content creation
- **Gamification**: Encouraging quality contributions through recognition
- **Scalable Architecture**: Modular design supporting future enhancements
- **User-Centric Design**: Intuitive interface tailored for educational use

### Impact
- **Students**: Better access to mentorship, resources, and peer collaboration
- **Faculty**: Enhanced ability to share knowledge and engage with students
- **Institutions**: Improved academic community engagement and knowledge sharing
- **Education**: More accessible and interactive learning experiences

### Next Steps
The platform provides a solid foundation for future educational technology innovations. With planned enhancements focusing on real-time collaboration, advanced AI features, and expanded integrations, CohortConnect is positioned to become a leading platform in educational technology.

---

##  Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- Python 3.8+
- FFmpeg (for video processing)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/cohort-connect.git
   cd cohort-connect
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Configure your environment variables
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. **AI Service Setup**
   ```bash
   cd ../manim-service
   pip install -r requirements.txt
   python app.py
   ```

### Usage

1. Open your browser and navigate to `http://localhost:5173`
2. Register as a new user or login with existing credentials
3. Start exploring the platform features

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with love for students, by students**