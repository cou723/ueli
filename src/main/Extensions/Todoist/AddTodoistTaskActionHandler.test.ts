/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SettingsManager } from "@Core/SettingsManager";
import type { SearchResultItemAction } from "@common/Core";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ActionArgument } from "./ActionArgument";
import { AddTodoistTaskActionHandler } from "./AddTodoistTaskActionHandler";

// Mock fetch globally
global.fetch = vi.fn();

describe(AddTodoistTaskActionHandler, () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe(AddTodoistTaskActionHandler.prototype.id, () =>
        it(`should be "AddTodoistTaskActionHandler"`, () =>
            expect(
                new AddTodoistTaskActionHandler(<SettingsManager>{ getValue: vi.fn(), updateValue: vi.fn() }).id,
            ).toBe("AddTodoistTaskActionHandler")),
    );

    describe(AddTodoistTaskActionHandler.prototype.invokeAction, () => {
        it("should throw error when API token is missing", async () => {
            const settingsManager = <SettingsManager>{
                getValue: vi.fn().mockReturnValue(""),
                updateValue: vi.fn(),
            };

            const actionHandler = new AddTodoistTaskActionHandler(settingsManager);

            await expect(
                actionHandler.invokeAction(<SearchResultItemAction>{
                    argument: JSON.stringify(<ActionArgument>{ taskContent: "Test task" }),
                }),
            ).rejects.toThrow("Missing Todoist API token");
        });

        it("should create task successfully with valid API token", async () => {
            const mockResponse = {
                ok: true,
                json: vi.fn().mockResolvedValue({ id: "123", content: "Test task" }),
            };

            const fetchMock = vi.mocked(fetch);
            fetchMock.mockResolvedValue(mockResponse as any);

            const settingsManager = <SettingsManager>{
                getValue: vi.fn().mockReturnValue("test-api-token"),
                updateValue: vi.fn(),
            };

            const actionHandler = new AddTodoistTaskActionHandler(settingsManager);

            await actionHandler.invokeAction(<SearchResultItemAction>{
                argument: JSON.stringify(<ActionArgument>{ taskContent: "Test task" }),
            });

            expect(fetch).toHaveBeenCalledWith("https://api.todoist.com/rest/v2/tasks", {
                method: "POST",
                headers: {
                    Authorization: "Bearer test-api-token",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    content: "Test task",
                }),
            });
        });

        it("should throw error when API call fails", async () => {
            const mockResponse = {
                ok: false,
                status: 400,
                text: vi.fn().mockResolvedValue("Bad Request"),
            };

            const fetchMock = vi.mocked(fetch);
            fetchMock.mockResolvedValue(mockResponse as any);

            const settingsManager = <SettingsManager>{
                getValue: vi.fn().mockReturnValue("test-api-token"),
                updateValue: vi.fn(),
            };

            const actionHandler = new AddTodoistTaskActionHandler(settingsManager);

            await expect(
                actionHandler.invokeAction(<SearchResultItemAction>{
                    argument: JSON.stringify(<ActionArgument>{ taskContent: "Test task" }),
                }),
            ).rejects.toThrow("タスクの追加に失敗しました: Todoist API Error: 400 Bad Request");
        });

        it("should handle network errors", async () => {
            const fetchMock = vi.mocked(fetch);
            fetchMock.mockRejectedValue(new Error("Network error"));

            const settingsManager = <SettingsManager>{
                getValue: vi.fn().mockReturnValue("test-api-token"),
                updateValue: vi.fn(),
            };

            const actionHandler = new AddTodoistTaskActionHandler(settingsManager);

            await expect(
                actionHandler.invokeAction(<SearchResultItemAction>{
                    argument: JSON.stringify(<ActionArgument>{ taskContent: "Test task" }),
                }),
            ).rejects.toThrow("タスクの追加に失敗しました: Network error");
        });

        it("should parse action argument correctly", async () => {
            const mockResponse = {
                ok: true,
                json: vi.fn().mockResolvedValue({ id: "123", content: "Task with @label #project" }),
            };

            const fetchMock = vi.mocked(fetch);
            fetchMock.mockResolvedValue(mockResponse as any);

            const settingsManager = <SettingsManager>{
                getValue: vi.fn().mockReturnValue("test-api-token"),
                updateValue: vi.fn(),
            };

            const actionHandler = new AddTodoistTaskActionHandler(settingsManager);

            await actionHandler.invokeAction(<SearchResultItemAction>{
                argument: JSON.stringify(<ActionArgument>{ taskContent: "Task with @label #project" }),
            });

            expect(fetch).toHaveBeenCalledWith("https://api.todoist.com/rest/v2/tasks", {
                method: "POST",
                headers: {
                    Authorization: "Bearer test-api-token",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    content: "Task with @label #project",
                }),
            });
        });
    });
});
