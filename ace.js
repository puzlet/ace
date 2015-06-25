// Generated by CoffeeScript 1.7.1
(function() {
  var Ace, CodeNodeComment, CodeNodeFunction, CoffeeEditor, CoffeeEval, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Ace = {};

  window.$Ace = Ace;

  console.log("Ace module");

  if (typeof $blab !== "undefined" && $blab !== null) {
    if ((_ref = $blab.resources) != null) {
      _ref.on("postload", function() {
        return Ace.load($blab.resources);
      });
    }
  }

  Ace.currentCoffeeResource = null;

  Ace.evalContainer = function(resource) {
    var _ref1;
    if (resource == null) {
      resource = Ace.currentCoffeeResource;
    }
    if (!resource) {
      return;
    }
    return {
      resource: resource,
      container: resource != null ? (_ref1 = resource.containers) != null ? _ref1.getEvalContainer() : void 0 : void 0,
      find: function(str) {
        var _ref2;
        return resource != null ? (_ref2 = resource.compiler) != null ? typeof _ref2.findStr === "function" ? _ref2.findStr(str) : void 0 : void 0 : void 0;
      }
    };
  };

  Ace.evalRemove = function(sel, resource) {
    var _ref1;
    if (resource == null) {
      resource = Ace.currentCoffeeResource;
    }
    return resource != null ? (_ref1 = resource.containers) != null ? typeof _ref1.evalRemove === "function" ? _ref1.evalRemove(sel) : void 0 : void 0 : void 0;
  };

  Ace.load = function(resources) {
    var attr, code, exists, load, postLoad, _i, _len, _ref1;
    console.log("Ace.load");
    $(document).on("preCompileCoffee", function(ev, data) {
      return Ace.currentCoffeeResource = data.resource;
    });
    _ref1 = Ace.ResourceContainers.getAttributes();
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      attr = _ref1[_i];
      exists = resources.find(attr.url);
      if (exists) {
        continue;
      }
      code = attr.code ? attr.code.split("\\n").join("\n") : null;
      resources.add({
        url: attr.url,
        source: code
      });
    }
    load = (function(_this) {
      return function(r, loaded) {
        resources.add(r);
        return resources.loadUnloaded(function() {
          return loaded();
        });
      };
    })(this);
    postLoad = function() {
      var resource, _j, _len1, _ref2;
      _ref2 = resources.resources;
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        resource = _ref2[_j];
        new Ace.ResourceContainers(resource);
      }
      return $.event.trigger("aceFilesLoaded");
    };
    return new Ace.Resources(load, postLoad);
  };

  Ace.ResourceContainers = (function() {
    var evalContainerAttr, fileContainerAttr, sourceAttr;

    fileContainerAttr = "data-file";

    evalContainerAttr = "data-eval";

    sourceAttr = "data-code";

    ResourceContainers.getAttributes = function() {
      var div, divs, _i, _len, _results;
      divs = $("div[" + fileContainerAttr + "]");
      _results = [];
      for (_i = 0, _len = divs.length; _i < _len; _i++) {
        div = divs[_i];
        _results.push({
          url: $(div).attr(fileContainerAttr),
          code: $(div).attr(sourceAttr)
        });
      }
      return _results;
    };

    function ResourceContainers(resource) {
      var _base, _base1;
      this.resource = resource;
      this.url = this.resource.url;
      if (!this.hasDiv()) {
        return;
      }
      this.resource.containers = this;
      this.render();
      if (typeof (_base = this.resource).setEval === "function") {
        _base.setEval(this.hasEval());
      }
      if (!this.resource.compiled) {
        if (typeof (_base1 = this.resource).compile === "function") {
          _base1.compile();
        }
      }
      $(document).on("preSaveResources", (function(_this) {
        return function() {
          return _this.updateResource();
        };
      })(this));
    }

    ResourceContainers.prototype.render = function() {
      var file, idx, node, _i, _len, _ref1, _results;
      this.files().addClass("loaded");
      this.evals().addClass("loaded");
      this.fileNodes = (function() {
        var _i, _len, _ref1, _results;
        _ref1 = this.files();
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          node = _ref1[_i];
          _results.push(new Ace.EditorNode($(node), this.resource));
        }
        return _results;
      }).call(this);
      this.evalNodes = (function() {
        var _i, _len, _ref1, _results;
        _ref1 = this.evals();
        _results = [];
        for (idx = _i = 0, _len = _ref1.length; _i < _len; idx = ++_i) {
          node = _ref1[idx];
          _results.push(new Ace.EvalNode($(node), this.resource, this.fileNodes[idx]));
        }
        return _results;
      }).call(this);
      if ($pz.codeNode == null) {
        $pz.codeNode = {};
      }
      _ref1 = this.files;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        file = _ref1[_i];
        _results.push($pz.codeNode[file.editor.id] = file.editor);
      }
      return _results;
    };

    ResourceContainers.prototype.getEvalContainer = function() {
      var _ref1;
      if (((_ref1 = this.evalNodes) != null ? _ref1.length : void 0) !== 1) {
        return null;
      }
      return this.evalNodes[0].container;
    };

    ResourceContainers.prototype.evalRemove = function(sel) {
      var _ref1;
      return (_ref1 = this.getEvalContainer()) != null ? _ref1.find(sel).remove() : void 0;
    };

    ResourceContainers.prototype.setEditorContent = function(content) {
      var node, triggerChange, _i, _len, _ref1, _results;
      triggerChange = false;
      _ref1 = this.fileNodes;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        node = _ref1[_i];
        _results.push(node.setCode(triggerChange));
      }
      return _results;
    };

    ResourceContainers.prototype.setFromEditor = function(editor) {
      var node, triggerChange, _i, _len, _ref1, _results;
      triggerChange = false;
      _ref1 = this.fileNodes;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        node = _ref1[_i];
        if (node.editor.id !== editor.id) {
          _results.push(node.setCode(triggerChange));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    ResourceContainers.prototype.updateResource = function() {
      var _ref1;
      if (!(this.resource.edited && ((_ref1 = this.fileNodes) != null ? _ref1.length : void 0))) {
        return;
      }
      if (this.fileNodes.length > 1) {
        console.log("Multiple editor nodes for resource.  Updating resource from only first editor node.", this.resource);
      }
      this.resource.update(this.fileNodes[0].code());
      return console.log("Resource " + this.url + " updated from editor node");
    };

    ResourceContainers.prototype.files = function() {
      return $("div[" + fileContainerAttr + "='" + this.url + "']");
    };

    ResourceContainers.prototype.evals = function() {
      return $("div[" + evalContainerAttr + "='" + this.url + "']");
    };

    ResourceContainers.prototype.hasDiv = function() {
      return this.hasFile() || this.hasEval();
    };

    ResourceContainers.prototype.hasFile = function() {
      return this.files().length;
    };

    ResourceContainers.prototype.hasEval = function() {
      return this.evals().length;
    };

    return ResourceContainers;

  })();

  Ace.Node = (function() {
    function Node(container, resource) {
      this.container = container;
      this.resource = resource;
      this.getSpec();
      this.create();
      this.renderTId = null;
    }

    Node.prototype.getSpec = function() {
      if (!this.resource) {
        return;
      }
      this.filename = this.resource.url;
      this.lang = Ace.Languages.langName(this.resource.fileExt);
      return this.spec = {
        container: this.container,
        filename: this.filename,
        lang: this.lang
      };
    };

    Node.prototype.create = function() {};

    Node.prototype.code = function() {
      return this.editor.code();
    };

    Node.prototype.setCode = function(triggerChange) {
      if (triggerChange == null) {
        triggerChange = true;
      }
      if (this.renderTId) {
        clearTimeout(this.renderTId);
      }
      this.editor.set(this.resource.content, triggerChange);
      return this.renderTId = setTimeout(((function(_this) {
        return function() {
          return _this.editor.customRenderer.render();
        };
      })(this)), 1000);
    };

    return Node;

  })();

  Ace.EditorNode = (function(_super) {
    __extends(EditorNode, _super);

    function EditorNode() {
      return EditorNode.__super__.constructor.apply(this, arguments);
    }

    EditorNode.prototype.getSpec = function() {
      EditorNode.__super__.getSpec.call(this);
      if (!this.resource) {
        return;
      }
      this.spec.code = this.resource.content;
      this.getAttributes();
      this.spec.startLine = this.startLine;
      this.spec.endLine = this.endLine;
      this.spec.viewPort = this.viewPort;
      return this.spec.update = (function(_this) {
        return function(code) {
          var _base;
          return typeof (_base = _this.resource).update === "function" ? _base.update(code) : void 0;
        };
      })(this);
    };

    EditorNode.prototype.create = function() {
      var Editor, _ref1;
      Editor = (_ref1 = Ace.Languages.get(this.spec.lang).Editor) != null ? _ref1 : Ace.Editor;
      this.editor = new Editor(this.spec);
      return this.editor.onChange((function(_this) {
        return function() {
          _this.resource.content = _this.editor.code();
          _this.resource.containers.setFromEditor(_this.editor);
          _this.resource.edited = true;
          return $.event.trigger("codeNodeChanged");
        };
      })(this));
    };

    EditorNode.prototype.getAttributes = function() {
      var data, lines, numLines, _ref1, _ref2, _ref3, _ref4;
      lines = this.resource.content.split("\n");
      numLines = lines.length;
      data = (function(_this) {
        return function(name) {
          return _this.container.data(name);
        };
      })(this);
      this.startMatch = data("start-match");
      this.endMatch = data("end-match");
      this.startLine = (_ref1 = this.match(lines, this.startMatch)) != null ? _ref1 : (_ref2 = data("start-line")) != null ? _ref2 : 1;
      this.endLine = (_ref3 = this.match(lines, this.endMatch)) != null ? _ref3 : (_ref4 = data("end-line")) != null ? _ref4 : numLines;
      return this.viewPort = this.startLine > 1 || this.endLine < numLines;
    };

    EditorNode.prototype.match = function(lines, regex) {
      var idx, line, match, _i, _len;
      if (!((lines != null ? lines.length : void 0) && regex)) {
        return null;
      }
      for (idx = _i = 0, _len = lines.length; _i < _len; idx = ++_i) {
        line = lines[idx];
        match = line.match(regex);
        if (match) {
          return idx + 1;
        }
      }
      return null;
    };

    return EditorNode;

  })(Ace.Node);

  Ace.EvalNode = (function(_super) {
    __extends(EvalNode, _super);

    function EvalNode(container, resource, fileNode) {
      this.container = container;
      this.resource = resource;
      this.fileNode = fileNode;
      EvalNode.__super__.constructor.call(this, this.container, this.resource);
    }

    EvalNode.prototype.getSpec = function() {
      EvalNode.__super__.getSpec.call(this);
      this.spec.startLine = this.fileNode.spec.startLine;
      this.spec.endLine = this.fileNode.spec.endLine;
      return this.spec.viewPort = this.fileNode.spec.viewPort;
    };

    EvalNode.prototype.create = function() {
      if (this.lang !== "coffee") {
        console.log("<div data-eval='" + this.filename + "'>: must be CoffeeScript.");
        return;
      }
      this.editor = new CoffeeEval(this.spec);
      this.setCode();
      return $(document).on("compiledCoffeeScript", (function(_this) {
        return function(ev, data) {
          if (data.url === _this.filename) {
            return _this.setCode();
          }
        };
      })(this));
    };

    EvalNode.prototype.setCode = function() {
      return this.editor.set(this.resource.resultStr);
    };

    return EvalNode;

  })(Ace.Node);

  Ace.Editor = (function() {
    Editor.prototype.idPrefix = "ace_editor_";

    Editor.count = 0;

    function Editor(spec) {
      this.spec = spec;
      this.filename = this.spec.filename;
      this.lang = this.spec.lang;
      Ace.Editor.count++;
      this.id = this.idPrefix + this.filename + ("_" + this.spec.startLine + "_" + this.spec.endLine) + ("_" + Ace.Editor.count);
      this.fixedNumLines = this.spec.viewPort ? this.spec.endLine - this.spec.startLine + 1 : null;
      this.initContainer();
      this.editor = ace.edit(this.id);
      this.initMode();
      this.initRenderer();
      this.initFont();
      this.editor.$blockScrolling = Infinity;
      this.set(this.spec.code);
      this.setEditable();
      this.initChangeListeners();
      this.keyboardShortcuts();
      this.onSwipe((function(_this) {
        return function() {
          return _this.run();
        };
      })(this));
      this.customRenderer = new Ace.CustomRenderer(this, ((function(_this) {
        return function() {
          return _this.setViewPort();
        };
      })(this)));
      this.setViewPort();
    }

    Editor.prototype.initContainer = function() {
      this.container = this.spec.container;
      this.container.addClass("code_node_container");
      this.container.addClass("tex2jax_ignore");
      this.outer = $("<div>", {
        "class": "code_node_editor_container"
      });
      this.editorContainer = $("<div>", {
        "class": "code_node_editor",
        id: this.id,
        "data-lang": "" + this.lang
      });
      this.outer.append(this.editorContainer);
      return this.container.append(this.outer);
    };

    Editor.prototype.onSwipe = function(callback) {
      var down, listener, move, pos, start;
      down = null;
      pos = function(evt) {
        var t;
        t = evt.touches[0];
        return {
          x: t.clientX,
          y: t.clientY
        };
      };
      start = function(evt) {
        return down = pos(evt);
      };
      move = function(evt) {
        var d, up;
        if (!down) {
          return;
        }
        up = pos(evt);
        d = {
          x: up.x - down.x,
          y: up.y - down.y
        };
        if (Math.abs(d.x) > Math.abs(d.y) && d.x > 0) {
          if (typeof callback === "function") {
            callback();
          }
        }
        return down = null;
      };
      listener = (function(_this) {
        return function(e, f) {
          return _this.editorContainer[0].addEventListener(e, f, false);
        };
      })(this);
      listener("touchstart", start);
      return listener("touchmove", move);
    };

    Editor.prototype.initMode = function() {
      var mode;
      this.editor.setTheme("ace/theme/textmate");
      if (this.lang) {
        mode = Ace.Languages.mode(this.lang);
      }
      if (mode) {
        return this.session().setMode(mode);
      }
    };

    Editor.prototype.initRenderer = function() {
      this.renderer = this.editor.renderer;
      this.renderer.scrollBar.setWidth = function(width) {
        if (width == null) {
          width = this.width || 15;
        }
        return $(this.element).css("width", width + "px");
      };
      this.renderer.scrollBar.setWidth(0);
      this.renderer.scroller.style.overflowX = "hidden";
      this.renderer.$textLayer.addEventListener("changeCharacterSize", (function(_this) {
        return function() {
          return _this.setHeight();
        };
      })(this));
      this.renderer.$gutterLayer.setShowLineNumbers = function(show, start) {
        if (start == null) {
          start = 1;
        }
        this.showLineNumbers = show;
        return this.lineNumberStart = start;
      };
      this.renderer.$gutterLayer.setShowLineNumbers(true, 1);
      return this.editor.setShowFoldWidgets(false);
    };

    Editor.prototype.initFont = function() {
      var char, css;
      this.editorContainer.addClass("pz_ace_editor");
      css = {
        fontFamily: "Consolas, Menlo, DejaVu Sans Mono, Monaco, monospace",
        fontSize: "11pt",
        lineHeight: "150%"
      };
      char = $("<span>", {
        css: css,
        html: "m"
      });
      $("body").append(char);
      this.charWidth = char.width();
      char.remove();
      this.narrowFont = this.charWidth < 9;
      if (this.narrowFont) {
        css.fontSize = "12pt";
      }
      return this.editorContainer.css(css);
    };

    Editor.prototype.setViewPort = function() {
      var c, endLine, height, line, lines, numLines, session, startLine, _i, _j, _results;
      if (!this.spec.viewPort) {
        return;
      }
      startLine = this.spec.startLine;
      endLine = this.spec.endLine;
      height = endLine - startLine + 1;
      this.setHeight(height);
      if (startLine > 1) {
        setTimeout(((function(_this) {
          return function() {
            _this.editor.gotoLine(startLine - 1);
            return _this.editor.scrollToLine(startLine - 1);
          };
        })(this)), 10);
      }
      lines = this.code().split("\n");
      numLines = lines.length;
      session = this.session();
      c = "ace_light_line_numbers";
      for (line = _i = 1; 1 <= numLines ? _i <= numLines : _i >= numLines; line = 1 <= numLines ? ++_i : --_i) {
        session.removeGutterDecoration(line - 1, c);
      }
      _results = [];
      for (line = _j = 1; 1 <= numLines ? _j <= numLines : _j >= numLines; line = 1 <= numLines ? ++_j : --_j) {
        if (line < startLine || line > endLine) {
          _results.push(session.addGutterDecoration(line - 1, c));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Editor.prototype.setHeight = function(numLines) {
      var heightStr, l, lengths, lineHeight, lines, max;
      if (numLines == null) {
        numLines = null;
      }
      if (!this.editor) {
        return;
      }
      lineHeight = this.renderer.lineHeight;
      if (numLines == null) {
        numLines = this.fixedNumLines;
      }
      if (!numLines) {
        lines = this.code().split("\n");
        numLines = lines.length;
        if (numLines < 20) {
          lengths = (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = lines.length; _i < _len; _i++) {
              l = lines[_i];
              _results.push(l.length);
            }
            return _results;
          })();
          max = Math.max.apply(Math, lengths);
          if (max > 75) {
            numLines++;
          }
        } else {
          numLines++;
        }
      }
      if (this.numLines === numLines && this.lineHeight === lineHeight) {
        return;
      }
      this.numLines = numLines;
      this.lineHeight = lineHeight;
      heightStr = lineHeight * (numLines > 0 ? numLines : 1) + "px";
      this.editorContainer.css("height", heightStr);
      this.outer.css("height", heightStr);
      return this.editor.resize();
    };

    Editor.prototype.focus = function() {
      return this.editor.focus();
    };

    Editor.prototype.session = function() {
      if (this.editor) {
        return this.editor.getSession();
      } else {
        return null;
      }
    };

    Editor.prototype.code = function() {
      return this.session().getValue();
    };

    Editor.prototype.set = function(code, triggerChange, setEditorView) {
      if (triggerChange == null) {
        triggerChange = true;
      }
      if (setEditorView == null) {
        setEditorView = true;
      }
      if (!triggerChange) {
        this.enableChangeAction = false;
      }
      if (!this.editor) {
        return;
      }
      this.session().setValue(code);
      if (setEditorView) {
        if (this.spec.viewPort) {
          this.setViewPort();
        } else {
          this.setHeight();
        }
      }
      return this.enableChangeAction = true;
    };

    Editor.prototype.show = function(show) {
      return this.outer.css("display", show ? "" : "none");
    };

    Editor.prototype.showCode = function(show) {
      this.editor.show(show);
      if (show) {
        return this.editor.resize();
      }
    };

    Editor.prototype.setEditable = function(editable) {
      if (editable == null) {
        editable = true;
      }
      this.isEditable = editable;
      this.editor.setReadOnly(!editable);
      return this.editor.setHighlightActiveLine(false);
    };

    Editor.prototype.initChangeListeners = function() {
      var changeAction;
      this.enableChangeAction = true;
      changeAction = (function(_this) {
        return function() {
          var code, listener, _i, _len, _ref1, _results;
          if (!_this.spec.viewPort) {
            _this.setHeight();
          }
          code = _this.code();
          _ref1 = _this.changeListeners;
          _results = [];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            listener = _ref1[_i];
            _results.push(listener(code));
          }
          return _results;
        };
      })(this);
      this.session().on("change", (function(_this) {
        return function() {
          if (_this.enableChangeAction) {
            return changeAction();
          }
        };
      })(this));
      return this.changeListeners = [];
    };

    Editor.prototype.onChange = function(f) {
      return this.changeListeners.push(f);
    };

    Editor.prototype.run = function() {
      this.spec.update(this.code());
      return $.event.trigger("runCode", {
        filename: this.filename
      });
    };

    Editor.prototype.keyboardShortcuts = function() {
      var command;
      command = (function(_this) {
        return function(o) {
          return _this.editor.commands.addCommand(o);
        };
      })(this);
      command({
        name: "run",
        bindKey: {
          win: "Shift-Return",
          mac: "Shift-Return",
          sender: "editor"
        },
        exec: (function(_this) {
          return function(env, args, request) {
            return _this.run();
          };
        })(this)
      });
      return command({
        name: "save",
        bindKey: {
          win: "Ctrl-s",
          mac: "Ctrl-s",
          sender: "editor"
        },
        exec: (function(_this) {
          return function(env, args, request) {
            return $.event.trigger("saveGitHub");
          };
        })(this)
      });
    };

    return Editor;

  })();

  CoffeeEditor = (function(_super) {
    __extends(CoffeeEditor, _super);

    function CoffeeEditor(spec) {
      this.spec = spec;
      CoffeeEditor.__super__.constructor.call(this, this.spec);
    }

    return CoffeeEditor;

  })(Ace.Editor);

  CoffeeEval = (function(_super) {
    __extends(CoffeeEval, _super);

    CoffeeEval.prototype.idPrefix = "ace_eval_";

    function CoffeeEval(spec) {
      this.spec = spec;
      CoffeeEval.__super__.constructor.call(this, this.spec);
      this.container.css({
        position: "relative",
        border: "1px dashed black"
      });
      this.editorContainer.css({
        background: "white"
      });
      this.renderer.setShowGutter(false);
    }

    return CoffeeEval;

  })(Ace.Editor);

  Ace.Languages = (function() {
    function Languages() {}

    Languages.list = {
      html: {
        ext: "html",
        mode: "html"
      },
      css: {
        ext: "css",
        mode: "css"
      },
      javascript: {
        ext: "js",
        mode: "javascript"
      },
      coffee: {
        ext: "coffee",
        mode: "coffee",
        Editor: CoffeeEditor
      },
      json: {
        ext: "json",
        mode: "javascript"
      },
      python: {
        ext: "py",
        mode: "python"
      },
      octave: {
        ext: "m",
        mode: "matlab"
      },
      latex: {
        ext: "tex",
        mode: "latex"
      }
    };

    Languages.get = function(lang) {
      return Ace.Languages.list[lang];
    };

    Languages.mode = function(lang) {
      return "ace/mode/" + (Ace.Languages.get(lang).mode);
    };

    Languages.langName = function(ext) {
      var language, name, _ref1;
      _ref1 = Ace.Languages.list;
      for (name in _ref1) {
        language = _ref1[name];
        if (language.ext === ext) {
          return name;
        }
      }
    };

    return Languages;

  })();

  Ace.path = "http://ajaxorg.github.io/ace-builds/src-min-noconflict";

  Ace.Resources = (function() {
    Resources.prototype.main = [
      {
        url: "" + Ace.path + "/ace.js"
      }
    ];

    Resources.prototype.modes = [
      {
        url: "" + Ace.path + "/mode-html.js"
      }, {
        url: "" + Ace.path + "/mode-css.js"
      }, {
        url: "" + Ace.path + "/mode-javascript.js"
      }, {
        url: "" + Ace.path + "/mode-coffee.js"
      }, {
        url: "" + Ace.path + "/mode-python.js"
      }, {
        url: "" + Ace.path + "/mode-matlab.js"
      }, {
        url: "" + Ace.path + "/mode-latex.js"
      }
    ];

    Resources.prototype.styles = [
      {
        url: "/puzlet/ace/ace.css"
      }
    ];

    function Resources(load, loaded) {
      load(this.main, (function(_this) {
        return function() {
          return load(_this.modes, function() {
            return load(_this.styles, function() {
              _this.customStyles();
              return typeof loaded === "function" ? loaded() : void 0;
            });
          });
        };
      })(this));
    }

    Resources.prototype.customStyles = function() {
      var custom, head;
      custom = $("<style>", {
        type: "text/css",
        id: "puzlet_ace_custom_styles",
        html: ".ace-tm {\n	background: #f4f4f4;;\n}\n.ace-tm .ace_gutter {\n	color: #aaa;\n	background: #f8f8f8;\n}\n.ace_gutter-cell {\n	padding-left: 15px;\n	background: #eee;\n}\n.ace-tm .ace_print_margin {\n	background: #f0f0f0;\n}"
      });
      head = document.getElementsByTagName('head')[0];
      return head.appendChild(custom[0]);
    };

    return Resources;

  })();

  Ace.CustomRenderer = (function() {
    CustomRenderer.tempIdx = 0;

    function CustomRenderer(node, callback1, callback) {
      this.node = node;
      this.callback1 = callback1;
      this.callback = callback;
      this.editorContainer = this.node.editorContainer;
      this.editor = this.node.editor;
      this.renderer = this.node.renderer;
      this.isEditable = this.node.isEditable;
      this.customRendering();
    }

    CustomRenderer.prototype.customRendering = function() {
      var onBlur, onFocus;
      this.linkSelected = false;
      this.comments = [];
      this.functions = [];
      this.inFocus = false;
      onFocus = this.editor.onFocus;
      this.editor.onFocus = (function(_this) {
        return function() {
          _this.restoreCode();
          onFocus.call(_this.editor);
          if (_this.isEditable) {
            _this.renderer.showCursor();
          }
          if (!_this.isEditable) {
            _this.renderer.hideCursor();
          }
          _this.editor.setHighlightActiveLine(true);
          return _this.inFocus = true;
        };
      })(this);
      onBlur = this.editor.onBlur;
      this.editor.onBlur = (function(_this) {
        return function() {
          _this.renderer.hideCursor();
          _this.editor.setHighlightActiveLine(false);
          _this.render();
          return _this.inFocus = false;
        };
      })(this);
      this.editor.on("mouseup", (function(_this) {
        return function(aceEvent) {
          return _this.mouseUpHandler();
        };
      })(this));
      return $(document).on("mathjaxPreConfig", (function(_this) {
        return function() {
          if (typeof _this.callback1 === "function") {
            _this.callback1();
          }
          return window.MathJax.Hub.Register.StartupHook("MathMenu Ready", function() {
            _this.render();
            return typeof _this.callback === "function" ? _this.callback() : void 0;
          });
        };
      })(this));
    };

    CustomRenderer.prototype.render = function() {
      var comment, commentNodes, f, i, identifiers, l, linkCallback, node, _i, _j, _len, _len1, _ref1, _ref2, _results;
      if (!window.MathJax) {
        return;
      }
      if (!$blab.codeDecoration) {
        return;
      }
      commentNodes = this.editorContainer.find(".ace_comment");
      linkCallback = (function(_this) {
        return function(target) {
          return _this.linkSelected = target;
        };
      })(this);
      this.comments = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = commentNodes.length; _i < _len; _i++) {
          node = commentNodes[_i];
          _results.push(new CodeNodeComment($(node), linkCallback));
        }
        return _results;
      })();
      _ref1 = this.comments;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        comment = _ref1[_i];
        comment.render();
      }
      identifiers = this.editorContainer.find(".ace_identifier");
      this.functions = (function() {
        var _j, _len1, _results;
        _results = [];
        for (_j = 0, _len1 = identifiers.length; _j < _len1; _j++) {
          i = identifiers[_j];
          if (l = Ace.Identifiers.link($(i).text())) {
            _results.push(new CodeNodeFunction($(i), l, linkCallback));
          }
        }
        return _results;
      })();
      _ref2 = this.functions;
      _results = [];
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        f = _ref2[_j];
        _results.push(f.render());
      }
      return _results;
    };

    CustomRenderer.prototype.restoreCode = function() {
      var comment, f, _i, _j, _len, _len1, _ref1, _ref2, _results;
      _ref1 = this.comments;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        comment = _ref1[_i];
        comment.restore();
      }
      _ref2 = this.functions;
      _results = [];
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        f = _ref2[_j];
        _results.push(f.restore());
      }
      return _results;
    };

    CustomRenderer.prototype.mouseUpHandler = function() {
      var href, target;
      if (!this.linkSelected) {
        return;
      }
      href = this.linkSelected.attr("href");
      target = this.linkSelected.attr("target");
      if (target === "_self") {
        $(document.body).animate({
          scrollTop: $(href).offset().top
        }, 1000);
      } else {
        window.open(href, target != null ? target : "_blank");
      }
      this.linkSelected = false;
      return this.editor.blur();
    };

    return CustomRenderer;

  })();

  Ace.Identifiers = (function() {
    function Identifiers() {}

    Identifiers.links = {};

    Identifiers.registerLinks = function(links) {
      var identifier, link, _results;
      _results = [];
      for (identifier in links) {
        link = links[identifier];
        _results.push(Ace.Identifiers.links[identifier] = link);
      }
      return _results;
    };

    Identifiers.link = function(name) {
      return Ace.Identifiers.links[name];
    };

    return Identifiers;

  })();

  CodeNodeComment = (function() {
    function CodeNodeComment(node, linkCallback) {
      this.node = node;
      this.linkCallback = linkCallback;
    }

    CodeNodeComment.prototype.render = function() {
      this.originalText = this.node.text();
      this.replaceDiv();
      this.mathJax();
      return this.processLinks();
    };

    CodeNodeComment.prototype.replaceDiv = function() {
      var comment, content, pattern, re;
      pattern = String.fromCharCode(160);
      re = new RegExp(pattern, "g");
      comment = this.originalText.replace(re, " ");
      this.node.empty();
      content = $("<div>", {
        css: {
          display: "inline-block"
        }
      });
      content.append(comment);
      return this.node.append(content);
    };

    CodeNodeComment.prototype.mathJax = function() {
      var node;
      if (!(node = this.node[0])) {
        return;
      }
      MathJax.Hub.Queue(["PreProcess", MathJax.Hub, node]);
      return MathJax.Hub.Queue(["Process", MathJax.Hub, node]);
    };

    CodeNodeComment.prototype.processLinks = function() {
      var link, links, _i, _len, _results;
      links = this.node.find("a");
      if (!links.length) {
        return;
      }
      _results = [];
      for (_i = 0, _len = links.length; _i < _len; _i++) {
        link = links[_i];
        _results.push($(link).mousedown((function(_this) {
          return function(evt) {
            return _this.linkCallback($(evt.target));
          };
        })(this)));
      }
      return _results;
    };

    CodeNodeComment.prototype.restore = function() {
      if (this.originalText) {
        this.node.empty();
        return this.node.text(this.originalText);
      }
    };

    return CodeNodeComment;

  })();

  CodeNodeFunction = (function() {
    function CodeNodeFunction(node, link, linkCallback) {
      this.node = node;
      this.link = link;
      this.linkCallback = linkCallback;
    }

    CodeNodeFunction.prototype.render = function() {
      this.originalText = this.node.text();
      this.replaceDiv();
      return this.processLinks();
    };

    CodeNodeFunction.prototype.replaceDiv = function() {
      var content, link, txt;
      txt = this.originalText;
      link = $("<a>", {
        href: this.link.href,
        target: this.link.target,
        text: txt
      });
      this.node.empty();
      content = $("<div>", {
        css: {
          display: "inline-block"
        }
      });
      content.append(link);
      return this.node.append(content);
    };

    CodeNodeFunction.prototype.mathJax = function() {
      var node;
      if (!(node = this.node[0])) {
        return;
      }
      MathJax.Hub.Queue(["PreProcess", MathJax.Hub, node]);
      return MathJax.Hub.Queue(["Process", MathJax.Hub, node]);
    };

    CodeNodeFunction.prototype.processLinks = function() {
      var link, links, _i, _len, _results;
      links = this.node.find("a");
      if (!links.length) {
        return;
      }
      _results = [];
      for (_i = 0, _len = links.length; _i < _len; _i++) {
        link = links[_i];
        _results.push($(link).mousedown((function(_this) {
          return function(evt) {
            return _this.linkCallback($(evt.target));
          };
        })(this)));
      }
      return _results;
    };

    CodeNodeFunction.prototype.restore = function() {
      if (this.originalText) {
        this.node.empty();
        return this.node.text(this.originalText);
      }
    };

    return CodeNodeFunction;

  })();

}).call(this);
