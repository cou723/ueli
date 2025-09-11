import type { AssetPathResolver } from "@Core/AssetPathResolver";
import type { SettingsManager } from "@Core/SettingsManager";
import type { Translator } from "@Core/Translator";
import { describe, expect, it, vi } from "vitest";
import { TodoistExtension } from "./TodoistExtension";

describe(TodoistExtension, () => {
    describe(TodoistExtension.prototype.id, () =>
        it(`should be "Todoist"`, () =>
            expect(new TodoistExtension(<AssetPathResolver>{}, <SettingsManager>{}, <Translator>{}).id).toBe(
                "Todoist",
            )),
    );

    describe(TodoistExtension.prototype.name, () =>
        it(`should be "Todoist"`, () =>
            expect(new TodoistExtension(<AssetPathResolver>{}, <SettingsManager>{}, <Translator>{}).name).toBe(
                "Todoist",
            )),
    );

    describe("author", () =>
        it(`should be "koucha"`, () =>
            expect(new TodoistExtension(<AssetPathResolver>{}, <SettingsManager>{}, <Translator>{}).author.name).toBe(
                "koucha",
            )));

    describe(TodoistExtension.prototype.getSearchResultItems, () =>
        it("should return an empty array", async () =>
            expect(
                await new TodoistExtension(
                    <AssetPathResolver>{},
                    <SettingsManager>{},
                    <Translator>{},
                ).getSearchResultItems(),
            ).toEqual([])),
    );

    describe(TodoistExtension.prototype.isSupported, () => {
        it("should return true", () =>
            expect(new TodoistExtension(<AssetPathResolver>{}, <SettingsManager>{}, <Translator>{}).isSupported()).toBe(
                true,
            ));
    });

    describe(TodoistExtension.prototype.getSettingDefaultValue, () => {
        it("should return 'todo' for prefix key", () => {
            const extension = new TodoistExtension(<AssetPathResolver>{}, <SettingsManager>{}, <Translator>{});

            expect(extension.getSettingDefaultValue("prefix")).toBe("todo");
        });

        it("should return empty string for apiToken key", () => {
            const extension = new TodoistExtension(<AssetPathResolver>{}, <SettingsManager>{}, <Translator>{});

            expect(extension.getSettingDefaultValue("apiToken")).toBe("");
        });
    });

    describe(TodoistExtension.prototype.getImage, () => {
        it("should return the image URL", () => {
            const assetPathResolver = <AssetPathResolver>{
                getExtensionAssetPath: vi.fn().mockReturnValue("path/to/todoist.svg"),
                getModuleAssetPath: vi.fn(),
            };

            const actual = new TodoistExtension(assetPathResolver, <SettingsManager>{}, <Translator>{}).getImage();

            expect(actual).toEqual({ url: "file://path/to/todoist.svg" });

            expect(assetPathResolver.getExtensionAssetPath).toHaveBeenCalledOnce();
            expect(assetPathResolver.getExtensionAssetPath).toHaveBeenCalledWith("Todoist", "todoist.svg");
        });
    });

    describe(TodoistExtension.prototype.getI18nResources, () => {
        it("should return i18n resources for en-US and ja-JP", () => {
            const extension = new TodoistExtension(<AssetPathResolver>{}, <SettingsManager>{}, <Translator>{});
            expect(Object.keys(extension.getI18nResources())).toEqual(["en-US", "ja-JP"]);
        });
    });

    describe(TodoistExtension.prototype.getInstantSearchResultItems, () => {
        it("should return empty result when search term doesn't start with prefix", () => {
            const settingsManager = <SettingsManager>{
                getValue: vi.fn().mockReturnValue("todo"),
                updateValue: vi.fn(),
            };

            const extension = new TodoistExtension(<AssetPathResolver>{}, settingsManager, <Translator>{});

            const result = extension.getInstantSearchResultItems("hello world");

            expect(result.before).toEqual([]);
            expect(result.after).toEqual([]);
        });

        it("should return empty result when search term is just the prefix", () => {
            const settingsManager = <SettingsManager>{
                getValue: vi.fn().mockReturnValue("todo"),
                updateValue: vi.fn(),
            };

            const extension = new TodoistExtension(<AssetPathResolver>{}, settingsManager, <Translator>{});

            const result = extension.getInstantSearchResultItems("todo");

            expect(result.before).toEqual([]);
            expect(result.after).toEqual([]);
        });

        it("should return task item when search term contains task content", () => {
            const settingsManager = <SettingsManager>{
                getValue: vi.fn().mockReturnValue("todo"),
                updateValue: vi.fn(),
            };

            const mockT = (key: string) => {
                const translations: Record<string, string> = {
                    addTaskDescription: "Add task to Todoist",
                    searchResultItemDescription: "Add to Todoist",
                };
                return translations[key] || key;
            };

            const translator = <Translator>{
                createT: vi.fn().mockReturnValue({ t: mockT }),
            };

            const assetPathResolver = <AssetPathResolver>{
                getExtensionAssetPath: vi.fn().mockReturnValue("path/to/todoist.svg"),
                getModuleAssetPath: vi.fn(),
            };

            const extension = new TodoistExtension(assetPathResolver, settingsManager, translator);

            const result = extension.getInstantSearchResultItems("todo Buy groceries");

            expect(result.before).toEqual([]);
            expect(result.after).toHaveLength(1);
            expect(result.after[0]).toMatchObject({
                name: "Buy groceries",
                description: "Add to Todoist",
                id: "[Todoist][instantSearchResultItem]",
                defaultAction: {
                    handlerId: "AddTodoistTaskActionHandler",
                    description: "Add task to Todoist",
                    fluentIcon: "AppsAddInRegular",
                    hideWindowAfterInvocation: true,
                },
            });

            const actionArgument = JSON.parse(result.after[0].defaultAction.argument);
            expect(actionArgument).toEqual({ taskContent: "Buy groceries" });
        });
    });
});
