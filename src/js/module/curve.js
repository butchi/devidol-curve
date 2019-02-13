import ns from './ns';

export default class Curve {
  constructor(opts = {}) {
    this.initialize(opts);
  }

  initialize({ components, maxFreqOpt }) {
    this.components = components;
    this.maxFreqOpt = maxFreqOpt;

    // components: 級数展開の係数の配列
    this.func = axis => {
      // axis:  x: 0, y: 1
      return t => {
        let ret = components[axis][0]; // 定数（周波数0）
        const maxFreqOrg = components[axis].length - 1; // 級数
        const maxFreq = Math.min(maxFreqOpt || maxFreqOrg, maxFreqOrg); // 何次まで拾うか
        for (let i = 1; i <= maxFreq; i++) {
          const cmp = components[axis][i];
          // cmp[0]: 係数, cmp[1]: 位相
          ret += cmp[0] * Math.sin(i * t + cmp[1]);
        }
        return ret;
      };
    };

    this.funcX = this.func(0);
    this.funcY = this.func(1);

    this.vertexArr = [];

    for (let t = 0; t < 2 * Math.PI; t += Math.PI / 256) {
      this.vertexArr.push([this.funcX(t), this.funcY(t)]);
    }
  }

  draw() {
    const curve = document.createElementNS("http://www.w3.org/2000/svg", "polygon");

    curve.setAttribute('points', this.vertexArr);

    ns.$canvas.append(curve);
  }

  toExpression() {
    // https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Math/sign#Polyfill
    if (!Math.sign) {
      Math.sign = function(x) {
        return ((x > 0) - (x < 0)) || +x;
      };
    }

    const strPair = [];

    this.components.forEach((component, axisIndex) => {
      const len = component.length;

      let str = component[0];
      const maxFreqOrg = len - 1; // 級数
      const maxFreq = Math.min(this.maxFreqOpt || maxFreqOrg, maxFreqOrg); // 何次まで拾うか

      for (let i = 1; i <= maxFreq; i++) {
        const a = component[i][0];
        const aSgn = Math.sign(a);
        const aAbs = Math.abs(a);

        const q = component[i][1];
        const qSgn = Math.sign(q);
        const qAbs = Math.abs(q);

        const isExist = (aSgn !== 0);

        if(isExist) {
          str += ' ' + (aSgn === 1 ? '+' : '-') + ' ' + (a === 1 ? '' : a) + 'sin(' + (i === 1 ? '' : i) + 't' + ((qAbs === 0) ? '' : ' ' + (qSgn === 1 ? '+' : '-') + ' ' + qAbs + ')');
        }
      }

      strPair[axisIndex] = str;
    });

    return {
      x: strPair[0],
      y: strPair[1],
    };
  }
}