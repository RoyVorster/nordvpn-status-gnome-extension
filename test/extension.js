const { St, Clutter, GObject } = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

let Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
    _init() {
        super._init(0.0, _("Indicator"), false);

        this.label = new St.Label({ text: 'Indicator', y_expand: true, y_align: Clutter.ActorAlign.CENTER });
        this.add_child(this.label);
    }
});

let MenuItem = GObject.registerClass(
class MenuItem extends PopupMenu.PopupBaseMenuItem {
    _init(info) {
        super._init();

        this.label = new St.Label({ text: info.label, y_expand: true, y_align: Clutter.ActorAlign.CENTER });
        this.add_child(this.label);
    }
});

let MenuButton = GObject.registerClass(
class MenuButton extends PanelMenu.Button {
    _init() {
        super._init(0.0, _("MenuButton"), false);

        this.label = new St.Label({ text: 'Menu', y_expand: true, y_align: Clutter.ActorAlign.CENTER });
        this.add_actor(this.label);

        this._menuSection = new PopupMenu.PopupMenuSection();
        this._menuSection.actor.visible = true;

        // Add some random menu items
        const menuItems = [...Array(5).keys()].map((k) => ({ label: `Item ${k + 1}` }));
        menuItems.forEach((item) => this._menuSection.addMenuItem(new MenuItem(item)));

        this.menu.addMenuItem(this._menuSection);
    }
});

let indicator;
let menubutton;

function init() {
    indicator = new Indicator();
    menubutton = new MenuButton();
}

function enable() {
    Main.panel.addToStatusArea('indicator', indicator, 0);
    Main.panel.addToStatusArea('menubutton', menubutton, 0);
}

function disable() {
    indicator.destroy();
    menubutton.destroy();
}

