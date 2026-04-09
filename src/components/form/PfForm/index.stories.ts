import { CalendarDate, Time } from '@internationalized/date';
import { reactive, ref } from 'vue';
import type { Meta, StoryObj } from '@storybook/vue3';
import PfButton from '../../element/PfButton/index.vue';
import PfCalendar from '../PfCalendar/index.vue';
import PfCheckbox from '../PfCheckbox/index.vue';
import PfCheckboxGroup from '../PfCheckboxGroup/index.vue';
import PfColorPicker from '../PfColorPicker/index.vue';
import PfFileUpload from '../PfFileUpload/index.vue';
import PfInput from '../PfInput/index.vue';
import PfInputDate from '../PfInputDate/index.vue';
import PfInputMenu from '../PfInputMenu/index.vue';
import PfInputNumber from '../PfInputNumber/index.vue';
import PfInputTags from '../PfInputTags/index.vue';
import PfInputTime from '../PfInputTime/index.vue';
import PfPinInput from '../PfPinInput/index.vue';
import PfRadio from '../PfRadio/index.vue';
import PfRadioGroup from '../PfRadioGroup/index.vue';
import PfSelect from '../PfSelect/index.vue';
import PfSelectMenu from '../PfSelectMenu/index.vue';
import PfSlider from '../PfSlider/index.vue';
import PfSwitch from '../PfSwitch/index.vue';
import PfTextarea from '../PfTextarea/index.vue';
import type { PfCalendarDateRange } from '../PfCalendar/calendarSelection';
import PfFormField from '../PfFormField/index.vue';
import PfForm from './index.vue';
import type { PfFormSubmitEvent } from './index.vue';
import type { PfFormError } from './injection';

const meta = {
  title: 'Form/PfForm',
  component: PfForm,
  tags: ['autodocs'],
} satisfies Meta<typeof PfForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => ({
    components: { PfForm, PfFormField, PfInput, PfButton },
    setup() {
      const state = reactive({
        email: '',
        password: '',
      });
      const submitted = ref(false);

      function validate(formState: typeof state): PfFormError[] {
        const errors: PfFormError[] = [];
        if (!formState.email) {
          errors.push({ name: 'email', message: 'Email is required' });
        }
        if (!formState.password || formState.password.length < 8) {
          errors.push({
            name: 'password',
            message: 'Password must be at least 8 characters',
          });
        }
        return errors;
      }

      function onSubmit(_event: PfFormSubmitEvent) {
        submitted.value = true;
      }

      return { state, validate, onSubmit, submitted };
    },
    template: `
      <PfForm :state="state" :validate="validate" style="width: 24rem;" @submit="onSubmit">
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          <PfFormField label="Email" name="email">
            <PfInput v-model="state.email" type="email" />
          </PfFormField>

          <PfFormField label="Password" name="password">
            <PfInput v-model="state.password" type="password" />
          </PfFormField>

          <PfButton type="submit">
            Submit
          </PfButton>

          <p v-if="submitted">Submitted!</p>
        </div>
      </PfForm>
    `,
  }),
};

const choiceItems = [
  { label: 'Option 1', value: 'option-1' },
  { label: 'Option 2', value: 'option-2' },
  { label: 'Option 3', value: 'option-3' },
] as const;

const selectOptions = [
  { label: 'Option 1', value: 'option-1' },
  { label: 'Option 2', value: 'option-2' },
  { label: 'Option 3', value: 'option-3' },
] as const;

export const AllFormComponents: Story = {
  parameters: {
    layout: 'fullscreen',
  },
  render: () => ({
    components: {
      PfForm,
      PfFormField,
      PfButton,
      PfInput,
      PfTextarea,
      PfInputNumber,
      PfInputDate,
      PfInputTime,
      PfColorPicker,
      PfSwitch,
      PfSlider,
      PfCheckbox,
      PfCheckboxGroup,
      PfRadio,
      PfRadioGroup,
      PfSelect,
      PfSelectMenu,
      PfInputMenu,
      PfInputTags,
      PfPinInput,
      PfFileUpload,
      PfCalendar,
    },
    setup() {
      const state = reactive({
        text: '',
        textarea: '',
        inputNumber: null as number | null,
        inputDate: null as CalendarDate | null,
        inputTime: null as Time | null,
        color: '',
        switchOn: false,
        agree: false,
        checkboxGroup: [] as unknown[],
        radioGroup: '' as string,
        radioStandalone: '' as string,
        slider: 0,
        select: undefined as string | undefined,
        selectMultiple: [] as string[],
        selectMenu: null as unknown,
        selectMenuMultiple: [] as unknown[],
        inputMenu: null as unknown,
        inputMenuMultiple: [] as unknown[],
        tags: [] as unknown[],
        pin: '',
        file: null as File | File[] | null,
        calendar: { start: null, end: null } as PfCalendarDateRange,
      });

      const submitted = ref(false);

      function validate(formState: typeof state): PfFormError[] {
        const errors: PfFormError[] = [];

        if (!String(formState.text ?? '').trim()) {
          errors.push({ name: 'text', message: 'Required' });
        }
        if (!String(formState.textarea ?? '').trim()) {
          errors.push({ name: 'textarea', message: 'Required' });
        }
        if (formState.inputNumber == null) {
          errors.push({ name: 'inputNumber', message: 'Required' });
        }
        if (formState.inputDate == null) {
          errors.push({ name: 'inputDate', message: 'Required' });
        }
        if (formState.inputTime == null) {
          errors.push({ name: 'inputTime', message: 'Required' });
        }
        if (
          !formState.color ||
          !/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(formState.color.trim())
        ) {
          errors.push({ name: 'color', message: 'Pick a color' });
        }
        if (!formState.switchOn) {
          errors.push({ name: 'switchOn', message: 'Required' });
        }
        if (!formState.agree) {
          errors.push({ name: 'agree', message: 'Required' });
        }
        if (!formState.checkboxGroup?.length) {
          errors.push({
            name: 'checkboxGroup',
            message: 'Select at least one',
          });
        }
        if (!String(formState.radioGroup ?? '').trim()) {
          errors.push({ name: 'radioGroup', message: 'Required' });
        }
        if (!String(formState.radioStandalone ?? '').trim()) {
          errors.push({ name: 'radioStandalone', message: 'Required' });
        }
        if (formState.select == null || formState.select === '') {
          errors.push({ name: 'select', message: 'Required' });
        }
        if (!formState.selectMultiple?.length) {
          errors.push({
            name: 'selectMultiple',
            message: 'Select at least one',
          });
        }
        if (formState.selectMenu == null || formState.selectMenu === '') {
          errors.push({ name: 'selectMenu', message: 'Required' });
        }
        if (
          !Array.isArray(formState.selectMenuMultiple) ||
          !formState.selectMenuMultiple.length
        ) {
          errors.push({
            name: 'selectMenuMultiple',
            message: 'Select at least one',
          });
        }
        if (formState.inputMenu == null || formState.inputMenu === '') {
          errors.push({ name: 'inputMenu', message: 'Required' });
        }
        if (
          !Array.isArray(formState.inputMenuMultiple) ||
          !formState.inputMenuMultiple.length
        ) {
          errors.push({
            name: 'inputMenuMultiple',
            message: 'Select at least one',
          });
        }
        if (!formState.tags?.length) {
          errors.push({ name: 'tags', message: 'Add at least one tag' });
        }
        if (String(formState.pin ?? '').length !== 4) {
          errors.push({ name: 'pin', message: 'Enter all 4 digits' });
        }
        if (
          formState.file == null ||
          (Array.isArray(formState.file) && formState.file.length === 0)
        ) {
          errors.push({ name: 'file', message: 'Required' });
        }
        const range = formState.calendar;
        if (!range?.start || !range?.end) {
          errors.push({ name: 'calendar', message: 'Select a date range' });
        }

        return errors;
      }

      function onSubmit(_event: PfFormSubmitEvent) {
        submitted.value = true;
      }

      return {
        state,
        validate,
        onSubmit,
        submitted,
        choiceItems,
        selectOptions,
      };
    },
    template: `
      <PfForm
        :state="state"
        :validate="validate"
        style="box-sizing: border-box; width: min(72rem, 100%); margin: 0 auto; padding: 1rem;"
        @submit="onSubmit"
      >
        <div
          style="
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
            gap: 1rem 1.25rem;
            align-items: start;
          "
        >
          <PfFormField required label="PfInput" name="text" description="Text input">
            <PfInput v-model="state.text" name="text" placeholder="Type here" />
          </PfFormField>

          <PfFormField required label="PfTextarea" name="textarea" description="Multiline">
            <PfTextarea v-model="state.textarea" name="textarea" placeholder="Notes" />
          </PfFormField>

          <PfFormField required label="PfInputNumber" name="inputNumber">
            <PfInputNumber v-model="state.inputNumber" name="inputNumber" />
          </PfFormField>

          <PfFormField required label="PfInputDate" name="inputDate">
            <PfInputDate v-model="state.inputDate" name="inputDate" locale="en-US" />
          </PfFormField>

          <PfFormField required label="PfInputTime" name="inputTime">
            <PfInputTime v-model="state.inputTime" name="inputTime" locale="en-US" />
          </PfFormField>

          <PfFormField required label="PfColorPicker" name="color">
            <PfColorPicker v-model="state.color" />
          </PfFormField>

          <PfFormField required label="PfSwitch" name="switchOn">
            <PfSwitch v-model="state.switchOn" name="switchOn" label="Enable notifications" />
          </PfFormField>

          <PfFormField required label="PfSlider" name="slider">
            <PfSlider v-model="state.slider" name="slider" :min="0" :max="100" />
          </PfFormField>

          <PfFormField required label="PfCheckbox" name="agree">
            <PfCheckbox v-model="state.agree" name="agree" label="I agree to the terms" />
          </PfFormField>

          <PfFormField required label="PfCheckboxGroup" name="checkboxGroup">
            <PfCheckboxGroup
              v-model="state.checkboxGroup"
              name="checkboxGroup"
              legend="Pick any"
              :items="choiceItems"
            />
          </PfFormField>

          <PfFormField required label="PfRadioGroup" name="radioGroup">
            <PfRadioGroup
              v-model="state.radioGroup"
              name="radioGroup"
              legend="Pick one"
              :items="choiceItems"
            />
          </PfFormField>

          <PfFormField required label="PfRadio" name="radioStandalone">
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
              <PfRadio
                v-model="state.radioStandalone"
                value="a"
                name="radioStandalone"
                label="Option A"
              />
              <PfRadio
                v-model="state.radioStandalone"
                value="b"
                name="radioStandalone"
                label="Option B"
              />
            </div>
          </PfFormField>

          <PfFormField required label="PfSelect" name="select">
            <PfSelect
              v-model="state.select"
              name="select"
              placeholder="Choose"
              :options="selectOptions"
            />
          </PfFormField>

          <PfFormField required label="PfSelect (multiple)" name="selectMultiple">
            <PfSelect
              v-model="state.selectMultiple"
              name="selectMultiple"
              multiple
              placeholder="Choose several"
              :options="selectOptions"
            />
          </PfFormField>

          <PfFormField required label="PfSelectMenu" name="selectMenu">
            <PfSelectMenu
              v-model="state.selectMenu"
              name="selectMenu"
              placeholder="Menu"
              :items="choiceItems"
            />
          </PfFormField>

          <PfFormField required label="PfSelectMenu (multiple)" name="selectMenuMultiple">
            <PfSelectMenu
              v-model="state.selectMenuMultiple"
              name="selectMenuMultiple"
              multiple
              placeholder="Choose several"
              :items="choiceItems"
            />
          </PfFormField>

          <PfFormField required label="PfInputMenu" name="inputMenu">
            <PfInputMenu
              v-model="state.inputMenu"
              name="inputMenu"
              placeholder="Menu"
              :items="choiceItems"
            />
          </PfFormField>

          <PfFormField required label="PfInputMenu (multiple)" name="inputMenuMultiple">
            <PfInputMenu
              v-model="state.inputMenuMultiple"
              name="inputMenuMultiple"
              multiple
              placeholder="Choose several"
              :items="choiceItems"
            />
          </PfFormField>

          <PfFormField required label="PfInputTags" name="tags">
            <PfInputTags v-model="state.tags" name="tags" placeholder="Add tags, Enter" />
          </PfFormField>

          <PfFormField required label="PfPinInput" name="pin">
            <PfPinInput v-model="state.pin" name="pin" :length="4" />
          </PfFormField>

          <PfFormField required label="PfFileUpload" name="file">
            <PfFileUpload
              v-model="state.file"
              name="file"
              variant="area"
              label="Drop files here"
              description="Any file type"
              :multiple="true"
            />
          </PfFormField>

          <PfFormField required label="PfCalendar" name="calendar" style="grid-column: 1 / -1;">
            <PfCalendar v-model="state.calendar" locale="en-US" :range="true" :number-of-months="3" />
          </PfFormField>
        </div>

        <div style="margin-top: 1.25rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <PfButton type="submit">Submit</PfButton>
          <span v-if="submitted" style="align-self: center;">Submitted</span>
        </div>
      </PfForm>
    `,
  }),
};
