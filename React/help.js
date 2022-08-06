// инициализация
function loadScript(src, callback) {
    let script = document.createElement('script');
    script.src = src;
//   onload событие которое происходит после загрузки скрипта
//   callback то что должно произойти непосредственно после загрузки скрипта
    script.onload = () => callback(script);
  
    document.head.append(script);
  }

// 
  loadScript('/my/script.js', function() {
    // эта функция вызовется после того, как загрузится скрипт
    newFunction(); // теперь всё работает
    ...
  });