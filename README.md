# PolarisATC

<div align="center">

<!-- TODO: Add project logo -->

![Vue](https://img.shields.io/badge/Vue-3.x-42b883?style=flat-square&logo=vue.js&logoColor=white)
![Tauri](https://img.shields.io/badge/Tauri-2.x-ffc131?style=flat-square&logo=tauri&logoColor=black)
![PixiJS](https://img.shields.io/badge/Pixi.js-8.x-e2212d?style=flat-square)
![License](https://img.shields.io/badge/license-AGPL--3.0-green?style=flat-square)

**A modern, high-performance Air Traffic Control radar application built as a standalone desktop app.**

</div>

## 📖 Overview

PolarisATC is a **standalone Air Traffic Control radar application** designed for simulation networks such as **IVAO**.

Unlike traditional browser plugins or tightly-coupled tools, PolarisATC runs as a **native desktop application**, giving full control over performance, rendering, and extensibility.

The radar is rendered using **Pixi.js**, allowing smooth, GPU-accelerated visuals, while the application logic and UI are built with a modern web stack.

---

## ✨ Key Features

- 🖥️ **Native Desktop Application**  
  Built with **Tauri**, combining a Rust backend with a web-based frontend.

- 📡 **High-Performance Radar Rendering**  
  Radar visuals powered by **Pixi.js**, optimized for real-time rendering.

- 🧩 **Modular UI Architecture**  
  Window-based interface designed for extensibility.

- ⚡ **Modern Frontend Stack**  
  Built with **Vue 3**, **TypeScript**, and **Pinia**.

- 🔒 **Type-Safe Codebase**  
  Strong typing across the entire frontend.

- 🐧 **Cross-Platform by Design**  
  Targets Linux, Windows, and macOS through Tauri.

---

## 🛠️ Tech Stack

### Frontend

- **Vue 3**
- **TypeScript**
- **Pinia**
- **Pixi.js**
- **Vite**

### Backend

- **Rust**
- **Tauri**

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18 (recommended: 20)
- **Rust & Cargo** via https://rustup.rs
- **Tauri system dependencies**  
  See: https://tauri.app/start/prerequisites/

---

### Installation

```bash
git clone https://github.com/tiaguinho2009/PolarisATC.git
cd PolarisATC
npm install
```

---

### Development

```bash
npm run tauri dev
```

> On Linux + NVIDIA, you may need:
>
> ```bash
> npm run tauri:dev:linux-nvidia
> ```

---

## 🤝 Contributing

Contributions are welcome.

- Fork the repository
- Create a feature branch
- Open a pull request with a clear description

If you plan to work on larger changes, please open an issue first.

---

## 📄 License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.

See the [LICENSE](./LICENSE) file for full details.

---

<div align="center">

⭐ **Star the repository if you’re interested in the project** ⭐

Made with ❤️ by [tiaguinho2009](https://github.com/tiaguinho2009)

</div>
