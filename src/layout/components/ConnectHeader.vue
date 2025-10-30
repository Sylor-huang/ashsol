<template>
  <div>
    <div v-if="isConnect">
        <el-dropdown size="large" trigger="click">
          <el-button text key="plain" type="default" size="large">
            <el-space :size="2">
              <div>
                <img
                  src="@/assets/phantom_logo.svg"
                  alt="phantom"
                  class="w-6 h-6 mr-2 rounded"
                  v-if="currentWalletType == 'phantom'"
                /><img
                  src="@/assets/okx_logo.svg"
                  alt="okx"
                  class="w-6 h-6 mr-2 rounded"
                  v-else
                />
              </div>
              <div>
                <el-space direction="vertical" :size="1">
                  <span class="text-xs">{{ sliceString(walletAddress, 4) }}</span>
                  <span class="text-xs text-gray-400">{{ formatNumber(Number(ashBalance)) }} $Ash</span>
                </el-space>
              </div>
            </el-space>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>
                <el-button link @click="disconnectWallet"
                  >DisConnect</el-button
                >
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <div class="ml-2" v-else>
        <el-dropdown trigger="click">
          <el-button type="primary" size="large" round>
            Connect Wallet
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>
                <el-button
                  link
                  class="my-1"
                  size="small"
                  @click="connectSpecificWallet('phantom')"
                >
                  <img
                    src="@/assets/phantom_logo.svg"
                    alt="Phantom"
                    class="w-6 h-6 mr-2 rounded"
                  />
                  Phantom
                </el-button>
              </el-dropdown-item>
              <el-dropdown-item>
                <el-button
                  link
                  class="my-1"
                  size="small"
                  @click="connectSpecificWallet('okx')"
                >
                  <img
                    src="@/assets/okx_logo.svg"
                    alt="OKX"
                    class="w-6 h-6 mr-2 rounded"
                  />
                  OKX Wallet</el-button
                >
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
  </div>
</template>
<script setup>
import {getCurrentInstance, ref, onMounted, onUnmounted} from "vue";
import {getTokenBalance, waitForWallet} from "@/api/solana_base.js";
import {sliceString,formatNumber} from "@/utils/validate.js";
let {proxy} = getCurrentInstance();

const isConnect = ref(false);
const walletAddress = ref("");
const ashBalance = ref(0);
const currentWalletType = ref("");

const checkWalletInstalled = (type) => {
  if (type === "phantom") {
    return window.solana && window.solana.isPhantom;
  } else if (type === "okx") {
    return !!window.okxwallet.solana;
  }
  return false;
};

onMounted(async () => {
  const localAddress = localStorage.getItem("MySolAddress");
  const walletType = localStorage.getItem("WalletType");

  if (localAddress && walletType) {
    currentWalletType.value = walletType;
    const wallet = await waitForWallet(walletType);
    if (wallet) {
      wallet.on("connect", handleConnect);
      wallet.on("disconnect", handleDisconnect);
      wallet.on("accountChanged", handleAccountChanged);
      await wallet.connect({onlyIfTrusted: false});
    }
  }
});

const connectSpecificWallet = async (walletType) => {
  try {
    if (!checkWalletInstalled(walletType)) {
      proxy.$elmsg.error(`Please install ${walletType} wallet!`)
      return;
    }

    const wallet = await waitForWallet(walletType);
    if (!wallet) {
       proxy.$elmsg.error(`${walletType} wallet not found!`)
      return;
    }
    wallet.removeListener("connect", handleConnect);
    currentWalletType.value = walletType;
    localStorage.setItem("WalletType", walletType);
    wallet.on("connect", handleConnect);
    await wallet.connect({onlyIfTrusted: false});
  } catch (err) {
    proxy.$elmsg.error(err.message)
  }
};

const handleDisconnect = () => {
  isConnect.value = false;
  walletAddress.value = "";
  currentWalletType.value = "";
  localStorage.removeItem("MySolAddress");
  localStorage.removeItem("AshBalance");
  localStorage.removeItem("WalletType");
  ashBalance.value = 0;
};

const isConnecting = ref(false);

const handleConnect = async () => {
  if (isConnecting.value) return;
  isConnecting.value = true;

  try {
    const wallet = await waitForWallet(currentWalletType.value);
    if (!wallet) {
      throw new Error("Wallet not connected properly");
    }

    isConnect.value = true;
    walletAddress.value = wallet.publicKey.toString();
    const AshBalance = await getTokenBalance(walletAddress.value);
    ashBalance.value = AshBalance;
    localStorage.setItem("MySolAddress", walletAddress.value);
    localStorage.setItem("AshBalance", AshBalance);
    proxy.$store.commit("app/TOGGLE_WALLET", walletAddress.value);
  } catch (err) {
    proxy.$elmsg.error(err.message)
  } finally {
    isConnecting.value = false;
  }
};

const handleAccountChanged = async () => {
  const wallet =
    currentWalletType.value === "phantom"
      ? window.solana
      : window.okxwallet.solana;
  if (wallet?.publicKey) {
    const newAddress = wallet.publicKey.toString();
    const AshBalance = await getTokenBalance(newAddress);
    walletAddress.value = newAddress;
    ashBalance.value = AshBalance;
    localStorage.setItem("MySolAddress", walletAddress.value);
    localStorage.setItem("AshBalance", AshBalance);
    proxy.$store.commit("app/TOGGLE_WALLET", walletAddress.value);
  } else {
    handleDisconnect();
  }
};

const disconnectWallet = async () => {
  try {
    const wallet =
      currentWalletType.value === "phantom"
        ? window.solana
        : window.okxwallet.solana;
    await wallet.disconnect();
    isConnect.value = false;
  } catch (err) {
    proxy.$elmsg.error(err.message)
  }
};

onUnmounted(() => {
  const wallet =
    currentWalletType.value === "phantom"
      ? window.solana
      : window.okxwallet.solana;
  if (wallet) {
    wallet.removeListener("connect", handleConnect);
    wallet.removeListener("disconnect", handleDisconnect);
    wallet.removeListener("accountChanged", handleAccountChanged);
  }
});
</script>
