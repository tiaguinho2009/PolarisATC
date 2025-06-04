# PolarisATC

## How to Install

Go to the [latest releases](https://github.com/tiaguinho2009/PolarisATC/releases/latest) and download the respective setup file for your operating system.

## Links & Resources

### Legal
- [License](LICENSE)
- [Terms of Service](.github/TERMS.md)
- [Code of Conduct](.github/CODE_OF_CONDUCT.md)
- [Security](.github/SECURITY.md)

### Communuty
- [Discord](https://discord.gg/eSTuJNnARf)
- [Github Discussions](https://github.com/tiaguinho2009/PolarisATC/discussions)

### Support
- [Documentation](https://github.com/tiaguinho2009/PolarisATC/wiki) ___`To be created`___
- [Github Issues](https://github.com/tiaguinho2009/PolarisATC/issues)
- In the last case you can always join Discord and ask for help.

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
