const { exec } = require("child_process");
const { promisify } = require("util");
const fs = require("fs");

lemmatization(10);

async function lemmatization(N) {
  let str = [];
  for (let i = 1; i <= N; i++) {
    str.push(
      `cd ./mystem & mystem.exe ..\\texts\\in-text${i}.txt ..\\texts\\text${i}.txt -l -n -d`
    );
  }
  //console.log(str);
  console.log("ОБРАБОТКА ФАЙЛОВ..");
  await Promise.all(str.map(str => promisify(exec)(str)));
  console.log("ОБРАБОТКА ФАЙЛОВ ЗАВЕРШЕНА");
  workWithFiles();
}

function raznost(A, B) {
  // очистка от стоп-слов // разность множеств
  diff = A.filter(x => !B.includes(x));
  return diff;
}

function getAverageScore(rang) {
  let score = [];
  for (let i = 0; i < rang.length; i++) {
    score[i] = null;
    //console.log(i, "текст:", rang[i].length);
    for (let j = 0; j < rang[i].length; j++) {      
      if (rang[i][j] !== null) {
        score[i] += rang[i][j];
      }
    }
  }
  return score;
}

async function workWithFiles() {
  "use strict";
  let fileNames = [];
  for (let i = 1; i <= 10; i++) {
    fileNames.push(`texts/text${i}.txt`);
  }
  fileNames.push("mystem/mysor.txt");
  fileNames.push("convertcsv (3).json");
  
  const files = await Promise.all(
    fileNames
      // Метод map() создаёт новый массив с результатом вызова указанной функции для каждого элемента массива.
      .map(path => promisify(fs.readFile)(path, { encoding: "utf8" }))
  );

  const dictionary = JSON.parse(files.pop());
  

  for (let i = 0; i < files.length; i++) {
    // делаем массивы слов
    files[i] = files[i].split(/[,]|[\n]/);
  }

  for (let i = 0; i < files.length; i++) {
    // убираем конечные пробелы
    for (let j = 0; j < files[i].length; j++) {
      files[i][j] = files[i][j].replace(/[?]*/g, "").trim();
    }
  }

  const mysor = files.pop();
  //console.log(mysor);

  
  for (let i = 0; i < files.length; i++) {
    files[i] = raznost(files[i], mysor); // убираем стоп-слова
  }


  //console.log(dictionary[7544]);
  let rang = [];
  
  for (let i = 0; i < files.length; i++) {
    rang[i] = [];
    for (let j = 0; j < files[i].length; j++) {
      //rang[i][j] = null;
      let k = 0;
      while (dictionary) {
        if(dictionary[k] === undefined){
          rang[i][j] = null;
          //console.log('-'+dictionary[k])
          break;
        } else 
        if (files[i][j] === dictionary[k].Words) {
          rang[i][j] = dictionary[k]["average rate"];
          //console.log('+'+dictionary[k])
          break;
        }
        //console.log(dictionary[i].Words);
        k++;
      }
    }
  }

  const score = getAverageScore(rang); // получение средней оценки для каждого текста

  let l = 1;
  while (l<=10) {
    console.log(`оценка ${l} текста: ${score[l-1]}`);
    l++;
  }
}


