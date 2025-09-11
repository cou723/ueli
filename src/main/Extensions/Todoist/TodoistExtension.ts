import type { AssetPathResolver } from "@Core/AssetPathResolver";
import type { Extension } from "@Core/Extension";
import type { SettingsManager } from "@Core/SettingsManager";
import type { Translator } from "@Core/Translator";
import { createEmptyInstantSearchResult, type InstantSearchResultItems, type SearchResultItem } from "@common/Core";
import { getExtensionSettingKey } from "@common/Core/Extension";
import type { Image } from "@common/Core/Image";
import type { Settings } from "./Settings";

export class TodoistExtension implements Extension {
    public readonly id = "Todoist";
    public readonly name = "Todoist";

    public readonly nameTranslation = {
        key: "extensionName",
        namespace: "extension[Todoist]",
    };

    private readonly defaultSettings: Settings = {
        prefix: "todo",
        apiToken: "",
    };

    public readonly author = {
        name: "koucha",
        githubUserName: "cou723",
    };

    public constructor(
        private readonly assetPathResolver: AssetPathResolver,
        private readonly settingsManager: SettingsManager,
        private readonly translator: Translator,
    ) {}

    public getInstantSearchResultItems(searchTerm: string): InstantSearchResultItems {
        const prefix = this.getPrefix();

        if (!searchTerm.startsWith(prefix) || searchTerm.replace(prefix, "").trim().length === 0) {
            return createEmptyInstantSearchResult();
        }

        const taskContent = this.extractTaskContentFromSearchTerm(searchTerm);
        const { t } = this.translator.createT(this.getI18nResources());

        return {
            after: [
                {
                    defaultAction: {
                        argument: JSON.stringify({ taskContent }),
                        description: t("addTaskDescription"),
                        handlerId: "AddTodoistTaskActionHandler",
                        fluentIcon: "AppsAddInRegular",
                        hideWindowAfterInvocation: true,
                    },
                    description: t("searchResultItemDescription"),
                    id: `[${this.id}][instantSearchResultItem]`,
                    image: this.getImage(),
                    name: taskContent,
                },
            ],
            before: [],
        };
    }

    public async getSearchResultItems(): Promise<SearchResultItem[]> {
        return [];
    }

    public isSupported(): boolean {
        return true;
    }

    public getSettingDefaultValue(key: keyof Settings) {
        return this.defaultSettings[key];
    }

    public getImage(): Image {
        return {
            url: `file://${this.assetPathResolver.getExtensionAssetPath(this.id, "todoist.svg")}`,
        };
    }

    public getSettingKeysTriggeringRescan(): string[] {
        return [];
    }

    public getI18nResources() {
        return {
            "en-US": {
                extensionName: "Todoist",
                prefix: "Prefix",
                prefixDescription:
                    "The prefix to trigger Todoist task creation. Add tasks with this pattern: <prefix> <task content>",
                apiToken: "API Token",
                apiTokenDescription: "Your Todoist API token. Get it from Todoist Settings -> Integrations",
                addTaskDescription: "Add task to Todoist",
                searchResultItemDescription: "Add to Todoist",
                taskAddedSuccessfully: "Task added successfully",
                taskAddFailed: "Failed to add task",
                apiTokenRequired: "API Token is required",
            },
            "ja-JP": {
                extensionName: "Todoist",
                prefix: "プレフィックス",
                prefixDescription:
                    "Todoistタスク作成のトリガとなるプレフィックスです。次のパターンで使用します： <prefix> <タスク内容>",
                apiToken: "APIトークン",
                apiTokenDescription: "TodoistのAPIトークンです。Todoist設定 -> 連携から取得してください",
                addTaskDescription: "Todoistにタスクを追加",
                searchResultItemDescription: "Todoistに追加",
                taskAddedSuccessfully: "タスクを追加しました",
                taskAddFailed: "タスクの追加に失敗しました",
                apiTokenRequired: "APIトークンが必要です",
            },
        };
    }

    private getPrefix(): string {
        return this.settingsManager.getValue<string>(
            getExtensionSettingKey(this.id, "prefix"),
            this.getSettingDefaultValue("prefix"),
        );
    }

    private extractTaskContentFromSearchTerm(searchTerm: string): string {
        return searchTerm.replace(this.getPrefix(), "").trim();
    }
}
