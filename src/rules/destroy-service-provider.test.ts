import rule, {
  MessageIds,
  RULE_NAME,
} from './destroy-service-provider';
import { RuleTester } from 'eslint';

const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
});

const validClasses = [
  `@Component({
    selector: 'my-orgs',
    templateUrl: './welcome.component.html',
    styleUrls: ['./welcome.component.scss'],
    providers: [DestroyService]
  })
  export class WelcomeComponent implements OnInit {
    constructor(
      private destroy$: DestroyService,
    ) {}
  }`,
  `@Directive({
    selector: 'my-directive',
    providers: [DestroyService]
  })
  export class MyDirective implements OnInit {
    constructor(
      private destroy$: DestroyService,
    ) {}
  }`,
];

const invalidClasses = [
  `@Component({
    selector: 'my-orgs',
    templateUrl: './welcome.component.html',
    styleUrls: ['./welcome.component.scss'],
    providers: []
  })
  export class WelcomeComponent implements OnInit {
    constructor(
      private destroy$: DestroyService,
    ) {}
  }`,
  `@Directive({
    selector: 'my-directive',
  })
  export class MyDirective implements OnInit {
    constructor(
      private destroy$: DestroyService,
    ) {}
  }`,
];

const messageId: MessageIds = 'destroyServiceProvider';

// @ts-ignore
ruleTester.run(RULE_NAME, rule, {
  valid: validClasses,
  invalid: [
    {
      code: invalidClasses[0],
      errors: [{ messageId }],
    },
    {
      code: invalidClasses[1],
      errors: [{ messageId }],
    },
  ],
});
