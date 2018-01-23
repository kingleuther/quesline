var connection = require('../mongo/connection');
var saving = require('../mongo/saving');
var replyURL = 'https://higashiyama-nanajo-812.questetra.net/System/Event/IntermediateMessage/16/4/receive';
var startURL = 'https://higashiyama-nanajo-812.questetra.net/System/Event/MessageStart/16/28/start';
function callback(router, axios, querystring, mongoose, client){
	/*connection(mongoose);*/
    router.post('/callback', function(req, res) {
        console.log("from a friend source",req.body.events[0].source.userId);

        client.getProfile(req.body.events[0].source.userId)
        .then((profile) => {
            console.log("profile",profile);
            console.log("displayName",profile.displayName);
            console.log("userId",profile.userId);
            console.log("pictureUrl",profile.pictureUrl);
        })
        .catch((err) => {
            // error handling
        });


    	if(req.body.events[0].postback != null && req.body.events[0].message == null){
            console.log("Start Sending");
            var parsedData = querystring.parse(req.body.events[0].postback.data);

            var repeatCounter = 0;

            (function resend(){
                setTimeout(callAxios,500,resend);
            })();

            function callAxios(resend){
                axios.post(replyURL,
                    querystring.stringify({
                        processInstanceId:parsedData.processInstanceId,
                        key:"sFCAYJMX1UokTLEOCOD42C5h1sbiPji4",
                        q_replymsg:parsedData.q_replymsg
                    }))
                    .then(function(response){
                            console.log('success');                
                    })            
                    .catch(function(error){
                            // console error here
                            console.log('failed');
                            if(repeatCounter >= 10) return sendingReplyFailed();
                            repeatCounter++;
                            console.log(repeatCounter);
                            resend();
                    }); 
            }

            function sendingReplyFailed(email) {
                axios.post(startURL,
                    querystring.stringify({
                        key:"jzLofTrDkhtZ8ehEYYaqb5gOAQNWLhV1",
                        title:"restart process",
                        email:email
                    }))
                    .then(function(response){
                            console.log('success sending failed status');                
                    })            
                    .catch(function(error){
                            // console error here
                            console.log("resending failed");
                    }); 
            }
        }
        res.send(true)    	
    });
}

module.exports = callback;