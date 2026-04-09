import type { PfFormError } from './injection';

type UnknownRecord = Record<string, unknown>;

type ValidationResult = {
  data: unknown;
  errors: PfFormError[];
};

function isObject(value: unknown): value is UnknownRecord {
  return value !== null && typeof value === 'object';
}

function pathToString(path: unknown): string | undefined {
  if (typeof path === 'string') return path;
  if (!Array.isArray(path)) return undefined;

  const tokens = path
    .map((segment) => {
      if (typeof segment === 'string' || typeof segment === 'number') {
        return String(segment);
      }
      if (isObject(segment) && 'key' in segment) {
        const key = segment.key;
        if (typeof key === 'string' || typeof key === 'number') {
          return String(key);
        }
      }
      return '';
    })
    .filter((token) => token.length > 0);

  return tokens.length > 0 ? tokens.join('.') : undefined;
}

function normalizeErrorLike(error: unknown): PfFormError[] {
  if (!error) return [];

  if (isObject(error) && Array.isArray(error.inner)) {
    return error.inner
      .map((issue) => {
        const path = isObject(issue) ? pathToString(issue.path) : undefined;
        const message =
          isObject(issue) && typeof issue.message === 'string'
            ? issue.message
            : 'Invalid value';
        return path ? { name: path, message } : null;
      })
      .filter((item): item is PfFormError => item !== null);
  }

  if (isObject(error) && Array.isArray(error.details)) {
    return error.details
      .map((issue) => {
        if (!isObject(issue)) return null;
        const path = pathToString(issue.path);
        const message =
          typeof issue.message === 'string' ? issue.message : 'Invalid value';
        return path ? { name: path, message } : null;
      })
      .filter((item): item is PfFormError => item !== null);
  }

  if (isObject(error) && Array.isArray(error.issues)) {
    return error.issues
      .map((issue) => {
        if (!isObject(issue)) return null;
        const path = pathToString(issue.path);
        const message =
          typeof issue.message === 'string' ? issue.message : 'Invalid value';
        return path ? { name: path, message } : null;
      })
      .filter((item): item is PfFormError => item !== null);
  }

  if (
    isObject(error) &&
    typeof error.failures === 'function' &&
    error.failures.length === 0
  ) {
    const failures = Array.from(
      (
        error.failures as () => Iterable<{ path?: unknown; message?: unknown }>
      )()
    );
    return failures
      .map((failure) => {
        const path = pathToString(failure.path);
        const message =
          typeof failure.message === 'string'
            ? failure.message
            : 'Invalid value';
        return path ? { name: path, message } : null;
      })
      .filter((item): item is PfFormError => item !== null);
  }

  if (
    isObject(error) &&
    (typeof error.path === 'string' || Array.isArray(error.path))
  ) {
    const path = pathToString(error.path);
    if (!path) return [];
    return [
      {
        name: path,
        message:
          typeof error.message === 'string' ? error.message : 'Invalid value',
      },
    ];
  }

  return [];
}

function normalizeStandardSchemaIssues(issues: unknown): PfFormError[] {
  if (!Array.isArray(issues)) return [];

  return issues
    .map((issue) => {
      if (!isObject(issue)) return null;

      const path = pathToString(issue.path);
      const message =
        typeof issue.message === 'string' ? issue.message : 'Invalid value';

      return path ? { name: path, message } : null;
    })
    .filter((item): item is PfFormError => item !== null);
}

function normalizeExplicitErrors(errors: unknown): PfFormError[] {
  if (!Array.isArray(errors)) return [];

  return errors
    .map((error) => {
      if (!isObject(error) || typeof error.name !== 'string') return null;
      const message =
        typeof error.message === 'string' ? error.message : 'Invalid value';
      return { name: error.name, message };
    })
    .filter((item): item is PfFormError => item !== null);
}

export function filterErrorsByName(
  errors: PfFormError[],
  name?: string | string[]
): PfFormError[] {
  if (!name) return errors;
  const names = Array.isArray(name) ? name : [name];

  return errors.filter((error) =>
    names.some(
      (item) => error.name === item || error.name.startsWith(`${item}.`)
    )
  );
}

export async function runSchemaValidation(
  schema: unknown,
  data: unknown
): Promise<ValidationResult> {
  if (!schema) return { data, errors: [] };

  const schemaRecord = isObject(schema) ? schema : undefined;
  const standardSchema = schemaRecord?.['~standard'];

  if (
    isObject(standardSchema) &&
    typeof standardSchema.validate === 'function' &&
    standardSchema.validate.length >= 1
  ) {
    const result = (await standardSchema.validate(data)) as UnknownRecord;
    const errors = normalizeStandardSchemaIssues(result.issues);
    return {
      data: errors.length > 0 ? data : (result.value ?? data),
      errors,
    };
  }

  if (isObject(schema) && typeof schema.safeParseAsync === 'function') {
    const result = (await schema.safeParseAsync(data)) as UnknownRecord;
    if (result.success === true) {
      return { data: result.data, errors: [] };
    }
    return {
      data,
      errors: normalizeErrorLike(result.error),
    };
  }

  if (isObject(schema) && typeof schema.safeParse === 'function') {
    const result = schema.safeParse(data) as UnknownRecord;
    if (result.success === true) {
      return { data: result.data, errors: [] };
    }
    return {
      data,
      errors: normalizeErrorLike(result.error),
    };
  }

  if (isObject(schema) && typeof schema.validateAsync === 'function') {
    try {
      const validated = await schema.validateAsync(data, { abortEarly: false });
      return { data: validated, errors: [] };
    } catch (error) {
      return { data, errors: normalizeErrorLike(error) };
    }
  }

  if (isObject(schema) && typeof schema.validate === 'function') {
    try {
      const maybeResult = schema.validate(data, { abortEarly: false });
      if (maybeResult && typeof maybeResult.then === 'function') {
        const validated = await maybeResult;
        return { data: validated, errors: [] };
      }
      if (isObject(maybeResult) && 'error' in maybeResult) {
        const validationError = maybeResult.error;
        if (validationError) {
          return { data, errors: normalizeErrorLike(validationError) };
        }
        if ('value' in maybeResult) {
          return { data: maybeResult.value, errors: [] };
        }
      }
      return { data: maybeResult ?? data, errors: [] };
    } catch (error) {
      return { data, errors: normalizeErrorLike(error) };
    }
  }

  if (isObject(schema) && typeof schema.parseAsync === 'function') {
    try {
      const parsed = await schema.parseAsync(data);
      return { data: parsed, errors: [] };
    } catch (error) {
      return { data, errors: normalizeErrorLike(error) };
    }
  }

  if (isObject(schema) && typeof schema.parse === 'function') {
    try {
      const parsed = schema.parse(data);
      return { data: parsed, errors: [] };
    } catch (error) {
      return { data, errors: normalizeErrorLike(error) };
    }
  }

  return { data, errors: [] };
}

export async function runCustomValidation(
  validate:
    | ((
        state: Record<string, unknown>
      ) => PfFormError[] | Promise<PfFormError[]>)
    | undefined,
  data: Record<string, unknown>
): Promise<PfFormError[]> {
  if (!validate) return [];

  const result = await validate(data);
  return normalizeExplicitErrors(result);
}
