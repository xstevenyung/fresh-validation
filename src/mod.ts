/** @ts-ignore */
export function useForm(schema) {
  const register = (name: string) => {
    if (!Object.keys(schema.shape).includes(name)) {
      console.warn(`${name} doesn't match any key in the schema`);
      return {};
    }
    /** @ts-ignore */
    const definition = schema.shape[name];

    let type = "text";
    if (name === "password") {
      type = "password";
    } else if (
      definition._def.typeName === "ZodString" && definition.isEmail
    ) {
      type = "email";
    }

    /** @ts-ignore */
    const validation = (definition._def.checks || []).reduce((acc, check) => {
      if (check.kind === "min") {
        return {
          ...acc,
          [definition._def.typeName === "ZodString" ? "minlength" : "min"]:
            check.value,
        };
      }

      if (check.kind === "max") {
        return {
          ...acc,
          [definition._def.typeName === "ZodString" ? "maxlength" : "max"]:
            check.value,
        };
      }

      return acc;
    }, {});

    return {
      name,
      required: !definition.isOptional() && !definition.isNullable(),
      type,
      ...validation,
    };
  };

  return { register };
}
