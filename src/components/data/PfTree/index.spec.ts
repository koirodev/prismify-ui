import { mount } from '@vue/test-utils';
import { defineComponent, ref } from 'vue';
import { describe, expect, it } from 'vitest';
import PfTree from './index.vue';
import type { PfTreeItem } from './treeTypes';

const nestedItems: PfTreeItem[] = [
  {
    label: 'parent',
    defaultExpanded: false,
    children: [{ label: 'child' }],
  },
];

describe('PfTree', () => {
  it('expands node when expand control is clicked', async () => {
    const w = mount(PfTree, {
      props: { items: nestedItems, nested: true },
    });
    expect(w.find('.pfTree__subtree_open').exists()).toBe(false);
    const expand = w.find('.pfTree__expand');
    expect(expand.exists()).toBe(true);
    await expand.trigger('click');
    expect(w.find('.pfTree__subtree_open').exists()).toBe(true);
    expect(
      w.findAll('.pfTree__link').some((l) => l.text().trim() === 'child')
    ).toBe(true);
  });

  it('does not expand when item onToggle prevents default', async () => {
    const items: PfTreeItem[] = [
      {
        label: 'parent',
        children: [{ label: 'child' }],
        onToggle(e) {
          e.preventDefault();
        },
      },
    ];
    const w = mount(PfTree, {
      props: { items, nested: true },
    });
    await w.find('.pfTree__expand').trigger('click');
    expect(w.find('.pfTree__subtree_open').exists()).toBe(false);
  });

  it('renders default leading icons for folders and item.icon', () => {
    const w = mount(PfTree, {
      props: {
        items: [{ label: 'dir', children: [{ label: 'leaf', icon: 'file' }] }],
        nested: true,
        defaultExpanded: ['dir'],
      },
    });
    const icons = w.findAll('.pfTree__leading .pfIcon');
    expect(icons.length).toBeGreaterThanOrEqual(2);
  });

  it('renders leading image when iconSrc is set', () => {
    const w = mount(PfTree, {
      props: {
        items: [
          {
            label: 'pic',
            iconSrc:
              'data:image/svg+xml,' +
              encodeURIComponent(
                '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect width="16" height="16" fill="red"/></svg>'
              ),
          },
        ],
        nested: false,
      },
    });
    const img = w.find('.pfTree__leadingImg');
    expect(img.exists()).toBe(true);
    expect(img.attributes('src')).toContain('data:image/svg+xml');
  });

  it('renders flat rows when nested is false', () => {
    const w = mount(PfTree, {
      props: {
        items: [{ label: 'a' }, { label: 'b' }],
        nested: false,
      },
    });
    expect(w.findAll('.pfTree__row')).toHaveLength(2);
  });

  it('emits update:modelValue when controlled', async () => {
    const w = mount(PfTree, {
      props: {
        items: [{ label: 'a' }, { label: 'b' }],
        nested: false,
        modelValue: undefined as string | undefined,
        'onUpdate:modelValue': () => {},
      },
    });
    const links = w.findAll('.pfTree__link');
    await links[0].trigger('click');
    expect(w.emitted('update:modelValue')?.[0]).toEqual(['a']);
  });

  it('emits update:expanded when expanded is controlled', async () => {
    const Parent = defineComponent({
      components: { PfTree },
      setup() {
        const expanded = ref<string[]>([]);
        return { expanded, items: nestedItems };
      },
      template: '<PfTree v-model:expanded="expanded" :items="items" nested />',
    });
    const w = mount(Parent);
    await w.find('.pfTree__expand').trigger('click');
    const tree = w.findComponent(PfTree);
    expect(tree.emitted('update:expanded')?.[0]).toEqual([['parent']]);
  });
});
