import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import PfButton from '../../element/PfButton/index.vue';
import PfColorPicker from './index.vue';

const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
const formats = ['hex', 'rgb', 'hsl', 'cmyk', 'lab'] as const;

const meta = {
  title: 'Form/PfColorPicker',
  component: PfColorPicker,
  tags: ['autodocs'],
  args: {
    format: 'hex',
    throttle: 50,
    disabled: false,
    size: 'md',
    defaultValue: '#FFFFFF',
    history: true,
    historyDebounce: 300,
    historyLimit: 50,
  },
  argTypes: {
    format: { control: 'select', options: [...formats] },
    size: { control: 'select', options: [...sizes] },
  },
} satisfies Meta<typeof PfColorPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => ({
    components: { PfColorPicker },
    setup() {
      const color = ref('#00C16A');
      return { args, color };
    },
    template: `
      <PfColorPicker v-bind="args" v-model="color" />
      <p style="margin-top: 1rem; font-family: var(--pf-font-sans); color: var(--pf-color-muted); font-size: var(--pf-font-size-sm);">{{ color }}</p>
    `,
  }),
};

export const Uncontrolled: Story = {
  args: {
    defaultValue: '#00BCD4',
  },
};

export const Formats: Story = {
  render: () => ({
    components: { PfColorPicker },
    setup() {
      const hex = ref('#00C16A');
      const rgb = ref('rgb(0, 193, 106)');
      const hsl = ref('hsl(153, 100%, 37.8%)');
      const cmyk = ref('cmyk(100%, 0%, 45.08%, 24.31%)');
      const lab = ref('lab(68.88% -60.41% 32.55%)');
      return { hex, rgb, hsl, cmyk, lab };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <div>
          <div style="font-size: var(--pf-font-size-sm); color: var(--pf-color-muted); margin-bottom: 0.25rem;">hex</div>
          <PfColorPicker v-model="hex" format="hex" />
          <p style="margin-top: 0.25rem; font-size: var(--pf-font-size-sm);">{{ hex }}</p>
        </div>
        <div>
          <div style="font-size: var(--pf-font-size-sm); color: var(--pf-color-muted); margin-bottom: 0.25rem;">rgb</div>
          <PfColorPicker v-model="rgb" format="rgb" />
          <p style="margin-top: 0.25rem; font-size: var(--pf-font-size-sm);">{{ rgb }}</p>
        </div>
        <div>
          <div style="font-size: var(--pf-font-size-sm); color: var(--pf-color-muted); margin-bottom: 0.25rem;">hsl</div>
          <PfColorPicker v-model="hsl" format="hsl" />
          <p style="margin-top: 0.25rem; font-size: var(--pf-font-size-sm);">{{ hsl }}</p>
        </div>
        <div>
          <div style="font-size: var(--pf-font-size-sm); color: var(--pf-color-muted); margin-bottom: 0.25rem;">cmyk</div>
          <PfColorPicker v-model="cmyk" format="cmyk" />
          <p style="margin-top: 0.25rem; font-size: var(--pf-font-size-sm);">{{ cmyk }}</p>
        </div>
        <div>
          <div style="font-size: var(--pf-font-size-sm); color: var(--pf-color-muted); margin-bottom: 0.25rem;">lab</div>
          <PfColorPicker v-model="lab" format="lab" />
          <p style="margin-top: 0.25rem; font-size: var(--pf-font-size-sm);">{{ lab }}</p>
        </div>
      </div>
    `,
  }),
};

export const WithButton: Story = {
  render: () => ({
    components: { PfButton, PfColorPicker },
    setup() {
      const color = ref('#00C16A');
      const chip = () => ({ backgroundColor: color.value });
      return { color, chip };
    },
    template: `
      <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 0.75rem;">
        <PfButton color="neutral" variant="outline" label="Choose color">
          <template #leading>
            <span :style="chip()" style="width: 0.75rem; height: 0.75rem; border-radius: 9999px; display: inline-block;" />
          </template>
        </PfButton>
        <PfColorPicker v-model="color" style="padding: 0.5rem;" />
        <span style="font-size: var(--pf-font-size-sm); color: var(--pf-color-muted);">{{ color }}</span>
      </div>
    `,
  }),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: '#00C16A',
  },
};

export const Sizes: Story = {
  render: () => ({
    components: { PfColorPicker },
    setup() {
      const color = ref('#7c3aed');
      const sizelist = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
      return { color, sizelist };
    },
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 1rem; align-items: flex-end;">
        <PfColorPicker v-for="s in sizelist" :key="s" v-model="color" :size="s" />
      </div>
    `,
  }),
};
