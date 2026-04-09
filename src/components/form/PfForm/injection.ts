import type { Ref, InjectionKey } from 'vue';

export type PfFormInputEvent = 'input' | 'change' | 'blur';

export type PfFormError<TName extends string = string> = {
  id?: string;
  name: TName;
  message: string;
};

export type PfFormValidateOptions = {
  name?: string | string[];
  silent?: boolean;
  nested?: boolean;
  transform?: boolean;
};

export type PfFormContextValue = {
  pathPrefix: string;
  state: Readonly<Ref<unknown>>;
  errors: Ref<PfFormError[]>;
  disabled: Ref<boolean>;
  getError: (name?: string, pattern?: RegExp) => PfFormError | undefined;
  clear: (path?: string | RegExp) => void;
  markFieldInteraction: (name: string, event: PfFormInputEvent) => void;
  validate: (opts?: PfFormValidateOptions) => Promise<unknown>;
  registerNested: (entry: {
    validate: (opts?: PfFormValidateOptions) => Promise<unknown>;
    clear: (path?: string | RegExp) => void;
  }) => void;
  unregisterNested: (entry: {
    validate: (opts?: PfFormValidateOptions) => Promise<unknown>;
    clear: (path?: string | RegExp) => void;
  }) => void;
};

export const PF_FORM_INJECTION_KEY: InjectionKey<PfFormContextValue> =
  Symbol('pfForm');
