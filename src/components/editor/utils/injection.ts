import type { InjectionKey, Ref } from 'vue';
import type { Editor } from '@tiptap/vue-3';
import type { PfEditorCustomHandlers } from './types';

export interface PfEditorContextValue {
  editor: Ref<Editor | undefined>;
  handlers: Ref<PfEditorCustomHandlers>;
}

export const PF_EDITOR_INJECTION_KEY: InjectionKey<PfEditorContextValue> =
  Symbol('PF_EDITOR_INJECTION_KEY');
