import { Identifier } from "@babel/types";
import type { TSESTree } from "@typescript-eslint/experimental-utils";
import { CallExpression, MethodDefinition } from "estree";
import { createEslintRule } from "../utils/create-eslint-rule";

export const RULE_NAME = "destroy-service-provider";
export type MessageIds = "destroyServiceProvider";
export type Options = [];

export default createEslintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: "problem",
    docs: {
      description:
        "DestroyService must be provided in Component or Directive class providers",
      recommended: "error",
    },
    schema: [],
    messages: {
      destroyServiceProvider:
        "Please provide DestroyService in {{decoratorName}} class providers.",
    },
  },
  defaultOptions: [],
  create: (context) => {
    return {
      ["ClassDeclaration > Decorator[expression.callee.name=/^(Component|Directive)$/]"](
        node: TSESTree.Decorator,
      ) {
        // whether component has providers decorator property
        const providersProperty: TSESTree.Property | undefined = (
          (node.expression as CallExpression)
            .arguments[0] as TSESTree.ObjectExpression
        ).properties.find((property: any) => {
          return (
            property.key.type === "Identifier" &&
            (property.key as TSESTree.Identifier).name === "providers"
          );
        }) as TSESTree.Property;

        let providerValuesHasDestroyService: boolean = false;

        if (
          providersProperty &&
          providersProperty.value &&
          providersProperty.value.type === "ArrayExpression"
        ) {
          providerValuesHasDestroyService =
            !!providersProperty.value.elements.find((e) => {
              return e.type === "Identifier" && e.name === "DestroyService";
            });
        }

        if (
          !providersProperty ||
          (providersProperty && !providerValuesHasDestroyService)
        ) {
          // get constructor
          const classDeclaration: TSESTree.ClassDeclaration =
            node.parent as TSESTree.ClassDeclaration;
          const classElements = classDeclaration.body.body;
          const classConstructor: MethodDefinition | undefined =
            classElements.find((e) => {
              return e.type === "MethodDefinition" && e.kind === "constructor";
            }) as MethodDefinition;

          let hasDestroy;

          if (classConstructor) {
            // find DestroyService
            const params: any[] = classConstructor.value.params;
            hasDestroy = params.find((param) => {
              return (
                param.type === "TSParameterProperty" &&
                param.parameter.type === "Identifier" &&
                param.parameter.typeAnnotation.typeAnnotation.type ===
                  "TSTypeReference" &&
                (
                  param.parameter.typeAnnotation
                    .typeAnnotation as TSESTree.TSTypeReference
                ).typeName.type === "Identifier" &&
                (
                  (
                    param.parameter.typeAnnotation
                      .typeAnnotation as TSESTree.TSTypeReference
                  ).typeName as TSESTree.Identifier
                ).name === "DestroyService"
              );
            });
          }

          if (hasDestroy) {
            context.report({
              loc: hasDestroy.loc,
              messageId: "destroyServiceProvider",
              data: {
                decoratorName: (
                  (node.expression as CallExpression)
                    .callee as unknown as Identifier
                ).name,
              },
            });
          }
        }
      },
    };
  },
});
