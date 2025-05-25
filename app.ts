var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
import cors from "cors";
import { NextFunction, Response, Request } from "express";
import allowedOrigins from "./config/allowedOrigins";

var collectPaymentRouter = require("./routes/collectPayment");
var checkPaymentRouter = require("./routes/paymentStatus");
var disbursePayment = require("./routes/disbursePayment");
var expirePayment = require("./routes/expirePayment");

var app = express();

// view engine setup
 app.set('views', path.join(__dirname, 'views'));
 app.set('view engine', 'jade');

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const message = 'The CORS policy for this origin is not enabled.';
      return callback(new Error(message), false);
    }
    callback(null, true);
  }
}));
app.use("/request-to-pay", collectPaymentRouter);
app.use("/payment-status", checkPaymentRouter);
app.use("/request-withdrawal", disbursePayment);
app.use("/expire-payment", expirePayment);

// catch 404 and forward to error handler
app.use(function (req: Request, res: Response, next: NextFunction) {
  next(createError(404));
});

// error handler
app.use(function (err: Error, req: Request, res: Response, next: NextFunction) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = app.get("env") === "development" ? err : {}; // modified fromreq.app.get to app.get

  // render the error page
  res.status(err.message as any || 500); //modified from err.status to err.message
  res.render("error");
});

export default app;
