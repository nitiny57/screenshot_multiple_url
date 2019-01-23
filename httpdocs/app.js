const nodemailer = require('nodemailer');
const puppeteer = require('puppeteer');
//process.setMaxListeners(25);
const news_sites = require('./urls.js');
var startingDate = new Date().getTime() / 1000;
var mailOptions = {

  from: '"adam" <adam@abc.com>', // sender address
  to: 'example1@gmail.com, example2@gmail.com', // list of receivers
  subject: 'website screenshot', // Subject line
  text: 'website screenshot', // plain text body
  html: '<b>Screenshots</b>', // html body
  attachments: []
};


async function doScreenCapture(url, site_name, lang, callback) {
  const browser = await puppeteer.launch(
    {
      headless: true,
      args: ['--no-sandbox']
    }
  );
  const page = await browser.newPage();
  await page.setViewport({ width: 1500, height: 2000 });
  await page.goto(url, {
    waitUntil: 'networkidle2',
    timeout: 300000
  });
  await page.screenshot({
    path: `./img/${lang}/${site_name}.jpg`
  });
  await browser.close();
  await callback('Saved');


}



function SaveAllImages(url, name, lang) {
  return new Promise((res, rej) => {
    doScreenCapture(url, name, lang, function (status) {
      res(url + ' ' + status);
    }).catch((err) => {
      rej(url + ' Rejected with error ---->' + err);
    });
  })

}

function EmailOfEnglishSites() {
  return new Promise((res, rej) => {
    news_sites.forEach(site => {
      if (Object.is(site.lang, "English")) {
        mailOptions.attachments.push({
          filename: `${site.name}.jpg`,
          path: `./img/${site.lang}/${site.name}.jpg`
        });
      }
    });

    nodemailer.createTestAccount((err, account) => {
      // create reusable transporter object using the default SMTP transport
      var transporter = nodemailer.createTransport({
        host: '192.168.0.1',//host ip
        port: 25,
        secure: false, // true for 465, false for other ports
      });
      transporter.sendMail(mailOptions, (error, info) => {

        if (error) {
          rej('English Mail not sent with error ------->' + error);
        }
        res('English Mail Successfully Sent');
      });
    })
  })
}
function EmailOfHindiSites() {
  return new Promise((res, rej) => {
    mailOptions.attachments = [];
    news_sites.forEach(site => {
      if (Object.is(site.lang, "Hindi")) {

        mailOptions.attachments.push({
          filename: `${site.name}.jpg`,
          path: `./img/${site.lang}/${site.name}.jpg`
        });
      }
    });


    nodemailer.createTestAccount((err, account) => {
      // create reusable transporter object using the default SMTP transport
      var transporter = nodemailer.createTransport({
        host: '192.168.0.1',//host ip
        port: 25,
        secure: false, // true for 465, false for other ports
      });



      transporter.sendMail(mailOptions, (error, info) => {

        if (error) {
          rej('Hindi Mail not sent with error ------->' + error);
        }
        res('Hindi Mail Successfully Sent');

      });
    })
  })
}

function timeToExecute() {
  return new Promise(res => {
    let totalTime = (new Date().getTime() / 1000 - startingDate) / 60
    res(`Time of execution is ${totalTime} minutes.`);
  })
}

async function masterFunction() {
  for (var i = 0; i < news_sites.length; i++) {
    await SaveAllImages(news_sites[i].url, news_sites[i].name, news_sites[i].lang).then(message => {
      console.log(message);
    })
      .catch(error => {
        console.log(error)
      })
  }

  await EmailOfEnglishSites().then(message => {
    console.log(message);
  })
    .catch(error => {
      console.log(error)
    })


  await EmailOfHindiSites().then(message => {
    console.log(message);
  })
    .catch(error => {
      console.log(error)
    })

  await timeToExecute().then(message => {
    console.log(message);
  })
}
masterFunction();
