this.Runner = class Runner {
  constructor(microvm) {
    this.microvm = microvm;
  }

  init() {
    var kd, key, src;
    this.initialized = true;
    window.ctx = this.microvm.context.global;
    src = "";
    for (key in this.microvm.context.global) {
      kd = key;
      src += `${kd} =  window.ctx.${key}\n`;
    }
    window.stdout = {
      write: (text) => {
        return this.microvm.context.meta.print(text);
      }
    };
    window.stderr = {
      write: (text) => {
        var f, file, i, len, line, t;
        if (Array.isArray(text)) {
          line = 1;
          file = "";
          for (i = 0, len = text.length; i < len; i++) {
            t = text[i];
            f = t.split("File");
            if (f[1] != null) {
              f = f[1].split('"');
              if ((f[1] != null) && f[1].length > 0) {
                file = f[1];
              }
            }
            t = t.split(" line ");
            if (t[1] != null) {
              line = t[1].split("\n")[0].split(",")[0];
            }
          }
          this.microvm.context.location = {
            token: {
              file: file,
              line: line,
              column: 0
            }
          };
          throw text[text.length - 1].replace("\n", "");
        } else {
          throw text;
        }
      }
    };
    src += "import sys\n\nsys.stdout = window.stdout\n\nsys.stderr = window.stderr\n\n\ndef __reportError(err):\n  window.reportError(err)";
    return this.run(src);
  }

  run(program, name = "") {
    var err, res;
    if (!this.initialized) {
      this.init();
    }
    //console.info program
    window.__reportError = (err) => {
      return console.info("plop");
    };
    console.log = function(err, error) {
      console.info("ploum");
      console.info(err);
      return console.info(error);
    };
    try {
      res = python(program, name);
      program = "import traceback\nimport sys\n\ndef __draw():\n  try:\n    draw()\n  except BaseException as err:\n    sys.stderr.write(traceback.format_exception(err))\n\n  except Error as err:\n    sys.stderr.write(traceback.format_exception(err))\n\ndef __update():\n  try:\n    update()\n  except BaseException as err:\n    sys.stderr.write(traceback.format_exception(err))\n\n  except Error as err:\n    sys.stderr.write(traceback.format_exception(err))\n\ndef __init():\n  try:\n    init()\n  except BaseException as err:\n    sys.stderr.write(traceback.format_exception(err))\n\n  except Error as err:\n    sys.stderr.write(traceback.format_exception(err))\n\nif \"draw\" in globals():\n  window.draw = __draw\n\nif \"update\" in globals():\n  window.update = __update\n\nif \"init\" in globals():\n  window.init = __init";
      python(program, "__init__");
      return res;
    } catch (error1) {
      err = error1;
      throw err.toString();
    }
  }

  call(name, args) {
    var err;
    if ((name === "draw" || name === "update" || name === "init") && typeof window[name] === "function") {
      try {
        return window[name]();
      } catch (error1) {
        err = error1;
        throw err.toString();
      }
    } else {

    }
  }

  toString(obj) {
    if (obj != null) {
      return obj.toString();
    } else {
      return "none";
    }
  }

};
