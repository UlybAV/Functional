"use strict";
// const http = require('http');
const { exec } = require('child_process');
const fs = require('fs');
const express = require('express');
const app = express();

const hostname = 'localhost';
const port = 8080;
const logDir = '/var/log/TMP/Rubilnik';

const version = '1.0.0';
const authorString = 'Автор - Улыбин Александр Валерьевич, Тюмень, 2022г.';

const passwordUrlSeparator = ';';
const password = 'secret-passer';
const cmdPwrOn = '/pwrOn';
const signalMsg = 'Cигнал на включение подан. Проверьте соединение с ПК через пару минут. Эту страницу можно закрыть.';

function headHTML(res) {
  res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
  res.write('<!DOCTYPE html>');
  res.write("<meta charset = 'utf-8'>");
  res.write("<body bgcolor = 'BEBEBE'>");
}

function splitTgtFrmPswd(reqUrl)
{
  const inputPassword = reqUrl.split(passwordUrlSeparator)[0].slice(1);
  const inputTarget = reqUrl.split(passwordUrlSeparator)[1];

  console.log('inputPassword = ', inputPassword);
  console.log('inputTarget = ', inputTarget);

  return inputTarget;
}
function waker(mac){
    exec('wakeonlan ' + mac, (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
});
}

function logger (req, status) {
  const log = (new Date().toString() + ` ${req.headers["host"]} ${req.url} ${req.headers["user-agent"]}\n`);

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
    console.log('Создаю директорию ' + logDir);
  }
  console.log(log);
 if (status === 'success') fs.appendFile(logDir + '/success.log', log, function (error) {
  if (error) throw error;
 });
 else if (fs.appendFile(logDir + '/fail.log', log, function(error) {
  if (error) throw error;
 }));
}


app.get('/' + password + passwordUrlSeparator + '*', (req, res) => {
  console.log('---------');
  const reqUrl = req.url;
  
  headHTML(res);
  res.write('Для включения Вашего компьютера нажмите кнопку ниже:<br><br>');
  
  console.log('reqUrl = ', reqUrl);
  
  const inputTarget = splitTgtFrmPswd(reqUrl);
 
  const fetchString = `<script>
  function fetchPwrOn(){
    fetch('${cmdPwrOn}${password}${passwordUrlSeparator}${inputTarget}');
    alert('${signalMsg}');
  }
  </script>`;

  const buttonString = "<button onclick = 'fetchPwrOn()'>Включить ПК</button>";

  res.write(fetchString); 
  res.write(buttonString);
  res.end(`<br><br><a href="" onclick = "alert('${authorString}')"> Рубильник, версия: ${version} </a>`);
  logger(req);
});

app.get(cmdPwrOn + password + '*', (req, res) => {
  console.log('Попали в блок включения.');
  // console.log('reqUrl = ' + req.url);
  headHTML(res);
  const target = splitTgtFrmPswd(req.url);
  console.log('Включаю цель: ' + target);

  res.end(`<script>alert('${signalMsg}')</script>`);
  logger(req,'success');
})

app.get('/favicon.ico', (req, res) => {
  // console.log('app get' + req.url);
  // res.end();
})

app.get('*', (req, res) => {
  console.log('app get * вызван, reqURL = ', req.url);
  logger(req);
  //  res.end();
});

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
})

