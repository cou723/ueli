import type { ActionHandler } from "@Core/ActionHandler";
import type { SettingsManager } from "@Core/SettingsManager";
import type { SearchResultItemAction } from "@common/Core";
import { getExtensionSettingKey } from "@common/Core/Extension";
import type { ActionArgument } from "./ActionArgument";

export class AddTodoistTaskActionHandler implements ActionHandler {
    public readonly id = "AddTodoistTaskActionHandler";

    public constructor(private readonly settingsManager: SettingsManager) {}

    public async invokeAction(action: SearchResultItemAction): Promise<void> {
        const { taskContent } = JSON.parse(action.argument) as ActionArgument;
        const apiToken = this.settingsManager.getValue<string>(getExtensionSettingKey("Todoist", "apiToken"), "");

        if (!apiToken) {
            // Error message in English to follow existing extension patterns (not i18n translated)
            throw new Error("Missing Todoist API token");
        }

        try {
            const response = await fetch("https://api.todoist.com/rest/v2/tasks", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${apiToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    content: taskContent,
                }),
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Todoist API Error: ${response.status} ${errorData}`);
            }

            const result = await response.json();
            console.log("Todoistにタスクを追加しました:", result);
        } catch (error) {
            console.error("Todoistタスク追加エラー:", error);
            throw new Error(`タスクの追加に失敗しました: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
