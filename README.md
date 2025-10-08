# curl2httpie

A command-line tool that converts curl commands to HTTPie syntax. It reads the curl command from your clipboard and puts the converted HTTPie command back into your clipboard.

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/curl2httpie.git

# Navigate to the project directory
cd curl2httpie

# Install dependencies
npm install

# Install globally (optional)
npm install -g .
```

## Usage

1. Copy a curl command to your clipboard
2. Run the tool:
   ```bash
   curl2httpie
   ```
3. The converted HTTPie command will be placed in your clipboard

### Example

Original curl command:
```bash
curl -X POST "https://api.example.com/data" -H "Content-Type: application/json" -d '{"key": "value"}'
```

Will be converted to HTTPie syntax:
```bash
http POST https://api.example.com/data Content-Type:application/json key=value
```

## Features

- Converts common curl options to HTTPie syntax
- Supports:
  - HTTP methods (-X, --request)
  - Headers (-H, --header)
  - Data (-d, --data)
  - JSON data (--json)
- Clipboard integration for seamless workflow
- Preserves query parameters and URL structure

## Requirements

- Node.js >= 14.0.0
- npm >= 6.0.0

## License

MIT
