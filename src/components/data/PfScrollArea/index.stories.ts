import type { Meta, StoryObj } from '@storybook/vue3';
import { computed, ref } from 'vue';
import PfCard from '../../element/PfCard/index.vue';
import PfScrollArea from './index.vue';
import type { PfScrollAreaVirtualizer } from './index.vue';

const meta: Meta<typeof PfScrollArea> = {
  title: 'Data/PfScrollArea',
  component: PfScrollArea,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    orientation: { control: 'select', options: ['vertical', 'horizontal'] },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

const heights = [120, 160, 200, 240];

function getHeight(index: number) {
  const seed = (index * 11 + 7) % 17;
  return heights[seed % heights.length]!;
}

export const ListDefault: Story = {
  render: () => ({
    components: { PfScrollArea, PfCard },
    setup() {
      const items = Array.from({ length: 40 }, (_, i) => ({
        id: i,
        title: `Item ${i + 1}`,
        description: `Description for row ${i + 1}`,
      }));
      return { items };
    },
    template: `
      <PfScrollArea
        v-slot="{ item, index }"
        :items="items"
        style="height: 24rem; width: 100%; max-width: 32rem; border: 1px solid var(--pf-border-color); border-radius: var(--pf-radius-md);"
      >
        <PfCard
          :title="item.title"
          :description="item.description"
          :variant="index % 2 === 0 ? 'soft' : 'outline'"
        />
      </PfScrollArea>
    `,
  }),
};

export const VirtualizedVertical: Story = {
  render: () => ({
    components: { PfScrollArea, PfCard },
    setup() {
      const items = computed(() =>
        Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          title: `Item ${i + 1}`,
          description: `Virtualized, row ${i + 1}`,
        }))
      );
      return { items };
    },
    template: `
      <PfScrollArea
        v-slot="{ item, index }"
        :items="items"
        :virtualize="{
          estimateSize: 72,
          skipMeasurement: true,
          gap: 8,
          overscan: 64,
        }"
        style="height: 24rem; width: 100%; max-width: 32rem; border: 1px solid var(--pf-border-color); border-radius: var(--pf-radius-md);"
      >
        <PfCard
          :title="item.title"
          :description="item.description"
          :variant="index % 2 === 0 ? 'soft' : 'outline'"
        />
      </PfScrollArea>
    `,
  }),
};

export const Masonry: Story = {
  render: () => ({
    components: { PfScrollArea },
    setup() {
      const items = Array.from({ length: 200 }).map((_, index) => {
        const height = getHeight(index);
        return {
          id: index,
          title: `Card ${index + 1}`,
          height,
        };
      });
      return { items };
    },
    template: `
      <PfScrollArea
        v-slot="{ item, index }"
        :items="items"
        :virtualize="{
          gap: 16,
          lanes: 3,
          estimateSize: 180,
          overscan: 120,
          skipMeasurement: true,
        }"
        style="height: 28rem; width: 100%; max-width: 40rem; border: 1px solid var(--pf-border-color); border-radius: var(--pf-radius-md); padding: var(--pf-space-sm);"
      >
        <div
          :style="{
            width: '100%',
            height: item.height + 'px',
            background: 'var(--pf-color-surface)',
            border: '1px solid var(--pf-border-color)',
            borderRadius: 'var(--pf-radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            font: 'var(--pf-font-weight-medium) var(--pf-font-size-sm) / var(--pf-line-height-md) var(--pf-font-sans)',
            color: 'var(--pf-color-text)',
          }"
        >
          #{{ index + 1 }}
        </div>
      </PfScrollArea>
    `,
  }),
};

export const ScrollToProgrammatic: Story = {
  render: () => ({
    components: { PfScrollArea, PfCard },
    setup() {
      const items = computed(() =>
        Array.from({ length: 500 }, (_, i) => ({
          id: i,
          title: `Item ${i + 1}`,
          description: `Row ${i + 1}`,
        }))
      );
      const scrollArea = ref<{ virtualizer?: PfScrollAreaVirtualizer } | null>(
        null
      );
      const targetIndex = ref(200);
      function goTop() {
        scrollArea.value?.virtualizer?.scrollToIndex(0, {
          align: 'start',
          behavior: 'smooth',
        });
      }
      function goBottom() {
        scrollArea.value?.virtualizer?.scrollToIndex(items.value.length - 1, {
          align: 'end',
          behavior: 'smooth',
        });
      }
      function goTarget() {
        const i = Math.max(1, Math.min(targetIndex.value, items.value.length));
        scrollArea.value?.virtualizer?.scrollToIndex(i - 1, {
          align: 'center',
          behavior: 'smooth',
        });
      }
      return { items, scrollArea, targetIndex, goTop, goBottom, goTarget };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--pf-space-sm); width: 100%; max-width: 32rem;">
        <PfScrollArea
          ref="scrollArea"
          v-slot="{ item, index }"
          :items="items"
          :virtualize="{ estimateSize: 72, skipMeasurement: true, gap: 8 }"
          style="height: 18rem; width: 100%; border: 1px solid var(--pf-border-color); border-radius: var(--pf-radius-md);"
        >
          <PfCard
            :title="item.title"
            :description="item.description"
            variant="outline"
          />
        </PfScrollArea>
        <div style="display: flex; flex-wrap: wrap; gap: var(--pf-space-xs); align-items: center;">
          <button type="button" style="padding: 0.5rem 0.75rem; border-radius: var(--pf-radius-md); border: 1px solid var(--pf-border-color); background: var(--pf-color-surface); cursor: pointer;" @click="goTop">Top</button>
          <button type="button" style="padding: 0.5rem 0.75rem; border-radius: var(--pf-radius-md); border: 1px solid var(--pf-border-color); background: var(--pf-color-surface); cursor: pointer;" @click="goBottom">Bottom</button>
          <label style="display: flex; flex-direction: row; align-items: center; gap: 0.4rem;">
            <span>Index</span>
            <input v-model.number="targetIndex" type="number" min="1" max="500" style="width: 5rem; padding: 0.25rem 0.5rem;" />
          </label>
          <button type="button" style="padding: 0.5rem 0.75rem; border-radius: var(--pf-radius-md); border: 1px solid var(--pf-border-color); background: var(--pf-color-surface); cursor: pointer;" @click="goTarget">Go</button>
        </div>
      </div>
    `,
  }),
};

export const CustomSlot: Story = {
  render: () => ({
    components: { PfScrollArea, PfCard },
    template: `
      <PfScrollArea
        style="height: 16rem; width: 100%; max-width: 28rem; border: 1px solid var(--pf-border-color); border-radius: var(--pf-radius-md); --pf-scroll-area-gap: var(--pf-space-md);"
      >
        <PfCard title="Section 1" description="Content without an items array." variant="soft" />
        <PfCard title="Section 2" description="Arbitrary slot content." variant="outline" />
        <PfCard title="Section 3" description="Another block." variant="soft" />
      </PfScrollArea>
    `,
  }),
};
