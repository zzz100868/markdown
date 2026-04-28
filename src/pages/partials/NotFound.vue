<!-- @format -->

<!-- 404 页面：处理未匹配到的路由。 -->

<template>
  <div class="error-404">
    <div class="error-404-body">
      <div class="error-404-body-title">
        <span class="left-four">4</span>
        <span class="center-zero">0</span>
        <span class="right-four">4</span>
      </div>
      <p class="error-404-body-message">PAGE NOT FOUND</p>
      <div class="error-404-btns">
        <a href="javascript:;" @click="onGoHomeClick">返回首页</a>
        <a href="javascript:;" @click="onBackPageClick">返回上一页</a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Error404",

  methods: {
    onBackPageClick() {
      this.$router.go(-1);
    },
    onGoHomeClick() {
      this.$router.push("/");
    },
  },
};
</script>

<style type="text/css" lang="less">
@import "./../../assets/styles/style.less";

.error-404 {
  background-color: @bg-page;
  min-height: 100vh;
}

.error-404-body {
  width: 96%;
  max-width: 520px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  padding: 20px 0;

  .error-404-body-title {
    text-align: center;
    font-size: 6rem;
    font-weight: 700;
    color: @text-primary;
    height: 10rem;
    line-height: 10rem;
    letter-spacing: -0.04em;

    .center-zero {
      display: inline-block;
      color: @text-tertiary;
      margin: 0 -0.5rem;
    }

    .left-four,
    .right-four {
      margin: 0;
      display: inline-block;
      color: @text-primary;
    }
  }

  .error-404-body-message {
    display: block;
    text-align: center;
    font-size: 0.875rem;
    font-weight: 500;
    letter-spacing: 0.15em;
    color: @text-tertiary;
    margin-bottom: 2rem;
  }

  .error-404-btns {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;

    a {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 8px 20px;
      font-size: 0.875rem;
      font-weight: 500;
      color: @text-primary;
      background-color: @bg-surface;
      border: 1px solid @border;
      border-radius: 8px;
      transition: all 0.2s ease;

      &:hover {
        background-color: @bg-hover;
        border-color: @border-strong;
      }

      &:active {
        background-color: @bg-active;
      }
    }
  }
}

@media (max-width: 375px) {
  .error-404-body {
    .error-404-body-title {
      height: 8rem;
      font-size: 5rem;
      line-height: 8rem;
    }
  }
}
</style>
