const keyAbleList = ['name', 'id', 'type', 'className']; //支持识别的标签属性
const inputAbleList = ['input', 'textarea']; //支持记录的标签 必须具有value属性 必须为表单类标签
const token = window.location.href;
class FormRecord {
  // inputs;
  inputsRecord;
  constructor () {
    // this.inputsInit();
    this.inputsRecordInit();
    // console.log(this.inputs);
    console.log(this.inputsRecord);
  }
  handleRecord (inputs) {
    this.addEvent(inputs);
    this.getRecord(inputs);
  }
  // inputsInit () {
  //   let inputs = [];
  //   inputAbleList.forEach(name => {
  //     console.log(document.getElementsByTagName('input').length);
  //     inputs = [...inputs, ...document.getElementsByTagName(name)];
  //   });
  //   this.inputs = inputs;
  // }
  inputsRecordInit () {
    let inputsRecordInitValue = JSON.parse(localStorage.getItem(token + '__inputsRecord'));
    if (!inputsRecordInitValue) {
      inputsRecordInitValue = {};
      keyAbleList.forEach(value => {
        inputsRecordInitValue[value] = {};
      });
    }
    this.inputsRecord = inputsRecordInitValue;
  }
  setRecord () {
    for (let input of this.inputs) {
      for (let key of keyAbleList) {
        if (input[key]) {
          this.inputsRecord[key][input[key]] = input.value;
          break;
        }
      }
    }
    this.saveRecord();
    console.log('保存成功');
  }
  getRecord (inputs) {
    if (this.inputsRecord) {
      for (let input of inputs) {
        for (let key of keyAbleList) {
          if (input[key]) {
            this.inputsRecord[key][input[key]] && (input.value = this.inputsRecord[key][input[key]]);
            break;
          }
        }
      }
    }
  }
  saveRecord () {
    localStorage.setItem(token + '__inputsRecord', JSON.stringify(this.inputsRecord));
  }
  addEvent (inputs) {
    for (let input of inputs) {
      input.oninput !== undefined
        ? input.addEventListener('input', this.changeEvent, false)
        : input.addEventListener('change', this.changeEvent, false);
    }
    console.log(inputs);
  }
  changeEvent = e => {
    const input = e.target;
    console.log(input.name, input.id);
    for (let key of keyAbleList) {
      if (input[key]) {
        this.inputsRecord[key][input[key]] = input.value;
        break;
      }
    }
    this.saveRecord();
  };
}
function seekDomToFormRecord (formRecord, domMap, loadedMap, time) {
  let waitLoadDom = [];
  let isLoad = false;
  console.log(domMap);
  console.log(loadedMap);
  inputAbleList.forEach(name => {
    console.log(name + ':' + domMap[name].length);
    const rest = domMap[name].length - loadedMap[name];
    if (rest != 0) {
      //有未加载的
      isLoad = true;
      let thisWaitLoadDom = [];
      for (let i = loadedMap[name]; i <= domMap[name].length - 1; i++) {
        thisWaitLoadDom.push(domMap[name][i]);
      }
      waitLoadDom = [...waitLoadDom, ...thisWaitLoadDom];
      loadedMap[name] = domMap[name].length;
      thisWaitLoadDom = null;
    }
  });
  if (isLoad) {
    time = 0;
    formRecord.handleRecord(waitLoadDom);
  } else {
    time++;
  }
  waitLoadDom = null;
  if (time <= 20) {
    setTimeout(() => {
      seekDomToFormRecord(formRecord, domMap, loadedMap, time);
    }, 200); //200ms查找一次
  } else {
    console.log('停止查找');
  }
}
window.addEventListener(
  'load',
  () => {
    const formRecord = new FormRecord();
    let domMap = {};
    let loadedMap = {};
    inputAbleList.forEach(name => {
      domMap[name] = document.getElementsByTagName(name);
      loadedMap[name] = 0;
    });
    //开启遍历加载模式
    seekDomToFormRecord(formRecord, domMap, loadedMap, 0);
  },
  false
);
document.addEventListener('DOMContentLoaded', () => {
  const inputsRecord = JSON.parse(localStorage.getItem(token + '__inputsRecord'));
  let inputs = [];
  if (inputsRecord) {
    inputAbleList.forEach(name => {
      inputs = [...inputs, ...document.getElementsByTagName(name)];
    });
    for (let input of inputs) {
      for (let key of keyAbleList) {
        if (input[key]) {
          inputsRecord[key][input[key]] && (input.value = '正在加载数据...(easyFormMemory插件)');
          break;
        }
      }
    }
  }
  inputs = null;
});
