import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

let watcher: fs.FSWatcher | null = null;

export function activate(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration("laravelLogWatcher");
  let enabled = config.get<boolean>("enabled", true);
  let logPath = resolvePath(config.get<string>("logFilePath", ""));
  let message = config.get<string>(
    "notificationMessage",
    "Laravel log updated!"
  );

  const toggleCmd = vscode.commands.registerCommand(
    "laravelLogWatcher.toggle",
    () => {
      enabled = !enabled;
      vscode.workspace
        .getConfiguration()
        .update("laravelLogWatcher.enabled", enabled, true);
      if (enabled) {
        startWatcher(logPath, message);
        vscode.window.showInformationMessage("Laravel Log Watcher Enabled");
      } else {
        stopWatcher();
        vscode.window.showWarningMessage("Laravel Log Watcher Disabled");
      }
    }
  );

  context.subscriptions.push(toggleCmd);

  if (enabled) {
    startWatcher(logPath, message);
  }
}

function resolvePath(configPath: string): string {
  if (path.isAbsolute(configPath)) return configPath;
  const workspaceFolder =
    vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || "";
  return path.join(workspaceFolder, configPath);
}

function startWatcher(filePath: string, message: string) {
  if (!fs.existsSync(filePath)) {
    vscode.window.showWarningMessage(`Log file not found: ${filePath}`);
    return;
  }

  stopWatcher();

  watcher = fs.watch(filePath, (eventType) => {
    if (eventType === "change") {
      vscode.window.showInformationMessage(message);
    }
  });
}

function stopWatcher() {
  if (watcher) {
    watcher.close();
    watcher = null;
  }
}

export function deactivate() {
  stopWatcher();
}
