# Paladin-RS 🛡️ (Rust Version)

A high-performance, memory-efficient rewrite of the Paladin orchestrator in Rust.

## 🚀 Features

- **Blazing Fast**: Native compilation and minimal runtime overhead.
- **Memory Efficient**: Uses a fraction of the memory compared to the Python version.
- **Async Runtime**: Built on `tokio` for non-blocking I/O.
- **Compatible**: Uses the same `config.toml` and safety mechanisms (Stable/Experimental modes) as the main project.

## 🛠️ Build & Run

### Prerequisites
- Rust and Cargo (latest stable)
- A configured `config.toml` in the project root (one level up).

### Running

```bash
# Navigate to the rust directory
cd paladin-rs

# Run in debug mode
cargo run

# Build for release (optimized)
cargo build --release
./target/release/paladin-rs
```

## 🏗️ Architecture

The Rust architecture mirrors the Python logic:

1.  **Config**: Loads `../config.toml`.
2.  **Planner**: Uses LLM to check `planner.txt` prompt (hardcoded in this version for performance/portability) and decides on a command.
3.  **Executor**: Executes the command using strictly controlled process spawning.
4.  **Presenter**: Formats the output.

## ⚠️ Safety

- **Stable Mode**: Only allows whitelisted commands (`ls`, `uname`, etc.) defined in `src/tools.rs`.
- **Experimental Mode**: Allows all commands EXCEPT interactive ones (`vim`, `top`, etc.) to prevent hanging the orchestrator.
