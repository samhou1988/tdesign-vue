<template>
  <t-space direction="vertical">
    <t-breadcrumb>
      <t-breadcrumbItem :to="{ path: '/' }">首页</t-breadcrumbItem>
      <t-breadcrumbItem to="/vue/components/menu" :replace="true">页面1(覆盖路由)</t-breadcrumbItem>
      <t-breadcrumbItem href="http://tdesign.tencent.com/" :target="'_blank'">页面2</t-breadcrumbItem>
      <t-breadcrumbItem href="http://tdesign.tencent.com/vue/components/button" :disabled="true"
      >页面3(disabled)</t-breadcrumbItem
      >
      <t-breadcrumbItem @click="onClickItem">页面4自定义点击</t-breadcrumbItem>
    </t-breadcrumb>
    <div style="margin-top:20px;">点击计数器：{{ count }}</div>
  </t-space>
</template>
<script>
export default {
  name: 'href',
  data() {
    return {
      count: 0,
    };
  },
  methods: {
    onClickItem() {
      this.count += 1;
    },
  },
};
</script>
