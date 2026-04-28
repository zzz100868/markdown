<!-- @format -->

<!-- 关于页面：展示项目说明和作者信息。 -->

<template>
  <PreviewVditor :pdata="pdata" @callback="handleCallBack" />
</template>

<script>
import PreviewVditor from "@components/PreviewVditor";
import AboutAryaMd from "@config/about";

export default {
  name: "about-arya",

  data() {
    return {
      isLoading: true,
      pdata: AboutAryaMd,
    };
  },

  components: {
    PreviewVditor,
  },

  methods: {
    handleCallBack() {
      this.isLoading = false;
    },
  },
};
</script>
