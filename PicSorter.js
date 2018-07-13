'use strict';

/* todo
* Задачи для сортировщика.
1. Выделить сущность сортировка. Составляющие - список объектов и соотношения. + имя
2. возможность задать имя сортировки
3. хранение сортировок в локалСтораже
+5. добавление file:/// к именам файлов на входе
7. возможность добавлять и удалять файлы из списка в процессе сортировки
8. Перестановка картинок в удобном порядке
9. масштабирование картинок
* */
//global variables
let source = []; // входной массив ссылок на картинки
const stats = []; //статистика. кол-ва сравнений после каждого прохода массива

let testing = false; //тестирование (сравнивает комп) или прод (сравнивает пользователь)

//объект, содержащий отношения картинок
const relations = {
    rel: [], /*
     массив структур, обозначающих отношения картинок
     структура состоит из двух массивов; aMore и aLess в которых хранятся индексы картинок больше и меньше заданной
     */

    init: function (count) {
        this.rel = [];
        for (; count--; count > 0) {
            this.rel.push({aMore: [], aLess: []});
        }
    },

    uniq: function (a) {
        return a.sort().filter(function (item, pos, ary) {
            return !pos || item !== ary[pos - 1];
        });
    },

    add: function (aMax, aMin, r) {
        if ((aMin === undefined) || (aMax === undefined)) {
            return undefined
        }
        //let t1, t2;
        // 1. прямое добавление
        if (this.rel[aMax].aLess.indexOf(aMin) < 0) {
            this.rel[aMax].aLess.push(aMin);
            //t1 = 1;
        }
        if (this.rel[aMin].aMore.indexOf(aMax) < 0) {
            this.rel[aMin].aMore.push(aMax);
            //t2 = 1;
        }
        // все элементы больше макс (rel[aMax].aMore) также больше мин (надо добавить в (rel[aMin].aMore))
        this.rel[aMin].aMore.push.apply(this.rel[aMax].aMore);
        this.uniq(this.rel[aMin].aMore);
        // все элементы меньше мин также меньше макс
        this.rel[aMax].aLess.push.apply(this.rel[aMin].aLess);
        this.uniq(this.rel[aMax].aLess);
        // aMax>aMin
        const self = this;
        // элемент макс больше каждого элемента меньше мин
        if (r !== 1) {
            this.uniq(this.rel[aMin].aLess);
            this.rel[aMin].aLess.forEach(function (item) {
                self.add(aMax, item, 1)
            });
        }
        // элемент мин меньше любого элемента больше макс
        if (r !== 1) {
            this.uniq(this.rel[aMax].aMore);
            this.rel[aMax].aMore.forEach(function (item) {
                self.add(item, aMin, 1)
            });
        }
    },

    check: function (a1, a2) {
        if (this.rel[a1].aLess.indexOf(a2) >= 0) {
            return 1
        }
        if (this.rel[a1].aMore.indexOf(a2) >= 0) {
            return -1
        }
        if (this.rel[a2].aLess.indexOf(a1) >= 0) {
            return -1
        }
        if (this.rel[a2].aMore.indexOf(a1) >= 0) {
            return 1
        }
        return 0;
    }
};

const stat = {
    compares: 0,
    compares2: 0,
    compares3: 0,
    compares4: 0,

    initStat: function () {
        this.compares = 0;
        this.compares2 = 0;
        this.compares3 = 0;
        this.compares4 = 0;
    },

    showStat: function () {
        console.log('Всего сравнений: ' + this.compares.toString());
        console.log('Cравнений 2 значений: ' + this.compares2.toString());
        console.log('Cравнений 3 значений: ' + this.compares3.toString());
        console.log('Cравнений 4 значений: ' + this.compares4.toString());
    },

    addStat: function (a1, a2, a3, a4) {
        let t = 0;
        if (((typeof source[a1] === 'string') && (source[a1] !== ''))) {
            t += 1;
        }
        if (((typeof source[a2] === 'string') && (source[a2] !== ''))) {
            t += 1;
        }
        if (((typeof source[a3] === 'string') && (source[a3] !== ''))) {
            t += 1;
        }
        if (((typeof source[a4] === 'string') && (source[a4] !== ''))) {
            t += 1;
        }
        if (t === 2) {
            this.compares2 += 1;
        }
        if (t === 3) {
            this.compares3 += 1;
        }
        if (t === 4) {
            this.compares4 += 1;
        }
        this.compares += 1;

    }
};

function getSource(id) {
    const sElem = document.getElementById(id);
    if (sElem === null) {
        alert('Не найден элемент с id source');
        return [];
    }
    const sData = sElem.value;
    if (typeof sData !== 'string') {
        return [];
    }
    return sData.split('\n').filter(item => ((typeof item === 'string') && (item !== '')));
}

function loadSource() {
    source = getSource('source');
    localStorage.setItem('source', JSON.stringify(source));
}

function showSortTable() {
    document.getElementById('sort-table').style.zIndex = '1';
}

function hideSortTable() {
    document.getElementById('sort-table').style.zIndex = '-1';
}

function onCellClick(a1, a2, a3, a4) {
    hideSortTable();
    relations.add(a1, a2);
    relations.add(a1, a3);
    relations.add(a1, a4);

    sortObj.continueSort();
}

function nvl(val_, nullVal) {
    if (val_ === undefined) {
        return nullVal;
    } else {
        return val_;
    }
}

function sortUISetPic(idx, a1, a2, a3, a4) {
    const sElem = document.getElementById(idx);
    if ((typeof source[a1] === 'string') && (source[a1] !== '')) {
        //sElem.style.backgroundImage = 'url(' + source[a1] + ')';
        sElem.innerHTML = '<img class="si" src="'+source[a1]+'">';
        //sElem.innerHTML = source[a1] + '&nbsp;';
        sElem.onclick = function x() {
            onCellClick(a1, a2, a3, a4)
        };
    } else {
        sElem.style.backgroundImage = '';
        sElem.innerHTML = 'Нет&nbsp;изображения';
    }
    if (testing) {
        /*Для тестирования*/
        if ((source[a1] >= nvl(source[a2], -1)) && (source[a1] >= nvl(source[a3], -1)) && (source[a1] >= nvl(source[a4], -1))) {
            setTimeout(function x() {
                onCellClick(a1, a2, a3, a4)
            }, 1);
        }
    }
}

function SortUI(a1, a2, a3, a4) {
    // получает 4 индекса картинок, возвращает, какой из 4 индексов наибольший (на кого кликнули)
    sortUISetPic('i1', a1, a2, a3, a4);
    sortUISetPic('i2', a2, a1, a3, a4);
    sortUISetPic('i3', a3, a2, a1, a4);
    sortUISetPic('i4', a4, a2, a3, a1);
    if (!testing) {
        showSortTable();
    }
    stat.addStat(a1, a2, a3, a4);
}

function compare(a1, a2, a3, a4, noUI) {
    let t;
    let i;
    const args = [a1, a2, a3, a4];
    for (i = args.length - 1; i >= 0; i--) {
        for (let j = args.length - 1; j >= 0; j--) {
            if (i !== j && args[i] !== undefined && args[j] !== undefined) {
                t = relations.check(args[i], args[j]);
                if (t !== 0) {
                    if (t > 0) {
                        args[j] = undefined;
                    } else {
                        args[i] = undefined;
                    }
                }
            }
        }
    }
    t = 0;
    let c = 0;
    for (i = args.length - 1; i >= 0; i--) {
        if (args[i] !== undefined) {
            t = i;
            c = c + 1;
        }
    }
    if (c <= 1) {
        return t + 1
    }
    if (!noUI) {
        SortUI(args[0], args[1], args[2], args[3]);
    }
    return 0;
}

function showStat(r,c) {
    document.getElementById('stat_round').textContent = r;
    document.getElementById('stat_comp').textContent = c;
}

const sortObj = {
    res: undefined,
    len: undefined,
    a: undefined,
    i: undefined,
    vTo: undefined,

    onSortFinish:function(){},
    onSortStep:function(){},

    sortFinish:function(){
        if (typeof(this.onSortFinish) ==='function'){
            this.onSortFinish();
        }
    },
    sortStep:function(){
        if (typeof(this.onSortStep)==='function'){
            this.onSortStep();
        }
    },

    init_: function (source) {
        this.res = [];
        // заполняем массив индексов для сортировки
        this.len = source.length;
        this.a = new Array(this.len);

        for (let i = 0; i < this.len; i++) {
            this.a[i] = i;
        }
        for (let i = this.len - 1; i > 0; i--) {
            if (this.a[i] === undefined) {
                this.len -= 1;
            } else {
                break;
            }
        }
        // len += 1;
        // len = a.length;
        // получаем индекс последнего корня, по эту позицию сортируем деревья.
        this.vTo = Math.round((this.len + 1) / 3);
        if ((this.len + 1) % 3 > 0) {
            this.vTo += 1
        }
        this.i = this.vTo;
    },

    sort_: function () {
        while (this.res.length < this.a.length) { //(a[0] !== undefined) {
            // сортируем с конца в начало
            for (; this.i >= 0; this.i--) {
                // ставим наибольший элемент куста в его корень
                // куст - часть дерева из родителя и его прямых потомков
                showStat(this.res.length,this.i+1);
                const j = compare(this.a[this.i], this.a[this.i * 3 + 1], this.a[this.i * 3 + 2], this.a[this.i * 3 + 3]);
                if (j === 0) {
                    return false;
                }
                if (j > 1) {
                    const t = this.a[this.i];
                    this.a[this.i] = this.a[this.i * 3 - 1 + j];
                    this.a[this.i * 3 - 1 + j] = t;
                }
            }
            if (this.a[0] === undefined) {
                continue
            }
            // теперь в корне дерева у нас наибольший элемент
            // кладем его в result
            this.res.push(this.a[0]);
            // затираем корень
            //this.a.splice(0, 1);
            this.a[0] = undefined;
            // находим в основании дерева наилучший элемент для обмена
            for (let i = this.len - 1; i > 0; i--) {
                if (this.a[i] === undefined) {
                    this.len -= 1;
                } else {
                    break;
                }
            }
            // len += 1;
            // получаем индекс последнего корня, по эту позицию сортируем деревья.
            this.vTo = Math.round((this.len + 1) / 3);
            if ((this.len + 1) % 3 > 0) {
                this.vTo += 1
            }
            let bestChangeId = this.len - 1;

            for (; this.a[bestChangeId] === undefined && bestChangeId > this.vTo; bestChangeId--) {
            }
            let bestChangeVal = -this.len;
            for (let i = this.vTo; i < this.len; i++) {
                // считаем уровень качества элемента
                // лучший это тот, у которого больше всего aLess и меньше всего aMore
                if (this.a[i] === undefined) {
                    continue
                }
                let t1 = relations.rel[this.a[i]].aLess;
                if (Array.isArray(t1)) {
                    t1 = t1.length
                } else {
                    t1 = 0
                }
                let t2 = relations.rel[this.a[i]].aMore;
                if (Array.isArray(t2)) {
                    t2 = t2.length
                } else {
                    t2 = 0
                }
                const chVal = t1 - t2;
                //var chVal = t2 - t1;
                // var chVal = relations.rel[a[i]].aLess.length-relations.rel[a[i]].aMore.length;
                if (chVal >= bestChangeVal) {
                    bestChangeVal = chVal;
                    bestChangeId = i;
                }
            }
            if (this.a[bestChangeId] === undefined) {
                // alert('end');
            }
            /* */
            // меняем его с корнем
            this.a[0] = this.a[bestChangeId];
            this.a[bestChangeId] = undefined;
            stats.push([stat.compares, stat.compares2, stat.compares3, stat.compares4]);

            // запускаем цикл заново
            this.i = this.vTo;
            this.sortStep();
        }
        this.sortFinish();
        return true;
    },

    continueSort:function(){
        this.sort_();
        if (!testing) {
            fillResult(this.res);
        }
    },

    sort:function sort() {
        stat.initStat();
        relations.init(source.length);
        this.init_(source);
        this.sort_();
    }
};


function fillResult(res) {
    setSource('result',res.map(item => source[item]));
    document.getElementById('result1').innerHTML = res.map(item => '<option>' + source[item] + '</option>').join('\n');
    document.getElementById('logs').value = JSON.stringify(relations.rel);
}

function onStart() {
    loadSource();
    sortObj.sort();
}

function onContinue() {
    sortObj.continueSort()
}

 window.addEventListener('keydown',function(e){
 if (e.code==='Escape') {
     hideSortTable();
 }

 },false);

function saveContent(fileContents, fileName) {

    const blob = new Blob([fileContents], {type: "text/plain;charset=utf-8"});
    saveAs(blob, fileName);
}

function saveContent_() {
    saveContent(JSON.stringify({source: source, relations: relations.rel}), 'SortInfo.txt');
}

function readSingleFile(e) {
    let file = e.target.files[0];
    if (!file) {
        return undefined;
    }
    const reader = new FileReader();
    reader.onload = function (e) {
        const contents = e.target.result;
        displayContents(contents);
    };
    reader.readAsText(file);
}

function displayContents(contents) {
    let contentObj;
    try {
        contentObj = JSON.parse(contents);
    } catch (e) {
        alert('Ошибка разбора файла. Загрузка отменена.' + e.name);
        return;
    }
    if (!contentObj.source) {
        alert('В файле нет необходимых данных. Загрузка отменена.');
        return;
    }
    //load params
    source = contentObj.source;
    relations.rel = contentObj.relations;
    if (!relations.rel) {
    	alert('reinit relations');
        relations.init(source.length);
    }
    setSource('source',source);
    sortObj.init_(source);
    sortObj.sort_();
}

function setSource(id,arr) {
  document.getElementById(id).value = arr.join('\n');
}

function onCreateCmd(){
  let names = getSource('result');
  let l = names.length;
  l = l.toString().length;
  let newNames = names.map(function (name,idx) {
          const shortName = name.substr(name.lastIndexOf('\\'));
          return 'rename ' + shortName + ' '+(idx+1).toString().padStart(l, '0')+'_'+ shortName;
      }
  );
  setSource('result',newNames);
}

function  onAddFile(){
    setSource('source',getSource('source').map(item => 'file:///'+item));
}

document.getElementById('file-input')
    .addEventListener('change', readSingleFile, false);
