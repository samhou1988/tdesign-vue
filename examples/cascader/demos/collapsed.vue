<template>
  <div class="tdesign-demo-block-row">
    <t-cascader v-model="value" :options="options" :on-remove="handleBlur" multiple :min-collapsed-num="1" />
    <t-cascader v-model="value" :options="options" :collapsed-items="collapsedItems" multiple :min-collapsed-num="1" />
    <t-cascader v-model="value" :options="options" multiple clearable :min-collapsed-num="1">
      <template #collapsedItems="{ collapsedSelectedItems, count }">
        <t-popup>
          <template #content>
            <p v-for="(item, index) in collapsedSelectedItems" :key="index" style="padding: 10px">
              {{ item.label }}
            </p>
          </template>
          <span v-show="count > 0" style="color: #00a870">+{{ count - 1 }}</span>
        </t-popup>
      </template>
    </t-cascader>
  </div>
</template>
<script lang="jsx">
export default {
  data() {
    return {
      options: [
        {
          label: '选项一',
          value: '1',
          children: [
            {
              label: '子选项一',
              value: '1.1',
            },
            {
              label: '子选项二',
              value: '1.2',
            },
            {
              label: '子选项三',
              value: '1.3',
            },
          ],
        },
        {
          label: '选项二',
          value: '2',
          children: [
            {
              label: '子选项一',
              value: '2.1',
            },
            {
              label: '子选项二',
              value: '2.2',
            },
          ],
        },
      ],
      value: ['1.1', '1.2', '1.3'],
      open: true,
    };
  },
  methods: {
    collapsedItems(h, { value, count }) {
      if (!(value instanceof Array) || !count) return;
      // hover展示全部已选项
      return (
        <t-popup>
          <div slot="content">
            {value.map((item) => (
              <p style="padding: 10px;">{item.label}</p>
            ))}
          </div>
          <span v-show={count > 0} style="color: #ED7B2F;">
            +{count - 1}
          </span>
        </t-popup>
      );
    },
    handleBlur(e) {
      console.log(e);
    },
  },
};
</script>
