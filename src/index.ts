import './styles/index.scss';
import type { App, Plugin } from 'vue';
import PfAlert from './components/element/PfAlert/index.vue';
import PfAvatar from './components/element/PfAvatar/index.vue';
import PfAvatarGroup from './components/element/PfAvatarGroup/index.vue';
import PfBadge from './components/element/PfBadge/index.vue';
import PfBanner from './components/element/PfBanner/index.vue';
import PfButton from './components/element/PfButton/index.vue';
import PfChip from './components/element/PfChip/index.vue';
import PfCollapsible from './components/element/PfCollapsible/index.vue';
import PfFieldGroup from './components/element/PfFieldGroup/index.vue';
import PfIcon from './components/element/PfIcon/index.vue';
import PfProgress from './components/element/PfProgress/index.vue';
import PfSeparator from './components/element/PfSeparator/index.vue';
import PfSkeleton from './components/element/PfSkeleton/index.vue';
import PfKbd from './components/element/PfKbd/index.vue';
import PfContentSearchButton from './components/element/PfContentSearchButton/index.vue';
import PfCalendar from './components/form/PfCalendar/index.vue';
import PfCheckbox from './components/form/PfCheckbox/index.vue';
import PfCheckboxGroup from './components/form/PfCheckboxGroup/index.vue';
import PfInput from './components/form/PfInput/index.vue';
import PfTextarea from './components/form/PfTextarea/index.vue';
import PfRadio from './components/form/PfRadio/index.vue';
import PfRadioGroup from './components/form/PfRadioGroup/index.vue';
import PfSwitch from './components/form/PfSwitch/index.vue';
import PfSlider from './components/form/PfSlider/index.vue';
import PfSelect from './components/form/PfSelect/index.vue';
import PfSelectMenu from './components/form/PfSelectMenu/index.vue';
import PfInputMenu from './components/form/PfInputMenu/index.vue';
import PfInputTags from './components/form/PfInputTags/index.vue';
import PfPinInput from './components/form/PfPinInput/index.vue';
import PfInputNumber from './components/form/PfInputNumber/index.vue';
import PfInputDate from './components/form/PfInputDate/index.vue';
import PfInputTime from './components/form/PfInputTime/index.vue';
import PfColorPicker from './components/form/PfColorPicker/index.vue';
import PfFileUpload from './components/form/PfFileUpload/index.vue';
import PfForm from './components/form/PfForm/index.vue';
import PfFormField from './components/form/PfFormField/index.vue';
import PfCard from './components/element/PfCard/index.vue';
import PfApp from './components/layout/PfApp/index.vue';
import PfContainer from './components/layout/PfContainer/index.vue';
import PfHeader from './components/layout/PfHeader/index.vue';
import PfMain from './components/layout/PfMain/index.vue';
import PfError from './components/layout/PfError/index.vue';
import PfFooter from './components/layout/PfFooter/index.vue';
import PfAccordion from './components/data/PfAccordion/index.vue';
import PfEmpty from './components/data/PfEmpty/index.vue';
import PfScrollArea from './components/data/PfScrollArea/index.vue';
import PfTable from './components/data/PfTable/index.vue';
import PfTimeline from './components/data/PfTimeline/index.vue';
import PfMarquee from './components/data/PfMarquee/index.vue';
import PfUser from './components/data/PfUser/index.vue';
import PfTree from './components/data/PfTree/index.vue';
import PfBreadcrumb from './components/navigation/PfBreadcrumb/index.vue';
import PfFooterColumns from './components/navigation/PfFooterColumns/index.vue';
import PfLink from './components/navigation/PfLink/index.vue';
import PfPagination from './components/navigation/PfPagination/index.vue';
import PfStepper from './components/navigation/PfStepper/index.vue';
import PfTabs from './components/navigation/PfTabs/index.vue';
import PfNavigationMenu from './components/navigation/PfNavigationMenu/index.vue';
import PfContentNavigation from './components/navigation/PfContentNavigation/index.vue';
import PfContentSurround from './components/navigation/PfContentSurround/index.vue';
import PfContentToc from './components/navigation/PfContentToc/index.vue';
import PfContextMenu from './components/overlay/PfContextMenu/index.vue';
import PfDropdownMenu from './components/overlay/PfDropdownMenu/index.vue';
import PfTooltip from './components/overlay/PfTooltip/index.vue';
import PfModal from './components/overlay/PfModal/index.vue';
import PfContentSearch from './components/overlay/PfContentSearch/index.vue';
import PfDrawer from './components/overlay/PfDrawer/index.vue';
import PfToast from './components/overlay/PfToast/index.vue';
import PfToaster from './components/overlay/PfToaster/index.vue';
import PfEditor from './components/editor/PfEditor/index.vue';
import PfEditorToolbar from './components/editor/PfEditorToolbar/index.vue';
import PfEditorSuggestionMenu from './components/editor/PfEditorSuggestionMenu/index.vue';
import PfEditorMentionMenu from './components/editor/PfEditorMentionMenu/index.vue';
import PfEditorEmojiMenu from './components/editor/PfEditorEmojiMenu/index.vue';
import PfEditorDragHandle from './components/editor/PfEditorDragHandle/index.vue';
import PfDashboardGroup from './components/dashboard/PfDashboardGroup/index.vue';
import PfDashboardNavbar from './components/dashboard/PfDashboardNavbar/index.vue';
import PfDashboardPanel from './components/dashboard/PfDashboardPanel/index.vue';
import PfDashboardResizeHandle from './components/dashboard/PfDashboardResizeHandle/index.vue';
import PfDashboardSearch from './components/dashboard/PfDashboardSearch/index.vue';
import PfDashboardSearchButton from './components/dashboard/PfDashboardSearchButton/index.vue';
import PfDashboardSidebar from './components/dashboard/PfDashboardSidebar/index.vue';
import PfDashboardSidebarCollapse from './components/dashboard/PfDashboardSidebarCollapse/index.vue';
import PfDashboardSidebarToggle from './components/dashboard/PfDashboardSidebarToggle/index.vue';
import PfDashboardToolbar from './components/dashboard/PfDashboardToolbar/index.vue';

export {
  PfApp,
  PfContainer,
  PfHeader,
  PfMain,
  PfError,
  PfFooter,
  PfAlert,
  PfAvatar,
  PfAvatarGroup,
  PfBadge,
  PfBanner,
  PfButton,
  PfInput,
  PfTextarea,
  PfCalendar,
  PfCheckbox,
  PfCheckboxGroup,
  PfRadio,
  PfRadioGroup,
  PfSwitch,
  PfSlider,
  PfSelect,
  PfSelectMenu,
  PfInputMenu,
  PfInputTags,
  PfPinInput,
  PfInputNumber,
  PfInputDate,
  PfInputTime,
  PfColorPicker,
  PfFileUpload,
  PfForm,
  PfFormField,
  PfCard,
  PfChip,
  PfCollapsible,
  PfFieldGroup,
  PfIcon,
  PfKbd,
  PfContentSearchButton,
  PfProgress,
  PfSeparator,
  PfSkeleton,
  PfAccordion,
  PfEmpty,
  PfScrollArea,
  PfTable,
  PfTimeline,
  PfMarquee,
  PfUser,
  PfTree,
  PfBreadcrumb,
  PfFooterColumns,
  PfLink,
  PfPagination,
  PfStepper,
  PfTabs,
  PfNavigationMenu,
  PfContentNavigation,
  PfContentSurround,
  PfContentToc,
  PfContextMenu,
  PfDropdownMenu,
  PfTooltip,
  PfModal,
  PfContentSearch,
  PfDrawer,
  PfToast,
  PfToaster,
  PfEditor,
  PfEditorToolbar,
  PfEditorSuggestionMenu,
  PfEditorMentionMenu,
  PfEditorEmojiMenu,
  PfEditorDragHandle,
  PfDashboardGroup,
  PfDashboardNavbar,
  PfDashboardPanel,
  PfDashboardResizeHandle,
  PfDashboardSearch,
  PfDashboardSearchButton,
  PfDashboardSidebar,
  PfDashboardSidebarCollapse,
  PfDashboardSidebarToggle,
  PfDashboardToolbar,
};
export type {
  PfAvatarChipColor,
  PfAvatarChipProps,
} from './components/element/PfAvatar/index.vue';
export type { PfAvatarGroupSize } from './components/element/PfAvatarGroup/injection';
export type { PfButtonAvatarProps } from './components/element/PfButton/index.vue';
export type { PfBadgeAvatarProps } from './components/element/PfBadge/index.vue';
export type {
  PfAlertActionProps,
  PfAlertAvatarProps,
  PfAlertButtonVariant,
  PfAlertCloseButtonProps,
  PfAlertColor,
  PfAlertUi,
  PfAlertVariant,
} from './components/element/PfAlert/index.vue';
export type {
  PfBannerActionProps,
  PfBannerCloseButtonProps,
  PfBannerColor,
  PfBannerUi,
} from './components/element/PfBanner/index.vue';
export type { PfIconSize } from './components/element/PfIcon/iconSizes';
export type {
  PfKbdColor,
  PfKbdSize,
  PfKbdUi,
  PfKbdVariant,
} from './components/element/PfKbd/index.vue';
export type { PfContentSearchButtonUi } from './components/element/PfContentSearchButton/index.vue';
export { getPfKbdKey, usePfKbd, PF_KBD_GLYPHS } from './composables/usePfKbd';
export { usePfApp } from './composables/usePfApp';
export { usePfContentSearch } from './composables/usePfContentSearch';
export { usePfToast } from './composables/usePfToast';
export type { PfContentSearchState } from './composables/usePfContentSearch';
export type {
  PfAppContextValue,
  PfAppDirection,
  PfAppPortalProp,
  PfAppPortalTarget,
  PfAppScrollBodyOption,
  PfAppToasterProps,
  PfAppTooltipProviderProps,
} from './components/layout/PfApp/injection';
export {
  PF_APP_INJECTION_KEY,
  resolvePfAppPortalTarget,
} from './components/layout/PfApp/injection';
export { PF_ICON_SIZES } from './components/element/PfIcon/iconSizes';
export type { PfIconName } from './components/element/PfIcon/paths';
export { PF_ICON_NAMES } from './components/element/PfIcon/paths';
export type {
  PfCalendarColor,
  PfCalendarDateRange,
  PfCalendarMatcher,
  PfCalendarModelValue,
  PfCalendarSize,
  PfCalendarUi,
  PfCalendarVariant,
  PfCalendarWeekdayFormat,
  PfCalendarWeekStartsOn,
} from './components/form/PfCalendar/index.vue';
export type {
  PfCheckboxColor,
  PfCheckboxIndicator,
  PfCheckboxSize,
  PfCheckboxUi,
  PfCheckboxVariant,
} from './components/form/PfCheckbox/index.vue';
export type { PfCheckboxGroupUi } from './components/form/PfCheckboxGroup/index.vue';
export type {
  PfRadioColor,
  PfRadioIndicator,
  PfRadioSize,
  PfRadioUi,
  PfRadioVariant,
} from './components/form/PfRadio/index.vue';
export type { PfRadioGroupUi } from './components/form/PfRadioGroup/index.vue';
export type {
  PfSwitchColor,
  PfSwitchSize,
  PfSwitchUi,
} from './components/form/PfSwitch/index.vue';
export type {
  PfSliderColor,
  PfSliderModelValue,
  PfSliderOrientation,
  PfSliderSize,
  PfSliderTooltipProps,
  PfSliderUi,
} from './components/form/PfSlider/index.vue';
export type {
  PfSelectColor,
  PfSelectGroupItem,
  PfSelectModelValue,
  PfSelectOption,
  PfSelectOptionAvatarConfig,
  PfSelectOptionAvatarSize,
  PfSelectOptionChipConfig,
  PfSelectOptionGroups,
  PfSelectSize,
  PfSelectUi,
  PfSelectVariant,
} from './components/form/PfSelect/index.vue';
export type {
  PfSelectMenuItem,
  PfSelectMenuItemObject,
  PfSelectMenuItems,
  PfSelectMenuModelValue,
  PfSelectMenuPrimitive,
  PfSelectMenuSearchInputProps,
  PfSelectMenuUi,
} from './components/form/PfSelectMenu/index.vue';
export type {
  PfInputMenuItem,
  PfInputMenuItemObject,
  PfInputMenuItems,
  PfInputMenuModelValue,
  PfInputMenuPrimitive,
  PfInputMenuUi,
} from './components/form/PfInputMenu/index.vue';
export type { PfInputTagsUi } from './components/form/PfInputTags/index.vue';
export type {
  PfPinInputColor,
  PfPinInputUi,
  PfPinInputVariant,
} from './components/form/PfPinInput/index.vue';
export type {
  PfInputNumberColor,
  PfInputNumberStepButtonProps,
  PfInputNumberUi,
  PfInputNumberVariant,
} from './components/form/PfInputNumber/index.vue';
export type {
  PfInputDateColor,
  PfInputDateModel,
  PfInputDateUi,
  PfInputDateVariant,
} from './components/form/PfInputDate/index.vue';
export type {
  PfInputTimeColor,
  PfInputTimeModel,
  PfInputTimeUi,
  PfInputTimeVariant,
} from './components/form/PfInputTime/index.vue';
export type {
  PfColorPickerSize,
  PfColorPickerUi,
} from './components/form/PfColorPicker/index.vue';
export type { PfColorPickerFormat } from './components/form/PfColorPicker/colorPicker';
export type {
  PfFileUploadColor,
  PfFileUploadFileDeleteConfig,
  PfFileUploadUi,
} from './components/form/PfFileUpload/index.vue';
export type {
  PfFormErrorEvent,
  PfFormSubmitEvent,
  PfFormUi,
} from './components/form/PfForm/index.vue';
export type {
  PfFormContextValue,
  PfFormError,
  PfFormInputEvent,
  PfFormValidateOptions,
} from './components/form/PfForm/injection';
export type {
  PfFormFieldOrientation,
  PfFormFieldSize,
  PfFormFieldUi,
} from './components/form/PfFormField/index.vue';
export type {
  PfInputDateGranularity,
  PfInputDateHourCycle,
} from './components/form/PfInputDate/inputDateSegments';
export type {
  PfInputTimeGranularity,
  PfInputTimeHourCycle,
  PfInputTimeLayoutToken,
  PfInputTimeRange,
  PfTimeValue,
} from './components/form/PfInputTime/inputTimeSegments';
export type {
  PfChoiceControlUi,
  PfChoiceGroupItem,
  PfChoiceGroupItemObject,
  PfNormalizedChoiceItem,
} from './components/form/groupItems';
export type {
  PfInputColor,
  PfInputUi,
  PfInputVariant,
} from './components/form/PfInput/index.vue';
export type {
  PfTextareaColor,
  PfTextareaUi,
  PfTextareaVariant,
} from './components/form/PfTextarea/index.vue';
export type {
  PfCardUi,
  PfCardVariant,
} from './components/element/PfCard/index.vue';
export type { PfContainerUi } from './components/layout/PfContainer/index.vue';
export type { PfMainUi } from './components/layout/PfMain/index.vue';
export type {
  PfHeaderToggleButtonProps,
  PfHeaderUi,
} from './components/layout/PfHeader/index.vue';
export type { PfFooterUi } from './components/layout/PfFooter/index.vue';
export type {
  PfErrorClearButtonProps,
  PfErrorUi,
  PfErrorValue,
} from './components/layout/PfError/index.vue';
export type { PfCollapsibleUi } from './components/element/PfCollapsible/index.vue';
export type {
  PfAccordionItem,
  PfAccordionItemUi,
  PfAccordionType,
  PfAccordionUi,
} from './components/data/PfAccordion/index.vue';
export type {
  PfMarqueeOrientation,
  PfMarqueeUi,
} from './components/data/PfMarquee/index.vue';
export type {
  PfEmptyActionProps,
  PfEmptyAvatarProps,
  PfEmptyButtonVariant,
  PfEmptySize,
  PfEmptyUi,
  PfEmptyVariant,
} from './components/data/PfEmpty/index.vue';
export type {
  PfScrollAreaOrientation,
  PfScrollAreaUi,
  PfScrollAreaVirtualizeOptions,
  PfScrollAreaVirtualizer,
} from './components/data/PfScrollArea/index.vue';
export type {
  PfTableColumn,
  PfTableColumnMeta,
  PfTableLoadingAnimation,
  PfTableLoadingColor,
  PfTableRow,
  PfTableRowMeta,
  PfTableUi,
} from './components/data/PfTable/index.vue';
export type {
  PfTimelineColor,
  PfTimelineItem,
  PfTimelineItemUi,
  PfTimelineOrientation,
  PfTimelineSize,
  PfTimelineUi,
} from './components/data/PfTimeline/index.vue';
export type {
  PfTreeColor,
  PfTreeItem,
  PfTreeItemUi,
  PfTreeSelectPayload,
  PfTreeSelectionBehavior,
  PfTreeSize,
  PfTreeTogglePayload,
  PfTreeUi,
} from './components/data/PfTree/index.vue';
export type {
  PfBreadcrumbAvatarProps,
  PfBreadcrumbItem,
  PfBreadcrumbItemUi,
  PfBreadcrumbUi,
} from './components/navigation/PfBreadcrumb/index.vue';
export type {
  PfFooterColumn,
  PfFooterColumnLink,
  PfFooterColumnLinkUi,
  PfFooterColumnUi,
  PfFooterColumnsUi,
} from './components/navigation/PfFooterColumns/index.vue';
export type {
  PfPaginationColor,
  PfPaginationItem,
  PfPaginationSize,
  PfPaginationUi,
  PfPaginationVariant,
} from './components/navigation/PfPagination/index.vue';
export type {
  PfStepperColor,
  PfStepperItem,
  PfStepperItemState,
  PfStepperItemUi,
  PfStepperOrientation,
  PfStepperSize,
  PfStepperUi,
} from './components/navigation/PfStepper/index.vue';
export type {
  PfTabsColor,
  PfTabsItem,
  PfTabsItemAvatar,
  PfTabsItemBadge,
  PfTabsItemUi,
  PfTabsOrientation,
  PfTabsSize,
  PfTabsUi,
  PfTabsVariant,
} from './components/navigation/PfTabs/index.vue';
export type {
  PfNavigationMenuChildItem,
  PfNavigationMenuChildUi,
  PfNavigationMenuColor,
  PfNavigationMenuContentOrientation,
  PfNavigationMenuItem,
  PfNavigationMenuItemAvatar,
  PfNavigationMenuItemBadge,
  PfNavigationMenuItemChip,
  PfNavigationMenuItemsInput,
  PfNavigationMenuItemType,
  PfNavigationMenuOrientation,
  PfNavigationMenuType,
  PfNavigationMenuUi,
  PfNavigationMenuVariant,
} from './components/navigation/PfNavigationMenu/index.vue';
export type {
  PfContentNavigationColor,
  PfContentNavigationItem,
  PfContentNavigationType,
  PfContentNavigationUi,
  PfContentNavigationVariant,
} from './components/navigation/PfContentNavigation/index.vue';
export type {
  PfContentSurroundItem,
  PfContentSurroundUi,
} from './components/navigation/PfContentSurround/index.vue';
export type {
  PfContentTocColor,
  PfContentTocHighlightVariant,
  PfContentTocLink,
  PfContentTocUi,
} from './components/navigation/PfContentToc/index.vue';
export type {
  PfContextMenuItem,
  PfContextMenuItemsInput,
  PfContextMenuSize,
  PfContextMenuUi,
} from './components/overlay/PfContextMenu/types';
export type {
  PfDropdownMenuContent,
  PfDropdownMenuFilter,
  PfDropdownMenuItem,
  PfDropdownMenuItemsInput,
  PfDropdownMenuSize,
  PfDropdownMenuUi,
} from './components/overlay/PfDropdownMenu/types';
export type {
  PfTooltipAlign,
  PfTooltipArrowProps,
  PfTooltipContentProps,
  PfTooltipKbd,
  PfTooltipKbdProps,
  PfTooltipReferenceElement,
  PfTooltipSide,
  PfTooltipUi,
} from './components/overlay/PfTooltip/index.vue';
export type {
  PfModalCloseButtonProps,
  PfModalUi,
} from './components/overlay/PfModal/index.vue';
export type {
  PfContentSearchFile,
  PfContentSearchGroup,
  PfContentSearchItem,
  PfContentSearchLink,
  PfContentSearchUi,
} from './components/overlay/PfContentSearch/index.vue';
export type {
  PfDrawerDirection,
  PfDrawerUi,
} from './components/overlay/PfDrawer/index.vue';
export type { PfToastUi } from './components/overlay/PfToast/index.vue';
export type { PfDashboardGroupUi } from './components/dashboard/PfDashboardGroup/index.vue';
export type { PfDashboardNavbarUi } from './components/dashboard/PfDashboardNavbar/index.vue';
export type { PfDashboardPanelUi } from './components/dashboard/PfDashboardPanel/index.vue';
export type { PfDashboardResizeHandleUi } from './components/dashboard/PfDashboardResizeHandle/index.vue';
export type {
  PfDashboardSearchGroup,
  PfDashboardSearchItem,
  PfDashboardSearchUi,
} from './components/dashboard/PfDashboardSearch/index.vue';
export type { PfDashboardSearchButtonUi } from './components/dashboard/PfDashboardSearchButton/index.vue';
export type {
  PfDashboardSidebarMode,
  PfDashboardSidebarUi,
} from './components/dashboard/PfDashboardSidebar/index.vue';
export type { PfDashboardSidebarCollapseUi } from './components/dashboard/PfDashboardSidebarCollapse/index.vue';
export type { PfDashboardSidebarToggleUi } from './components/dashboard/PfDashboardSidebarToggle/index.vue';
export type { PfDashboardToolbarUi } from './components/dashboard/PfDashboardToolbar/index.vue';
export type {
  PfEditorAlign,
  PfEditorCommandItem,
  PfEditorContentType,
  PfEditorCustomHandlers,
  PfEditorEmojiMenuItem,
  PfEditorHandler,
  PfEditorMentionMenuItem,
  PfEditorProps,
  PfEditorSuggestionMenuItem,
  PfEditorToolbarItem,
  PfEditorUi,
} from './components/editor/utils/types';
export { mapEditorItems, mapEditorItem } from './utils/editor';
export { PfEditorImageUpload } from './components/editor/PfEditor/imageUploadExtension';
export type {
  PfToastAction,
  PfToastCloseButton,
  PfToastColor,
  PfToastInput,
  PfToastOrientation,
  PfToastRecord,
} from './composables/usePfToast';
export type {
  PfSeparatorAvatarProps,
  PfSeparatorColor,
  PfSeparatorSize,
  PfSeparatorType,
  PfSeparatorUi,
} from './components/element/PfSeparator/index.vue';
export type { PfSkeletonUi } from './components/element/PfSkeleton/index.vue';
export type { PfFieldGroupSize } from './components/element/PfFieldGroup/injection';
export type { PfFieldGroupUi } from './components/element/PfFieldGroup/index.vue';
export type {
  PfChipColor,
  PfChipPosition,
  PfChipSize,
} from './components/element/PfChip/index.vue';
export type {
  PfProgressAnimation,
  PfProgressColor,
  PfProgressOrientation,
  PfProgressSize,
  PfProgressUi,
} from './components/element/PfProgress/index.vue';

export const prismifyPlugin: Plugin = {
  install(app: App) {
    app.component('PfApp', PfApp);
    app.component('PfContainer', PfContainer);
    app.component('PfHeader', PfHeader);
    app.component('PfMain', PfMain);
    app.component('PfError', PfError);
    app.component('PfFooter', PfFooter);
    app.component('PfAlert', PfAlert);
    app.component('PfAvatar', PfAvatar);
    app.component('PfAvatarGroup', PfAvatarGroup);
    app.component('PfBadge', PfBadge);
    app.component('PfBanner', PfBanner);
    app.component('PfButton', PfButton);
    app.component('PfInput', PfInput);
    app.component('PfTextarea', PfTextarea);
    app.component('PfCalendar', PfCalendar);
    app.component('PfCheckbox', PfCheckbox);
    app.component('PfCheckboxGroup', PfCheckboxGroup);
    app.component('PfRadio', PfRadio);
    app.component('PfRadioGroup', PfRadioGroup);
    app.component('PfSwitch', PfSwitch);
    app.component('PfSlider', PfSlider);
    app.component('PfSelect', PfSelect);
    app.component('PfSelectMenu', PfSelectMenu);
    app.component('PfInputMenu', PfInputMenu);
    app.component('PfInputTags', PfInputTags);
    app.component('PfPinInput', PfPinInput);
    app.component('PfInputNumber', PfInputNumber);
    app.component('PfInputDate', PfInputDate);
    app.component('PfInputTime', PfInputTime);
    app.component('PfColorPicker', PfColorPicker);
    app.component('PfFileUpload', PfFileUpload);
    app.component('PfForm', PfForm);
    app.component('PfFormField', PfFormField);
    app.component('PfCard', PfCard);
    app.component('PfChip', PfChip);
    app.component('PfCollapsible', PfCollapsible);
    app.component('PfFieldGroup', PfFieldGroup);
    app.component('PfIcon', PfIcon);
    app.component('PfKbd', PfKbd);
    app.component('PfContentSearchButton', PfContentSearchButton);
    app.component('PfProgress', PfProgress);
    app.component('PfSeparator', PfSeparator);
    app.component('PfSkeleton', PfSkeleton);
    app.component('PfAccordion', PfAccordion);
    app.component('PfEmpty', PfEmpty);
    app.component('PfScrollArea', PfScrollArea);
    app.component('PfTable', PfTable);
    app.component('PfTimeline', PfTimeline);
    app.component('PfMarquee', PfMarquee);
    app.component('PfUser', PfUser);
    app.component('PfTree', PfTree);
    app.component('PfBreadcrumb', PfBreadcrumb);
    app.component('PfFooterColumns', PfFooterColumns);
    app.component('PfLink', PfLink);
    app.component('PfPagination', PfPagination);
    app.component('PfStepper', PfStepper);
    app.component('PfTabs', PfTabs);
    app.component('PfNavigationMenu', PfNavigationMenu);
    app.component('PfContentNavigation', PfContentNavigation);
    app.component('PfContentSurround', PfContentSurround);
    app.component('PfContentToc', PfContentToc);
    app.component('PfContextMenu', PfContextMenu);
    app.component('PfDropdownMenu', PfDropdownMenu);
    app.component('PfTooltip', PfTooltip);
    app.component('PfModal', PfModal);
    app.component('PfContentSearch', PfContentSearch);
    app.component('PfDrawer', PfDrawer);
    app.component('PfToast', PfToast);
    app.component('PfToaster', PfToaster);
    app.component('PfEditor', PfEditor);
    app.component('PfEditorToolbar', PfEditorToolbar);
    app.component('PfEditorSuggestionMenu', PfEditorSuggestionMenu);
    app.component('PfEditorMentionMenu', PfEditorMentionMenu);
    app.component('PfEditorEmojiMenu', PfEditorEmojiMenu);
    app.component('PfEditorDragHandle', PfEditorDragHandle);
    app.component('PfDashboardGroup', PfDashboardGroup);
    app.component('PfDashboardNavbar', PfDashboardNavbar);
    app.component('PfDashboardPanel', PfDashboardPanel);
    app.component('PfDashboardResizeHandle', PfDashboardResizeHandle);
    app.component('PfDashboardSearch', PfDashboardSearch);
    app.component('PfDashboardSearchButton', PfDashboardSearchButton);
    app.component('PfDashboardSidebar', PfDashboardSidebar);
    app.component('PfDashboardSidebarCollapse', PfDashboardSidebarCollapse);
    app.component('PfDashboardSidebarToggle', PfDashboardSidebarToggle);
    app.component('PfDashboardToolbar', PfDashboardToolbar);
  },
};

export default prismifyPlugin;
