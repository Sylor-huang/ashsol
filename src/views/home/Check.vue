<template>
  <div class="ash-border p-4 lg:p-4">
    <div class="mb-4 flex">
      <div class="font-bold text-2xl lg:text-3xl">Setting</div>
      <div class="flex-1 text-right">
        <el-button icon="Setting" @click="setCustomRpc"> Custom RPC </el-button>
      </div>
    </div>
    <el-row :gutter="20">
      <el-col :xs="{span: 24}" :md="{span: 12}" class="p-2">
        <el-input
          v-model="state.currentAddr"
          placeholder="Please input"
          size="large"
          :clearable="true"
        >
          <template #prepend>
            <span>Address</span>
          </template>
        </el-input>
      </el-col>
      <el-col :xs="{span: 24}" :md="{span: 12}" class="p-2">
        <el-input-number
          size="large"
          v-model="state.maxAmount"
          :min="0"
          controls-position="right"
          class="w-full"
        >
          <template #prefix>
            <div class="text-xs text-gray-400">
              <el-tooltip
                content="Set the maximum token balance to check."
                effect="light"
              >
                <el-space>
                  <span>MaxBalance</span>
                  <el-icon><InfoFilled /></el-icon>
                </el-space>
              </el-tooltip>
            </div>
          </template>
        </el-input-number>
      </el-col>
      <el-col :xs="{span: 24}" :md="{span: 24}" class="p-2">
        <div class="w-full overflow-x-auto whitespace-nowrap">
          <el-button
            type="primary"
            size="large"
            @click="checkWalletInfo"
            :loading="state.loading"
            icon="Coin"
            class="my-2"
            >Fetch Tokens</el-button
          >
          <el-popconfirm
            confirm-button-text="Yes"
            cancel-button-text="No"
            width="300"
            title="Are you sure to burn these tokens? This action cannot be undone."
            @confirm="BatchBurnRecords"
          >
            <template #reference>
              <el-button
                type="default"
                size="large"
                icon="Sunny"
                :loading="state.pageLoading"
                :disabled="!state.buttonAction"
                class="my-2"
                >Burn Tokens</el-button
              >
            </template>
          </el-popconfirm>
          <el-button
            type="default"
            size="large"
            icon="Close"
            @click="BatchCloseRecords"
            :loading="state.pageLoading"
            :disabled="!state.buttonAction"
            class="my-2"
            >Reclaim Accounts</el-button
          >
        </div>
      </el-col>
    </el-row>
    <div class="mt-4">
      <div class="mb-4">
        <div class="font-bold text-2xl lg:text-3xl">Results</div>
        <span class="gradient-color text-sm"
          >Expected reclaim ≈ {{ state.exceptedSol }} SOL</span
        >
      </div>
      <BurnListTables
        :targets="state.currentTargets"
        :pages="state.pages"
        ref="burnRecords"
      ></BurnListTables>
      <ElPagies
        :pagies="state.pages"
        @change_page="handlePageChange"
      ></ElPagies>
    </div>
    <div v-if="state.dialogVisible">
      <el-dialog
        v-model="state.dialogVisible"
        title="Set Custom RPC"
        width="400"
        destroy-on-close
        append-to-body
      >
        <SetRpc></SetRpc>
      </el-dialog>
    </div>
  </div>
</template>
<script setup>
import {getCurrentInstance, ref, reactive, onMounted, computed, watch} from "vue";
let {proxy} = getCurrentInstance();
import BurnListTables from "./BurnListTables";
import ElPagies from "@/layout/components/Commons/Paginations";
import SetRpc from "./SetRpc";
import {
  checkRecyleAccounts,
  getTokenSymbolFromDedx,
  batchBurnTokens,
  batchReclaimAccounts,
} from "@/api/solana_base.js";

let walletInfo = computed(() => {
  return proxy.$store.state.app.wallet || "";
});

let state = reactive({
  currentAddr: "",
  maxAmount: 1,
  pageSize: 20,
  loading: false,
  pageLoading: false,
  buttonAction: false,
  dialogVisible: false,
  targets: [],
  currentTargets: [],
  batchRecords: [],
  exceptedSol: 0,
  pages: {
    total: 0,
    page: 1,
    pageSize: 20,
  },
});

watch(
  walletInfo,
  (newVal) => {
    // 如果 walletInfo 有值，并且用户还没输入任何地址，则使用 walletInfo
    if (newVal && newVal.length > 0 && !state.currentAddr) {
      state.currentAddr = newVal;
    }
  },
  { immediate: true }
);

onMounted(() => {
  const localAddress = localStorage.getItem("MySolAddress");
  if (localAddress && localAddress.length > 0) {
    state.currentAddr = localAddress;
  }else{
    state.currentAddr = "";
  }
});

let setCustomRpc = () => {
  state.dialogVisible = true;
};

let checkWalletInfo = async () => {
  state.loading = true;
  const localAddress = localStorage.getItem("MySolAddress");
  if (!state.currentAddr || state.currentAddr.length == 0) {
    state.loading = false;
    proxy.$elmsg.error("Please input wallet address");
    return;
  }
  const res = await checkRecyleAccounts(
    state.currentAddr,
    state.maxAmount
  );
  if (res.success) {
    state.targets = res.balances;
    state.pages.total = res.balances.length;
    state.exceptedSol = Number((res.balances.length * 0.00203928).toFixed(4));
    const ableAction = (res.balances.length > 0) && (localAddress == state.currentAddr);
    state.buttonAction = ableAction;
    await setCurrentDatas();
  } else {
    proxy.$elmsg.error(res.message);
  }
  state.loading = false;
};

let setCurrentDatas = async () => {
  const startIndex = (state.pages.page - 1) * state.pages.pageSize;
  const endIndex = startIndex + state.pages.pageSize;
  const pageData = state.targets.slice(startIndex, endIndex);
  state.currentTargets = state.targets.slice(startIndex, endIndex);
  const symbols = state.currentTargets
    .map((k) => k.symbol)
    .filter(
      (symbol) =>
        symbol !== null &&
        symbol !== undefined &&
        symbol !== "" &&
        typeof symbol === "string"
    );
  if (symbols.length == 0) {
    const res = await getTokenSymbolFromDedx(pageData);
    state.currentTargets = res;
  }
};

const handlePageChange = async (page) => {
  state.pageLoading = true;
  state.pages.page = page;
  await setCurrentDatas();
  state.pageLoading = false;
};

const burnRecords = ref(null);

let BatchBurnRecords = async () => {
  state.pageLoading = true;
  const batchBurnRecords = burnRecords.value.batchRecords;
  const batchRecords = batchBurnRecords.filter((item) => {
    return item.burn && item.tokenBalance && Number(item.tokenBalance) > 0 && Number(item.burn) > 0 && Number(item.tokenBalance) >= Number(item.burn);
  });
  if (batchRecords.length > 0) {
    proxy.$elmsg.success(`Start burning ${batchRecords.length} tokens`);
    const WalletType = localStorage.getItem("WalletType");
    const res = await batchBurnTokens(WalletType, batchRecords, state.pages.pageSize);
    if (res.success) {
      proxy.$elmsg.success("Burning successful");
    } else {
      proxy.$elmsg.error(res.msg);
    }
  } else {
    proxy.$elmsg.error("No valid data");
  }
  state.pageLoading = false;
};

let BatchCloseRecords = async () => {
  state.pageLoading = true;
  const batchRecords = burnRecords.value.batchRecords;
  if (batchRecords.length > 0) {
    const WalletType = localStorage.getItem("WalletType");
    proxy.$elmsg.success(`Start reclaim ${batchRecords.length} token accounts`);
    const res = await batchReclaimAccounts(WalletType, batchRecords, state.pages.pageSize);
    if (res.success) {
      proxy.$elmsg.success("Account reclaim successful");
    } else {
      proxy.$elmsg.error(res.msg);
    }
  } else {
    proxy.$elmsg.error("No data");
  }
  state.pageLoading = false;
};
</script>
