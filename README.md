# Sansha's Helper

A Discord bot for EVE Frontier role management with thematic messaging. Built with TypeScript and Discord.js.

## Quick Start

### Prerequisites

- Node.js 18+ 
- Discord application and bot token

### Setup

1. **Install:**
   ```bash
   git clone https://github.com/tsal/sanshas-helper.git
   cd sanshas-helper
   npm install
   ```

2. **Configure:**
   ```bash
   cp local-example.env .env
   # Edit .env with your bot token
   ```

3. **Run:**
   ```bash
   npm run dev
   ```

## Configuration

### Environment Variables

```bash
DISCORD_TOKEN=your_bot_token

# Optional configurations
TRIBE_ROLES=Exploration,PVP,Mining     # Limit available roles
RESPONSE_THEME=kuvakei                 # Message theme: kuvakei|triglav  
ROLES_COMMAND_NAME=eve-roles           # Slash command name
```

### Discord Setup

Bot needs `Manage Roles`, `Send Messages`, `Use Slash Commands` permissions. Position bot role above managed roles.

## Features

### Role Management

Manages EVE Frontier activity roles:
- `Exploration` (🟣) - `Industry` (🟡) - `Mining` (🟢) - `PVE` (🟠) - `PVP` (🔴)

### Themes

- **Kuvakei**: Sansha's Nation consciousness remnant
- **Triglav**: Triglavian Collective proving trials

### Commands

- Default: `/eve-roles` (configurable via `ROLES_COMMAND_NAME`)

## Configuration Options

### Required

- **`DISCORD_TOKEN`**: Bot token from Discord application configuration panel

### Optional

- **`TRIBE_ROLES`**: Comma-separated list of enabled roles (default: all roles)
- **`RESPONSE_THEME`**: Message theme - `kuvakei` or `triglav` (default: `kuvakei`)
- **`ROLES_COMMAND_NAME`**: Slash command name (default: `eve-roles`)

## Development

### Project Structure

```
src/
├── config/          # Bot configuration and environment parsing
├── discord/         # Discord.js integration and role management  
├── frontier/        # EVE Frontier role definitions
├── kuvakei/         # Thematic messaging system
└── index.ts         # Bot entry point
```

### Testing

Run the full test suite:
```bash
npm test
```

All role management, configuration parsing, and core functionality is covered by unit tests.

### Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality  
4. Ensure all tests pass: `npm test`
5. Submit a pull request

## License

MIT License - see LICENSE file for details
