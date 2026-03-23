# Mizuki

A Discord bot handler built with discord.js.

## Features

- **Hybrid Command System** - Supports both slash commands and message prefix commands
- **Extensible Event Handlers** - Modular event handling system (interactions, messages, client lifecycle)
- **PostgreSQL & Prisma ORM** - Type-safe database access with automatic migrations
- **Redis Integration** - High-performance caching layer for data optimization
- **TypeScript Support** - Fully typed codebase with path aliases for cleaner imports
- **Winston Logger** - Comprehensive logging with daily rotation and multiple transports
- **Anti-Crash Handler** - Graceful error handling and process management

## Prerequisites

- Node.js 18 or higher
- PostgreSQL database
- Redis server

## Installation

1. Clone the repository:
```bash
git clone https://github.com/wtfenzo/Mizuki.git
cd Mizuki
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
TOKEN=your_bot_token
CLIENT_ID=your_bot_id
DATABASE_URL=postgresql://user:password@localhost:5432/mizuki
REDIS_URL=redis://localhost:6379
NODE_ENV=production or development
```

4. Set up the database:
```bash
npx prisma migrate dev
```

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Using PM2
```bash
pm2 start dist/index.js --name mizuki
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Run production build
- `npm run lint:format` - Format code with Biome

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 🍼

## License

MIT

## Author

[wtfenzo](https://github.com/wtfenzo)
