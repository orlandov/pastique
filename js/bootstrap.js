system.use("com.joyent.Sammy");
system.use("com.joyent.Resource");

var Paste = new Resource("paste");

GET("/paste/new", function() {
    return template("new.html");
});

GET(/\/paste\/([^/]+)\/delete$/, function(pasteId) {
    try {
        this.paste = Paste.get(pasteId);
        this.paste.remove();
    }
    catch (e) {
        return uneval(e);
    }
    return redirect('/');
});

POST(/\/paste\/?$/, function() {
    this.paste = new Paste();
    this.paste.title = this.request.body.title;
    this.paste.text = this.request.body.text;
    this.paste.save()

    this.response.code = 201;
    return redirect('/paste/' + this.paste.id);
});

GET(/\/paste\/(.+)$/, function (pasteId) {
    this.paste = Paste.get(pasteId);
    return template("paste.html");
});

GET("/", function() {
    this.pastes = Paste.search({});

    return template('index.html');
});
