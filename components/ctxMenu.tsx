/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { copyWithToast } from "@utils/misc";
import { findComponentByCodeLazy } from "@webpack";
import { Slider, FluxDispatcher, Menu } from "@webpack/common";
import { React, useState } from "@webpack/common";

import { Provider } from "../providers/types";
import { useLyrics } from "./util";
import settings from "../settings";

const CopyIcon = findComponentByCodeLazy(" 1-.5.5H10a6");

const lyricsActualProviders = [Provider.Lrclib, Provider.Spotify];
const lyricsAlternative = [Provider.Translated, Provider.Romanized];

function ProviderMenuItem(toProvider: Provider, currentProvider?: Provider) {
    return (
        (!currentProvider || currentProvider !== toProvider) && (
            <Menu.MenuItem
                key={`switch-provider-${toProvider.toLowerCase()}`}
                id={`switch-provider-${toProvider.toLowerCase()}`}
                label={`Switch to ${toProvider}`}
                action={() => {
                    FluxDispatcher.dispatch({
                        // @ts-ignore
                        type: "SPOTIFY_LYRICS_PROVIDER_CHANGE",
                        provider: toProvider,
                    });
                }}
            />
        )
    );
}

function LyricOffsetSlider() {
    const [delay, setDelay] = useState(settings.store.LyricDelay);
    
    const handleChange = (value: number) => {
        setDelay(value);
        settings.store.LyricDelay = value;
    };

    return (
        <div style={{ padding: "8px 12px" }}>
            <div style={{ marginBottom: "6px", display: "flex", justifyContent: "space-between" }}>
                <span>Lyric Offset: {delay}ms</span>
                {delay !== 0 && (
                    <span 
                        style={{ cursor: "pointer", fontSize: "12px", color: "var(--interactive-normal)" }}
                        onClick={() => handleChange(0)}
                    >
                        Reset
                    </span>
                )}
            </div>
            <Slider
                initialValue={delay}
                minValue={-2500}
                maxValue={2500}
                markers={[-2500, -2000, -1500, -1000, -500, 0, 500, 1000, 1500, 2000, 2500]}
                stickToMarkers={true}
                onValueChange={handleChange}
                onValueRender={(v) => `${v}ms`}
            />
        </div>
    );
}

export function LyricsContextMenu() {
    const { lyricsInfo, currLrcIndex } = useLyrics();

    const currentLyrics = lyricsInfo?.lyricsVersions[lyricsInfo.useLyric];
    const hasAShowingLyric = currLrcIndex !== null && currLrcIndex >= 0;
    const hasLyrics = !!(lyricsInfo?.lyricsVersions[Provider.Lrclib] || lyricsInfo?.lyricsVersions[Provider.Spotify]);

    return (
        <Menu.Menu
            navId="spotify-lyrics-menu"
            onClose={() => FluxDispatcher.dispatch({ type: "CONTEXT_MENU_CLOSE" })}
            aria-label="Spotify Lyrics Menu"
        >
            {hasAShowingLyric && (
                <Menu.MenuItem
                    key="copy-lyric"
                    id="copy-lyric"
                    label="Copy lyric"
                    action={() => {
                        copyWithToast(currentLyrics![currLrcIndex].text!, "Lyric copied!");
                    }}
                    icon={CopyIcon}
                />
            )}
            <Menu.MenuItem
                navId="spotify-lyrics-provider"
                id="spotify-lyrics-provider"
                label="Lyrics Provider"
            >
                {lyricsActualProviders.map(provider =>
                    ProviderMenuItem(provider, lyricsInfo?.useLyric)
                )}
                {hasLyrics && lyricsAlternative.map(provider =>
                    ProviderMenuItem(provider, lyricsInfo?.useLyric)
                )}
            </Menu.MenuItem>
            <Menu.MenuSeparator />
            <Menu.MenuItem
                id="lyric-offset"
                label="Lyric Offset"
                render={() => <LyricOffsetSlider />}
            />
        </Menu.Menu>
    );
}
