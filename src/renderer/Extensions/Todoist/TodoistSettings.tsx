import { useExtensionSetting } from "@Core/Hooks";
import { Setting } from "@Core/Settings/Setting";
import { SettingGroup } from "@Core/Settings/SettingGroup";
import { SettingGroupList } from "@Core/Settings/SettingGroupList";
import { Input } from "@fluentui/react-components";
import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";

export const TodoistSettings = (): ReactElement => {
    const extensionId = "Todoist";
    const { t } = useTranslation("extension[Todoist]");

    const { value: prefix, updateValue: setPrefix } = useExtensionSetting<string>({
        extensionId,
        key: "prefix",
    });

    const { value: apiToken, updateValue: setApiToken } = useExtensionSetting<string>({
        extensionId,
        key: "apiToken",
    });

    return (
        <SettingGroupList>
            <SettingGroup title={t("extensionName")}>
                <Setting
                    label={t("prefix")}
                    description={t("prefixDescription")}
                    control={<Input value={prefix} onChange={(_, { value }) => setPrefix(value)} placeholder="todo" />}
                />
                <Setting
                    label={t("apiToken")}
                    description={t("apiTokenDescription")}
                    control={
                        <Input
                            type="password"
                            value={apiToken}
                            onChange={(_, { value }) => setApiToken(value)}
                            placeholder="APIトークンを入力..."
                        />
                    }
                />
            </SettingGroup>
        </SettingGroupList>
    );
};
