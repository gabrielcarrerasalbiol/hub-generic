# RealMadrid Hub Architecture

## Overview

RealMadrid Hub is a content aggregation platform that collects and displays Real Madrid-related content from various sources (YouTube, Twitter, TikTok, Instagram). The application uses a modern web stack with a React frontend and Express backend, connected to a PostgreSQL database through Drizzle ORM.

The system provides features for browsing, categorizing, and favoriting Real Madrid-related videos across different platforms, with AI-powered content classification for better organization and search.

## System Architecture

The application follows a client-server architecture with clearly separated concerns:

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Client    │◄──────►   Server    │◄──────►  Database   │
│   (React)   │       │  (Express)  │       │ (PostgreSQL)│
└─────────────┘       └─────────────┘       └─────────────┘
                            │
                            ▼
                     ┌─────────────┐
                     │  External   │
                     │    APIs     │
                     └─────────────┘
```

### Directory Structure

```
/
├── client/                # Frontend React application
│   ├── src/               # Frontend source code
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utility functions
│   │   └── hooks/         # Custom React hooks
├── server/                # Backend Express application
│   ├── api/               # API integration modules
│   └── routes.ts          # API route definitions
├── shared/                # Shared code between client and server
│   └── schema.ts          # Database schema and types
└── [config files]         # Various configuration files
```

## Key Components

### Frontend (React)

The frontend is built with React and follows a component-based architecture with separation of concerns:

- **Pages**: Container components for different routes
- **Components**: Reusable UI components
- **Hooks**: Custom React hooks for shared functionality
- **UI Components**: Shadcn UI library components for consistent design
- **Query Client**: React Query for data fetching and caching

The frontend uses:
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React Query** for data fetching
- **Wouter** for routing
- **Shadcn UI** (via Radix UI primitives) for UI components

### Backend (Express)

The backend is built with Express and TypeScript, structured around:

- **API Routes**: Defined in `server/routes.ts`
- **API Integrations**: Services for third-party platforms (YouTube, Twitter, TikTok)
- **Storage Interface**: Database abstraction layer
- **AI Services**: Content classification using various AI services

The backend handles:
- API requests from the frontend
- Authentication and authorization
- External API communication
- Database operations
- Content classification via AI services

### Database

The application uses PostgreSQL (via NeonDB's serverless offering) with Drizzle ORM for database operations. The schema includes:

- **Users**: User accounts with authentication information
- **Videos**: Video content with metadata from various platforms
- **Channels**: Content creator channels with metadata
- **Categories**: Content categories for classification
- **Favorites**: User favorite content mapping

### API Integrations

The application integrates with multiple external APIs:

1. **YouTube API**: For fetching video content and channel information
2. **Twitter API**: For fetching tweets with video content
3. **TikTok API**: For fetching TikTok videos
4. **AI Services**:
   - Anthropic Claude for content classification
   - Google Gemini for content enhancement and search

## Data Flow

### Content Aggregation Flow

1. Backend services fetch content from external APIs (YouTube, Twitter, TikTok)
2. Content is processed and normalized to a common schema
3. AI services classify content into relevant categories
4. Content is stored in the database
5. Frontend displays the content with appropriate categorization

### User Interaction Flow

1. User browses content on the frontend
2. User can filter content by platform or category
3. User can favorite content, which is stored in the database
4. User can view detailed content and related content

## External Dependencies

### Frontend Dependencies
- React
- TanStack React Query
- Tailwind CSS
- Shadcn UI (via Radix UI primitives)
- Wouter (for routing)

### Backend Dependencies
- Express
- Drizzle ORM
- Anthropic Claude SDK
- Google Generative AI SDK
- NeonDB Serverless Client

### Development Dependencies
- TypeScript
- Vite
- ESBuild
- Zod (for schema validation)

## Database Schema

The database schema consists of:

1. **Users**:
   - id (PK)
   - username
   - password

2. **Videos**:
   - id (PK)
   - title
   - description
   - thumbnailUrl
   - videoUrl
   - embedUrl
   - platform
   - channelId
   - channelTitle
   - channelThumbnail
   - viewCount
   - duration
   - publishedAt
   - categoryIds
   - externalId

3. **Channels**:
   - id (PK)
   - title
   - description
   - thumbnailUrl
   - bannerUrl
   - platform
   - externalId
   - subscriberCount
   - videoCount

4. **Categories** (implied from code)
5. **Favorites** (implied from code)

## Deployment Strategy

The application is configured for deployment on Replit's platform, with:

- Vite for frontend bundling
- ESBuild for backend bundling
- Configuration for Replit's Cloud Run deployment
- Automatic dependency installation
- Port configuration for hosting

The deployment process includes:
1. Building the frontend with Vite
2. Bundling the backend with ESBuild
3. Serving the static assets and API from a single Node.js process

## Authentication and Authorization

The application includes a simplified authentication system with:
- User registration and login
- Demo user creation for testing
- Session management for authenticated requests

## AI Content Classification

The application leverages multiple AI services for content classification:

1. **Anthropic Claude**: Used for deep content analysis and classification
2. **Google Gemini**: Used as an alternative for content classification

The AI services analyze video titles and descriptions to:
- Categorize content into relevant categories
- Determine relevance to Real Madrid
- Provide confidence scores for classifications

This enhances the user experience by providing better organization and filtering options for content.