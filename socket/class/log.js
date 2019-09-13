logger = function(arr) {
  if (process.env.LOG_ENABLE == 1) {
    for (var i = 0; i < arguments.length; i++) {
      console.log(arguments[i]);
    }
  }
};
module.exports = logger;
