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
```

### Discord Setup

Bot needs `Manage Roles`, `Send Messages`, `Use Slash Commands` permissions. Position bot role above managed roles.

## Features

### Role Management

Manages EVE Frontier activity roles:
- `Exploration` (🟣) - `Industry` (🟡) - `Mining` (🟢) - `PVE` (🟠) - `PVP` (🔴)
- `Nerd` (🔵) - `Hauling` (🟤) - `Market` (💰)

### Intel Management

Store and manage EVE Frontier systems intelligence with a set of management commands.

### Themes

- **Kuvakei**: Sansha's Nation consciousness remnant
- **Triglav**: Triglavian Collective proving trials

## Commands

- `/eve-roles` (Manage your roles for notifications and call outs)
- `/intel` (Manage intelligence reports for rift and ore sites)

#### `/intel` Command

Manage intelligence reports for rift and ore sites.

##### Usage

`/intel <subcommand> [options]`

##### Subcommands

- `/intel list`  
  View current intelligence reports.  
  Options:  
  - `timeout` (integer, optional): Minutes before the report expires (1-10, default: 5)  
  - `pages` (integer, optional): Number of pages to display (1-10, default: 1)  

- `/intel rift`  
  Add a rift intel report.  
  Options:  
  - `type` (string, required): Rift type code  
  - `system` (string, required): System name where the rift is located  
  - `near` (string, optional): What the rift is near (e.g., P1L4)  

- `/intel ore`  
  Add an ore site intel report.  
  Options:  
  - `oretype` (string, required): Type of ore resource (e.g., carbon, metal, common)  
  - `name` (string, required): Name of the ore site (e.g., Carbon Debris Cluster)  
  - `system` (string, required): System name where the ore site is located  
  - `near` (string, optional): What the ore site is near (e.g., P1L4)  

- `/intel del`  
  Delete an intel report.  
  Options:  
  - `type` (string, required): Intel type (`rift` or `ore`)  
  - `id` (string, required): Intel item ID to delete  

##### Example

```plaintext
/intel rift type:RIFT-A system:ZXY-123 near:P1L4
/intel ore oretype:carbon name:Carbon Debris Cluster system:ZXY-123 near:P1L4
/intel list timeout:10 pages:2
/intel del type:ore id:ore-123456789
```

## Configuration Options

### Required

- **`DISCORD_TOKEN`**: Bot token from Discord application configuration panel

### Optional

- **`TRIBE_ROLES`**: Comma-separated list of enabled roles (default: all roles)
- **`RESPONSE_THEME`**: Message theme - `kuvakei` or `triglav` (default: `kuvakei`)
- **`ROLES_COMMAND_NAME`**: Slash command name (default: `eve-roles`)
- TODO: Update this list; for now see example env files

## Development

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
