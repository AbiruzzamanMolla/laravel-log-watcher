# Laravel Log Watcher

> VS Code extension that watches your Laravel log file and notifies you when it changes.  
Perfect for debugging without constantly reopening the log file.

---

![Laravel Log Watcher Banner](https://raw.githubusercontent.com/azmolla/laravel-log-watcher/main/images/banner.png)
[VSCE](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)

## 🚀 Features

- ✅ Real-time monitoring of Laravel log file changes
- 🔔 Toast notifications with customizable message
- 🔧 Configurable log file path (supports relative and absolute paths)
- 🎚️ Toggle watcher on/off anytime via command
- 🔒 Lightweight, zero-permission log checking

---

## ⚙️ Configuration

Go to your VS Code `Settings` (`Ctrl + ,`) → Search for **Laravel Log Watcher**  
Or add/edit directly in `settings.json`:

```json
{
  "laravelLogWatcher.logFilePath": "storage/logs/laravel.log",
  "laravelLogWatcher.notificationMessage": "Laravel log updated!",
  "laravelLogWatcher.enabled": true
}
````

| Setting               | Description                                          | Default                    |
| --------------------- | ---------------------------------------------------- | -------------------------- |
| `logFilePath`         | Path to your Laravel log file (relative or absolute) | `storage/logs/laravel.log` |
| `notificationMessage` | Custom notification text                             | `Laravel log updated!`     |
| `enabled`             | Enable or disable the watcher globally               | `true`                     |

---

## ⚡ Commands

> Use the Command Palette (`Ctrl + Shift + P` or `Cmd + Shift + P` on Mac)

| Command                      | Description                    |
| ---------------------------- | ------------------------------ |
| `Toggle Laravel Log Watcher` | Enable/disable the log watcher |

---

## 📦 Installation

Search for **Laravel Log Watcher** in the VS Code Extensions Marketplace
or install directly by running:

```bash
code --install-extension azmolla.laravel-log-watcher
```

---

## 📁 Example Use Case

Imagine you're developing and want to see if an exception was logged without opening `laravel.log`.
This extension will notify you instantly when that happens. Debug smarter ⚡

---

## 🔧 Requirements

* Laravel project with log file writing enabled (default is `storage/logs/laravel.log`)
* VS Code 1.85.0+

---

## 💬 Known Limitations

* Only monitors a single file at a time
* Does not yet tail or parse log entries (coming soon?)

---

## 🧪 Coming Soon

* Status bar toggle
* Real-time log viewer
* Severity-based log parsing
* Workspace-level enable/disable

---

## 👨‍💻 Author

**Md Abiruzzaman Molla**
🔗 [audiobookbangla.com](https://audiobookbangla.com)
📦 [Packagist: azmolla](https://packagist.org/users/azmolla)
💻 [GitHub: @abiruzzamanmolla](https://github.com/abiruzzamanmolla)

---

## 🪪 License

[MIT](LICENSE)