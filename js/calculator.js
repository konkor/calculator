'use strict';

const e = React.createElement;

const NUMS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
const SYMBOLS = "1234567890.+-×÷";

class KeyPad extends React.Component {
  constructor(props) {
    super(props);
    this.css = props.css || "";
  }

  render() {
    return e(
      'div',
      { id: this.props.id || '', className: "keypad " + this.css,
        onClick: (e) => this.props.keypress (this.props.label)
      },
      this.props.label
    );
  }
}

class Calculator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      result: "0",
      formula: "",
      error: ""
    };
    this.checker = this.checker.bind (this);
    this.keypress = this.keypress.bind (this);
    this.handleKeyPress = this.handleKeyPress.bind (this);
  }

  componentDidMount () {
    document.addEventListener ("keydown", this.handleKeyPress);
  }

  componentWillUnmount () {
    document.removeEventListener ("keydown", this.handleKeyPress);
  }

  handleKeyPress (e) {
    let c = "";
    if (e.keyCode == 27) c = 'AC';
    else if (e.keyCode == 13) c = '=';
    this.keypress (c);
  }

  keypress (val) {
    let d = document.getElementById('display');
    //console.log (val);
    switch (val) {
      case 'AC':
        d.value = '';
        break;
      case '=':
        let res = this.calc (d.value);
        if (!Number.isFinite (res)) {
          this.setState ({
            error: res.toString ()
          });
          break;
        }
        this.setState ({
          formula: d.value,
          result: this.precision (res, 10)
        });
        d.value = this.precision (res);
        break;
      default:
        d.value += val;
        d.value = this.checker ({target:{value:d.value}});
        //WORKAROUND to select the end/last values
        d.focus()
        if (typeof d.selectionStart == "number") {
          d.selectionStart = d.selectionEnd = d.value.length;
        } else if (typeof d.createTextRange != "undefined") {
          var range = d.createTextRange();
          range.collapse(false);
          range.select();
        }
    }
    if (this.state.error) this.setState ({ error: "" });
  }

  precision (num, pr = 12) {
    let s = num.toString ();
    if (s.length > pr) {
      s = num.toPrecision (pr);
    }
    return s;
  }

  shorten (str, n = 13) {
    let s = str;
    if (s.length > n) {
      s = s.substring (0, n -1) + '…';
    }
    return s;
  }

  calc (text) {
    var arr = text.split ('+');
    var a = "";
    let res = 0;

    if (arr.length > 1) {
      a = arr.shift ();
      if (a[a.length - 1] != 'e')
        return this.calc (a) + this.calc (arr.join("+"));
      else {
        arr[0] = a + arr[0];
        a = arr.shift();
        if (arr.length > 0) return this.calc (a) + this.calc (arr.join("+"));
      }
    }
    arr = text.split ('-');
    if (arr.length > 1) {
      a = arr.shift ();
      if (a[a.length - 1] != 'e')
        return this.calc (a) - this.calc (arr.join("-"));
      else {
        arr[0] = a + '-' + arr[0];
        a = arr.shift();
        if (arr.length > 0) return this.calc (a) - this.calc (arr.join("-"));
      }
    }
    arr = text.split ('×');
    if (arr.length > 1) {
      a = arr.shift ();
      return this.calc (a) * this.calc (arr.join("×"));
    }
    arr = text.split ('÷');
    if (arr.length > 1) {
      a = arr.pop ();
      return this.calc (arr.join("÷")) / this.calc (a);
    }
    if (arr[0].length) res = parseFloat (arr[0]);
    return res;
  }

  checker(e) {
    if (this.state.error) this.setState ({ error: "" });
    let s = e.target.value.trim ();
    let c = s.length ? s[s.length -1] : '1';
    if (SYMBOLS.indexOf (c) < 0) {
      if (c == '*') s = s.replace ('*', '×');
      else if (c == 'x') s = s.replace ('x', '×');
      else if (c == '/') s = s.replace ('/', '÷');
      else s = s.substring (0, s.length - 1);
    }
    if (s.length == 1 && (s[0]=="×" || s[0]=="÷"))
      s = '';
    if (s[s.length - 1]=="0") {
      let n = this.last_number (s);
      if (n.length == 2 && n[0] == '0') s = s.substring (0, s.length - 1);
    }
    if (s[s.length - 1]==".") {
      let n = this.last_number (s);
      if (this.last_number (s).split ('.').length > 2) s = s.substring (0, s.length - 1);
    }
    if (s != e.target.value)
      e.target.value = s;
    return s;
  }

  last_number (str) {
    let last = '';
    let i = str.length - 1;
    while (i > -1 && ".1234567890".indexOf(str[i]) > -1) {
      last = str[i] + last;
      i--;
    }
    return last;
  }

  render() {
    let logo = e ('a', {id: 'logo', href: "https://github.com/konkor/calculator"}, 'Calculator');
    let history = e ('div', {id: 'history'},
      e ('div', {id: 'formula', title: this.state.formula}, this.shorten (this.state.formula)),
      e ('div', {id: 'result'}, this.state.result),
      e ('div', {id: 'space'}, '=')
    );
    let display = e ('input', {id: 'display', type: 'text', onChange: this.checker, placeholder: 0 }, null);
    let err_message =  e ('div', {id: 'error-panel'}, this.state.error? "Malformed expression":"");
    let pads    = e ('div', {id: 'pads-panel'},
      e (KeyPad, {id: 'clear', label: 'AC', css: 'clear', keypress: this.keypress}, null),
      e (KeyPad, {id: 'divide', label: '÷', css: 'fun', keypress: this.keypress}, null),
      e (KeyPad, {id: 'multiply', label: '×', css: 'fun', keypress: this.keypress}, null),
      e (KeyPad, {id: 'substract', label: '-', css: 'fun', keypress: this.keypress}, null),
      e (KeyPad, {id: 'seven', label: '7', keypress: this.keypress}, null),
      e (KeyPad, {id: 'eight', label: '8', keypress: this.keypress}, null),
      e (KeyPad, {id: 'nine', label: '9', keypress: this.keypress}, null),
      e (KeyPad, {id: 'add', label: '+', css: 'fun plus', keypress: this.keypress}, null),
      e (KeyPad, {id: 'four', label: '4', keypress: this.keypress}, null),
      e (KeyPad, {id: 'five', label: '5', keypress: this.keypress}, null),
      e (KeyPad, {id: 'six', label: '6', keypress: this.keypress}, null),
      e (KeyPad, {id: 'one', label: '1', keypress: this.keypress}, null),
      e (KeyPad, {id: 'two', label: '2', keypress: this.keypress}, null),
      e (KeyPad, {id: 'three', label: '3', keypress: this.keypress}, null),
      e (KeyPad, {id: 'equal', label: '=', css: 'plus equal', keypress: this.keypress}, null),
      e (KeyPad, {id: 'zero', label: '0', css: 'zero', keypress: this.keypress}, null),
      e (KeyPad, {id: 'decimal', label: '.', keypress: this.keypress}, null)
    );
    return e(
      'div',
      { id: 'calculator' },
      logo, history, display, err_message, pads
    );
  }
}

function debug (...args) {
  console.log (...args);
}

const domContainer = document.querySelector('#calculator_container');
const root = ReactDOM.createRoot(domContainer);
root.render(e(Calculator));
