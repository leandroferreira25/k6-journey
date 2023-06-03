// === Stress - Load Testing ===
// https://k6.io/docs/test-types/stress-testing/

//! Note that a stress test doesn't overwhelm the system immediately—that's a spike test, which is covered in the next section.
// Classic examples of a need for stress testing are Black Friday or Cyber Monday, two days each year that generate multiple times the normal traffic for many websites.

//! NO PROD, We recommend running a stress test in a UAT or staging environment.

//API for testing: https://test-api.k6.io/auth/token/login/

import http from "k6/http";
import { sleep } from "k6";
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";


export function handleSummary(data) {
    return {
      "result.html": htmlReport(data),
    };
  }

export const options = {
 //https://k6.io/docs/using-k6/scenarios/
 //Scenarios configure how VUs and iteration schedules in granular detail.
 // With scenarios, you can model diverse workloads, or traffic patterns in load tests.
  scenarios: {
    stress: {
      //https://k6.io/docs/using-k6/scenarios/executors/
      // More info about this executor: https://k6.io/docs/using-k6/scenarios/executors/ramping-arrival-rate/
      executor: "ramping-arrival-rate",
      //Number of VUs to pre-allocate before test start to preserve runtime resources.
      preAllocatedVUs: 500,
      timeUnit: "1s",
      // Period of time to apply the startRate to the stages' target value.
      // Its value is constant for the whole duration of the scenario, it is not possible to change it for a specific stage.
      stages: [
        { duration: "2m", target: 10 }, // below normal load
        { duration: "5m", target: 10 },
        { duration: "2m", target: 20 }, // normal load
        { duration: "5m", target: 20 },
        { duration: "2m", target: 30 }, // around the breaking point
        { duration: "5m", target: 30 },
        { duration: "2m", target: 40 }, // beyond the breaking point
        { duration: "5m", target: 40 },
        { duration: "10m", target: 0 }, // scale down. Recovery stage.
      ],
    },
  },
  //k6 login cloud -t 4060058a77338bd7d88e6c112d01482dde030632befb2750f48b8ee121fe1f06
  //k6 run -o cloud smoke.js if I want to send this to k6 cloud
  ext: {
    loadimpact: {
      projectID: 3629234,
      // Test runs with the same name groups test runs together
      name: "Smoke demo"
    }
  }
};

export default function () {
  const BASE_URL = "https://test-api.k6.io"; // make sure this is not production
  // -> https://k6.io/docs/javascript-api/k6-http/batch/
  // Batch multiple HTTP requests together to issue them in parallel over multiple TCP connections. 
  const responses = http.batch([
    ["GET", `${BASE_URL}/public/crocodiles/1/`],
    ["GET", `${BASE_URL}/public/crocodiles/2/`],
    ["GET", `${BASE_URL}/public/crocodiles/3/`],
    ["GET", `${BASE_URL}/public/crocodiles/4/`],
  ]);
}