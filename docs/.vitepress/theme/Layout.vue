<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { useData, inBrowser, withBase } from 'vitepress'
import { watchEffect } from 'vue'
import pkg from '../../../package.json'

const { lang, site } = useData()
watchEffect(() => {
  if (inBrowser) {
    document.cookie = `nf_lang=${lang.value}; expires=Mon, 1 Jan 2030 00:00:00 UTC; path=/`
  }
})

const version = pkg.version
</script>

<template>
  <DefaultTheme.Layout>
    <template #sidebar-nav-after>
      <div class="sidebar-footer">
        <span class="sidebar-version">v{{ version }}</span>
      </div>
    </template>
  </DefaultTheme.Layout>
</template>

<style>
.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--vp-c-divider);
  text-decoration: none;
  color: var(--vp-c-text-1);
  transition: color 0.25s;
}

.sidebar-brand:hover {
  color: var(--vp-c-brand-1);
}

.sidebar-brand-logo {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.sidebar-brand-title {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.2;
}

.sidebar-footer {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--vp-c-divider);
  display: flex;
  justify-content: center;
}

.sidebar-version {
  font-size: 12px;
  font-weight: 500;
  color: var(--vp-c-text-3);
  padding: 2px 10px;
  border-radius: 10px;
  background-color: var(--vp-c-default-soft);
}

/* 侧边栏分组折叠/展开动画 */
.VPSidebarItem .items {
  overflow: hidden;
  transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease !important;
}

.VPSidebarItem:not(.collapsed) .items {
  max-height: 10000px;
  opacity: 1;
}

.VPSidebarItem.collapsed .items {
  display: block !important;
  max-height: 0;
  opacity: 0;
}

/* 顶部导航下拉菜单滑入动画 */
.VPFlyout .menu,
.VPLocalNavOutlineDropdown .items {
  transition: opacity 0.25s, visibility 0.25s, transform 0.25s !important;
}

.VPFlyout .button[aria-expanded="false"] + .menu {
  transform: translateY(-6px) !important;
}
</style>
