function getHeaderHost(req, res) {
    //req.headers['abc']=123;
    //req.log("hello from foo() handler");
    return req.headers.host;
}

function summary(req, res) {
    var a, s, h;

    s = "JS summary\n\n";

    s += "Method: " + req.method + "\n";
    s += "HTTP version: " + req.httpVersion + "\n";
    s += "Host: " + req.headers.host + "\n";
    s += "Remote Address: " + req.remoteAddress + "\n";
    s += "URI: " + req.uri + "\n";

    s += "Headers:\n";
    for (h in req.headers) {
        s += "  header '" + h + "' is '" + req.headers[h] + "'\n";
    }

    s += "Args:\n";
    for (a in req.args) {
        s += "  arg '" + a + "' is '" + req.args[a] + "'\n";
    }

    return s;
}

function baz(req, res) {
    res.headers.foo = 1234;
    res.status = 200;
    res.contentType = "text/plain; charset=utf-8";
    res.contentLength = 15;
    res.sendHeader();
    res.send("nginx");
    res.send("java");
    res.send("script");

    res.finish();
}
function kvHeaders(headers, parent) {
    var kvpairs = "";
    for (var h in headers) {
        kvpairs += " " + parent + "." + h + "=";
        if ( headers[h].indexOf(" ") == -1 ) {
        kvpairs += headers[h];
        } else {
            kvpairs += "'" + headers[h] + "'";
        }
    }
    return kvpairs;
}
function kvAccessLog(req, res) {
    var log = req.variables.time_iso8601;  // nginScript可以访问所有变量
    log += " client=" + req.remoteAddress; // request对象的属性
    log += " method=" + req.method;        // "
    log += " uri=" + req.uri;              // "
    log += " status=" + res.status;        // response对象的属性
    log += kvHeaders(req.headers, "req");  // 把request header对象传给函数
    log += kvHeaders(res.headers, "res");  // 把response header对象传给函数
    return log;
}
