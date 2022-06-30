import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as moment from 'moment-timezone';

admin.initializeApp(functions.config().firebase);
//admin.initializeApp();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

export const JR6_SendNotiToApp = functions
    .region("asia-northeast1")
    .https.onRequest(async (request, response) => {
     
        try {
            const db = admin.firestore();
            
            //let arrayList =[];
            let arrayList: string[] = [
            ];

            const collectionSend = "JR6_Notification_log";//MES_Korat_notification
            const topicSend = "SMARTHATCH_ALARM";//MES_KORAT_MES002
            const roleSend = "JR6001";


            const dateNow = new Date();
            const dateNow2 = new Date(dateNow);
            dateNow2.setMinutes(dateNow.getMinutes() + 420);
            console.log("dateNow:" + dateNow + " / dateNow2 : " + dateNow2);

            /* insert fix id */
            let autogenId = "";

            // pass1. topic , 2. collection 3. document name
            const topic = topicSend //"MES_KORAT_MES002";

            //  let formattedDt = formatDate(new Date(), 'yyyy-MM-dd hh:mm:ssZZZZZ', 'en_US')

            const currentYear = dateNow2.getFullYear();
            const currentYearString = currentYear.toString();

            console.log("currentYear : " + currentYearString);
            //MONTH
            const currentMonth = dateNow2.getMonth() + 1;

            let currentMonthString = "";
            if (currentMonth < 10) {
                currentMonthString = "0" + currentMonth.toString();
            } else {
                currentMonthString = currentMonth.toString();
            }

            console.log("currentMonth : " + currentMonthString);

            //DAY
            const currentDate = dateNow2.getDate();
            console.log("currentDate no : " + currentDate);
            let currentDateString = "";
            if (currentDate < 10) {
                currentDateString = "0" + currentDateString.toString();
            } else {
                currentDateString = currentDate.toString();
            }
            console.log("currentDate : " + currentDateString);

            const currentHour = dateNow2.getHours();
            let currentHourString = "";
            if (currentHour < 10) {
                currentHourString = "0" + currentHour.toString();
            } else {
                currentHourString = currentHour.toString();
            }
            console.log("currentHour : " + currentHourString);

            const currentMin = dateNow2.getMinutes();
            let currentMinString = "";
            if (currentMin < 10) {
                currentMinString = "0" + currentMin.toString();
            } else {
                currentMinString = currentMin.toString();
            }
            console.log("currentMin : " + currentMinString);

            const currentSec = dateNow2.getSeconds();
            let currentSecString = "";
            if (currentSec < 10) {
                currentSecString = "0" + currentSec.toString();
            } else {
                currentSecString = currentSec.toString();
            }
            console.log("currentSec : " + currentSecString);

            autogenId =
                currentYearString.toString() +
                currentMonthString.toString() +
                currentDateString.toString() +
                "_" +
                currentHourString.toString() +
                currentMinString.toString() +
                currentSecString.toString();
            console.log(autogenId);


            /* const payloadNode = {
               notification: {
                 title: "NASDAQ News",
                 body: "The NASDAQ climbs for the second day. Closes up 0.60%."
               }
             }; */

             const timenow = new Date(Date.now());
             const timestr = moment(timenow).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss');
            
             let data = request.body; //only one list
             if (data.UpdateDate == null)
             {
                data = {
                     ackRequire: false,
                     Detail: "PLC Feed P2 : MSG Communication Error",
                     Notiack: false,
                     Time: timestr,
                     Title: "SmartHatch Alarm",
                     Topic: "SMARTHATCH_ALARM",
                     //Status: "A",
                     TagName: "FIX.FEED_P2_AL_PLC_COMM",
                     //Type: data.Type,
                     UpdateDate: timestr,
                     severity: "900",
                     subcondition: "CFN ",
                     newState: "Enabled, Active"
                 }
             }
            console.log("Detail==" + data.Detail);
     
            const payload = {
                notification: {
                    title: "SmartHatch Alarm",
                    body: data.Detail,
                    bage: "1",
                    sound: "Default",
                },
                data: {
                    click_action: "FLUTTER_NOTIFICATION_CLICK",
                    sound: "default",
                    status: "done",
                    title: "SmartHatch Alarm",
                    body: data.Detail,
                },
            };

            
            const getEmailuser = await db
                .collection("user_profile")
                .where("role", "==", roleSend);
            getEmailuser
                .get()
                .then((querySnapshot) => {
                    querySnapshot.docs.map(async (doc) => {
                        console.log("ID:", doc.id);
                        console.log("LOG Data:", doc.data());

                        const getSendData = doc.data();

                        for (const key in getSendData) {
                            console.log(" key is : " + key + "   and value for key is   " + getSendData[key]);
                            if (key.toString().search('Token') !== -1) {
                                // dont' match not keep
                                if(getSendData[key]!== null && getSendData[key]!=='' )
                                {
                                    console.log(" token value : " + getSendData[key]);
                                    arrayList.push(getSendData[key]); 
                                }
                               
                            }

                        }

                        if ((data.severity == "900") && (data.subcondition == "CFN ")) {

                        const factoryTagRef = db.collection(
                            collectionSend + "/User/" + doc.id
                        );

                        factoryTagRef
                            .doc(autogenId)
                            .set(data)
                            .then(async doc => {
                                console.log("JR6_Notification_Insert_Success :" + autogenId);
                                /*response.status(200).send("JR6_Notification_Insert_Success :" + data.UpdateDate);
                                response.end();*/
                            })
                            .catch(err => {
                                console.log("JR6_Notification_Insert_Success ===>" + autogenId);
                                /*response.status(200).send("JR6_Notification_Insert_Success ===>"  + err);
                                response.end();*/

                                //  response.status(400).send("Error notification_msg : "+ err.messaging);
                                //   response.end();
                            })
                        }

                    });
                })
                .catch((err2) => {
                    console.log("error Insert Data msg err2 " + err2);


                });
                

            

            if ((data.severity == "900") && (data.subcondition == "CFN ")) {

            //keep to storage
            const notiallhistory = db.collection(collectionSend + '/NotificationHistory/' + autogenId);
            notiallhistory.doc(autogenId)
                .set(data)
                .then(async () => {
                    console.log("JR6_Notification_History_Insert_Success :" + autogenId);
                    /*response.status(200).send("JR6_Notification_History_Insert_Success :" + postData.UpdateDate);
                    response.end();*/
                    admin
                        .messaging()
                        .sendToTopic(topic, payload)
                        .then(function (topicMsg) {

                            admin
                            admin.messaging().subscribeToTopic(arrayList, topic)
                                .then((responsein) => {
                                    // See the MessagingTopicManagementResponse reference documentation
                                    // for the contents of response.
                                    console.log('Successfully subscribed to topic:', responsein);
                                    console.log("Successfully sent message:", topicMsg);

                                    response.status(200).send("Success notification_msg : " + topicMsg);
                                    response.end();
                                })
                                .catch((error) => {
                                    console.log('Error subscribing to topic:', error);
                                    console.log("Error sending message:", error);
                                    response.status(400).send("Error notification_msg : " + error);
                                    response.end();
                                });


                            
                        })
                        .catch(function (error) {
                            console.log("Error sending message:", error);
                            response.status(400).send("Error notification_msg : " + error);
                            response.end();
                        });
                })
                .catch((err) => {
                    console.log('error send msg ' + err)
                    response.status(400).send("Error notification_msg : " + err.messaging);
                    response.end();
                })

            }

        } catch (e) {
            console.log(e);
            console.error(e);
            response.status(404).send(e);
            response.end();
        }


        
        //response.send(200);
  
    });

