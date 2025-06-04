# PolarisATC
![PolarisATCBanner](https://github.com/user-attachments/assets/c20a10bf-f2b5-4f8b-b469-5221c63ece73)

## Introduction

PolarisATC was created to address the main limitations found in IVAO Aurora and similar radar clients. While Aurora is a powerful tool, it restricts users in several key areas, such as integration with third-party applications, sector file customization, and overall flexibility.

### PolarisATC has:
- **Full Freedom for 3rd Party Integration:** Easily connect with external tools and plugins, enabling a more complete and customizable ATC environment.
- **Customizable Sector Files:** Load, edit, and create sector files without the limitations imposed by other platforms.
- **Bug Reduction and Stability:** Designed from the ground up to minimize bugs and provide a more stable experience.
- **Lightweight and Fast:** Built to be resource-efficient, ensuring smooth performance even on less powerful hardware.
- **User-Friendly Interface:** Modern, intuitive, and accessible UI for both beginners and experienced controllers.
- **Open Source and Community-Driven:** Anyone can contribute, suggest features, or adapt the software to their needs.

PolarisATC is cross-platform, lightweight, and open source, making it ideal for both training and recreational use.

In summary, PolarisATC is not just an alternative to Aurora—it's a next-generation ATC radar client designed to empower users with more control, flexibility, and reliability.

## How to Install

Go to the [latest releases](https://github.com/tiaguinho2009/PolarisATC/releases/latest) and download the respective setup file for your operating system.

## Links & Resources

### Legal
- [License](LICENSE)
- [Terms of Service](.github/TERMS.md)
- [Code of Conduct](.github/CODE_OF_CONDUCT.md)
- [Security](.github/SECURITY.md)

### Communuty
- [Discord Server](https://discord.gg/eSTuJNnARf)
- [Github Discussions](https://github.com/tiaguinho2009/PolarisATC/discussions)

### Support
- [Documentation](https://github.com/tiaguinho2009/PolarisATC/wiki) ___`To be created`___
- [Github Issues](https://github.com/tiaguinho2009/PolarisATC/issues)
- In the last case you can always join our [Discord Server](https://discord.gg/eSTuJNnARf) and ask for help.

# Project Development Setup

The main frameworks of the project are [Vue](https://vuejs.org) and [Tauri 1.0](https://tauri.app)

## Install Source Code and Dependencies

```sh
# Clone the repository
git clone https://github.com/tiaguinho2009/PolarisATC.git

# Change to the correspondig directory
cd PolarisATC

# Install dependencies
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run tauri dev
```

### Compile and Minify for Production

```sh
npm run tauri build
```
