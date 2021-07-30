const { St, Clutter, GLib } = imports.gi;
const Lang = imports.lang
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;

const Mainloop = imports.mainloop;

function get_nord_status() {
    const data = GLib.spawn_command_line_sync('nordvpn status')[1];
    let data_string = imports.byteArray.toString(data).trim()
    data_string = data_string.slice(data_string.indexOf("Status:"), data_string.length);

    const status = data_string.split('\n')[0].replace("Status:", "").trim();

    return status === 'Connected';
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

    _refresh: function() {
        this.nordstatus = get_nord_status();
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

