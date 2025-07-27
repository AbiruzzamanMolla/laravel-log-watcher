# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),  
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.0.1] - 2025-07-27

### ✨ Added
- Initial release of Laravel Log Watcher
- Detects Laravel log file changes in real-time
- Shows toast notification when the log file is updated
- Allows setting a custom notification message
- Lets users define a custom Laravel log file path (relative or absolute)
- Toggle watcher on/off via command
- Enable/disable via settings
---

### 🧪 What's Next?

For upcoming versions, you'd typically add entries like:

## [0.1.0] - 2025-08-02

### ✨ Added
- Status bar toggle: Watcher Active/Inactive
- Open log file directly from notification

### 🐛 Fixed
- Crash on non-existent file path
- Handling symlinked logs (Laravel Vapor-like setups)
