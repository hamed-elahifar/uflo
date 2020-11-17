const cluster  = require('cluster')
  ,   cpuCount = require('os').cpus().length

if (cluster.isMaster) {
  // Create a worker for each CPU
  for (var i = 0; i < cpuCount; i++) {
    cluster.fork();
  }

  // Listen for dying workers
  cluster.on('exit', function () {
    cluster.fork();
  });
} else {
  // this part will execute for each CPU core
  require('./index');
}