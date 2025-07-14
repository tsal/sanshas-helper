# Sansha's Helper

A Discord bot for EVE Frontier role management with a Sansha's Nation thematic twist. Built with TypeScript and Discord.js.

## Quick Start

### Prerequisites

- Node.js 18+ 
- A Discord application and bot token
- TypeScript knowledge for customization

### Local Development

1. **Clone and install dependencies:**
   ```bash
   git clone https://github.com/tsal/sanshas-helper.git
   cd sanshas-helper
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp local-example.env .env
   # Edit .env with your Discord bot credentials
   ```

3. **Configure your Discord bot:**
   - Go to https://discord.com/developers/applications
   - Create a new application or use existing one
   - Copy Bot Token to your `.env`
   - Enable the following bot permissions: `Manage Roles`, `Send Messages`, `Use Slash Commands`

4. **Run in development:**
   ```bash
   npm run dev
   ```

5. **Run tests:**
   ```bash
   npm test
   ```

## Configuration

### Environment Variables

Set these in your environment:

```bash
DISCORD_TOKEN=your_bot_token

# Optional: Limit available roles (comma-separated)
TRIBE_ROLES=Exploration,PVP,Mining
```

### Discord Setup

1. **Role positioning**: If you edit your server roles, do not change the names and ensure the bot's role is positioned above the roles it will manage in your server's role hierarchy

2. **Test the slash command**: `/eve-roles` should show role selection buttons

The bot will automatically create the following roles as needed:
- `Exploration` (Purple: #EB459E)
- `Industry` (Yellow: #FEE75C) 
- `Mining` (Green: #57F287)
- `PVE` (Orange: #F97316)
- `PVP` (Red: #ED4245)

### Role Selection

Control which roles are available by setting `TRIBE_ROLES`:

```bash
# Enable all roles (default)
# TRIBE_ROLES=

# Enable specific roles only
TRIBE_ROLES=Exploration,PVP,Mining

# Enable single role
TRIBE_ROLES=PVP
```

### Customization

- **Thematic messages**: Edit `src/kuvakei/messages.ts`
- **Role colors**: Modify `src/discord/roles.ts` emoji mappings
- **Auto-deletion timing**: Change timeout in `handleRoleToggle` function

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
