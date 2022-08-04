import {
  z,
  ZodArray,
  ZodBigInt,
  ZodBoolean,
  ZodDate,
  ZodError,
  ZodIssue,
  ZodNumber,
  ZodRawShape,
  ZodString,
} from "./deps.ts";

export function sourceToJSON(source: FormData | URLSearchParams) {
  let data: Record<string, any> = {};

  source.forEach((_, key) => {
    const values = source.getAll(key);
    data[key] = values.length === 1 ? values[0] : values;
  });

  return data;
}

// This function is meant to enhance a simple Zod shape with some preprocessing for dealing with constraint of FormData / SearchParams
export function wrapStringyShape(shape: ZodRawShape) {
  Object.entries(shape).forEach(([key, value]) => {
    if (value instanceof ZodString) {
      shape[key] = z.preprocess(
        (value) => {
          if (value === "") value = undefined;
          return value;
        },
        value,
      );
    }

    if (value instanceof ZodNumber || value instanceof ZodBigInt) {
      shape[key] = z.preprocess(
        (value) => {
          if (value === "") value = undefined;
          return !Number.isNaN(Number(value)) ? Number(value) : value;
        },
        value,
      );
    }

    if (value instanceof ZodDate) {
      shape[key] = z.preprocess(
        (value) => {
          if (typeof value !== "string") return undefined;
          return !isNaN(Date.parse(value)) ? new Date(value) : value;
        },
        value,
      );
    }

    if (value instanceof ZodBoolean) {
      shape[key] = z.preprocess(
        (value) => {
          return value === "on" ? true : false;
        },
        value,
      );
    }

    if (value instanceof ZodArray) {
      shape[key] = z.preprocess(
        (value) => {
          return Array.isArray(value) ? value.filter(Boolean) : [];
        },
        value,
      );
    }
  });

  return shape;
}

export function wrapJSONShape(shape: ZodRawShape) {
  Object.entries(shape).forEach(([key, value]) => {
    if (value instanceof ZodDate) {
      shape[key] = z.preprocess(
        (value) => {
          if (typeof value !== "string") return undefined;
          return !isNaN(Date.parse(value)) ? new Date(value) : value;
        },
        value,
      );
    }
  });

  return shape;
}

export function validateSearchParams(
  source: Request | URLSearchParams,
  shape: ZodRawShape,
) {
  if (source instanceof Request) {
    source = new URL(source.url).searchParams;
  }

  return z.object(wrapStringyShape(shape))
    .parseAsync(sourceToJSON(source))
    .then((validatedData) => ({ validatedData, errors: null }))
    .catch((e) => {
      if (e instanceof ZodError) {
        return { validatedData: null, errors: e.issues };
      }

      throw e;
    });
}

export async function validateFormData(
  source: Request | FormData,
  shape: ZodRawShape,
) {
  if (source instanceof Request) {
    source = await source.formData();
  }

  return z.object(wrapStringyShape(shape))
    .parseAsync(sourceToJSON(source))
    .then((validatedData) => ({ validatedData, errors: null }))
    .catch((e) => {
      if (e instanceof ZodError) {
        return { validatedData: null, errors: e.issues };
      }

      throw e;
    });
}

export async function validateJSON(
  source: Request | object,
  shape: ZodRawShape,
) {
  if (source instanceof Request) {
    source = await source.json();
  }

  return z.object(wrapJSONShape(shape))
    .parseAsync(source)
    .then((validatedData) => ({ validatedData, errors: null }))
    .catch((e) => {
      if (e instanceof ZodError) {
        return { validatedData: null, errors: e.issues };
      }

      throw e;
    });
}

export function error(errors: ZodIssue[], key: string) {
  if (!errors) return null;
  return errors.find((error) => error.path.includes(key));
}

export * from "./deps.ts";
