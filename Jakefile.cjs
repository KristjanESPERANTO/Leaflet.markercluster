/* eslint-disable no-undef */
/*
Leaflet.markercluster building, testing and linting scripts.

To use, install Node, then run the following commands in the project root:

    npm install -g jake
    npm install

To check the code for errors and build Leaflet from source, run "jake".
To run the tests, run "jake test".

For a custom build, open build/build.html in the browser and follow the instructions.
*/

desc("Check Leaflet.markercluster source for errors with ESLint");
task(
  "lint",
  {
    async: true
  },
  function () {
    jake.exec(
      "eslint",
      {
        printStdout: true
      },
      function () {
        console.log("\tCheck passed.\n");
        complete();
      }
    );
  }
);

desc("Combine Leaflet.markercluster source files");
task(
  "build",
  ["lint"],
  {
    async: true
  },
  function () {
    jake.exec("npm run-script rollup", function () {
      console.log("Rolled up.");
      complete();
    });
  }
);

desc("Compress bundled files");
task("uglify", ["build"], function () {
  jake.exec("npm run-script uglify", function () {
    console.log("Uglyfied.");
  });
});

desc("Run tests with node:test");
task(
  "test",
  ["lint"],
  {
    async: true
  },
  function () {
    console.log("Running tests...");
    jake.exec(
      "npm test",
      {
        printStdout: true
      },
      function () {
        console.log("\tTests ran successfully.\n");
        complete();
      }
    );
  }
);

task("default", ["build", "uglify"]);
