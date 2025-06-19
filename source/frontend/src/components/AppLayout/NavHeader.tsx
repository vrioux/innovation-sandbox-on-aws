// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import TopNavigation, {
  TopNavigationProps,
} from "@cloudscape-design/components/top-navigation";
import { Density, Mode } from "@cloudscape-design/global-styles";
import { FC, useMemo } from "react";

import { IsbUser } from "@amzn/innovation-sandbox-commons/types/isb-types";
import { useAppContext } from "@amzn/innovation-sandbox-frontend/components/AppContext/context";
import { spacerSvg } from "@amzn/innovation-sandbox-frontend/components/AppLayout/constants";
import { useLocale } from "@amzn/innovation-sandbox-frontend/i18n/IntlProvider";
import { useAppLayoutContext } from "@aws-northstar/ui/components/AppLayout";
import { useTranslation } from "@amzn/innovation-sandbox-frontend/hooks/useTranslation";

export interface NavHeaderProps {
  title: string;
  logo?: string;
  href?: string;
  user?: IsbUser;
  onExit?: () => void;
}

export const NavHeader: FC<NavHeaderProps> = ({
  title,
  href = "/",
  logo,
  user,
  onExit,
}) => {
  const { theme, density, setTheme, setDensity } = useAppContext();
  const { setToolsOpen, setToolsHide } = useAppLayoutContext();
  const { locale, setLocale } = useLocale();
  const { t } = useTranslation();

  const utilities: TopNavigationProps.Utility[] = useMemo(() => {
    const menu: TopNavigationProps.Utility[] = [
      {
        type: "menu-dropdown",
        iconName: "settings",
        ariaLabel: t("common.settings", "Settings"),
        items: [
          {
            id: "theme",
            text: t("settings.theme", "Theme"),
            items: [
              {
                id: "theme.light",
                text: t("settings.theme.light", "Light"),
                iconName: theme === Mode.Light ? "check" : undefined,
                iconSvg: theme !== Mode.Light ? spacerSvg : undefined,
              },
              {
                id: "theme.dark",
                text: t("settings.theme.dark", "Dark"),
                iconName: theme === Mode.Dark ? "check" : undefined,
                iconSvg: theme !== Mode.Dark ? spacerSvg : undefined,
              },
            ],
          },
          {
            id: "density",
            text: t("settings.density", "Density"),
            items: [
              {
                id: "density.comfortable",
                text: t("settings.density.comfortable", "Comfortable"),
                iconName: density === Density.Comfortable ? "check" : undefined,
                iconSvg:
                  density !== Density.Comfortable ? spacerSvg : undefined,
              },
              {
                id: "density.compact",
                text: t("settings.density.compact", "Compact"),
                iconName: density === Density.Compact ? "check" : undefined,
                iconSvg: density !== Density.Compact ? spacerSvg : undefined,
              },
            ],
          },
          {
            id: "language",
            text: t("settings.language", "Language"),
            items: [
              {
                id: "language.en",
                text: t("settings.language.en", "English"),
                iconName: locale === "en" ? "check" : undefined,
                iconSvg: locale !== "en" ? spacerSvg : undefined,
              },
              {
                id: "language.fr",
                text: t("settings.language.fr", "Français"),
                iconName: locale === "fr" ? "check" : undefined,
                iconSvg: locale !== "fr" ? spacerSvg : undefined,
              },
              {
                id: "language.es",
                text: t("settings.language.es", "Español"),
                iconName: locale === "es" ? "check" : undefined,
                iconSvg: locale !== "es" ? spacerSvg : undefined,
              },
              {
                id: "language.pt",
                text: t("settings.language.pt", "Português"),
                iconName: locale === "pt" ? "check" : undefined,
                iconSvg: locale !== "pt" ? spacerSvg : undefined,
              },
              {
                id: "language.it",
                text: t("settings.language.it", "Italiano"),
                iconName: locale === "it" ? "check" : undefined,
                iconSvg: locale !== "it" ? spacerSvg : undefined,
              },
              {
                id: "language.de",
                text: t("settings.language.de", "Deutsch"),
                iconName: locale === "de" ? "check" : undefined,
                iconSvg: locale !== "de" ? spacerSvg : undefined,
              },
              {
                id: "language.jp",
                text: t("settings.language.jp", "日本語"),
                iconName: locale === "jp" ? "check" : undefined,
                iconSvg: locale !== "jp" ? spacerSvg : undefined,
              },
            ],
          },
        ],
        onItemClick: (e) => {
          switch (e.detail.id) {
            case "theme.light":
              setTheme(Mode.Light);
              break;
            case "theme.dark":
              setTheme(Mode.Dark);
              break;
            case "density.comfortable":
              setDensity(Density.Comfortable);
              break;
            case "density.compact":
              setDensity(Density.Compact);
              break;
            case "language.en":
              setLocale("en");
              break;
            case "language.fr":
              setLocale("fr");
              break;
            case "language.es":
              setLocale("es");
              break;
            case "language.pt":
              setLocale("pt");
              break;
            case "language.it":
              setLocale("it");
              break;
            case "language.de":
              setLocale("de");
              break;
            case "language.jp":
              setLocale("jp");
              break;
            default:
              break;
          }
        },
      },
      {
        type: "button",
        iconName: "status-info",
        ariaLabel: t("common.help", "Help"),
        onClick: () => {
          setToolsHide(false);
          setToolsOpen((prev) => !prev);
        },
      },
    ];

    if (user) {
      menu.push({
        type: "menu-dropdown",
        text: user.displayName,
        description: user.email,
        iconName: "user-profile",
        items: [{ id: "exit", text: t("common.logout", "Exit") }],
        onItemClick: onExit,
      });
    }

    return menu;
  }, [theme, density, setDensity, setTheme, user, onExit, locale, setLocale, t]);

  const topNavLogo = logo ? { src: logo, alt: title } : undefined;

  return (
    <>
      <div id="app-header">
        <TopNavigation
          utilities={utilities}
          i18nStrings={{
            overflowMenuTitleText: title,
            overflowMenuTriggerText: title,
          }}
          identity={{
            title: title,
            href: href,
            logo: topNavLogo,
          }}
        />
      </div>
    </>
  );
};
