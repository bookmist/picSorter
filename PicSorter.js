'use strict';
//global variables
var source = []; // входной массив ссылок на картинки
var rel = []; // массив структур, обозначающих отношения картинок
// структура состоит из двух массивов; aMore и aLess в которых хранятся индексы картинок больше и меньше заданной

function loadSource () {
  var sElem = document.getElementById('source');
  if (sElem !== null) {
    var sData = sElem.value;
    source = sData.split('\n').filter(
      function (item) {
        if (typeof item === 'string') {
          if (item !== '') {
            return true;
          }
        }
        return false;
      }
    );
    // alert(source.length);
  } else {
    alert('error!');
  }
  localStorage.setItem('source',JSON.stringify(source));
};

function initRel () {
  rel = [];
  source.forEach(function (item, i) {
    rel.push({aMore: [], aLess: []});
  });
};

function uniq (a) {
  return a.sort().filter(function (item, pos, ary) {
    return !pos || item !== ary[pos - 1];
  });
}

function addRel (aMax, aMin, r) {
  if (aMin === undefined) { return undefined };
  if (aMax === undefined) { return undefined };
  var t1,t2;
  // 1. прямое добавление
  if (rel[aMax].aLess.indexOf(aMin) < 0) {
    rel[aMax].aLess.push(aMin);    
    t1=1;
  }
  if (rel[aMin].aMore.indexOf(aMax) < 0) {
    rel[aMin].aMore.push(aMax);
    t2=1;
  }
  // все элементы больше макс (rel[aMax].aMore) также больше мин (надо добавить в (rel[aMin].aMore))
  rel[aMin].aMore.push.apply(rel[aMax].aMore);
  uniq(rel[aMin].aMore);
  // все элементы меньше мин также меньше макс
  rel[aMax].aLess.push.apply(rel[aMin].aLess);
  uniq(rel[aMax].aLess);
  // aMax>aMin
  // элемент макс больше каждого элемента меньше мин
  if (r !== 1) {
  uniq(rel[aMin].aLess);
    rel[aMin].aLess.forEach(function (item) { addRel(aMax, item, 1) });
  }

  // элемент мин меньше любого элемента больше макс
  if (r !== 1) {
  uniq(rel[aMax].aMore);
    rel[aMax].aMore.forEach(function (item) { addRel(item, aMin, 1) });
  }
};

function checkRel (a1, a2) {
  if (rel[a1].aLess.indexOf(a2) >= 0) { return 1 };
  if (rel[a1].aMore.indexOf(a2) >= 0) { return -1 };
  if (rel[a2].aLess.indexOf(a1) >= 0) { return -1 };
  if (rel[a2].aMore.indexOf(a1) >= 0) { return 1 };
  return 0;
}

function onCellClick (a1, a2, a3, a4) {
  document.getElementById('sort-table').style.zIndex = -1;
  addRel(a1, a2);
  addRel(a1, a3);
  addRel(a1, a4);
  //localStorage.setItem('rel1',JSON.stringify(rel));
  localforage.setItem('rel',JSON.stringify(rel), function(err, value) {
    console.log(err);
  });
  var res = sort();
  fillResult(res);
}

function sortUISetPic (idx, a1, a2, a3, a4) {
  var sElem = document.getElementById(idx);
  if ((typeof source[a1] === 'string') && (source[a1] !== '')) {
    sElem.style.backgroundImage = 'url(' + source[a1] + ')';
    //sElem.innerHTML = '<img class="si" src="'+source[a1]+'">';
    sElem.innerHTML = a1 + '&nbsp;';
    sElem.onclick = function x () { onCellClick(a1, a2, a3, a4) };
  } else {
    sElem.style.backgroundImage = '';
    sElem.innerHTML = 'Нет&nbsp;изображения';
  }
}

function SortUI (a1, a2, a3, a4) {
  // получает 4 индекса картинок, возвращает, какой из 4 индексов наибольший (на кого кликнули)
  sortUISetPic('i1', a1, a2, a3, a4);
  sortUISetPic('i2', a2, a1, a3, a4);
  sortUISetPic('i3', a3, a2, a1, a4);
  sortUISetPic('i4', a4, a2, a3, a1);
  document.getElementById('sort-table').style.zIndex = 1;
}

function compare (a1, a2, a3, a4, noUI) {
  var t;
  var i;
  var args = [a1, a2, a3, a4];
  for (i = args.length - 1; i >= 0; i--) {
    for (var j = args.length - 1; j >= 0; j--) {
      if (i !== j && args[i] !== undefined && args[j] !== undefined) {
        t = checkRel(args[i], args[j]);
        if (t !== 0) {
          if (t > 0) {
            // args.splice(j,1);
            args[j] = undefined;
          } else {
            args[i] = undefined;
            // args.splice(i,1);
          }
        }
      }
    }
  }
  t = 0;
  var c = 0;
  for (i = args.length - 1; i >= 0; i--) {
    if (args[i] !== undefined) {
      t = i;
      c = c + 1;
    }
  }
  if (c <= 1) { return t + 1 };
  if (!noUI){
    SortUI(args[0], args[1], args[2], args[3]);
  }
  return 0;
}

function sort () {
  var res = [];
  // заполняем массив индексов для сортировки
  var len = source.length;
  var a = new Array(len);
  var i;
  for (i = 0; i < len; i++) {
    a[i] = i;
  };
  for (i = len - 1; i > 0; i--) {
    if (a[i] === undefined) {
      len -= 1;
    } else {
      break;
    };
  };
  // len += 1;
  // len = a.length;
  // получаем индекс последнего корня, по эту позицию сортируем деревья.
  var vTo = Math.round((len + 1) / 3);
  if ((len + 1) % 3 > 0) { vTo += 1 };
  while (res.length<a.length){ //(a[0] !== undefined) {
    // сортируем с конца в начало
    for (i = vTo; i >= 0; i--) {
      // ставим наибольший элемент куста в его корень
      // куст - часть дерева из родителя и его прямых потомков
      var j = compare(a[i], a[i * 3 + 1], a[i * 3 + 2], a[i * 3 + 3]);
      if (j === 0) {
        return res;
      };
      if (j > 1) {
        var t = a[i];
        a[i] = a[i * 3 - 1 + j];
        a[i * 3 - 1 + j] = t;
      };
    }
    if (a[0] === undefined) { continue };
    // теперь в корне дерева у нас наибольший элемент
    // кладем его в result
    res.push(a[0]);
    // затираем корень
    a[0] = undefined;
    // находим в основании дерева наилучший элемент для обмена
    for (i = len - 1; i > 0; i--) {
      if (a[i] === undefined) {
        len -= 1;
      } else {
        break;
      };
    };
    // len += 1;
    // получаем индекс последнего корня, по эту позицию сортируем деревья.
    vTo = Math.round((len + 1) / 3);
    if ((len + 1) % 3 > 0) { vTo += 1 };

    var bestChangeId = len - 1;
    for (;a[bestChangeId] === undefined && bestChangeId > vTo; bestChangeId--) {};
    var bestChangeVal = -len;
    for (i = vTo; i < len; i++) {
      // считаем уровень качества элемента
      // лучший это тот, у которого больше всего aLess и меньше всего aMore
      if (a[i] === undefined) { continue };
      var t1 = rel[a[i]].aLess;
      if (Array.isArray(t1)) { t1 = t1.length } else { t1 = 0 };
      var t2 = rel[a[i]].aMore;
      if (Array.isArray(t2)) { t2 = t2.length } else { t2 = 0 };
      var chVal = t1 - t2;
      // var chVal = rel[a[i]].aLess.length-rel[a[i]].aMore.length;
      if (chVal >= bestChangeVal) {
        bestChangeVal = chVal;
        bestChangeId = i;
      }
    }
    if (a[bestChangeId] === undefined) {
      // alert('end');
    };
    // меняем его с корнем
  //  a[0] = a[bestChangeId];
  //  a[bestChangeId] = undefined;
    // запускаем цикл заново
  }
  return res;
};

function fillResult (res) {
  var txt = '';
  var list = '';
  res.forEach(function (item) {
    txt = txt + source[item] + '\n';
    list = list + '<option>' + source[item] + '</option>\n';
  });
  document.getElementById('result').value = txt;
  document.getElementById('result1').innerHTML = list;
};

function recompileRel(){
  rel.forEach(function(item,i){
    uniq(item.aMore);
    item.aMore.forEach(function(item1,i1){rel[item1].aLess.push(i)})
    uniq(item.aLess);
    item.aLess.forEach(function(item1,i1){rel[item1].aMore.push(i)})
  })
  rel.forEach(function(item,i){
    uniq(item.aMore);
    uniq(item.aLess);
  })
};

/* eslint-disable no-unused-vars */
function onStart () {
/* eslint-enable no-unused-vars */
  if (localStorage.getItem('source') === null) {
    loadSource();
  } else {
    source = JSON.parse( localStorage.getItem('source') );
  }
  localforage.getItem('rel', function(err,value) {
    if (value === null) {
      if (localStorage.getItem('rel1') === null) {
        initRel();
      } else {
        rel = JSON.parse( localStorage.getItem('rel1') );
      }
    } else {
      rel = JSON.parse( value );
    }
    
    var res = sort();
    fillResult(res);

    //console.log('we just read ' + value);
  });
/*
  if (localStorage.getItem('rel1') === null) {
    initRel();
  } else {
    //localStorage.removeItem('rel');
    rel = JSON.parse( localStorage.getItem('rel1') );
    //recompileRel();
  }*/
//  var res = sort();
//  fillResult(res);
};
/*
window.addEventListener('keydown',function(e){
	//if (e.which==106) {
	  document.getElementById('sort-table').style.zIndex = -1;			
	//}
	
	},false)*/