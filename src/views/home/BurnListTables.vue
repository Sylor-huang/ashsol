<template>
  <div>
    <el-table
      :data="targets"
      size="large"
      class="w-full"
      :max-height="400"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column type="index" label="NO." width="60">
        <template #default="scope">
          {{ tableIndex(scope.$index, pages) }}
        </template>
      </el-table-column>
      <el-table-column prop="tokenMint" label="Token Address" width="160">
        <template #default="scope">
          <div>
            <el-link
              :href="`https://dexscreener.com/solana/${scope.row.tokenMint}`"
              target="_blank"
            >
              {{ sliceString(scope.row.tokenMint, 6) }}
            </el-link>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="symbol" label="Symbol" width="120">
      </el-table-column>
      <el-table-column prop="tokenBalance" label="Balance" width="140">
      </el-table-column>
      <el-table-column prop="tokenBalance" label="Burn Amount" width="200">
        <template #default="scope">
          <div>
            <el-input v-model="scope.row.burn"></el-input>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="TX">
        <template #default="scope">
          <div>
            <el-space v-if="scope.row.tx && scope.row.tx.length > 0">
              <el-link
                :href="`https://solscan.io/tx/${scope.row.tx}`"
                target="_blank"
              >
                {{ sliceString(scope.row.tx, 8) }}
              </el-link>
              <CoppyIcon :copy_text="`https://solscan.io/tx/${scope.row.tx}`" :icon_size="14"></CoppyIcon>
            </el-space>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script setup>
import {reactive, computed} from "vue";
import {sliceString, tableIndex} from "@/utils/validate.js";
import CoppyIcon from "@/layout/components/Commons/CoppyIcon";

defineProps({
  targets: {
    type: Object,
  },
  pages: {
    type: Object,
  },
});

const state = reactive({
  batchRecords: [],
});

const handleSelectionChange = (val) => {
  state.batchRecords = val;
};

defineExpose({
  batchRecords: computed(() => state.batchRecords),
});
</script>
