'use strict';
var saving = require('../mongo/saving');
var retrieve = require('../mongo/retrieve');
var retrieveUsers = require('../mongo/retrieveUsers');
var localechecker = require('../local/localchecker');

var questReceivedData = {};

function receiver(router, client, logger){
  
  router.post('/receiveFromQuest', function(req, res) {
    console.log("frommanager",req.body);
    questReceivedData = req.body;
    var managerEmail = questReceivedData.managerEmail;
    // var users = retrieveUsers(questReceivedData.managerEmail,questReceivedData.managerID);
    var users = retrieveUsers(managerEmail, logger);
    users.then(function(users){
      console.log("users",users);
      // check if returned user array is not empty
      if (users.length){
        logger.info('test');
        console.log("User exists");
        console.log("body",questReceivedData);
        logger.info("body",questReceivedData);
        saving(questReceivedData, logger);
        var localetext = localechecker(questReceivedData.empID);
        var lineId = 'U34f149724f23c004673a3e11409ed3c0';
        //at this point 6 is japanese or leuther is japanese
        const message = {
          "type": "template",
          "altText": "this is a confirm template",
          "template": {
              "type": "confirm",
              "text":  localetext.text.Employee+" : "+ questReceivedData.empEmail +"\n" +
                       localetext.text.OvertimeDate+" : "+ questReceivedData.date +"\n" +
                       localetext.text.StartTime+" : "+ questReceivedData.timeStart +"\n" +
                       localetext.text.EndTime+" : "+questReceivedData.timeEnd +"\n"+
                       localetext.text.Reason+" : "+questReceivedData.message +"\n" ,
              "actions": [
                  {
                    "type": "postback",
                    "label": localetext.label.Approve,
                    "text":  localetext.text.Employee+" : "+ questReceivedData.empEmail +"\n" +
                              localetext.text.OvertimeDate+" : "+ questReceivedData.date +"\n" +
                              localetext.text.StartTime+" : "+ questReceivedData.timeStart +"\n" +
                              localetext.text.EndTime+" : "+questReceivedData.timeEnd +"\n"+
                              localetext.text.Reason+" : "+questReceivedData.message +"\n" +
                              localetext.text.Status+" : "+text.Approved +"\n",
                    "data": "processInstanceId="+req.body.processInstanceId+"&key=sFCAYJMX1UokTLEOCOD42C5h1sbiPji4&q_replymsg=Yes"
                  },
                  {
                    "type": "postback",
                    "label": localetext.label.Decline,
                    "text":  localetext.text.Employee+" : "+ questReceivedData.empEmail +"\n" +
                             localetext.text.OvertimeDate+" : "+ questReceivedData.date +"\n" +
                             localetext.text.StartTime+" : "+ questReceivedData.timeStart +"\n" +
                             localetext.text.EndTime+" : "+questReceivedData.timeEnd +"\n"+
                             localetext.text.Reason+" : "+questReceivedData.message +"\n" +
                             localetext.text.Status+" : "+text.Declined +"\n",
                    "data": "processInstanceId="+req.body.processInstanceId+"&key=sFCAYJMX1UokTLEOCOD42C5h1sbiPji4&q_replymsg=No"
                    
                  }
              ]
          }
    
        }
    
        client.pushMessage(lineId, message)
            .then(() => {
              // getting the message recieved from questetra and passing to line API 
              console.log('The message: ', questReceivedData.message, 'message has ben sent'); 
              // test save data
            })
            .catch((err) => {
              // console.log();
            });
          res.send(true);
      }

      else {
         logger.log("User doesn't exist");  
         logger.error("User does not exist");
         // add handler for terminating process if no data was found 
         res.send("No data");
      }

      })
      .catch (function(err){
        console.log(err);
        logger.error(err);
      });

    });
}
module.exports = receiver;