/***
 * NOTE: All functions inside this controller file are in sequential order . Therefore All are executed in the same manner as they are in this file.
 *
 * author: Harshit Chandani
 *
 */

const mongoose = require("mongoose");
const PaytmCheckSum = require("paytmchecksum");
const crypto = require("crypto");
const axios = require("axios");
const moment = require("moment")

const UserModel = require("../../models/User");
const PremiumModel = require("../../models/premium");
const TransactionModel = require("../../models/transaction");
const UserPremiumModel = require("../../models/user_premium")

var premium_id = new String();
var transactionStatus = new Object();

// Redirect to Spotify Premium Page.
const redirectToPremium = async (request, response) => {
  if (request.session.authentication != null) {
    await UserModel.findById(request.session.authentication.user_id, {
      is_premium_user: 1,
      _id: 0,
    }).then((data, error) => {
      if (data.length != 0) {
        user_data = data;
        if (!data.is_premium_user) {
          response.redirect("/premium/premium");
        } else {
          console.log("Already a Premium user.");
        }
      }
    });
  } else {
    response.redirect(`/auth/login`);
  }
};

// Display all the premium's available.
const fetchAndDisplayPremiumAvailable = async (request, response) => {
  await PremiumModel.find({}).then((data, error) => {
    if (data.length != 0) {
      context_data = data;
    } else {
      context_data = null;
    }
  });
  response.render("premium/confirmPremiumSubscription", {
    data: context_data,
  });
};

// When user select and click on one premium.
const processPayment = (request, response) => {
  let payment_amt;
  const user_info = new Object();
  premium_id = request.params.premium_id;

  // premium_id validation check .
  const ObjectId = mongoose.Types.ObjectId;
  if (
    ObjectId.isValid(premium_id) &&
    String(new ObjectId(premium_id) == premium_id)
  ) {
    continue_payment_process();
  } else {
    response.send({
      error: true,
      message: "Invalid Premium value.",
      redirect: process.env.ROOT,
    });
  }

  // Might act as a Closure.
  async function continue_payment_process() {
    await PremiumModel.findById(premium_id, {
      _id: 0,
      p_amt: 1,
      period: 1,
      period_type: 1,
    }).then((data, error) => {
      payment_amt = data.p_amt;
    });

    await UserModel.findById(request.session.authentication.user_id, {
      f_name: 1,
      l_name: 1,
      number: 1,
    }).then((data, error) => {
      if (data) {
        user_info["f_name"] = `${data.f_name}`;
        user_info["l_name"] = ` ${data.l_name}`;
        user_info["phone_no"] = `${data.number}`;
        user_info["email"] = "";
        user_info["user_id"] = `${data._id}`;
      } else if (error) {
        console.log("Something went wrong.");
        response.end();
      }
    });

    const newOrderID = await createOrderID();
    initiatePayment(newOrderID, payment_amt, user_info, request, response);
  }
};

// Initiate the payment proces..
const initiatePayment = async (
  order_id,
  amount,
  userData,
  request,
  response
) => {
  console.log("Payment Initialization process.");
  let paytmParams = {},
    init_data;

  paytmParams.body = {
    requestType: "Payment",
    mid: process.env.MERCHENT_ID,
    websiteName: "WEBSTAGING",
    orderId: order_id,
    callbackUrl: `${process.env.ROOT}premium/isPaymentCompletedAndVerified?user_id=${userData["user_id"]}`,
    txnAmount: {
      value: `${amount}`,
      currency: "INR",
    },
    userInfo: {
      custId: userData["user_id"],
      firstName: userData["f_name"],
      lastName: userData["l_name"],
      mobile: userData["phone_no"],
      email: userData["email"],
    },
  };

  // Generate Paytm Checksum.
  await PaytmCheckSum.generateSignature(
    JSON.stringify(paytmParams.body),
    process.env.MERCHENT_KEY
  ).then(function (checksum) {
    paytmParams.head = {
      signature: checksum,
    };
  });

  // Create Order and initiate transaction.
  await axios
    .post(
      `https://securegw-stage.paytm.in/theia/api/v1/initiateTransaction?mid=${process.env.MERCHENT_ID}&orderId=${order_id}`,
      paytmParams
    )
    .then((post_response) => {
      if (post_response.status == 200 && post_response.statusText == "OK") {
        switch (post_response.data.body.resultInfo.resultCode) {
          case "0000":
            console.log(
              "Initialzation complete . Start with processing of transaction"
            );
            processTransaction(
              request,
              response,
              order_id,
              post_response.data.body.txnToken
            );
            break;
          case "325":
            console.log(
              "Order Cancelled. " + post_response.data.body.resultInfo.resultMsg
            );
            CancelOrderAndTransaction(
              orderId,
              `${process.env.ROOT}premium/premium`
            );
            break;
          case "196":
            console.log(
              "Payment failed as amount entered exceeds the allowed limit. Please enter a lower amount and try again or reach out to the merchant for further assistance."
            );
            break;
          case "1006":
            console.log("Session has been expired.");
            break;
          case "00000900":
            console.log("System error.");
            break;
          case "2005":
            console.log("Checksum provided is invalid.");
            break;
          case "2013":
            console.log(
              "Mid in the query param doesn’t match with the Mid sent in the request"
            );
            break;
          case "2014":
            console.log(
              "OrderId in the query param doesn’t match with the OrderId sent in the request"
            );
        }
      }
    })
    .catch((error) => {
      console.log("Error", error);
    });
};

// Redirected to payment page of payment gateway provider.
const processTransaction = (request, response, order_id, txnToken) => {
  /*
   * Before redirecting to paytm server page.
   * Create a session of 10 minutes .
   * */

  // Redirect to paytm server for payment page.
  response.render("premium/showPaymentPage", {
    mid: process.env.MERCHENT_ID,
    orderId: order_id,
    txnToken: txnToken,
  });
};

// Check Payment status and process further.
const isPaymentCompletedAndVerified = async (request, response) => {
  const paytmResponseCheckSum = request.body.CHECKSUMHASH;
  const user = request.query.user_id;
  delete request.body.CHECKSUMHASH;
  // Merchent ID verification check.
  if (typeof request.body.MID !== "string" && request.body.MID !== process.env.MERCHENT_ID){
    console.log("Merchent ID has been tempered");
    // Event .
  }
  // Paytm Signature verification check.
  else if (PaytmCheckSum.verifySignature(request.body,process.env.MERCHENT_KEY,paytmResponseCheckSum)) {
    console.log(
      "CheckSumHash Matched.! Hence It is not tempered transaction ."
    );
    const paytmParams = new Object();
    paytmParams.body = {
      mid: process.env.MERCHENT_ID,
      orderId: request.body.ORDERID,
    };

    await PaytmCheckSum.generateSignature(
      JSON.stringify(paytmParams.body),
      process.env.MERCHENT_KEY
    ).then((checksum) => {
      paytmParams.head = {
        signature: checksum,
      };
    });

    await axios
      .post("https://securegw-stage.paytm.in/v3/order/status", paytmParams)
      .then((post_response) => {
        if (post_response.status == 200 && post_response.statusText == "OK") {
          // Response received.

          transactionStatus = post_response.data;
          new Buffer(post_response.data.body.txnId).toString('base64')
          response.redirect(
            `${process.env.ROOT}premium/confirm?txn_id=${new Buffer(post_response.data.body.txnId).toString('base64')}&user_id=${user}&error=${false}`
          );
        }
      })
      .catch((error) => {
        console.log("Promise Rejected .Error", error);
      });
  }
};

// Payment COnfirmation Page.
const getConfirmation = async (request, response) => {
  var wasDataSaved;
  var spotify_premium_data;
  const transaction_id_query_string = new Buffer(request.query.txn_id,'base64').toString('ascii');
  if (request.query.txn_id != null && transaction_id_query_string === transactionStatus.body.txnId) {
    // True Transaction. Process futhure
    const responseContext = new Object();
    switch (transactionStatus.body.resultInfo.resultStatus) {
      case "TXN_SUCCESS":
        console.log("Saving the data....")
        await PremiumModel.findById(premium_id,{ 
          _id:0,
          p_type:1,
          p_amt:1,
          period:1,
          period_type:1, 
        }).then( (data,error) => {
          if (data.length != 0){
            PremiumPeriod = calculateTimeFromCurrent(data.period,data.period_type)
            spotify_premium_data = data
          }
        })
        wasDataSaved = await saveTransactionData(transactionStatus,request.query.user_id,premium_id,PremiumPeriod)
        break;
      case "TXN_FAILURE":
        responseContext.status = "FAIL";
        break;
      case "PENDING":
        responseContext.status = "PENDING";
        break;
      case "NO_RECORD_FOUND":
        responseContext.status = "NO RECORD FOUND";
        break;
    }
    responseContext.message = transactionStatus.body.resultInfo.resultMsg;
    responseContext.fraudTransaction = false;
    if (wasDataSaved){
      request.app.set('payment_status',true)  // Update the application that payment is completed .
      responseContext.status = "SUCCESS";
      responseContext.data = {
        "transactionDetail": transactionStatus.body,
        "premiumDetail":{
          "premiumType":spotify_premium_data.p_type,
          "premiumAmt":spotify_premium_data.p_amt,
        } 
      } 
    }else{
      responseContext.status = "FAIL";
      responseContext.message = "Server Error. We are trying to fix it fast. Please be patient"
    }
    response.render("premium/confirmationPage", responseContext);
  } else {
    // Invalid Redirection . Move to Home Page.
    response.redirect(process.env.ROOT);
  }
};

// Save all the data.
const saveTransactionData = async (data, user,premium,premium_from_to_data) => {
  let status = false,result;
  var PromiseFulfilled, PromiseRejected
  if (data.body.resultInfo.resultStatus == "TXN_SUCCESS") status = true;
  
  // Promise 1
  const newTransaction = () => {
    return new Promise(async (resolve, reject) => {
      const transaction = new TransactionModel({
        premium_id: premium_id,
        user_id: user, 
        order_id: data.body.orderId,
        t_id: data.body.txnId,
        t_date_time: data.body.txnDate,
        t_amt: data.body.txnAmount,
        t_status: status,
        t_status_msg: data.body.resultInfo.resultMsg,
        t_status_code: data.body.resultInfo.resultCode,
        t_currency: "INR",
        payment_gateway: data.body.gatewayName,
        t_bank_transaction_id: data.body.bankTxnId,
        t_bank: data.body.bankName,
        t_mode: data.body.paymentMode,
      })
      transaction.save().then((data, error) => {
        if (data) {
          resolve(data);  
        } else {
          reject(error);
        }
      });
    });
  }
  // Promise 2
  const newUserSubscribedPremium = (txn_id) => {
    return new Promise((resolve,reject) => {
      const newPremium = new UserPremiumModel({
        user_id: user,
        premium_id: premium,
        premium_status:"active",
        transaction_id: txn_id,
        start_date: premium_from_to_data.start.startPremiumDate,
        start_time:`${premium_from_to_data.start.startPremiumTime} ${premium_from_to_data.start.startPremiumMeridiem}`,
        end_date: premium_from_to_data.end.endPremiumDate,
        end_time: `${premium_from_to_data.end.endPremiumTime} ${premium_from_to_data.end.endPremiumMeridiem}`,
      })
      newPremium.save().then( (data,error) =>{
        if (data){
          resolve(data)
        }else{
          reject(data)
        }
      })
    })
  }

  // Promise 3
  const updateUser = (user_premium_id) => {
    return new Promise(async (resolve, reject) => {
      await UserModel.findByIdAndUpdate(
        user,
        {
          is_premium_user: true,
          premium: user_premium_id,
        },
        {
          returnDocument: "after",
          upsert:true
        }
      ).then((data, error) => {
        if (data) {
          resolve(data);
        } else {
          reject(error);
        }
      });
    });
  }

  await newTransaction().then( async (data) => {
    return await newUserSubscribedPremium(data._id)
  }).then( async (userSubscribedPremium) => {
    return await updateUser(userSubscribedPremium._id)
  }).then( (data) => {
      PromiseFulfilled = true;
      PromiseRejected = false;
  }).catch( (error) =>{
    PromiseFulfilled = false;
    PromiseRejected = true;
  })
  result = (PromiseFulfilled && !PromiseRejected) 
  return result
};

const createOrderID = async () => {
  console.log("New Order");
  const totalUsers = await UserModel.countDocuments({ is_premium_user: true });
  const newOrderID = `ORDER_${totalUsers + 1}_${crypto
    .randomBytes(5)
    .toString("hex")}`;
  return newOrderID;
};

const calculateTimeFromCurrent = (periodOf,periodType) => {
  if (typeof periodOf == "string"){
     periodOf = parseInt(periodOf)
  }
  momentPeriodType = periodType[periodType.length -1].toLowerCase() === "s" ? periodType : `${periodType}s`
  
  const start = moment() ,duplicateStart = moment()
  
  const end = duplicateStart.add(periodOf,momentPeriodType.toLowerCase())
  startDate = start.format("DD-MM-YYYY")
  startTime = start.format("HH:mm:ss")
  startMeridiem = start.format("A")

  endDate = end.format("DD-MM-YYYY")
  endTime = end.format("HH:mm:ss")
  endMeridiem = end.format("A")

  const premiumPeriods = {
     start:{
        startPremiumDate: startDate,
        startPremiumTime: startTime,
        startPremiumMeridiem: startMeridiem,
     },
     end:{
        endPremiumDate: endDate,
        endPremiumTime: endTime,
        endPremiumMeridiem: endMeridiem,
     }
  }
  return premiumPeriods
}

const CancelOrderAndTransaction = (order_id, callback) => {
  /**
   * Motive: Calls when Request has been rejected due to order  duplication . This function will cancel the order of given order_id and initiate the payment with same order_id.
   */
  // Order Cancel API
};

module.exports = {
  redirectToPremium: redirectToPremium,
  fetchAndDisplayPremiumAvailable: fetchAndDisplayPremiumAvailable,
  processPayment: processPayment,
  isPaymentCompletedAndVerified: isPaymentCompletedAndVerified,
  getConfirmation: getConfirmation,
};
