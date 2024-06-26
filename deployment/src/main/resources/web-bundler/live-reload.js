let retry = 0;

console.log("web-bundler live-reload is enabled");

function connectToChanges() {
    const eventSource = new EventSource(process.env.LIVE_RELOAD_PATH);
    eventSource.onopen = () => {
        if (retry > 0) {
            retry = 0;
            // server is back-on, let's reload to get the latest
            location.reload();
        }

        console.debug("connected to web-bundler live-reload");
    };
    eventSource.addEventListener('bundling-error', e => {
        location.reload();
    });
    eventSource.addEventListener('change', e => {
        if (!e.data) {
            return;
        }
        const {added, removed, updated} = JSON.parse(e.data);
        const updatedCss = updated.filter(p => p.endsWith(".css")).length;
        if (!added.length && !removed.length && updated.length > 0 && updatedCss === updated.length) {
            for (const link of document.getElementsByTagName("link")) {
                const url = new URL(link.href);
                for (const css of updated)
                    if (url.host === location.host && url.pathname === css) {
                        console.log("Live-reload: " + css);
                        const next = link.cloneNode();
                        next.href = css + '?' + Math.random().toString(36).slice(2);
                        next.onload = () => link.remove();
                        next.onerror = (e) => {
                            next.remove();
                            console.error(e);
                        };
                        link.parentNode.insertBefore(next, link.nextSibling);
                        return;
                    }
            }
        }
        location.reload();
    });

    eventSource.onerror = () => {
        // Reconnect on error
        eventSource.close();
        retry++;
        if (retry > 40) {
            console.error("web-bundler live-reload connection lost");
            return;
        }
        if (retry > 10) { // increase the interval after 10 attempts (~5s)
            setTimeout(connectToChanges, 1000);
            return;
        }
        setTimeout(connectToChanges, 500);
    };
}

connectToChanges();