# Board Game Borrow Knowledge Base

## Purpose
This knowledge base centralizes all technical and operational knowledge for the BoardGameBorrow project, ensuring consistency and clarity across development.

## How to Use This Knowledge Base

1. **Start Here**: Review the [technical_architecture.md](docs/technical_architecture.md) to understand the overall system.
2. **Development Steps**: Follow the [developer_instructions.md](docs/developer_instructions.md) for task breakdown and step-by-step guidance.
3. **APIs & Data**: Check [api_integrations.md](docs/api_integrations.md) and [data_modeling.md](docs/data_modeling.md) for handling backend integrations and database setups.
4. **Contributions**: Use the [CONTRIBUTING.md](CONTRIBUTING.md) file to learn how to submit documentation updates.

## Key Documentation Files

### 📄 [Technical Architecture](docs/technical_architecture.md)
- Overview of the app's tech stack (React, Firebase, TailwindCSS)
- File structure explanation
- State management overview (React Context, Firebase Realtime DB)

### 📄 [Onboarding Implementation](docs/onboarding_implementation.md)
- Step-by-step breakdown of the current onboarding system
- Component walkthrough (WelcomeModal, AddressOnboardingModal, etc.)
- Progress tracking logic explained

### 📄 [Developer Instructions](docs/developer_instructions.md)
- Task breakdown for autonomous agent Cline
- Clear task priority structure
- References to the MCP server and alternatives

### 📄 [Data Modeling](docs/data_modeling.md)
- Firebase collections (users, games, connections)
- Security rules overview

### 📄 [API Integrations](docs/api_integrations.md)
- BoardGameGeek API setup and integration
- SendGrid email setup

## Directory Structure

```
boardgameborrow/              # Project root
├── src/                      # Application source code
├── server/                   # Backend services
├── public/                   # Static assets
└── knowledgebase/           # Project documentation
    ├── README.md                # Overview and index
    ├── docs/                    # Documentation files
    │   ├── technical_architecture.md    # System architecture
    │   ├── onboarding_implementation.md # Onboarding system
    │   ├── developer_instructions.md    # Development guide
    │   ├── data_modeling.md            # Database structure
    │   └── api_integrations.md         # API documentation
    ├── assets/                 # Visual aids, diagrams, screenshots
    │   └── architecture_diagram.png    # System architecture diagram
    ├── CHANGELOG.md           # Record of documentation changes
    └── CONTRIBUTING.md       # Guidelines for contributing
```

## Visual Aids
Diagrams, architecture flowcharts, and system models are stored in the `/assets/` directory.

## Best Practices
- Keep documentation modular and up-to-date
- Use Markdown for consistency
- Reference the CHANGELOG.md for all major documentation updates

## Future Migration: Moving to Google Drive

Should the knowledge base transition to Google Drive in the future:
1. Maintain the same folder structure for consistency
2. Convert Markdown files to Google Docs
3. Share appropriate permissions and ensure restricted access for sensitive data

## Getting Started

1. Start with the [Technical Architecture](docs/technical_architecture.md) for a high-level overview
2. Review the [Onboarding Implementation](docs/onboarding_implementation.md) for user flow details
3. Follow [Developer Instructions](docs/developer_instructions.md) for setup and development
