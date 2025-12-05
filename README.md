<p align="center">
  <a href="https://github.com/xlc-dev/chromatic">
    <img src="/public/favicon.svg" alt="Chromatic Logo" width="100" style="border-radius: 50%;">
  </a>
</p>

<h1 align="center">Chromatic</h1>

<p align="center" style="font-size: 1.2em; color: #586069;">
  Finally a normal colorscheme generator for Linux.
</p>

---

Chromatic is a modern, web-based colorscheme generator designed specifically for Linux users. Create, customize, and export colorschemes for your terminal, window manager, and other applications with an intuitive visual interface.

## Features

- **Visual Color Picker:** Interactive color picker with spectrum, hue, and brightness controls for precise color selection.

- **Live Preview:** Real-time preview of your colorscheme in a simulated terminal and editor environment.

- **Import & Export:** Import existing colorschemes from JSON files or paste JSON directly. Export your creations for use with the Chromatic CLI tool.

- **Preset Library:** Choose from a curated collection of popular colorschemes to get started quickly.

- **CLI Tool:** Export colorschemes that work directly with the Chromatic CLI for automatic application configuration.

## Getting Started

### Prerequisites

- Bun
- A modern web browser

### Installation

1. **Clone the repository:**

   ```sh
   git clone https://github.com/xlc-dev/chromatic.git
   cd chromatic
   ```

2. **Install dependencies:**

   ```sh
   bun install
   ```

3. **Start the development server:**

   ```sh
   bun run dev
   ```

4. **Open your browser:**

   Navigate to `http://localhost:5173` to start using Chromatic.

## Development

### Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run build:cli` - Build CLI executable
- `bun run build:all` - Build both web app and CLI
- `bun run check` - Run type checking and formatting checks
- `bun run format` - Format code with Prettier
- `bun run preview` - Preview production build

### Code Style

The project uses:

- **Prettier** for code formatting
- **TypeScript** for type safety
- **SolidJS** for reactive UI components

Run formatting:

```sh
bun run format
```

## Contributing

Contributions are welcome! Whether it's bug reports, feature requests, documentation improvements, or code contributions, please feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
