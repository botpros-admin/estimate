# Estimate Generator

A professional paint estimating application with Bitrix24 CRM integration.

## Features

- Multi-step estimate creation workflow
- Photo capture and annotation
- Surface area calculations
- Custom pricing engine
- Contract generation
- Bitrix24 CRM integration
- Mobile-responsive design

## Project Structure

```
├── components/     # React-style components
├── css/           # Stylesheets
├── data/          # JSON data files
├── hooks/         # Custom React hooks
├── img/           # Images and icons
├── js/            # JavaScript modules
├── pages/         # HTML pages
├── server/        # Node.js server with Bitrix integration
└── styles/        # Additional stylesheets
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone this repository:
```bash
git clone https://github.com/botpros-admin/estimate.git
cd estimate
```

2. Install server dependencies:
```bash
cd server
npm install
```

### Running Locally

Start the development server:

```bash
cd server
npm start
```

The application will be available at `http://localhost:8080`

### Available Scripts

In the server directory:

- `npm start` - Start the basic server
- `npm run start:api` - Start server with API endpoints
- `npm run start:bitrix` - Start server with Bitrix integration

## Configuration

### Bitrix24 Integration

To enable Bitrix24 integration, update the webhook URL in:
- `server/bitrix/config.js`

## Technologies Used

- Vanilla JavaScript (ES6+)
- Node.js
- Express.js
- HTML5/CSS3
- Bitrix24 REST API

## License

Private repository - All rights reserved
