import { useCallback } from "react";

export function useClipboard() {
    const copy = useCallback(async (text: string) => {
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(text);
        } else {
            // fallback
            const textarea = document.createElement("textarea");
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
        }
    }, []);

    const paste = useCallback(async () => {
        if (navigator.clipboard) {
            return await navigator.clipboard.readText();
        } else {
            // fallback: クリップボードAPI非対応時は空文字
            return "";
        }
    }, []);

    return { copy, paste };
}
