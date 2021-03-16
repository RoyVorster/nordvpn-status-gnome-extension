const Clutter = imports.gi.Clutter;
Clutter.init(null);

let stage = new Clutter.Stage();
stage.connect("destroy", Clutter.main_quit);
stage.title = "lol";

stage.set_background_color(new Clutter.Color({
	red: 150,
	blue: 150,
	green: 0,
	alpha: 255
}));

// Add rectangle
let actorRectangle = new Clutter.Actor();
actorRectangle.set_size(100, 100);
actorRectangle.set_position(100, 100);
actorRectangle.set_background_color(new Clutter.Color({
	red: 150,
	blue: 0,
	green: 0,
	alpha: 255
}));

stage.add_actor(actorRectangle);

stage.show();

Clutter.main();
