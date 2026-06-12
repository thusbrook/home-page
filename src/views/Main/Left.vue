<template>
  <div :class="store.mobileOpenState ? 'left hidden' : 'left'">
    <Message />
    <!-- <SocialLinks /> -->
  </div>
</template>

<script setup>
import { mainStore } from "@/store";
import Message from "@/components/Message.vue";
// import SocialLinks from "@/components/SocialLinks.vue";
const store = mainStore();
</script>

<style lang="scss" scoped>
.left {
  // flex: 1 0 0%;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  width: 50%;
  height: 60vh;
  max-height: 480px;
  &.hidden {
    display: none;
  }
  @media (max-width: 720px) {
    margin-right: 0;
    width: 100%;
  }
}
</style>
