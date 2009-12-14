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
    this.paste.highlight = this.request.body.highlight;
    this.paste.save()

    this.response.code = 201;
    return redirect('/paste/' + this.paste.id);
});

GET(/\/paste\/(.+)$/, function (pasteId) {
    this.paste = Paste.get(pasteId);
    var highlight = this.paste.highlight;

    // XXX need to find out how to extend ashb's Template's filters
    this.paste.highlightCap =
        highlight.substring(0, 1).toUpperCase() + highlight.slice(1);

    return template("paste.html");
});

GET("/", function() {
    this.pastes = Paste.search({});

    return template('index.html');
});
