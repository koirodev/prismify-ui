import {
  addComponent,
  addImports,
  addPluginTemplate,
  defineNuxtModule,
} from '@nuxt/kit';

export interface PrismifyNuxtModuleOptions {
  css?: boolean;
  plugin?: boolean;
  components?: boolean;
  composables?: boolean;
}

const COMPONENT_EXPORTS = [
  'PfApp',
  'PfContainer',
  'PfHeader',
  'PfMain',
  'PfError',
  'PfFooter',
  'PfAlert',
  'PfAvatar',
  'PfAvatarGroup',
  'PfBadge',
  'PfBanner',
  'PfButton',
  'PfInput',
  'PfTextarea',
  'PfCalendar',
  'PfCheckbox',
  'PfCheckboxGroup',
  'PfRadio',
  'PfRadioGroup',
  'PfSwitch',
  'PfSlider',
  'PfSelect',
  'PfSelectMenu',
  'PfInputMenu',
  'PfInputTags',
  'PfPinInput',
  'PfInputNumber',
  'PfInputDate',
  'PfInputTime',
  'PfColorPicker',
  'PfFileUpload',
  'PfForm',
  'PfFormField',
  'PfCard',
  'PfChip',
  'PfCollapsible',
  'PfFieldGroup',
  'PfIcon',
  'PfKbd',
  'PfContentSearchButton',
  'PfProgress',
  'PfSeparator',
  'PfSkeleton',
  'PfAccordion',
  'PfEmpty',
  'PfScrollArea',
  'PfTable',
  'PfTimeline',
  'PfMarquee',
  'PfUser',
  'PfTree',
  'PfBreadcrumb',
  'PfFooterColumns',
  'PfLink',
  'PfPagination',
  'PfStepper',
  'PfTabs',
  'PfNavigationMenu',
  'PfContentNavigation',
  'PfContentSurround',
  'PfContentToc',
  'PfContextMenu',
  'PfDropdownMenu',
  'PfTooltip',
  'PfModal',
  'PfContentSearch',
  'PfDrawer',
  'PfToast',
  'PfToaster',
  'PfEditor',
  'PfEditorToolbar',
  'PfEditorSuggestionMenu',
  'PfEditorMentionMenu',
  'PfEditorEmojiMenu',
  'PfEditorDragHandle',
  'PfDashboardGroup',
  'PfDashboardNavbar',
  'PfDashboardPanel',
  'PfDashboardResizeHandle',
  'PfDashboardSearch',
  'PfDashboardSearchButton',
  'PfDashboardSidebar',
  'PfDashboardSidebarCollapse',
  'PfDashboardSidebarToggle',
  'PfDashboardToolbar',
] as const;

const COMPOSABLE_EXPORTS = [
  'usePfApp',
  'usePfToast',
  'usePfContentSearch',
  'usePfKbd',
] as const;

export default defineNuxtModule<PrismifyNuxtModuleOptions>({
  meta: {
    name: 'prismify-ui',
    configKey: 'prismifyUI',
  },
  defaults: {
    css: true,
    plugin: false,
    components: true,
    composables: true,
  },
  setup(options, nuxt) {
    if (options.css && !nuxt.options.css.includes('prismify-ui/style.css')) {
      nuxt.options.css.push('prismify-ui/style.css');
    }

    if (options.plugin) {
      addPluginTemplate({
        filename: 'prismify-ui.plugin.mjs',
        getContents: () =>
          "import PrismifyUI from 'prismify-ui';\nexport default defineNuxtPlugin((nuxtApp) => {\n  nuxtApp.vueApp.use(PrismifyUI);\n});\n",
      });
    }

    if (options.components) {
      for (const componentName of COMPONENT_EXPORTS) {
        addComponent({
          name: componentName,
          export: componentName,
          filePath: 'prismify-ui',
        });
      }
    }

    if (options.composables) {
      addImports(
        COMPOSABLE_EXPORTS.map((composableName) => ({
          name: composableName,
          from: 'prismify-ui',
        }))
      );
    }
  },
});
