module.exports = {
  apps: [{
    name: 'hub-generic',
    script: './dist/index.js',
    cwd: '/root/hub-generic',
    env: {
      NODE_ENV: 'production',
      PORT: '5000',
      DATABASE_URL: process.env.DATABASE_URL || 'postgresql://user:password@host:port/database?sslmode=require',
      PROD_DATABASE_URL: process.env.PROD_DATABASE_URL || 'postgresql://user:password@host:port/database?sslmode=require',
      JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_here',
      SESSION_SECRET: process.env.SESSION_SECRET || 'your_session_secret_here',
      FRONTEND_URL: 'http://82.165.196.49',
      CORS_ALLOWED_ORIGINS: 'http://82.165.196.49',
      CALLBACK_URL: 'http://82.165.196.49/api/auth/google/callback',
      MAILCHIMP_API_KEY: process.env.MAILCHIMP_API_KEY || '',
      MAILCHIMP_AUDIENCE_ID: process.env.MAILCHIMP_AUDIENCE_ID || '',
      MAILCHIMP_SERVER: process.env.MAILCHIMP_SERVER || '',
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
      GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
      OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
      DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY || '',
      YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY || '',
      RATE_LIMIT_WINDOW_MS: '900000',
      RATE_LIMIT_MAX_REQUESTS: '100'
    }
  }]
};
