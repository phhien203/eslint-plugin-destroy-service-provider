import { RuleTester } from "eslint";

import rule from "./destroy-service-provider";

const tester = new RuleTester({ parserOptions: { ecmaVersion: 2015 } });

tester.run("destroy-service-provider", rule, {
  valid: [{ code: `let x` }],
  invalid: [
    {
      code: `const x = 1;`,
      errors: [{ message: "haha" }],
    },
  ],
});
