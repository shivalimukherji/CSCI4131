const http = require('http');
const url = require('url');
const fs = require('fs');
const qs = require('querystring');

const port = 9001;
http.createServer(function(req, res) {
  var q = url.parse(req.url, true);
  if (q.pathname === '/') {
    indexPage(req, res);
  }
  else if (q.pathname === '/index.html') {
    indexPage(req, res);
  } else if (q.pathname === '/schedule.html') {
    schedulePage(req, res);
  } else if (q.pathname == '/addEvent.html') {
    addEvent(req, res);
  } else if (q.pathname == '/getSchedule') {
    getSchedule(req, res);
  } else if (q.pathname == '/postEventEntry') {
    postEventEntry(req, res);
  } else if (q.pathname == '/eventInterferes') {
    eventInterferes(req, res);
  }
  else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    return res.end("404 Not Found");
  }
}).listen(port);


function indexPage(req, res) {
  fs.readFile('client/index.html', (err, html) => {
    if (err) {
      throw err;
    }
    res.statusCode = 200;
    res.setHeader('Content-type', 'text/html');
    res.write(html);
    res.end();
  });
}

function schedulePage(req,res) {
  console.log("in schedule.html");
  fs.readFile('client/schedule.html', (err, html) => {
    if (err) { throw err; }
    console.log("got file: ");

    res.statusCode = 200;
    res.setHeader('Content-type', 'text/html');
    res.write(html);
    res.end();
  });
}

function addEvent(req,res) {
  console.log("in addEvent.html");
  fs.readFile('client/addEvent.html', (err, html) => {
    if (err) { throw err; }
    console.log("got file: ");
    
    res.statusCode = 200;
    res.setHeader('Content-type', 'text/html');
    res.write(html);
    res.end();
  });
}

function getSchedule(req, res) {
  console.log("in getSchedule");
  var query = url.parse(req.url, true).query;
  console.log('query.day: ', query.day);
  let day = query.day;
  var eventsOfDay = [];
  var eventString = {};
  fs.readFile('schedule.json', (err, jsonString) => {
    if (err) { console.log("Error reading file: ", err); throw err; }
    console.log("got file: ");
    try {
      const json = JSON.parse(jsonString);
      if (day == "monday") {
        eventsOfDay = json["monday"];
      }
      if (day == "tuesday") {
        eventsOfDay = json["tuesday"];
      }
      if (day == "wednesday") {
        eventsOfDay = json["wednesday"];
      }
      if (day == "thursday") {
        eventsOfDay = json["thursday"];
      }
      if (day == "friday") {
        eventsOfDay = json["friday"];
      }
      if (day == "saturday") {
        eventsOfDay = json["saturday"];
      }
      if (day == "sunday") {
        eventsOfDay = json["sunday"];
      }
      eventString = JSON.stringify(eventsOfDay);      
    } catch (err) {
      console.log("Processing error:", err);
      throw err;
    }
    //console.log('eventString: ', eventString);
    res.statusCode = 200;
    res.setHeader('Content-type', 'application/json');
    res.write(eventString);
    res.end();
  });
}

function eventInterferes(req, res) {
  var eventConflictString = '';
  var eventsOfDay = [];
  var eventConflicts = [];  
  console.log("in eventInterferes");
  var query = url.parse(req.url).query;
  //console.log('query: ', query);
  console.log('dec qry: ', qs.unescape(query));
  var nvPair = qs.unescape(query).split('&');
  console.log(nvPair.length);
  let day = '';
  let start = '';
  let end = '';
  for (let i = 0;i < nvPair.length;i++) {
    var param = nvPair[i].split('=');
    if (param[0] == "day") {
      day = param[1];
    } else if (param[0] == "start") {
      start = param[1];
    } else if (param[0] == "end") {
      end = param[1];
    }
  }
  console.log('day: ', day);
  console.log('start: ', start, ' end: ', end);
  if (start !== '' && end !== '') {
    //console.log('start and end is not empty');
    fs.readFile('schedule.json', (err, jsonString) => {
      if (err) { console.log("Error reading file: ", err); throw err; }
      console.log("got file: ");
      try {
        const json = JSON.parse(jsonString);
        if (day == "monday") {
          eventsOfDay = json["monday"];
        }
        if (day == "tuesday") {
          eventsOfDay = json["tuesday"];
        }
        if (day == "wednesday") {
          eventsOfDay = json["wednesday"];
        }
        if (day == "thursday") {
          eventsOfDay = json["thursday"];
        }
        if (day == "friday") {
          eventsOfDay = json["friday"];
        }
        if (day == "saturday") {
          eventsOfDay = json["saturday"];
        }
        if (day == "sunday") {
          eventsOfDay = json["sunday"];
        }
        eventConflicts = getEventConflicts(start, end, eventsOfDay);
        eventConflictString = JSON.stringify(eventConflicts);        
      } catch (err) {
        console.log("Processing error:", err);
        throw err;
      }
      //console.log('conf: ', eventConflictString);
      res.statusCode = 200;
      res.setHeader('Content-type', 'application/json');
      res.write(eventConflictString);
      res.end();      
    });
  } else {
    res.statusCode = 200;
    res.setHeader('Content-type', 'application/json');
    res.write('[]');
    res.end();
  }
}

function getEventConflicts(start, end, eventsOfDay) {
  let conflicts = [];
  let startDt = toDate(start, "h:m");
  let endDt = toDate(end, "h:m");
  console.log('num events: ', eventsOfDay.length);
  //console.log(startDt >= toDate(eventsOfDay[0].start, "h:m"));
  //console.log( endDt <= toDate(eventsOfDay[0].end, "h:m"));
  //console.log(startDt >= toDate(eventsOfDay[0].start, "h:m") && endDt <= toDate(eventsOfDay[0].end, "h:m"));
  if (eventsOfDay.length == 1) {
    if (startDt >= toDate(eventsOfDay[0].start, "h:m") && endDt <= toDate(eventsOfDay[0].end, "h:m")) {
      conflicts.push(eventsOfDay[0]);
    }
  } else {
    for(let i = 0;i < eventsOfDay.length;i++){
      if (startDt >= toDate(eventsOfDay[i].start, "h:m") && endDt <= toDate(eventsOfDay[i].end, "h:m")) {
        conflicts.push(eventsOfDay[i]);
      }      
   }
  }
  console.log('num conflicts: ', conflicts.length);
  return conflicts;
}

function postEventEntry(req, res) {
  console.log("in postEventEntry");
  let chunks = [];
  // 'data' event is emitted on every chunk received
  req.on("data", (chunk) => {
    // collecting the chunks in array
    chunks.push(chunk);
  });

  // when all chunks are received, 'end' event is emitted.
  req.on("end", () => {
    // joining all the chunks received
    const data = Buffer.concat(chunks);
    // data.toString() converts Buffer data to querystring format
    const querystring = data.toString();
    // URLSearchParams: takes querystring
    // & returns a URLSearchParams object instance.
    const parsedData = new URLSearchParams(querystring);
    const dataObj = {};
    // entries() method returns an iterator
    // allowing iteration through all key/value pairs
    for (var pair of parsedData.entries()) {
      console.log('name: ', pair[0], ' value: ', pair[1]);
      dataObj[pair[0]] = pair[1];
    }
    // Now request data is accessible using dataObj
    //TODO: Process the form data and update schedule.json
    console.log('dataObj.day ' + dataObj.day);
    //Day of the week - form post
    let dayOfWeek = dataObj.day.toLowerCase();
    //Event details - form post
    let eventObj = {};
    eventObj['name'] = dataObj.event;
    eventObj['start'] = dataObj.start;
    eventObj['end'] = dataObj.end;
    eventObj['phone'] = dataObj.phone;
    eventObj['location'] = dataObj.location;
    eventObj['info'] = dataObj.info;
    eventObj['url'] = dataObj.url;
    console.log('dayOfWeek: ', dayOfWeek);
    console.log('eventObj: ', JSON.stringify(eventObj));
    let monSch = [];
    let tueSch = [];
    let wedSch = [];
    let thuSch = [];
    let friSch = [];
    let satSch = [];
    let sunSch = [];
    let updSch = {};
    var updSchStr = {};
    fs.readFile('schedule.json', "utf-8", (err, jsonString) => {
      if (err) { console.log("Error reading file: ", err); throw err; }
      console.log("got file: ");
      try {
        const json = JSON.parse(jsonString);
        monSch = json["monday"];
        tueSch = json["tuesday"];
        wedSch = json["wednesday"];
        thuSch = json["thursday"];
        friSch = json["friday"];
        satSch = json["saturday"];
        sunSch = json["sunday"];
        if (dayOfWeek == "monday") {
          monSch.push(eventObj);
          if (monSch.length > 1) {
            monSch.sort(sortByDate("start"));
          }
        }
        //add updated monday schedule
        updSch["monday"] = monSch;
        if (dayOfWeek == "tuesday") {
          tueSch.push(eventObj);
          if (tueSch.length > 1) {
            tueSch.sort(sortByDate("start"));
          }
        }
        //add updated tuesday schedule
        updSch["tuesday"] = tueSch;
        if (dayOfWeek == "wednesday") {
          wedSch.push(eventObj);
          if (wedSch.length > 1) {
            wedSch.sort(sortByDate("start"));
          }
        }
        //add updated wedneday schedule
        updSch["wednesday"] = wedSch;
        if (dayOfWeek == "thursday") {
          thuSch.push(eventObj);
          if (thuSch.length > 1) {
            thuSch.sort(sortByDate("start"));
          }
        }
        //add updated thursday schedule
        updSch["thursday"] = thuSch;
        if (dayOfWeek == "friday") {
          friSch.push(eventObj);
          if (friSch.length > 1) {
            friSch.sort(sortByDate("start"));
          }
        }
        //add updated friday schedule
        updSch["friday"] = friSch;
        if (dayOfWeek == "saturday") {
          satSch.push(eventObj);
          if (satSch.length > 1) {
            satSch.sort(sortByDate("start"));
          }
        }
        //add updated saturday schedule
        updSch["saturday"] = satSch;
        if (dayOfWeek == "sunday") {
          sunSch.push(eventObj);
          if (sunSch.length > 1) {
            sunSch.sort(sortByDate("start"));
          }
        }
        //add updated sunday schedule
        updSch["sunday"] = sunSch;
        //console.log('-----updSch------');
        updSchStr = JSON.stringify(updSch, null, 2);
        //console.log(updSchStr);
        //console.log('----------------');
        //write updated data to schedule.json
        saveSchedule('schedule.json',updSchStr);
      } catch (err) {
        console.log("Processing error:", err);
        throw err;
      }
    });
    //Redirect to schedule page
    res.statusCode = 302;
    res.setHeader('Location', '/schedule.html');    
    res.end();
  });
}

function saveSchedule(scheduleFile, updatedSchecule) {
  console.log('Saving schedule');
  //console.log(updatedSchecule);
  fs.writeFileSync(scheduleFile, updatedSchecule, 'utf-8', (err) => {
      if (err) {
        console('Error writing to file..')
        throw err;
      }
  });  
  console.log('Schedule updated');
}

function sortByDate(prop) {
  return function(a,b){  
    if(toDate(a[prop], "h:m") > toDate(b[prop], "h:m"))
       return 1;  
    else if(toDate(a[prop],"h:m") < toDate(b[prop], "h:m"))  
       return -1;  

    return 0;  
 }    
}

function toDate(dStr,format) {
  var now = new Date();
  if (format == "h:m") {
    now.setHours(dStr.substr(0,dStr.indexOf(":")));
    now.setMinutes(dStr.substr(dStr.indexOf(":")+1));
    now.setSeconds(0);
  }
  return now;
}