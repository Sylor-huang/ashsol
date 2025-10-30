<template>
  <el-pagination
    layout="total,prev, pager, next"
    :total="pagies.total"
    :page-size="pagies.pageSize"
    @current-change="handleCurrentChange"
  />
</template>

<script setup>
import {getCurrentInstance} from "vue";
let {proxy} = getCurrentInstance();

defineProps({
  pagies: {
    type: Object,
    default: {
      total: 0,
      page: 1,
      pageSize: 20
    }
  }
});

let handleCurrentChange = (page) => {
  proxy.pagies.page = page
  proxy.$emit("change_page", page);
};
</script>
