import {
  PublicKey,
  Transaction,
  Connection,
} from "@solana/web3.js";
import { createBurnInstruction, createCloseAccountInstruction, getAssociatedTokenAddress, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import setting from '@/settings'

export async function getRpc() {
  let rpc;
  const localRpc = localStorage.getItem("myRpc");
  if (localRpc && localRpc.length > 0) {
    rpc = localRpc;
  } else {
    rpc = setting.freeRpc;
  }
  return rpc;
}

export async function checkRecyleAccounts(address, maxAmount = 0) {
  try {
    const rpc = await getRpc();
    const connection = new Connection(rpc, 'confirmed');
    const walletPubky = new PublicKey(address)
    const excludeMints = [
      "So11111111111111111111111111111111111111111", // SOL
      "So11111111111111111111111111111111111111112" // WSOL
    ]
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(walletPubky, {
      programId: TOKEN_PROGRAM_ID,
    });

    let balances = []
    await Promise.all(
      tokenAccounts.value.map(async (accountInfo) => {
        const accountData = accountInfo.account.data.parsed.info;
        const tokenBalance = accountData.tokenAmount.uiAmount;
        const tokenDecimals = accountData.tokenAmount.decimals;
        const tokenMint = accountData.mint;
        if (tokenBalance > maxAmount) return;
        if (excludeMints.includes(tokenMint)) return;
        balances.push({
          tokenMint: tokenMint,
          tokenBalance: tokenBalance,
          amount: accountData.tokenAmount.amount,
          tokenDecimals: tokenDecimals,
          burn: tokenBalance
        })
      })
    )
    balances = balances.sort((a, b) => b.tokenBalance - a.tokenBalance);
    return { success: true, balances: balances }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

export async function getTokenSymbolFromDedx(tokenInfos) {
  try {
    const poolIds = ["raydium", "pumpswap", "pumpfun"]
    const addrs = tokenInfos.map(k => k.tokenMint)
    if (addrs.length == 0) return tokenInfos;
    const url = `https://api.dexscreener.com/latest/dex/tokens/${addrs.join(',')}`
    const res = await fetch(url)
    const data = await res.json();
    const pairs = data.pairs.filter((k) => poolIds.includes(k.dexId)); // 修改这里
    let results = []
    if (pairs && pairs.length > 0) {
      for (const item of tokenInfos) {
        item.dexId = "Unknown"
        const tokenIm = pairs.find(m => (poolIds.includes(m?.dexId)) && (m?.baseToken?.address == item.tokenMint))
        if (tokenIm) {
          item.symbol = tokenIm?.baseToken?.symbol
          item.dexId = tokenIm?.dexId
        } else {
          item.symbol = 'Unknown'
        }
        results.push(item)
      }
      return results
    } else {
      return tokenInfos
    }
  } catch (e) {
    return tokenInfos
  }
}

export async function getTokenBalance(address) {
  if (!address || (String(address).length == 0)) return 0;
  const rpc = await getRpc();
  const connection = new Connection(rpc, 'confirmed');
  const token_address = setting.ca
  const tokenMintAddress = new PublicKey(token_address);
  const walletAddress = new PublicKey(address);
  let token_balance = 0
  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(walletAddress, {
    mint: tokenMintAddress
  });

  if (!tokenAccounts.value[0]) {
    token_balance = 0
  } else {
    const tokenAccount = tokenAccounts.value[0];
    token_balance = tokenAccount.account.data.parsed.info.tokenAmount.uiAmount;
  }

  return token_balance
}

export async function waitForWallet(walletType) {
  try {
    if (!walletType) return;
    return new Promise((resolve) => {
      if (walletType === "phantom") {
        if (window.solana && window.solana.isPhantom && window.solana.publicKey) {
          return resolve(window.solana);
        }
      } else if (walletType === "okx") {
        if (window.okxwallet && window.okxwallet.solana && window.okxwallet.solana.publicKey) {
          return resolve(window.okxwallet.solana);
        }
      }

      let attempts = 0;
      const checkWallet = setInterval(() => {
        attempts++;
        if (walletType === "phantom" && window.solana?.isPhantom) {
          clearInterval(checkWallet);
          resolve(window.solana);
        } else if (walletType === "okx" && window.okxwallet.solana) {
          clearInterval(checkWallet);
          resolve(window.okxwallet.solana);
        } else if (attempts > 10) {
          clearInterval(checkWallet);
          resolve(null);
        }
      }, 500);
    });
  } catch (e) {
    return;
  }
}

export async function batchBurnTokens(walletType, burnRecords, sizes = 10) {
  try {
    const wallet = await waitForWallet(walletType);
    const rpc = await getRpc()
    const connection = new Connection(rpc, 'confirmed');
    const chunk = (array, size) =>
      Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
        array.slice(i * size, i * size + size)
      );
    const records = chunk(burnRecords, sizes);
    for (const items of records) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      let transaction = new Transaction()
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.lastValidBlockHeight = lastValidBlockHeight;
      for (const b of items) {
        const decimals = Math.pow(10, b.tokenDecimals)
        const ata = await getAssociatedTokenAddress(
          new PublicKey(b.tokenMint),
          wallet.publicKey,
          false,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        )
        const burnInstruction = createBurnInstruction(
          ata,
          new PublicKey(b.tokenMint),
          wallet.publicKey,
          b.burn * decimals
        );
        transaction = transaction.add(burnInstruction);
      }
      transaction.feePayer = wallet.publicKey;
      const res = await wallet.signAndSendTransaction(transaction, {
        preflightCommitment: "processed",
        skipPreflight: false,
        maxRetries: 2
      });
      for (const ib of items) {
        ib.tx = res.signature
      }
    }
    return {
      success: true,
      burnRecords: burnRecords,
      msg: ""
    }
  } catch (e) {
    console.log(e)
    return {
      success: false,
      burnRecords: burnRecords,
      msg: e.message
    }
  }
}

export async function batchReclaimAccounts(walletType, burnRecords, sizes = 10) {
  try {
    const rpc = await getRpc()
    const wallet = await waitForWallet(walletType);
    const connection = new Connection(rpc, 'confirmed');
    const chunk = (array, size) =>
      Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
        array.slice(i * size, i * size + size)
      );
    const records = chunk(burnRecords, sizes);

    for (const items of records) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      let transaction = new Transaction()
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.lastValidBlockHeight = lastValidBlockHeight;
      for (const b of items) {
        const decimals = Math.pow(10, b.tokenDecimals)
        const ata = await getAssociatedTokenAddress(
          new PublicKey(b.tokenMint),
          wallet.publicKey,
          false,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        )

        if (Number(b.tokenBalance) > 0) {
          const burnInstruction = createBurnInstruction(
            ata,
            new PublicKey(b.tokenMint),
            wallet.publicKey,
            Number(b.tokenBalance) * decimals
          );
          transaction = transaction.add(burnInstruction);
        }

        const closeAccountInstruction = createCloseAccountInstruction(
          ata,
          wallet.publicKey,
          wallet.publicKey,
          [],
          TOKEN_PROGRAM_ID
        );
        transaction = transaction.add(closeAccountInstruction);
      }
      transaction.feePayer = wallet.publicKey;
      const res = await wallet.signAndSendTransaction(transaction, {
        preflightCommitment: "processed",
        skipPreflight: false,
        maxRetries: 3
      });
      for (const ib of items) {
        ib.tx = res.signature
      }
    }
    return {
      success: true,
      burnRecords: burnRecords,
      msg: ""
    }
  } catch (e) {
    return {
      success: false,
      burnRecords: burnRecords,
      msg: e.message
    }
  }
}