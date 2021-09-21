const { St, Clutter, GLib, Gio } = imports.gi;
const Lang = imports.lang
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;

const Mainloop = imports.mainloop;

function readStream(stream, buffer) {
    stream.read_line_async(0, null, (stream, res) => {
        const line = stream.read_line_finish_utf8(res)[0];
        if (line !== null) { buffer.push(line); readStream(stream, buffer); }
    });
}

const Indicator = new Lang.Class({
    Name: 'Indicator',
    Extends: PanelMenu.Button,

    _init: function() {
        this.parent(0.0, _("Indicator"), false);

        this.label = new St.Label({
            text: 'N',
            y_align: Clutter.ActorAlign.CENTER,
        });
        this.add_child(this.label);

        this.nordstatus = false;
        this._refresh();
    },

    update_label: function() {
        const style_class = 'label '.concat(this.nordstatus ? 'enabled' : 'disabled');
        this.label.set_style_class_name(style_class);
    },

    set_status: function(status) { this.nordstatus = status; },

    _refresh: function() {
        let [, pid, stdin, stdout, stderr] = GLib.spawn_async_with_pipes(
            null, ['nordvpn', 'status'], null,
            GLib.SpawnFlags.DO_NOT_REAP_CHILD | GLib.SpawnFlags.SEARCH_PATH, null);

        GLib.close(stdin);
        GLib.close(stderr);

        let stdoutStream = new Gio.DataInputStream({
            base_stream: new Gio.UnixInputStream({
                fd: stdout,
                close_fd: true,
            }),
            close_base_stream: true,
        });

        let buffer = [];
        readStream(stdoutStream, buffer);

        GLib.child_watch_add(GLib.PRIORITY_DEFAULT_IDLE, pid, (pid, status) => {
            if (status === 0) {
                const data = String(buffer)
                    .split(',')[0]
                    .replace("Status:", "")
                    .trim();

                const connected = data.includes("Connected");
                const new_status = data.includes("Disconnected") || connected ? connected : status;

                this.set_status(new_status);
            }

            GLib.close(stdout);
            GLib.spawn_close_pid(pid);
        });

        this.update_label();

        // Timer stuff
        if (this._timeout) {
            Mainloop.source_remove(this._timeout);
            this._timeout = null;
        };

        this._timeout = Mainloop.timeout_add_seconds(1, Lang.bind(this, this._refresh));

        return true;
    },
});

let indicator;

function enable() {
    indicator = new Indicator();
    Main.panel.addToStatusArea('indicator', indicator, 0);
}

function disable() {
    indicator.destroy();
}

