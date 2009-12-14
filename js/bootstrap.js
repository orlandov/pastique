system.use("com.joyent.Sammy");
system.use("com.joyent.Resource");
system.use("org.json.json2");

var Paste = new Resource("paste");
var Comment = new Resource("comment");

var highlights = {
    'cpp': 'C++',
    'cSharp': 'C#',
    'css': 'CSS',
    'diff': 'diff / patch',
    'java': 'Java',
    'jScript': 'JavaScript',
    'php': 'PHP',
    'plain': 'Plain text',
    'python': 'Python',
    'ruby': 'Ruby',
    'sql': 'SQL',
    'vb': 'VB',
    'xml': 'XML',
    'perl': 'Perl'
}

before(function () {
    this.highlights = highlights;
});

GET("/paste/new", function() {
    return template("new.html");
});

POST(/\/paste\/([^/]+)\/comments$/, function(pasteId) {
    this.paste = Paste.get(pasteId);
    this.response.mime = 'application/json';

    var comment = new Comment();
    comment.author = this.request.body.author;
    comment.comment = this.request.body.comment;
    comment.paste_id = this.paste.id;
    comment.save();

    return JSON.stringify({ ok: true });
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
    this.paste.author = this.request.body.author;
    this.paste.text = this.request.body.text;
    this.paste.highlight = this.request.body.highlight;
    this.paste.save()

    this.response.code = 201;
    return redirect('/paste/' + this.paste.id);
});

function setHighlight(paste) {
    // XXX need to find out how to extend ashb's Template's filters
    var highlight = paste.highlight;
    paste.highlightPretty = highlights[highlight];
    paste.highlightLower = highlight.toLowerCase();
    paste.highlightCap =
        highlight.substring(0, 1).toUpperCase() + highlight.slice(1);
}

GET(/\/paste\/(.+)$/, function (pasteId) {
    this.paste = Paste.get(pasteId);
    setHighlight(this.paste);
    var comments = Comment.search({ paste_id: this.paste.id });
    this.paste.comments = comments || [];
    return template("paste.html");
});

GET("/", function() {
    this.pastes = Paste.search({ });
    this.pastes.forEach(function (paste) {
        setHighlight(paste);    
        var comments = Comment.search({ paste_id: paste.id });
        paste.comments = comments || [];
    });
    return template('index.html');
});
