import type { UeliModuleRegistry } from "@Core/ModuleRegistry";
import type { ExtensionBootstrapResult } from "../ExtensionBootstrapResult";
import type { ExtensionModule } from "../ExtensionModule";
import { AddTodoistTaskActionHandler } from "./AddTodoistTaskActionHandler";
import { TodoistExtension } from "./TodoistExtension";

export class TodoistModule implements ExtensionModule {
    public bootstrap(moduleRegistry: UeliModuleRegistry): ExtensionBootstrapResult {
        return {
            extension: new TodoistExtension(
                moduleRegistry.get("AssetPathResolver"),
                moduleRegistry.get("SettingsManager"),
                moduleRegistry.get("Translator"),
            ),
            actionHandlers: [new AddTodoistTaskActionHandler(moduleRegistry.get("SettingsManager"))],
        };
    }
}
